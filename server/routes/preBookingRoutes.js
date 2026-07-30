const express = require('express');
const router = express.Router();
const {
  createPreBooking,
  cancelPreBooking,
  getMyPreBookings,
  checkPreBooking,
} = require('../controllers/preBookingController');
const protect = require('../middleware/auth');

router.post('/:carId', protect, createPreBooking);
router.delete('/:carId', protect, cancelPreBooking);
router.get('/mine', protect, getMyPreBookings);
router.get('/check/:carId', protect, checkPreBooking);

module.exports = router;
