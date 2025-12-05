const express = require('express');
const {
  getPGs,
  getPG,
  createPG,
  updatePG,
  deletePG,
  searchPGs,
  getMyPGs,
  predictRent,
  toggleLike,
  trackView,
  addReview,
  getPGReviews,
  markAsSoldOut,
  adminRemovePG
} = require('../controllers/pgs');

const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', getPGs);
router.get('/search', searchPGs);
router.get('/ai/recommendations', require('../controllers/pgs').getRecommendations);
router.get('/:id', getPG);
router.get('/:id/reviews', getPGReviews);

// Protected routes
router.use(protect);

router.post('/', authorize('broker', 'hostel_admin', 'admin'), upload.mixed, createPG, upload.errorHandler);
router.post('/predict-rent', predictRent);
router.get('/user/my-pgs', authorize('broker', 'hostel_admin', 'admin'), getMyPGs);
router.put('/:id', upload.mixed, updatePG, upload.errorHandler);
router.delete('/:id', deletePG);
router.post('/:id/like', toggleLike);
router.post('/:id/view', trackView);
router.post('/:id/reviews', addReview);
router.put('/:id/sold-out', authorize('admin'), markAsSoldOut);
router.delete('/:id/admin-remove', authorize('admin'), adminRemovePG);

module.exports = router;
