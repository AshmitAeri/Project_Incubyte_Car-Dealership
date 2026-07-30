const Review = require('../models/Review');
const InventoryHistory = require('../models/InventoryHistory');

/**
 * Helper — returns true if user has purchased this car
 */
const hasPurchasedCar = async (userId, carId) => {
  const record = await InventoryHistory.findOne({
    car: carId,
    user: userId,
    action: 'purchase',
  });
  return !!record;
};

/**
 * @desc    Get all reviews for a car
 * @route   GET /api/cars/:carId/reviews
 * @access  Public
 */
const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ car: req.params.carId })
      .populate('user', 'name avatarUrl')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check if the logged-in user can review a car
 * @route   GET /api/cars/:carId/reviews/canreview
 * @access  Private
 */
const checkCanReview = async (req, res, next) => {
  try {
    // Admins cannot review
    if (req.user.role === 'admin') {
      return res.status(200).json({ success: true, canReview: false, reason: 'Admins cannot write reviews.' });
    }

    const purchased = await hasPurchasedCar(req.user._id, req.params.carId);
    if (!purchased) {
      return res.status(200).json({ success: true, canReview: false, reason: 'You must purchase this car before reviewing it.' });
    }

    const alreadyReviewed = await Review.findOne({ car: req.params.carId, user: req.user._id });
    if (alreadyReviewed) {
      return res.status(200).json({ success: true, canReview: false, reason: 'You have already reviewed this car.' });
    }

    res.status(200).json({ success: true, canReview: true });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a review (only verified purchasers, not admins)
 * @route   POST /api/cars/:carId/reviews
 * @access  Private
 */
const createReview = async (req, res, next) => {
  try {
    // Admins cannot post reviews
    if (req.user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admins are not allowed to write customer reviews.',
      });
    }

    // Must have purchased the car
    const purchased = await hasPurchasedCar(req.user._id, req.params.carId);
    if (!purchased) {
      return res.status(403).json({
        success: false,
        message: 'You can only review a car you have purchased.',
      });
    }

    // No duplicate reviews
    const existing = await Review.findOne({ car: req.params.carId, user: req.user._id });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this car.',
      });
    }

    const { rating, title, body, pros, cons } = req.body;

    const review = await Review.create({
      car: req.params.carId,
      user: req.user._id,
      rating,
      title,
      body,
      pros: pros || [],
      cons: cons || [],
    });

    await review.populate('user', 'name avatarUrl');

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'You have already reviewed this car.' });
    }
    next(error);
  }
};

/**
 * @desc    Delete a review (own review only — admins can also delete)
 * @route   DELETE /api/cars/:carId/reviews/:reviewId
 * @access  Private
 */
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    // Only the author or an admin can delete
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review.' });
    }

    await Review.findByIdAndDelete(req.params.reviewId);

    res.status(200).json({ success: true, message: 'Review deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getReviews, checkCanReview, createReview, deleteReview };
