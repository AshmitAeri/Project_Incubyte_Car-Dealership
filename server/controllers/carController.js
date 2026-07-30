const Car = require('../models/Car');
const InventoryHistory = require('../models/InventoryHistory');
const APIFeatures = require('../utils/apiFeatures');
const { validationResult } = require('express-validator');
const { sendEmail, purchaseEmailTemplate } = require('../utils/sendEmail');
const fs = require('fs');
const path = require('path');

/**
 * @desc    Get all cars with search, filter, sort, pagination
 * @route   GET /api/cars
 * @access  Public
 */
const getCars = async (req, res, next) => {
  try {
    const features = new APIFeatures(Car.find().populate('createdBy', 'name email'), req.query)
      .search()
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const cars = await features.query;
    const total = await Car.countDocuments(features.query._conditions || {});

    res.status(200).json({
      success: true,
      count: cars.length,
      total,
      page: features.page || 1,
      pages: Math.ceil(total / (features.limit || 12)),
      data: cars,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single car by ID
 * @route   GET /api/cars/:id
 * @access  Public
 */
const getCarById = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id).populate('createdBy', 'name email');

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found.',
      });
    }

    res.status(200).json({ success: true, data: car });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new car (Admin only)
 * @route   POST /api/cars
 * @access  Private/Admin
 */
const createCar = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Clean up uploaded file on validation error
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    // Check for duplicate car (same name, brand, model, year)
    const existingCar = await Car.findOne({
      name: req.body.name,
      brand: req.body.brand,
      model: req.body.model,
      year: req.body.year,
    });

    if (existingCar) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(409).json({
        success: false,
        message: 'A car with the same Name, Brand, Model and Year already exists.',
      });
    }

    const carData = {
      ...req.body,
      createdBy: req.user.id,
      image: req.file ? req.file.filename : '',
    };

    const car = await Car.create(carData);

    res.status(201).json({
      success: true,
      message: 'Car added to inventory successfully.',
      data: car,
    });
  } catch (error) {
    if (req.file) fs.unlink(req.file.path, () => {});
    next(error);
  }
};

/**
 * @desc    Update a car (Admin only)
 * @route   PUT /api/cars/:id
 * @access  Private/Admin
 */
const updateCar = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    let car = await Car.findById(req.params.id);
    if (!car) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(404).json({ success: false, message: 'Car not found.' });
    }

    const updateData = { ...req.body };

    // FormData sends numbers as strings — cast them explicitly
    if (updateData.year)          updateData.year          = Number(updateData.year);
    if (updateData.mileage)       updateData.mileage       = Number(updateData.mileage);
    if (updateData.horsepower)    updateData.horsepower    = Number(updateData.horsepower);
    if (updateData.price)         updateData.price         = Number(updateData.price);
    if (updateData.stockQuantity) updateData.stockQuantity = Number(updateData.stockQuantity);
    if (updateData.interestRate)  updateData.interestRate  = Number(updateData.interestRate);

    // Handle image replacement
    if (req.file) {
      // Delete old image
      if (car.image) {
        const oldPath = path.join(__dirname, '../uploads', car.image);
        if (fs.existsSync(oldPath)) fs.unlink(oldPath, () => {});
      }
      updateData.image = req.file.filename;
    }

    car = await Car.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Car updated successfully.',
      data: car,
    });
  } catch (error) {
    if (req.file) fs.unlink(req.file.path, () => {});
    next(error);
  }
};

/**
 * @desc    Delete a car (Admin only)
 * @route   DELETE /api/cars/:id
 * @access  Private/Admin
 */
const deleteCar = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found.' });
    }

    // Delete associated image file
    if (car.image) {
      const imagePath = path.join(__dirname, '../uploads', car.image);
      if (fs.existsSync(imagePath)) fs.unlink(imagePath, () => {});
    }

    await car.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Car deleted from inventory.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Purchase a car (decrease stock)
 * @route   POST /api/cars/:id/purchase
 * @access  Private
 */
const purchaseCar = async (req, res, next) => {
  try {
    // Only regular users can purchase cars — admins manage inventory, not buy
    if (req.user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admins cannot purchase cars. Only customers can buy.',
      });
    }

    const { quantity = 1, paymentMethod = 'full', emiDetails } = req.body;
    const qty = parseInt(quantity);

    if (!qty || qty < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1.' });
    }

    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found.' });
    }

    if (car.stockQuantity === 0) {
      return res.status(400).json({
        success: false,
        message: 'This car is out of stock.',
      });
    }

    if (car.stockQuantity < qty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${car.stockQuantity} unit(s) available.`,
      });
    }

    const stockBefore = car.stockQuantity;
    const totalAmount = car.price * qty;
    const paymentStatus = paymentMethod === 'emi' ? 'active_emi' : 'completed';

    // Update stock
    car.stockQuantity -= qty;
    car.totalSold += qty;
    await car.save();

    // Record history
    const history = await InventoryHistory.create({
      car: car._id,
      user: req.user.id,
      action: 'purchase',
      quantity: qty,
      priceAtTime: car.price,
      stockBefore,
      stockAfter: car.stockQuantity,
      totalAmount,
      paymentMethod,
      paymentStatus,
      ...(paymentMethod === 'emi' && emiDetails && { emiDetails }),
    });

    // Send email notification (non-blocking)
    if (req.user.email) {
      sendEmail({
        to: req.user.email,
        subject: 'Purchase Confirmation — Car Inventory System',
        html: purchaseEmailTemplate({
          userName: req.user.name,
          carName: car.name,
          quantity: qty,
          totalAmount,
          orderId: history._id.toString().slice(-8).toUpperCase(),
        }),
      });
    }

    res.status(200).json({
      success: true,
      message: `Successfully purchased ${qty} unit(s) of ${car.name}.`,
      data: {
        car,
        history,
        totalAmount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Restock a car (increase stock) — Admin only
 * @route   POST /api/cars/:id/restock
 * @access  Private/Admin
 */
const restockCar = async (req, res, next) => {
  try {
    const { quantity, notes } = req.body;
    const qty = parseInt(quantity);

    if (!qty || qty < 1) {
      return res.status(400).json({ success: false, message: 'Restock quantity must be at least 1.' });
    }

    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found.' });
    }

    const stockBefore = car.stockQuantity;
    car.stockQuantity += qty;
    await car.save();

    await InventoryHistory.create({
      car: car._id,
      user: req.user.id,
      action: 'restock',
      quantity: qty,
      priceAtTime: car.price,
      stockBefore,
      stockAfter: car.stockQuantity,
      totalAmount: 0,
      notes,
    });

    res.status(200).json({
      success: true,
      message: `Restocked ${qty} unit(s) of ${car.name}. New stock: ${car.stockQuantity}`,
      data: car,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCars, getCarById, createCar, updateCar, deleteCar, purchaseCar, restockCar };
