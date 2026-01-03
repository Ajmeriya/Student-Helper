/**
 * Check Database Connection and Data
 * 
 * Run: node check-database.js
 * 
 * This script will:
 * 1. Connect to MongoDB
 * 2. Show which database you're connected to
 * 3. List all collections
 * 4. Count documents in users collection
 * 5. Show sample users if any exist
 */

import dotenv from 'dotenv'
import mongoose from 'mongoose'
import User from './models/User.js'

dotenv.config()

const checkDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...\n')
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in .env file!')
      process.exit(1)
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI)
    
    console.log('✅ Connected to MongoDB!')
    console.log(`📊 Database Name: ${conn.connection.name}`)
    console.log(`🌐 Host: ${conn.connection.host}\n`)

    // List all collections
    console.log('📋 Collections in this database:')
    const collections = await conn.connection.db.listCollections().toArray()
    if (collections.length === 0) {
      console.log('   (No collections found)')
    } else {
      for (const col of collections) {
        const count = await conn.connection.db.collection(col.name).countDocuments()
        console.log(`   - ${col.name}: ${count} documents`)
      }
    }
    console.log('')

    // Check users collection specifically
    console.log('👥 Users Collection:')
    const userCount = await User.countDocuments()
    console.log(`   Total users: ${userCount}`)

    if (userCount > 0) {
      console.log('\n📝 Sample users:')
      const users = await User.find().limit(5).select('-password')
      users.forEach((user, index) => {
        console.log(`\n   User ${index + 1}:`)
        console.log(`      ID: ${user._id}`)
        console.log(`      Name: ${user.name}`)
        console.log(`      Email: ${user.email}`)
        console.log(`      Role: ${user.role}`)
        console.log(`      City: ${user.city}`)
        console.log(`      Created: ${user.createdAt}`)
      })
    } else {
      console.log('   ⚠️  No users found in database!')
      console.log('\n💡 Possible issues:')
      console.log('   1. Data is being saved to a different database')
      console.log('   2. Check your MONGODB_URI in .env file')
      console.log('   3. Make sure database name in connection string matches what you see in Atlas')
    }

    // Check what database name is in connection string
    const uriParts = process.env.MONGODB_URI.split('/')
    const dbNameFromUri = uriParts[uriParts.length - 1].split('?')[0]
    console.log(`\n🔍 Database name in connection string: "${dbNameFromUri}"`)
    console.log(`🔍 Actual connected database: "${conn.connection.name}"`)
    
    if (dbNameFromUri !== conn.connection.name) {
      console.log('\n⚠️  WARNING: Database names don\'t match!')
      console.log('   This might be why you can\'t see data in Atlas.')
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

checkDatabase()

