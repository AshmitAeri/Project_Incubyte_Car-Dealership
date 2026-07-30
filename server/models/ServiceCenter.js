const mongoose = require('mongoose');

const serviceCenterSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 4.0,
    },
    timings: {
      type: String,
      default: 'Mon–Sat: 9AM–6PM',
    },
    services: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('ServiceCenter', serviceCenterSchema);
