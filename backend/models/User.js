/**
 * STEP 1: User Model
 * 
 * This defines what a User document looks like in MongoDB.
 * Stores user information and hashes passwords automatically.
 */

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true, // No duplicate emails
    lowercase: true, // Convert to lowercase
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't return password by default
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    validate: {
      validator: function(value) {
        // Remove all non-digits and check if it's 10 digits
        const digitsOnly = value.replace(/\D/g, '')
        return digitsOnly.length === 10
      },
      message: 'Phone number must be 10 digits'
    }
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: {
      values: ['student', 'broker', 'hostelAdmin'],
      message: 'Role must be student, broker, or hostelAdmin'
    }
  },
  // Only for students
  collegeName: {
    type: String,
    trim: true,
    validate: {
      validator: function(value) {
        // If role is student, collegeName is required
        if (this.role === 'student') {
          return value && value.trim().length > 0
        }
        return true
      },
      message: 'College name is required for students'
    }
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
})

// Hash password BEFORE saving to database
// This runs automatically when we create or update a user
userSchema.pre('save', async function(next) {
  // Only hash if password is new or modified
  if (!this.isModified('password')) {
    return next()
  }

  try {
    // Generate salt (random data for hashing)
    const salt = await bcrypt.genSalt(10)
    // Hash the password with salt
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Method to compare password (for login)
// Usage: user.comparePassword('plainPassword')
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Remove password from JSON output (security)
userSchema.methods.toJSON = function() {
  const userObject = this.toObject()
  delete userObject.password
  return userObject
}

const User = mongoose.model('User', userSchema)

export default User

