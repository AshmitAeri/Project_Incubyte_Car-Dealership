const express = require('express');
const router = express.Router();
const { getServiceCentersByBrand, getAllServiceCenters } = require('../controllers/serviceCenterController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/', getServiceCentersByBrand);          // ?brand=BMW — public
router.get('/all', protect, authorize('admin'), getAllServiceCenters);

module.exports = router;
