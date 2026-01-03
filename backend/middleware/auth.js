/**
 * STEP 3: Authentication Middleware
 * 
 * This protects routes by verifying JWT tokens.
 * 
 * How it works:
 * 1. User sends request with token in header: "Authorization: Bearer <token>"
 * 2. Middleware extracts and verifies token
 * 3. If valid, adds userId and user to request object
 * 4. If invalid, returns 401 error
 */

import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const auth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    // Format: "Bearer <token>"
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied'
      })
    }

    // Extract token (remove "Bearer " prefix)
    const token = authHeader.substring(7)

    // Verify token
    // jwt.verify checks if token is valid and not expired
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    )

    // Get user from database (to access role)
    const user = await User.findById(decoded.userId)
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      })
    }

    // Add userId and user to request object
    // Now any route using this middleware can access req.userId and req.user
    req.userId = decoded.userId
    req.user = user

    // Continue to next middleware/route
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      })
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      })
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    })
  }
}

/**
 * Role-based Authorization Middleware
 * 
 * Checks if user has required role(s)
 * 
 * Usage: requireRole('broker') or requireRole('broker', 'hostelAdmin')
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated (should be set by auth middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      })
    }

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This action requires one of these roles: ${allowedRoles.join(', ')}`
      })
    }

    // User has required role, continue
    next()
  }
}

export default auth

