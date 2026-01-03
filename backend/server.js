/**
 * STEP 1: Basic Server Setup
 * 
 * This is the simplest possible Express server.
 * We'll add more features step by step.
 */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'

// Import Routes
import authRoutes from './routes/auth.js'
import pgRoutes from './routes/pg.js'

// Load environment variables from .env file
dotenv.config()

// Create Express app
const app = express()

// Connect to MongoDB Atlas (cloud database)
// This is async, but we don't wait for it - server will start anyway
// If connection fails, it will exit the process
connectDB()

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json()) // Parse JSON request bodies

// Routes
app.use('/api/auth', authRoutes) // Authentication routes
app.use('/api/pg', pgRoutes)     // PG routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Student Helper API is running',
    apis: {
      auth: '/api/auth',
      pg: '/api/pg'
    },
    timestamp: new Date().toISOString()
  })
})

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📡 API URL: http://localhost:${PORT}`)
  console.log(`\n✅ Available APIs:`)
  console.log(`   🔐 Auth: http://localhost:${PORT}/api/auth`)
  console.log(`   🏠 PG:   http://localhost:${PORT}/api/pg`)
  console.log(`\n📚 Documentation:`)
  console.log(`   - Authentication: backend/AUTHENTICATION_EXPLAINED.md`)
  console.log(`   - PG API: backend/COMPLETE_PG_API.md`)
  console.log(`   - Testing: backend/TESTING_AUTH.md`)
})

