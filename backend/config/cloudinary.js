/**
 * Cloudinary Configuration
 * 
 * Cloudinary is a cloud-based image/video management service.
 * Free tier: 25GB storage, 25GB bandwidth/month
 * 
 * Setup:
 * 1. Go to https://cloudinary.com/users/register/free
 * 2. Create free account
 * 3. Get your credentials from Dashboard
 * 4. Add to .env file:
 *    CLOUDINARY_CLOUD_NAME=your_cloud_name
 *    CLOUDINARY_API_KEY=your_api_key
 *    CLOUDINARY_API_SECRET=your_api_secret
 */

import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'

// Load environment variables (in case this is imported before server.js loads dotenv)
dotenv.config()

// Get values and trim any whitespace
const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim()
const apiKey = process.env.CLOUDINARY_API_KEY?.trim()
const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim()

// Debug: Log raw values (first few chars only for security)
console.log('🔍 Cloudinary Config Check:')
console.log(`   CLOUDINARY_CLOUD_NAME: ${cloudName ? `"${cloudName}"` : 'undefined/null'}`)
console.log(`   CLOUDINARY_API_KEY: ${apiKey ? `"${apiKey.substring(0, 5)}..." (length: ${apiKey.length})` : 'undefined/null'}`)
console.log(`   CLOUDINARY_API_SECRET: ${apiSecret ? `"${apiSecret.substring(0, 5)}..." (length: ${apiSecret.length})` : 'undefined/null'}`)

// Validate Cloudinary configuration
if (!cloudName || cloudName.length === 0) {
  console.error('❌ CLOUDINARY_CLOUD_NAME is missing or empty!')
  throw new Error('CLOUDINARY_CLOUD_NAME is required')
}

if (!apiKey || apiKey.length === 0) {
  console.error('❌ CLOUDINARY_API_KEY is missing or empty!')
  throw new Error('CLOUDINARY_API_KEY is required')
}

if (!apiSecret || apiSecret.length === 0) {
  console.error('❌ CLOUDINARY_API_SECRET is missing or empty!')
  throw new Error('CLOUDINARY_API_SECRET is required')
}

// Configure Cloudinary with explicit values
try {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true // Use HTTPS
  })

  // Verify configuration was applied
  const config = cloudinary.config()
  if (!config.cloud_name || !config.api_key || !config.api_secret) {
    console.error('❌ Cloudinary configuration failed!')
    console.error('Config after setting:', {
      cloud_name: config.cloud_name ? 'SET' : 'MISSING',
      api_key: config.api_key ? 'SET' : 'MISSING',
      api_secret: config.api_secret ? 'SET' : 'MISSING'
    })
    throw new Error('Cloudinary configuration failed - values not set')
  }

  console.log('✅ Cloudinary configured successfully')
  console.log(`   Cloud Name: ${config.cloud_name}`)
  console.log(`   API Key: ${config.api_key.substring(0, 5)}...`)
} catch (error) {
  console.error('❌ Error configuring Cloudinary:', error.message)
  throw error
}

export default cloudinary

