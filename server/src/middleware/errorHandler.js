import logger from '../config/logger.js';

/**
 * Global Express error handler.
 * Must be registered LAST in the middleware chain (after all routes).
 *
 * Usage: next(error) from any route handler will invoke this.
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  const message = err.message || 'Internal Server Error';

  // Log unhandled server errors (500s) as errors, and client-side (4xx) issues as warnings
  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} - Internal Server Error: ${message}`, err);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} - Client Error (${statusCode}): ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    // Include stack trace in development only
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
