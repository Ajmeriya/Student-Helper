/**
 * Test Cloudinary Connection
 * 
 * Run: node test-cloudinary.js
 * 
 * This will test if Cloudinary is configured correctly
 */

import dotenv from 'dotenv'
import cloudinary from './config/cloudinary.js'

dotenv.config()

const testCloudinary = async () => {
  try {
    console.log('🧪 Testing Cloudinary connection...\n')
    
    // Check configuration
    console.log('📋 Configuration:')
    console.log(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME || 'NOT SET'}`)
    console.log(`   API Key: ${process.env.CLOUDINARY_API_KEY ? process.env.CLOUDINARY_API_KEY.substring(0, 5) + '...' : 'NOT SET'}`)
    console.log(`   API Secret: ${process.env.CLOUDINARY_API_SECRET ? 'SET (' + process.env.CLOUDINARY_API_SECRET.length + ' chars)' : 'NOT SET'}`)
    console.log('')

    // Test upload with a simple test image (1x1 pixel PNG)
    const testImage = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    )

    console.log('📤 Testing image upload...')
    
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'student-helper/test',
          public_id: 'test-upload-' + Date.now()
        },
        (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
        }
      )

      uploadStream.end(testImage)
    })

    console.log('✅ Upload successful!')
    console.log(`   URL: ${result.secure_url}`)
    console.log(`   Public ID: ${result.public_id}`)
    console.log('')
    console.log('✅ Cloudinary is working correctly!')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Cloudinary test failed!')
    console.error('Error:', error.message)
    console.error('')
    console.error('💡 Check:')
    console.error('   1. CLOUDINARY_CLOUD_NAME is correct')
    console.error('   2. CLOUDINARY_API_KEY is correct')
    console.error('   3. CLOUDINARY_API_SECRET is correct (no extra spaces)')
    console.error('   4. Your .env file is in the backend folder')
    console.error('   5. You restarted the server after adding credentials')
    console.error('')
    console.error('Full error:', error)
    process.exit(1)
  }
}

testCloudinary()

