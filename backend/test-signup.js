/**
 * Quick test script to verify signup is working
 * 
 * Run: node test-signup.js
 * 
 * Make sure:
 * 1. Server is running (npm run dev)
 * 2. .env file has MONGODB_URI
 */

import dotenv from 'dotenv'
import mongoose from 'mongoose'
import User from './models/User.js'

dotenv.config()

const testSignup = async () => {
  try {
    console.log('🔄 Connecting to database...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected!\n')

    // Test data
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`, // Unique email
      password: 'Test123!@#',
      phoneNumber: '1234567890',
      city: 'Nadiad',
      role: 'broker'
    }

    console.log('📝 Creating test user...')
    console.log('Data:', { ...testUser, password: '***' })

    const user = await User.create(testUser)
    
    console.log('✅ User created successfully!')
    console.log('User ID:', user._id)
    console.log('User:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      city: user.city
    })

    // Verify user exists in database
    const foundUser = await User.findById(user._id)
    if (foundUser) {
      console.log('\n✅ User found in database!')
    } else {
      console.log('\n❌ User NOT found in database!')
    }

    // Clean up - delete test user
    await User.findByIdAndDelete(user._id)
    console.log('\n🧹 Test user deleted')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.errors) {
      console.error('Validation errors:')
      Object.values(error.errors).forEach(err => {
        console.error(`  - ${err.path}: ${err.message}`)
      })
    }
    process.exit(1)
  }
}

testSignup()

