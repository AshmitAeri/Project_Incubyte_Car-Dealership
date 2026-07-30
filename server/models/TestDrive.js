const mongoose = require('mongoose');

const testDriveSchema = new mongoose.Schema(
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
    preferredDate: {
      type: Date,
      required: [true, 'Preferred date is required'],
    },
    preferredTime: {
      type: String,
      enum: ['Morning (9AM–12PM)', 'Afternoon (12PM–4PM)', 'Evening (4PM–7PM)'],
      required: [true, 'Preferred time slot is required'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// One active booking per user per car
testDriveSchema.index({ car: 1, user: 1 });

module.exports = mongoose.model('TestDrive', testDriveSchema);
