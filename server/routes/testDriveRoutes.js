const express = require('express');
const router = express.Router();
const {
  bookTestDrive,
  getMyTestDrives,
  getAllTestDrives,
  updateTestDriveStatus,
  cancelTestDrive,
} = require('../controllers/testDriveController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.post('/', protect, bookTestDrive);
router.get('/mine', protect, getMyTestDrives);
router.get('/', protect, authorize('admin'), getAllTestDrives);
router.put('/:id', protect, authorize('admin'), updateTestDriveStatus);
router.delete('/:id', protect, cancelTestDrive);

module.exports = router;
