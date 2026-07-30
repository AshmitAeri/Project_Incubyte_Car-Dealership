const PreBooking = require('../models/PreBooking');
const Car = require('../models/Car');

/**
 * @desc    Pre-book a car (notify when available)
 * @route   POST /api/prebookings/:carId
 * @access  Private
 */
const createPreBooking = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.carId);

    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found.' });
    }

    if (car.stockQuantity > 0) {
      return res.status(400).json({
        success: false,
        message: 'Car is in stock. You can purchase it directly.',
      });
    }

    const existing = await PreBooking.findOne({
      car: req.params.carId,
      user: req.user._id,
      status: 'waiting',
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You're already on the waitlist for this car.",
      });
    }

    const preBooking = await PreBooking.create({
      car: req.params.carId,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "You're on the waitlist! We'll notify you when it's available.",
      data: preBooking,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You're already on the waitlist for this car.",
      });
    }
    next(error);
  }
};

/**
 * @desc    Cancel pre-booking
 * @route   DELETE /api/prebookings/:carId
 * @access  Private
 */
const cancelPreBooking = async (req, res, next) => {
  try {
    const preBooking = await PreBooking.findOneAndUpdate(
      { car: req.params.carId, user: req.user._id, status: 'waiting' },
      { status: 'cancelled' },
      { new: true }
    );

    if (!preBooking) {
      return res.status(404).json({ success: false, message: 'No active pre-booking found.' });
    }

    res.status(200).json({ success: true, message: 'Pre-booking cancelled.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user's pre-bookings
 * @route   GET /api/prebookings/mine
 * @access  Private
 */
const getMyPreBookings = async (req, res, next) => {
  try {
    const preBookings = await PreBooking.find({ user: req.user._id })
      .populate('car', 'name brand model price image stockQuantity')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: preBookings.length, data: preBookings });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check if user has pre-booked a specific car
 * @route   GET /api/prebookings/check/:carId
 * @access  Private
 */
const checkPreBooking = async (req, res, next) => {
  try {
    const preBooking = await PreBooking.findOne({
      car: req.params.carId,
      user: req.user._id,
      status: 'waiting',
    });

    res.status(200).json({ success: true, hasPreBooking: !!preBooking, data: preBooking });
  } catch (error) {
    next(error);
  }
};

module.exports = { createPreBooking, cancelPreBooking, getMyPreBookings, checkPreBooking };
