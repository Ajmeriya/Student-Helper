# 🚀 Quick Start Guide

## Setup Instructions

### 1. Navigate to Frontend Directory
```bash
cd d:\Final_Project\new-student-helper\final_student_helper\frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

The app will automatically open at **http://localhost:3000**

## 📋 What You'll See

- **Login Page** - Default landing page
- **Signup Page** - Complete registration with role selection
- **Dashboard Placeholders** - For Student, Broker, and Hostel Admin

## 🔐 Test Accounts

You can create test accounts with these roles:
- **Student** - Requires college name and location
- **Broker** - Basic info only
- **Hostel Admin** - Basic info only

## 📁 Complete File Structure

```
final_student_helper/frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── Common/
│   │   │   └── MapComponent.jsx          ✅ Interactive map
│   │   └── ProtectedRoute.jsx            ✅ Route protection
│   ├── context/
│   │   └── AuthContext.jsx               ✅ Auth state management
│   ├── pages/
│   │   └── Auth/
│   │       ├── Login.jsx                 ✅ Login page
│   │       └── Signup.jsx                ✅ Signup page
│   ├── utils/
│   │   ├── api.js                        ✅ API helpers
│   │   └── constants.js                  ✅ App constants
│   ├── App.jsx                           ✅ Main app component
│   ├── main.jsx                          ✅ Entry point
│   └── index.css                         ✅ Global styles
├── .env                                  ✅ Environment config
├── .gitignore                            ✅ Git ignore rules
├── index.html                            ✅ HTML template
├── package.json                          ✅ Dependencies
├── vite.config.js                        ✅ Vite config
├── tailwind.config.js                    ✅ Tailwind config
├── postcss.config.js                     ✅ PostCSS config
└── README.md                             ✅ Documentation
```

## ✨ Features Included

### Authentication
- ✅ Login with email/password
- ✅ Signup with role selection
- ✅ Form validation
- ✅ Password strength requirements
- ✅ Role-based redirection

### UI/UX
- ✅ Responsive design (mobile-friendly)
- ✅ Smooth animations (Framer Motion)
- ✅ Toast notifications
- ✅ Loading states
- ✅ Error handling

### Map Integration
- ✅ Interactive Leaflet map
- ✅ Click to select location
- ✅ Multiple city support
- ✅ Custom markers

## 🔧 Configuration

### Backend API
Update the `.env` file with your backend URL:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Default Settings
- **Port**: 3000
- **Auto-open**: Enabled
- **Hot reload**: Enabled

## 📦 Dependencies Installed

### Core
- react, react-dom
- react-router-dom

### UI
- tailwindcss
- framer-motion
- react-icons
- react-hot-toast

### Maps
- leaflet
- react-leaflet

### Build Tools
- vite
- @vitejs/plugin-react
- autoprefixer
- postcss

## 🎯 Next Steps After Running

1. **Test Login/Signup**
   - Create an account
   - Login with credentials
   - Verify role-based redirection

2. **Check Authentication**
   - Try accessing protected routes
   - Verify logout functionality
   - Test token persistence

3. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial frontend setup with authentication"
   git push origin main
   ```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in vite.config.js
server: {
  port: 3001,  // Change to different port
}
```

### Dependencies Installation Failed
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Map Not Showing
- Check internet connection (Leaflet tiles load from CDN)
- Verify Leaflet CSS is loaded in index.html

## 📞 Support

If you encounter issues:
1. Check console for errors
2. Verify backend is running (if testing with API)
3. Clear browser cache
4. Check .env configuration

---

**Ready to run!** Just execute `npm install` then `npm run dev` 🚀
