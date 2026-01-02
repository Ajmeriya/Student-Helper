# Quick Start Guide

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   - The app will automatically open at `http://localhost:3000`
   - If not, manually navigate to the URL shown in terminal

## First Steps

1. **Sign Up**
   - Click "Sign Up" in the navigation
   - Fill in all required fields
   - Select your role (Student, Broker, or Hostel Admin)
   - If student, enter your college name

2. **Explore Features**
   - **Students**: Browse PGs, Hostels, and Marketplace
   - **Brokers**: Add and manage your PG properties
   - **Hostel Admins**: Add and manage your hostels

## Testing Different Roles

### As a Student:
1. Sign up with role "Student"
2. Browse PGs and Hostels in your city
3. Use filters to find perfect accommodation
4. View property details
5. Contact owners via chat
6. Browse marketplace for items

### As a Broker:
1. Sign up with role "Broker"
2. Go to Dashboard
3. Click "Add New PG"
4. Fill in all details including map location
5. Upload photos and videos
6. View your listings in "My PGs"
7. Edit or delete properties

### As a Hostel Admin:
1. Sign up with role "Hostel Admin"
2. Go to Dashboard
3. Click "Add New Hostel"
4. Fill in details including facilities
5. Upload photos for different room types
6. Manage your hostels

## Features to Test

- ✅ Responsive design (resize browser or use mobile device)
- ✅ Search and filter functionality
- ✅ Map integration (click to set location)
- ✅ Image/video uploads
- ✅ Chat interface
- ✅ Price prediction (click info icon for dataset details)
- ✅ Role-based navigation

## Backend Integration

Currently, the app uses mock data. To connect to a backend:

1. Update API endpoints in:
   - `src/context/AuthContext.jsx`
   - All page components with `TODO: Replace with actual API call`

2. Configure API base URL in environment variables

3. Set up WebSocket for real-time chat

## Troubleshooting

**Port already in use:**
- Change port in `vite.config.js`

**Map not loading:**
- Check internet connection (uses OpenStreetMap tiles)

**Styles not applying:**
- Ensure Tailwind CSS is properly configured
- Run `npm install` again

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

