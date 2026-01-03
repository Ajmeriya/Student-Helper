/**
 * File Upload Middleware using Cloudinary
 * 
 * Handles image and video uploads to Cloudinary
 */

import { Readable } from 'stream'
import dotenv from 'dotenv'
import cloudinary from '../config/cloudinary.js'

// Ensure environment variables are loaded
dotenv.config()

// Verify Cloudinary is configured before using it
if (!cloudinary.config().api_key) {
  console.error('❌ Cloudinary API key not found! Check your .env file.')
}

/**
 * Upload single image to Cloudinary
 */
export const uploadImage = async (file) => {
  return new Promise((resolve, reject) => {
    try {
      // Check if file has buffer
      if (!file || !file.buffer) {
        reject(new Error('Invalid file: no buffer found'))
        return
      }

      // Create upload stream
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'student-helper/pgs', // Organize images in folders
          transformation: [
            { width: 1200, height: 800, crop: 'limit' }, // Resize large images
            { quality: 'auto' } // Optimize quality
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error)
            reject(new Error(error.message || 'Failed to upload image to Cloudinary'))
          } else if (!result || !result.secure_url) {
            reject(new Error('Upload succeeded but no URL returned'))
          } else {
            resolve(result.secure_url) // Return the image URL
          }
        }
      )

      // Convert buffer to stream
      const bufferStream = new Readable()
      bufferStream.push(file.buffer)
      bufferStream.push(null)
      
      // Handle stream errors
      bufferStream.on('error', (err) => {
        console.error('Buffer stream error:', err)
        reject(new Error(`Stream error: ${err.message}`))
      })
      
      uploadStream.on('error', (err) => {
        console.error('Upload stream error:', err)
        reject(new Error(`Upload stream error: ${err.message}`))
      })

      bufferStream.pipe(uploadStream)
    } catch (error) {
      console.error('Error in uploadImage:', error)
      reject(new Error(`Upload failed: ${error.message || 'Unknown error'}`))
    }
  })
}

/**
 * Upload single video to Cloudinary
 */
export const uploadVideo = async (file) => {
  return new Promise((resolve, reject) => {
    try {
      // Check if file has buffer
      if (!file || !file.buffer) {
        reject(new Error('Invalid file: no buffer found'))
        return
      }

      // Create upload stream
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'student-helper/pgs/videos',
          transformation: [
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error)
            reject(new Error(error.message || 'Failed to upload video to Cloudinary'))
          } else if (!result || !result.secure_url) {
            reject(new Error('Upload succeeded but no URL returned'))
          } else {
            resolve(result.secure_url) // Return the video URL
          }
        }
      )

      // Convert buffer to stream
      const bufferStream = new Readable()
      bufferStream.push(file.buffer)
      bufferStream.push(null)
      
      // Handle stream errors
      bufferStream.on('error', (err) => {
        console.error('Buffer stream error:', err)
        reject(new Error(`Stream error: ${err.message}`))
      })
      
      uploadStream.on('error', (err) => {
        console.error('Upload stream error:', err)
        reject(new Error(`Upload stream error: ${err.message}`))
      })

      bufferStream.pipe(uploadStream)
    } catch (error) {
      console.error('Error in uploadVideo:', error)
      reject(new Error(`Upload failed: ${error.message || 'Unknown error'}`))
    }
  })
}

/**
 * Upload multiple images
 */
export const uploadImages = async (files) => {
  try {
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new Error('No files provided for upload')
    }

    console.log(`📤 Uploading ${files.length} image(s) to Cloudinary...`)
    
    const uploadPromises = files.map((file, index) => {
      console.log(`  Image ${index + 1}: ${file.originalname || 'unnamed'}, size: ${file.size} bytes`)
      return uploadImage(file)
    })
    
    const urls = await Promise.all(uploadPromises)
    console.log(`✅ Successfully uploaded ${urls.length} image(s)`)
    return urls
  } catch (error) {
    console.error('Error in uploadImages:', error)
    throw new Error(`Failed to upload images: ${error.message || 'Unknown error'}`)
  }
}

/**
 * Upload multiple videos
 */
export const uploadVideos = async (files) => {
  try {
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new Error('No files provided for upload')
    }

    console.log(`📤 Uploading ${files.length} video(s) to Cloudinary...`)
    
    const uploadPromises = files.map((file, index) => {
      console.log(`  Video ${index + 1}: ${file.originalname || 'unnamed'}, size: ${file.size} bytes`)
      return uploadVideo(file)
    })
    
    const urls = await Promise.all(uploadPromises)
    console.log(`✅ Successfully uploaded ${urls.length} video(s)`)
    return urls
  } catch (error) {
    console.error('Error in uploadVideos:', error)
    throw new Error(`Failed to upload videos: ${error.message || 'Unknown error'}`)
  }
}

