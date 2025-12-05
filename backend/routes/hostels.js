const express = require('express');
const {
  getHostels,
  getHostel,
  createHostel,
  updateHostel,
  deleteHostel,
  searchHostels,
  getMyHostels,
  predictRent,
  toggleLike,
  trackView,
  addReview,
  getHostelReviews,
  markAsSoldOut,
  adminRemoveHostel,
  addStudent,
  removeStudent,
  getStudents
} = require('../controllers/hostels');

const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', getHostels);
router.get('/search', searchHostels);
router.get('/ai/recommendations', require('../controllers/hostels').getRecommendations);
router.get('/:id', getHostel);
router.get('/:id/reviews', getHostelReviews);

// Protected routes
router.use(protect);

router.post('/', authorize('hostel_admin', 'admin'), upload.mixed, createHostel, upload.errorHandler);
router.post('/predict-rent', predictRent);
router.get('/user/my-hostels', authorize('hostel_admin', 'admin'), getMyHostels);
router.put('/:id', upload.mixed, updateHostel, upload.errorHandler);
router.delete('/:id', deleteHostel);
router.post('/:id/like', toggleLike);
router.post('/:id/view', trackView);
router.post('/:id/reviews', addReview);
router.put('/:id/sold-out', authorize('admin'), markAsSoldOut);
router.delete('/:id/admin-remove', authorize('admin'), adminRemoveHostel);

// Student Management Routes (Only hostel_admin and admin)
router.post('/:id/students', authorize('hostel_admin', 'admin'), addStudent);
router.get('/:id/students', authorize('hostel_admin', 'admin'), getStudents);
router.delete('/:id/students/:studentId', authorize('hostel_admin', 'admin'), removeStudent);

module.exports = router;
