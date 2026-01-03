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
  getMyPGs,
  updatePGStatus
} from '../controllers/pgController.js'
import auth, { requireRole } from '../middleware/auth.js'
import { uploadMedia } from '../middleware/multer.js'

const router = express.Router()

// Public routes (no authentication required)
router.get('/', getAllPGs)           // GET /api/pg - Get all PGs

// Protected routes (require authentication + broker role)
// IMPORTANT: Specific routes must come BEFORE parameterized routes
// auth: Verifies user is logged in
// requireRole('broker'): Ensures user is a broker
router.get('/my-pgs', auth, requireRole('broker'), getMyPGs)  // GET /api/pg/my-pgs - Get my PGs (broker only)

// Parameterized routes (must come after specific routes)
router.get('/:id', getPGById)        // GET /api/pg/:id - Get single PG
router.post('/', auth, requireRole('broker'), uploadMedia, createPG)       // POST /api/pg - Create PG (broker only) with file upload
router.put('/:id', auth, requireRole('broker'), uploadMedia, updatePG)    // PUT /api/pg/:id - Update PG (broker only) with file upload
router.patch('/:id/status', auth, requireRole('broker'), updatePGStatus)  // PATCH /api/pg/:id/status - Update PG status (broker only)
router.delete('/:id', auth, requireRole('broker'), deletePG)  // DELETE /api/pg/:id - Delete PG (broker only)

export default router

