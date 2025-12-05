const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketio = require('socket.io');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const apicache = require('apicache');
const cloudinary = require('./utils/cloudinary');


let Sentry = null;
let nodeProfilingIntegration = null;
try {
  Sentry = require('@sentry/node');
  ({ nodeProfilingIntegration } = require('@sentry/profiling-node'));
} catch (e) {
  // Sentry not installed; skip instrumentation
}
const connectDB = require('./config/database');
const errorHandler = require('./middleware/error');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Init Sentry (if DSN provided)
if (process.env.SENTRY_DSN && Sentry && nodeProfilingIntegration) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: 1.0,
    profilesSampleRate: 0.5,
    environment: process.env.NODE_ENV || 'development'
  });
}

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = socketio(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST']
  }
});

// Sentry request/tracing handlers first
if (process.env.SENTRY_DSN && Sentry) {
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}
// Security headers
app.use(helmet());
// HTTP compression
app.use(compression());
// Logging (dev only)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}
// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enable CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://127.0.0.1:3002'],
  credentials: true
}));

// Sanitize and harden inputs (skip mongoSanitize with Express 5 query immutability)
// app.use(mongoSanitize());
// app.use(xssClean());
app.use(hpp());

// Basic rate limiting for API (adjust as needed)
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 });
app.use('/api/', apiLimiter);

// Simple response caching for read endpoints
const cache = apicache.middleware;

// Serve static files (uploads)
app.use('/uploads', express.static('uploads'));

// Socket.IO connection handling
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join user to their room
  socket.on('join', (userId) => {
    activeUsers.set(userId, socket.id);
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  // Join chat room
  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat: ${chatId}`);
  });

  // Handle sending messages
  socket.on('send_message', (data) => {
    // Emit message to all users in the chat room
    socket.to(data.chatId).emit('receive_message', data);
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    socket.to(data.chatId).emit('user_typing', {
      userId: data.userId,
      userName: data.userName
    });
  });

  socket.on('stop_typing', (data) => {
    socket.to(data.chatId).emit('user_stop_typing', {
      userId: data.userId
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    // Remove user from active users
    for (let [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        break;
      }
    }
  });
});

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  req.activeUsers = activeUsers;
  next();
});

// Route files
const auth = require('./routes/auth');
const users = require('./routes/users');
const items = require('./routes/items');
const hostels = require('./routes/hostels');
const pgs = require('./routes/pgs');
const messages = require('./routes/messages');
const chats = require('./routes/chats');
const reviews = require('./routes/reviews');

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/items', items);
app.use('/api/v1/hostels', cache('30 seconds'), hostels);
app.use('/api/v1/pgs', cache('30 seconds'), pgs);
app.use('/api/v1/messages', messages);
app.use('/api/v1/chats', chats);
app.use('/api/v1/reviews', reviews);

// Health check route
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Student Helper API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Sentry error handler before our custom error handler
if (process.env.SENTRY_DSN && Sentry) {
  app.use(Sentry.Handlers.errorHandler());
}
// Error handler
app.use(errorHandler);

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});
