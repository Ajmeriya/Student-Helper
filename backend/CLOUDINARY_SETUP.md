# Cloudinary Setup Guide

## What is Cloudinary?

Cloudinary is a cloud-based image and video management service. It provides:
- Free storage for images and videos
- Automatic optimization and resizing
- CDN (Content Delivery Network) for fast delivery
- Free tier: 25GB storage, 25GB bandwidth/month

## Setup Steps

### 1. Create Cloudinary Account

1. Go to https://cloudinary.com/users/register/free
2. Sign up for a free account
3. Verify your email

### 2. Get Your Credentials

1. After logging in, go to Dashboard
2. You'll see your credentials:
   - **Cloud Name** (e.g., `dxyz123`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz`)

### 3. Add to .env File

Add these to your `backend/.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Important:** Never commit your `.env` file to Git! It's already in `.gitignore`.

### 4. Install Dependencies

The dependencies are already added to `package.json`. Just run:

```bash
cd backend
npm install
```

This will install:
- `cloudinary` - Cloudinary SDK
- `multer` - File upload middleware
- `multer-storage-cloudinary` - Cloudinary storage for Multer

### 5. Test Upload

After setting up, test by creating a PG with images. Check:
- Backend logs for "✅ Uploaded X images to Cloudinary"
- MongoDB - images array should contain Cloudinary URLs
- Cloudinary Dashboard - images should appear in "Media Library"

## How It Works

1. **User uploads image** → Frontend sends to backend
2. **Multer middleware** → Receives file and stores in memory
3. **Upload middleware** → Uploads to Cloudinary
4. **Cloudinary returns URL** → URL saved to database
5. **Frontend displays** → Uses Cloudinary URL to show image

## Image URLs

Cloudinary URLs look like:
```
https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/student-helper/pgs/abc123.jpg
```

These URLs are:
- ✅ Fast (CDN)
- ✅ Optimized (automatic compression)
- ✅ Resized (if needed)
- ✅ Secure (HTTPS)

## Troubleshooting

### Error: "Invalid API credentials"
- Check your `.env` file has correct values
- Make sure no extra spaces in values
- Restart server after changing `.env`

### Error: "File too large"
- Max file size: 10MB (configured in multer)
- Compress images before uploading
- Or increase limit in `backend/middleware/multer.js`

### Images not displaying
- Check Cloudinary URL is correct
- Check image exists in Cloudinary Dashboard
- Check browser console for errors
- Verify CORS settings (should work by default)

## Free Tier Limits

- **Storage:** 25GB
- **Bandwidth:** 25GB/month
- **Transformations:** Unlimited
- **Uploads:** Unlimited

For most projects, this is more than enough!

## Next Steps

Once setup is complete:
1. Test image upload when creating PG
2. Check images display correctly
3. Verify images in Cloudinary Dashboard
4. Test video uploads (if needed)

