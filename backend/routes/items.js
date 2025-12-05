const express = require('express');
const {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  searchItems,
  getMyItems,
  markAsSold,
  toggleLike,
  trackView,
  addReview,
  getItemReviews
} = require('../controllers/items');

const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', getItems);
router.get('/search', searchItems);
router.get('/:id', getItem);
router.get('/:id/reviews', getItemReviews);

// Protected routes
router.use(protect);

router.post('/', upload.images('images'), createItem, upload.errorHandler);
router.get('/user/my-items', getMyItems);
router.put('/:id', upload.images('images'), updateItem, upload.errorHandler);
router.delete('/:id', deleteItem);
router.put('/:id/sold', markAsSold);
router.post('/:id/like', toggleLike);
router.post('/:id/view', trackView);
router.post('/:id/reviews', addReview);

module.exports = router;