const express = require('express');
const router = express.Router({ mergeParams: true }); // access :carId from parent
const { getReviews, checkCanReview, createReview, deleteReview } = require('../controllers/reviewController');
const protect = require('../middleware/auth');

router.get('/', getReviews);
router.get('/canreview', protect, checkCanReview);  // check eligibility before showing form
router.post('/', protect, createReview);
router.delete('/:reviewId', protect, deleteReview);

module.exports = router;
