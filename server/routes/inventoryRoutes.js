const express = require('express');
const router = express.Router();
const { getInventoryHistory, getPurchaseHistory } = require('../controllers/inventoryController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Admin: full inventory history
router.get('/history', protect, authorize('admin'), getInventoryHistory);

// Any user: own purchase history
router.get('/purchases', protect, getPurchaseHistory);

module.exports = router;
