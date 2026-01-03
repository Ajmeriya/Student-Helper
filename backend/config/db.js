/**
 * STEP 2: MongoDB Atlas Connection
 * 
 * MongoDB Atlas is a CLOUD database (free tier available).
 * This means:
 * - No need to install MongoDB on your computer
 * - Works everywhere (easy deployment)
 * - Free tier: 512MB storage (enough for learning)
 * 
 * Get your connection string from: https://www.mongodb.com/cloud/atlas
 */

import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI is not set in .env file!')
      console.error('💡 Please add MONGODB_URI to your .env file')
      process.exit(1)
    }

    console.log('🔄 Connecting to MongoDB Atlas...')
    
    // Connect to MongoDB Atlas (cloud database)
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Mongoose 6+ handles these automatically
    })

    console.log(`✅ MongoDB Atlas Connected!`)
    console.log(`📊 Database: ${conn.connection.name}`)
    console.log(`🌐 Host: ${conn.connection.host}`)
    console.log(`🔗 Connection String: ${process.env.MONGODB_URI.replace(/:[^:@]+@/, ':****@')}`) // Hide password
    console.log(`📈 Ready to accept connections\n`)
    
    // Log database and collection info
    console.log(`📋 Collections in database "${conn.connection.name}":`)
    const collections = await conn.connection.db.listCollections().toArray()
    collections.forEach(col => {
      console.log(`   - ${col.name}`)
    })
    console.log('')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message)
    console.error('\n💡 Make sure:')
    console.error('   1. You have created MongoDB Atlas account')
    console.error('   2. You have created a cluster (free tier M0)')
    console.error('   3. You have added your IP address to whitelist (0.0.0.0/0 for all)')
    console.error('   4. Your .env file has correct MONGODB_URI')
    console.error('   5. Your connection string format: mongodb+srv://username:password@cluster.mongodb.net/database-name')
    process.exit(1)
  }
}

export default connectDB

