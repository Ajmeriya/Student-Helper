/**
 * STEP 2: Authentication Controller
 * 
 * Handles user registration (signup) and login.
 * 
 * Functions:
 * - signup: Create new user account
 * - login: Authenticate user and return token
 */

import User from '../models/User.js'
import jwt from 'jsonwebtoken'

// Generate JWT Token
// JWT = JSON Web Token (like a temporary ID card)
const generateToken = (userId) => {
  return jwt.sign(
    { userId }, // Data stored in token (user ID)
    process.env.JWT_SECRET || 'your-secret-key-change-in-production', // Secret key
    { expiresIn: '30d' } // Token expires in 30 days
  )
}

/**
 * Signup - Create new user account
 * 
 * Endpoint: POST /api/auth/signup
 * Body: { name, email, password, phoneNumber, city, role, collegeName? }
 */
export const signup = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, city, role, collegeName } = req.body

    console.log('📝 Signup attempt:', { name, email, role, city })

    // Validation - Check required fields
    if (!name || !email || !password || !phoneNumber || !city || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
        missing: {
          name: !name,
          email: !email,
          password: !password,
          phoneNumber: !phoneNumber,
          city: !city,
          role: !role
        }
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      console.log('❌ User already exists:', email)
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      })
    }

    // Validate student has college name
    if (role === 'student' && !collegeName) {
      return res.status(400).json({
        success: false,
        message: 'College name is required for students'
      })
    }

    // Prepare user data
    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, '')
    
    if (cleanPhoneNumber.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be exactly 10 digits'
      })
    }

    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password, // Will be hashed automatically by pre-save hook
      phoneNumber: cleanPhoneNumber,
      city: city.trim(),
      role: role.toLowerCase()
    }

    // Only add collegeName if role is student
    if (role === 'student' && collegeName) {
      userData.collegeName = collegeName.trim()
    }

    // Create user (password will be hashed automatically by pre-save hook)
    const user = await User.create(userData)

    console.log('✅ User created successfully!')

    // Verify user was actually saved
    const verifyUser = await User.findById(user._id)
    if (verifyUser) {
      console.log('Verification: User found in database!')
    } else {
      console.error('Verification: User NOT found in database!')
    }

    // Generate JWT token
    const token = generateToken(user._id)

    // Send response (password is automatically excluded by toJSON method)
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        city: user.city,
        collegeName: user.collegeName,
        phoneNumber: user.phoneNumber
      }
    })
  } catch (error) {
    console.error('❌ Signup error:', error)
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      errors: error.errors
    })
    
    // Handle duplicate email error (MongoDB unique index)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
        field: Object.keys(error.keyPattern)[0]
      })
    }

    // Handle validation errors (from Mongoose schema)
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }))
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      })
    }

    // Generic server error
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}

/**
 * Login - Authenticate user
 * 
 * Endpoint: POST /api/auth/login
 * Body: { email, password }
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      })
    }

    // Find user by email
    // .select('+password') - Include password field (normally excluded)
    const user = await User.findOne({ email }).select('+password')
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Generate JWT token
    const token = generateToken(user._id)

    // Send response
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        city: user.city,
        collegeName: user.collegeName,
        phoneNumber: user.phoneNumber
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    })
  }
}

/**
 * Get Current User
 * 
 * Endpoint: GET /api/auth/me
 * Requires: Authentication token in header
 */
export const getMe = async (req, res) => {
  try {
    // User is attached to req by auth middleware
    const user = await User.findById(req.userId)
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        city: user.city,
        collegeName: user.collegeName,
        phoneNumber: user.phoneNumber
      }
    })
  } catch (error) {
    console.error('Get me error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    })
  }
}

