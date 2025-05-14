import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  statusCode?: number;
  details?: any;
}

/**
 * Global error handling middleware for the application
 * Catches all errors and sends appropriate responses
 */
export const errorHandler = (
  err: AppError, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  console.error('Error:', err);
  
  // Default error status and message
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Specific error handling for known error types
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: err.details || err.message
    });
  }
  
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    // MongoDB error
    if ((err as any).code === 11000) {
      // Duplicate key error
      return res.status(409).json({
        success: false,
        message: 'Duplicate key error',
        error: 'A record with this information already exists'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Database Error',
      error: process.env.NODE_ENV === 'production' 
        ? 'A database error occurred' 
        : err.message
    });
  }
  
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    // JWT errors
    return res.status(401).json({
      success: false,
      message: 'Authentication Error',
      error: 'Invalid or expired token'
    });
  }
  
  // Default error response
  return res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'production' 
      ? statusCode === 500 ? 'An unexpected error occurred' : message 
      : err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};

/**
 * Middleware to handle 404 Not Found errors
 */
export const notFoundHandler = (req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    message: 'Not Found',
    error: `Route ${req.method} ${req.originalUrl} not found`
  });
};

/**
 * Async error handler to catch errors in async routes
 * @param fn - Async route handler function
 * @returns Route handler with error catching
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default {
  errorHandler,
  notFoundHandler,
  asyncHandler
};
