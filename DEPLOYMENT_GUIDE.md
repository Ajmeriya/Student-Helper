# 🚀 Deployment Guide - Student Helper Platform

## Overview
This guide will help you deploy your full-stack application:
- **Backend**: Node.js/Express API
- **Frontend**: React + Vite
- **Database**: MongoDB Atlas (Cloud)
- **Image Storage**: Cloudinary (Cloud)

---

## 🎯 Recommended Deployment Stack

| Component | Service | Cost | Why? |
|-----------|---------|------|------|
| Backend | Render | Free | Easy setup, auto-deploy from Git |
| Frontend | Vercel | Free | Best for React/Vite, automatic builds |
| Database | MongoDB Atlas | Free (512MB) | Already configured |
| Images | Cloudinary | Free (25GB) | Already configured |

---

## 📝 Pre-Deployment Checklist

### Environment Variables You Need:

**Backend (.env)**
```env
# Database
MONGODB_URI=your_mongodb_atlas_connection_string

# JWT Authentication
JWT_SECRET=your_very_long_random_secret_key_here

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=5000
NODE_ENV=production

# Frontend URL (will update after deploying frontend)
FRONTEND_URL=https://your-frontend-app.vercel.app
```

**Frontend (.env)**
```env
VITE_API_BASE_URL=https://your-backend-app.onrender.com/api
```

---

## 🔧 Step 1: Prepare Backend for Deployment

### 1.1 Create .env.example file
```bash
cd backend
```

Create `.env.example` with variable names (no values):
```env
MONGODB_URI=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
PORT=5000
NODE_ENV=production
FRONTEND_URL=
```

### 1.2 Update package.json
Your backend package.json already has the correct start script ✅
```json
"scripts": {
  "start": "node server.js"
}
```

### 1.3 Create .gitignore (if not exists)
```
node_modules/
.env
*.log
.DS_Store
```

---

## 🌐 Step 2: Deploy Backend to Render

