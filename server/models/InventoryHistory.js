const mongoose = require('mongoose');

/**
 * InventoryHistory Schema
 * Tracks every purchase and restock event
 */
const inventoryHistorySchema = new mongoose.Schema(
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
    action: {
      type: String,
      enum: ['purchase', 'restock'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    priceAtTime: {
      type: Number,
      required: true,
    },
    stockBefore: {
      type: Number,
      required: true,
    },
    stockAfter: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    paymentMethod: {
      type: String,
      enum: ['full', 'emi'],
      default: 'full',
    },
    paymentStatus: {
      type: String,
      enum: ['completed', 'active_emi', 'pending'],
      default: 'completed',
    },
    emiDetails: {
      tenure: { type: Number },
      interestRate: { type: Number },
      monthlyEMI: { type: Number },
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster history queries
inventoryHistorySchema.index({ car: 1, createdAt: -1 });
inventoryHistorySchema.index({ user: 1, createdAt: -1 });
inventoryHistorySchema.index({ action: 1 });

module.exports = mongoose.model('InventoryHistory', inventoryHistorySchema);
