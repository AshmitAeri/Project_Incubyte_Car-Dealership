const mongoose = require('mongoose');

/**
 * Car Schema
 * Core model for the inventory system
 */
const carSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Car name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: [1886, 'Year must be after 1886'],
      max: [new Date().getFullYear() + 2, 'Year is too far in the future'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Pickup Truck', 'Van', 'Wagon', 'Sports', 'Luxury', 'Electric'],
    },
    color: {
      type: String,
      required: [true, 'Color is required'],
      trim: true,
    },
    fuelType: {
      type: String,
      required: [true, 'Fuel type is required'],
      enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG', 'LPG'],
    },
    transmission: {
      type: String,
      required: [true, 'Transmission is required'],
      enum: ['Manual', 'Automatic', 'CVT', 'Semi-Automatic'],
    },
    mileage: {
      type: Number,
      required: [true, 'Mileage is required'],
      min: [0, 'Mileage cannot be negative'],
      comment: 'Mileage in km/l or miles/gallon',
    },
    engine: {
      type: String,
      required: [true, 'Engine specification is required'],
      trim: true,
    },
    horsepower: {
      type: Number,
      required: [true, 'Horsepower is required'],
      min: [1, 'Horsepower must be at least 1'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    interestRate: {
      type: Number,
      required: [true, 'Interest rate is required'],
      min: [0, 'Interest rate cannot be negative'],
      max: [100, 'Interest rate cannot exceed 100%'],
      default: 10,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    image: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['available', 'out_of_stock', 'discontinued'],
      default: 'available',
    },
    totalSold: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tags: [{ type: String }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes for faster querying ──────────────────────────────────────────────
carSchema.index({ brand: 1 });
carSchema.index({ category: 1 });
carSchema.index({ price: 1 });
carSchema.index({ year: -1 });
carSchema.index({ status: 1 });
carSchema.index({ name: 'text', brand: 'text', description: 'text' });

// ─── Virtual: Image URL ────────────────────────────────────────────────────────
carSchema.virtual('imageUrl').get(function () {
  if (this.image) return `/uploads/${this.image}`;
  return `https://via.placeholder.com/600x400?text=${encodeURIComponent(this.name)}`;
});

// ─── Pre-save Hook: Auto-update status based on stock ─────────────────────────
carSchema.pre('save', function (next) {
  if (this.stockQuantity === 0) {
    this.status = 'out_of_stock';
  } else if (this.status === 'out_of_stock' && this.stockQuantity > 0) {
    this.status = 'available';
  }
  next();
});

// ─── Static: Get inventory value ─────────────────────────────────────────────
carSchema.statics.getTotalInventoryValue = async function () {
  const result = await this.aggregate([
    { $match: { status: { $ne: 'discontinued' } } },
    {
      $group: {
        _id: null,
        totalValue: { $sum: { $multiply: ['$price', '$stockQuantity'] } },
      },
    },
  ]);
  return result[0]?.totalValue || 0;
};

module.exports = mongoose.model('Car', carSchema);
