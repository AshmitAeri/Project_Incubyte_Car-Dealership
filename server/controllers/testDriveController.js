const TestDrive = require('../models/TestDrive');

/**
 * @desc    Book a test drive
 * @route   POST /api/testdrives
 * @access  Private
 */
const bookTestDrive = async (req, res, next) => {
  try {
    const { carId, preferredDate, preferredTime, phone, notes } = req.body;

    // Check for existing active booking
    const existing = await TestDrive.findOne({
      car: carId,
      user: req.user._id,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You already have an active test drive booking for this car.',
      });
    }

    const testDrive = await TestDrive.create({
      car: carId,
      user: req.user._id,
      preferredDate,
      preferredTime,
      phone,
      notes,
    });

    await testDrive.populate('car', 'name brand model');

    res.status(201).json({ success: true, data: testDrive });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user's test drive bookings
 * @route   GET /api/testdrives/mine
 * @access  Private
 */
const getMyTestDrives = async (req, res, next) => {
  try {
    const testDrives = await TestDrive.find({ user: req.user._id })
      .populate('car', 'name brand model image price')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: testDrives.length, data: testDrives });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all test drive bookings (admin)
 * @route   GET /api/testdrives
 * @access  Private/Admin
 */
const getAllTestDrives = async (req, res, next) => {
  try {
    const testDrives = await TestDrive.find()
      .populate('car', 'name brand model')
      .populate('user', 'name email')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: testDrives.length, data: testDrives });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update test drive status (admin)
 * @route   PUT /api/testdrives/:id
 * @access  Private/Admin
 */
const updateTestDriveStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const testDrive = await TestDrive.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('car', 'name brand').populate('user', 'name email');

    if (!testDrive) {
      return res.status(404).json({ success: false, message: 'Test drive booking not found.' });
    }

    res.status(200).json({ success: true, data: testDrive });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel own test drive
 * @route   DELETE /api/testdrives/:id
 * @access  Private
 */
const cancelTestDrive = async (req, res, next) => {
  try {
    const testDrive = await TestDrive.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!testDrive) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    testDrive.status = 'cancelled';
    await testDrive.save();

    res.status(200).json({ success: true, message: 'Test drive booking cancelled.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { bookTestDrive, getMyTestDrives, getAllTestDrives, updateTestDriveStatus, cancelTestDrive };
