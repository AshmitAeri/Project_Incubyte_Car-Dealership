const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    title: {
      type: String,
      required: [true, 'Review title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    body: {
      type: String,
      required: [true, 'Review body is required'],
      trim: true,
      maxlength: [1000, 'Review cannot exceed 1000 characters'],
    },
    pros: [{ type: String, trim: true }],
    cons: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

// One review per user per car
reviewSchema.index({ car: 1, user: 1 }, { unique: true });

// ─── Static: recalculate average rating on a car ──────────────────────────────
reviewSchema.statics.calcAverageRating = async function (carId) {
  const result = await this.aggregate([
    { $match: { car: carId } },
    { $group: { _id: '$car', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  if (result.length > 0) {
    await mongoose.model('Car').findByIdAndUpdate(carId, {
      averageRating: Math.round(result[0].avgRating * 10) / 10,
      reviewCount: result[0].count,
    });
  } else {
    await mongoose.model('Car').findByIdAndUpdate(carId, {
      averageRating: 0,
      reviewCount: 0,
    });
  }
};

// Recalculate after save and delete
reviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.car);
});

reviewSchema.post('findOneAndDelete', function (doc) {
  if (doc) doc.constructor.calcAverageRating(doc.car);
});

module.exports = mongoose.model('Review', reviewSchema);
