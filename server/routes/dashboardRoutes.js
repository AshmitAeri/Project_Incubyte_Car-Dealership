const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/dashboardController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/', protect, authorize('admin'), getDashboard);

module.exports = router;