### 2.1 Sign Up & Create Web Service
1. Go to [render.com](https://render.com)
2. Sign up with GitHub/GitLab
3. Click **"New +"** → **"Web Service"**
4. Connect your repository: `new-student-helper`

### 2.2 Configure Render Settings
```
Name: student-helper-backend
Region: Singapore (or closest to your users)
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
```

### 2.3 Add Environment Variables
In Render dashboard, go to **Environment** tab and add:
- `MONGODB_URI` → Your MongoDB Atlas connection string
- `JWT_SECRET` → A strong random string (use: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
- `CLOUDINARY_CLOUD_NAME` → From Cloudinary dashboard
- `CLOUDINARY_API_KEY` → From Cloudinary dashboard
- `CLOUDINARY_API_SECRET` → From Cloudinary dashboard
- `NODE_ENV` → `production`
- `FRONTEND_URL` → Leave blank for now, update after frontend deployment

### 2.4 Deploy
1. Click **"Create Web Service"**
2. Wait 5-10 minutes for deployment
3. Your backend URL: `https://student-helper-backend.onrender.com`
4. **Save this URL** - you'll need it for frontend!

### 2.5 Test Backend
Visit: `https://your-backend-url.onrender.com/api/test`

---

## 🎨 Step 3: Deploy Frontend to Vercel

### 3.1 Create Environment File
In `frontend/` create `.env.production`:
```env
VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
```

### 3.2 Update vite.config.js
Already configured correctly ✅

### 3.3 Deploy to Vercel

**Option A: Vercel CLI (Recommended)**
```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd frontend

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? student-helper
# - In which directory is your code? ./
# - Override settings? No
```

**Option B: Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click **"Add New"** → **"Project"**
4. Import `new-student-helper` repository
5. Configure:
   - Framework Preset: **Vite**
   - Root Directory: **frontend**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### 3.4 Add Environment Variables in Vercel
1. Go to **Project Settings** → **Environment Variables**
2. Add:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://your-backend-url.onrender.com/api`
   - Environment: **Production, Preview, Development**

### 3.5 Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Your frontend URL: `https://student-helper.vercel.app`

---

## 🔄 Step 4: Connect Frontend & Backend

### 4.1 Update Backend CORS
Go back to Render dashboard:
1. Navigate to your backend service
2. Go to **Environment** tab
3. Update `FRONTEND_URL` to your Vercel URL:
   ```
   https://student-helper.vercel.app
   ```
4. Click **"Save Changes"** (will trigger redeployment)

### 4.2 Test Full Application
1. Visit your frontend URL
2. Try signing up a new user
3. Test login
4. Test uploading images (PG/Hostel)
5. Test chat functionality

---

## 🎯 Alternative Deployment Options

### Option 2: Railway (All-in-One)
- **Pros**: Single platform for both frontend & backend, easy setup
- **Cons**: Less generous free tier
- **Best for**: Quick deployment, paid projects

### Option 3: Netlify (Frontend) + Railway (Backend)
- **Pros**: Netlify has excellent CDN for frontend
- **Cons**: Managing two platforms
- **Best for**: High-traffic applications

### Option 4: AWS/Azure/GCP
- **Pros**: Production-grade, scalable
- **Cons**: Complex setup, expensive for learning projects
- **Best for**: Enterprise applications

---

## 📊 Cost Breakdown (Free Tier)

| Service | Free Tier | Limits |
|---------|-----------|--------|
| Render | ✅ Free | 750 hrs/month, sleeps after 15 min inactivity |
| Vercel | ✅ Free | 100GB bandwidth, unlimited projects |
| MongoDB Atlas | ✅ Free | 512MB storage |
| Cloudinary | ✅ Free | 25GB storage, 25GB bandwidth |

**Total Monthly Cost**: $0 (with limitations)

**Upgrade Path**: 
- Render Starter: $7/month (no sleep)
- Vercel Pro: $20/month (more bandwidth)
- MongoDB Atlas M10: $9/month (2GB RAM)

---

## 🐛 Common Issues & Solutions

### Backend won't start
```bash
# Check logs in Render dashboard
# Common issue: Missing environment variables
```

### Frontend can't connect to backend
```bash
# Check CORS settings in backend/server.js
# Verify VITE_API_BASE_URL is correct
# Check browser console for errors
```

### Database connection failed
```bash
# Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for cloud deployments)
# Verify MONGODB_URI is correct
# Check database user permissions
```

### Images not uploading
```bash
# Verify Cloudinary credentials
# Check file size limits
# Check network logs in browser
```

---

## 🔐 Security Checklist

- [ ] JWT_SECRET is a strong random string (64+ characters)
- [ ] MongoDB Atlas IP whitelist configured
- [ ] All API keys in environment variables (not in code)
- [ ] CORS only allows your frontend domain
- [ ] Rate limiting implemented (if needed)
- [ ] HTTPS enabled (automatic on Render/Vercel)
- [ ] .env files added to .gitignore

---

## 🚀 Continuous Deployment

Both Render and Vercel support automatic deployments:

1. **Push to GitHub** → Automatic deployment
2. **Branch Protection** → Deploy from `main` branch only
3. **Preview Deployments** → Vercel creates preview URLs for PRs

---

## 📱 Testing Checklist

After deployment, test:

- [ ] User registration
- [ ] User login
- [ ] Student dashboard
- [ ] Broker dashboard (PG management)
- [ ] Hostel admin dashboard
- [ ] Image uploads (PG/Hostel/Items)
- [ ] Map functionality
- [ ] Distance calculation
- [ ] Marketplace (add/edit items)
- [ ] Chat/messaging
- [ ] Responsive design (mobile/tablet)

---

## 📞 Need Help?

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://www.mongodb.com/docs/atlas
- **Cloudinary**: https://cloudinary.com/documentation

---

## 🎉 You're Ready!

Your application will be live at:
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-app.onrender.com`

**Note**: Render free tier sleeps after 15 minutes of inactivity. First request after sleep takes 30-60 seconds to wake up.

Good luck with your deployment! 🚀
