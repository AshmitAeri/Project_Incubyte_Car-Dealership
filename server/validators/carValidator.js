const { body } = require('express-validator');

const currentYear = new Date().getFullYear();

/**
 * Validation rules for creating/updating a car
 */
const carValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Car name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),

  body('brand')
    .trim()
    .notEmpty().withMessage('Brand is required'),

  body('model')
    .trim()
    .notEmpty().withMessage('Model is required'),

  body('year')
    .notEmpty().withMessage('Year is required')
    .isInt({ min: 1886, max: currentYear + 2 })
    .withMessage(`Year must be between 1886 and ${currentYear + 2}`),

  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Pickup Truck', 'Van', 'Wagon', 'Sports', 'Luxury', 'Electric'])
    .withMessage('Invalid category'),

  body('color')
    .trim()
    .notEmpty().withMessage('Color is required'),

  body('fuelType')
    .notEmpty().withMessage('Fuel type is required')
    .isIn(['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG', 'LPG'])
    .withMessage('Invalid fuel type'),

  body('transmission')
    .notEmpty().withMessage('Transmission is required')
    .isIn(['Manual', 'Automatic', 'CVT', 'Semi-Automatic'])
    .withMessage('Invalid transmission type'),

  body('mileage')
    .notEmpty().withMessage('Mileage is required')
    .isFloat({ min: 0 }).withMessage('Mileage must be a positive number'),

  body('engine')
    .trim()
    .notEmpty().withMessage('Engine specification is required'),

  body('horsepower')
    .notEmpty().withMessage('Horsepower is required')
    .isInt({ min: 1 }).withMessage('Horsepower must be at least 1'),

  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),

  body('stockQuantity')
    .notEmpty().withMessage('Stock quantity is required')
    .isInt({ min: 0 }).withMessage('Stock cannot be negative'),

  body('interestRate')
    .notEmpty().withMessage('Interest rate is required')
    .isFloat({ min: 0, max: 100 }).withMessage('Interest rate must be between 0 and 100'),

  body('description')
    .optional()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
];

/**
 * Validation rules for restock
 */
const restockValidation = [
  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

module.exports = { carValidation, restockValidation };
