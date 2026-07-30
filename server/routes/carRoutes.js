const express = require('express');
const router = express.Router();
const {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  purchaseCar,
  restockCar,
} = require('../controllers/carController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const upload = require('../middleware/upload');
const { carValidation, restockValidation } = require('../validators/carValidator');

// ─── Public Routes ────────────────────────────────────────────────────────────
router.get('/', getCars);
router.get('/:id', getCarById);

// ─── Protected Routes (Any authenticated user) ────────────────────────────────
router.post('/:id/purchase', protect, purchaseCar);

// ─── Admin Only Routes ────────────────────────────────────────────────────────
router.post(
  '/',
  protect,
  authorize('admin'),
  upload.single('image'),
  carValidation,
  createCar
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  upload.single('image'),
  carValidation,
  updateCar
);

router.delete('/:id', protect, authorize('admin'), deleteCar);

router.post(
  '/:id/restock',
  protect,
  authorize('admin'),
  restockValidation,
  restockCar
);

module.exports = router;
