const InventoryHistory = require('../models/InventoryHistory');

/**
 * @desc    Get full inventory history (purchases + restocks)
 * @route   GET /api/inventory/history
 * @access  Private/Admin
 */
const getInventoryHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.action) filter.action = req.query.action;
    if (req.query.carId) filter.car = req.query.carId;

    const [history, total] = await Promise.all([
      InventoryHistory.find(filter)
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .populate('car', 'name brand model image')
        .populate('user', 'name email role'),
      InventoryHistory.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: history.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get purchase history for current user
 * @route   GET /api/inventory/purchases
 * @access  Private
 */
const getPurchaseHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { user: req.user.id, action: 'purchase' };

    const [history, total] = await Promise.all([
      InventoryHistory.find(filter)
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .populate('car', 'name brand model image price'),
      InventoryHistory.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: history.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getInventoryHistory, getPurchaseHistory };
