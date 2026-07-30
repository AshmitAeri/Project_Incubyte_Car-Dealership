const ServiceCenter = require('../models/ServiceCenter');

/**
 * @desc    Get service centers by brand
 * @route   GET /api/servicecenters?brand=BMW
 * @access  Public
 */
const getServiceCentersByBrand = async (req, res, next) => {
  try {
    const { brand } = req.query;

    if (!brand) {
      return res.status(400).json({ success: false, message: 'Brand query param is required.' });
    }

    const centers = await ServiceCenter.find({
      brand: { $regex: new RegExp(brand, 'i') },
    }).sort('city');

    res.status(200).json({ success: true, count: centers.length, data: centers });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all service centers (admin)
 * @route   GET /api/servicecenters/all
 * @access  Private/Admin
 */
const getAllServiceCenters = async (req, res, next) => {
  try {
    const centers = await ServiceCenter.find().sort('brand city');
    res.status(200).json({ success: true, count: centers.length, data: centers });
  } catch (error) {
    next(error);
  }
};

module.exports = { getServiceCentersByBrand, getAllServiceCenters };
