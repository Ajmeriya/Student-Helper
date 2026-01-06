# 🚀 Render + Vercel Deployment Guide

This is a **MUCH SIMPLER** alternative to AWS - no credit card needed for testing!

## 🎯 Deployment Stack

| Component | Service | Cost | Setup Time |
|-----------|---------|------|------------|
| Backend API | Render | FREE | 10 min |
| Frontend | Vercel | FREE | 5 min |
| Database | MongoDB Atlas | FREE | Already setup |
| Images | Cloudinary | FREE | Already setup |

**Total Time**: ~20 minutes  
**Total Cost**: $0 (Free tier)

---

## 📋 STEP 1: Prepare Backend .env File (5 minutes)

Create `backend/.env` with your credentials:

```env
# MongoDB Atlas Connection
MONGODB_URI=your_mongodb_atlas_connection_string

# JWT Secret (generate below)
JWT_SECRET=your_generated_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=5000
NODE_ENV=production

# Frontend URL (update after deploying frontend)
FRONTEND_URL=https://your-app.vercel.app
```

### Generate JWT Secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🔧 STEP 2: Deploy Backend to Render (10 minutes)

### 2.1 Sign Up for Render
1. Go to https://render.com/
2. Click **"Get Started for Free"**
3. Sign up with **GitHub** (recommended) or email
4. No credit card required!

### 2.2 Connect GitHub Repository
1. Go to https://github.com/ and sign in
2. Create a **new repository** for your project
3. Push your code:
   ```bash
   git remote add origin https://github.com/yourusername/student-helper.git
   git add .
   git commit -m "Ready for deployment"
   git push -u origin main
   ```

### 2.3 Create Web Service on Render
1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `student-helper-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Docker`
   - **Instance Type**: `Free`

### 2.4 Add Environment Variables
Click **"Advanced"** → **Environment Variables**:
- `MONGODB_URI` = your MongoDB connection string
- `JWT_SECRET` = your generated secret
- `CLOUDINARY_CLOUD_NAME` = your cloud name
- `CLOUDINARY_API_KEY` = your API key
- `CLOUDINARY_API_SECRET` = your API secret
- `NODE_ENV` = `production`
- `PORT` = `5000`
- `FRONTEND_URL` = (leave blank for now)

### 2.5 Deploy
1. Click **"Create Web Service"**
2. Wait 5-10 minutes for deployment
3. Your backend URL: `https://student-helper-backend.onrender.com`
4. **Save this URL!**

---

## 🎨 STEP 3: Deploy Frontend to Vercel (5 minutes)

### 3.1 Update Frontend Environment
Create `frontend/.env.production`:
```env
VITE_API_BASE_URL=https://student-helper-backend.onrender.com/api
```

### 3.2 Sign Up for Vercel
1. Go to https://vercel.com/
2. Click **"Sign Up"**
3. Sign up with **GitHub** (recommended)
4. No credit card required!

### 3.3 Import Project
1. Click **"Add New..."** → **"Project"**
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.4 Add Environment Variable
1. Go to **Settings** → **Environment Variables**
2. Add:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://student-helper-backend.onrender.com/api`
   - Environment: Production, Preview, Development

### 3.5 Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Your frontend URL: `https://student-helper.vercel.app`

---

## 🔄 STEP 4: Connect Frontend & Backend

### Update Backend CORS
1. Go to Render dashboard → Your backend service
2. Go to **Environment** tab
3. Update `FRONTEND_URL` to your Vercel URL:
   ```
   https://student-helper.vercel.app
   ```
4. Service will auto-redeploy

---

## ✅ STEP 5: Test Your Application

1. Visit your Vercel URL
2. Test signup/login
3. Test image uploads
4. Test all features

---

## 🐛 Troubleshooting

### Backend won't start
- Check Render logs: Click your service → "Logs" tab
- Verify environment variables are set correctly
- Check MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

### Frontend can't connect to backend
- Verify VITE_API_BASE_URL is correct
- Check browser console for CORS errors
- Ensure FRONTEND_URL is set in Render

### Render Free Tier Limitations
- Service sleeps after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- 750 hours/month free (enough for one service 24/7)

---

## 🎁 Why This is Better Than AWS

✅ **No credit card needed** for free tier  
✅ **Simpler setup** - no IAM, no S3, no CloudFront  
✅ **Automatic HTTPS** - SSL certificates included  
✅ **Auto-deploy** - Push to GitHub → Auto-deploys  
✅ **Better free tier** - More generous limits  
✅ **Easier to use** - Better UI and documentation  

---

## 📊 Upgrade Options (Optional)

**Render Starter**: $7/month
- No sleep
- 512MB RAM → 2GB RAM
- Better performance

**Vercel Pro**: $20/month
- More bandwidth
- Advanced analytics
- Team collaboration

---

## 🚀 Ready to Deploy!

**Start here**: I'll guide you step by step!

1. First, let's create your .env file
2. Then push to GitHub
3. Deploy to Render
4. Deploy to Vercel
5. Done! 🎉

Tell me when you're ready to start!
