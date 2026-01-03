/**
 * Multer Configuration for File Uploads
 * 
 * Multer handles multipart/form-data (file uploads)
 */

import multer from 'multer'

// Configure multer to store files in memory (we'll upload to Cloudinary)
const storage = multer.memoryStorage()

// File filter - only allow images and videos
const fileFilter = (req, file, cb) => {
  // Check if file is image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  }
  // Check if file is video
  else if (file.mimetype.startsWith('video/')) {
    cb(null, true)
  }
  // Reject other file types
  else {
    cb(new Error('Only images and videos are allowed!'), false)
  }
}

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  }
})

// Middleware for uploading multiple images
export const uploadImages = upload.array('images', 10) // Max 10 images

// Middleware for uploading multiple videos
export const uploadVideos = upload.array('videos', 5) // Max 5 videos

// Middleware for uploading both images and videos
export const uploadMedia = upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 5 }
])

export default upload

