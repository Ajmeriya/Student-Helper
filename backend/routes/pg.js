/**
 * STEP 5: PG Routes
 * 
 * Connects URL endpoints to controller functions.
 * Some routes require authentication (auth middleware).
 */

import express from 'express'
import {
  getAllPGs,
  getPGById,
  createPG,
  updatePG,
  deletePG,
  getMyPGs
} from '../controllers/pgController.js'
import auth, { requireRole } from '../middleware/auth.js'

const router = express.Router()

// Public routes (no authentication required)
router.get('/', getAllPGs)           // GET /api/pg - Get all PGs
router.get('/:id', getPGById)        // GET /api/pg/:id - Get single PG

// Protected routes (require authentication + broker role)
// auth: Verifies user is logged in
// requireRole('broker'): Ensures user is a broker
router.get('/my-pgs', auth, requireRole('broker'), getMyPGs)  // GET /api/pg/my-pgs - Get my PGs (broker only)
router.post('/', auth, requireRole('broker'), createPG)       // POST /api/pg - Create PG (broker only)
router.put('/:id', auth, requireRole('broker'), updatePG)    // PUT /api/pg/:id - Update PG (broker only)
router.delete('/:id', auth, requireRole('broker'), deletePG)  // DELETE /api/pg/:id - Delete PG (broker only)

export default router

