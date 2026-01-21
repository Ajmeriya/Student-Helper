# Student Helper Frontend

## Authentication Module

This is the frontend application for the Student Helper platform, currently containing the authentication module.

## Features

- ✅ User Authentication (Login/Signup)
- ✅ Role-based access (Student, Broker, Hostel Admin)
- ✅ Protected routes
- ✅ Form validation
- ✅ Interactive map for location selection
- ✅ Responsive design with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Update `.env` file with your backend API URL
   - Default: `VITE_API_BASE_URL=http://localhost:5000/api`

3. Start the development server:
```bash
npm run dev
```

The app will open at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **React Router v6** - Routing
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Leaflet** - Maps
- **React Hot Toast** - Notifications
- **React Icons** - Icons

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── Common/
│   │   │   └── MapComponent.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   └── Auth/
│   │       ├── Login.jsx
│   │       └── Signup.jsx
│   ├── utils/
│   │   ├── api.js
│   │   └── constants.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Authentication Flow

1. User visits the app → Redirected to `/login`
2. User can login or navigate to `/signup`
3. After successful authentication:
   - Student → `/student/dashboard`
   - Broker → `/broker/dashboard`
   - Hostel Admin → `/hostel-admin/dashboard`
4. Protected routes require authentication and correct role

## Next Steps

- Add dashboard pages for each role
- Implement PG/Hostel listing features
- Add marketplace functionality
- Implement chat system

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Deployment

Build the app for production:

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Contributing

1. Make changes in feature branches
2. Test thoroughly
3. Submit pull request

## License

Private project
