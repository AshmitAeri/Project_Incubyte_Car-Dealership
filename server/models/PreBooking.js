const mongoose = require('mongoose');

const preBookingSchema = new mongoose.Schema(
  {
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['waiting', 'notified', 'cancelled'],
      default: 'waiting',
    },
    notifiedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// One pre-booking per user per car
preBookingSchema.index({ car: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('PreBooking', preBookingSchema);
