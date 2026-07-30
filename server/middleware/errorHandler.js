/**
 * Global Error Handler Middleware
 * Catches and formats all errors thrown in the application
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('🔴 ERROR:', err);
  }

  // ─── Mongoose: Bad ObjectId ───────────────────────────────────────────────────
  if (err.name === 'CastError') {
    error = {
      statusCode: 400,
      message: `Resource not found. Invalid ID: ${err.value}`,
    };
  }

  // ─── Mongoose: Duplicate Key ──────────────────────────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = {
      statusCode: 409,
      message: `Duplicate value for field '${field}'. This ${field} already exists.`,
    };
  }

  // ─── Mongoose: Validation Error ───────────────────────────────────────────────
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    error = {
      statusCode: 400,
      message: messages.join('. '),
    };
  }

  // ─── JWT Errors ───────────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    error = { statusCode: 401, message: 'Invalid token.' };
  }
  if (err.name === 'TokenExpiredError') {
    error = { statusCode: 401, message: 'Token expired.' };
  }

  // ─── Multer Errors ────────────────────────────────────────────────────────────
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = { statusCode: 400, message: 'File size too large. Maximum 5MB allowed.' };
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = { statusCode: 400, message: 'Unexpected field in file upload.' };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 Not Found Handler
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = { errorHandler, notFound };
