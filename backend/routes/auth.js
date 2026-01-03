/**
 * STEP 4: Authentication Routes
 * 
 * Defines the authentication endpoints:
 * - POST /api/auth/signup - Register new user
 * - POST /api/auth/login - Login user
 * - GET /api/auth/me - Get current user (protected)
 */

import express from 'express'
import { signup, login, getMe } from '../controllers/authController.js'
import auth from '../middleware/auth.js'

const router = express.Router()

// Public routes (no authentication required)
router.post('/signup', signup)
router.post('/login', login)

// Protected route (requires authentication token)
// auth middleware verifies the JWT token
router.get('/me', auth, getMe)

export default router

