import { Request, Response, NextFunction } from 'express';

// Simple in-memory store for rate limiting
// For production, should use Redis or another external store
const ipRequests: Record<string, { count: number, resetTime: number }> = {};

interface RateLimitOptions {
  windowMs?: number;       // Time window in milliseconds
  max?: number;            // Maximum number of requests in the time window
  standardHeaders?: boolean; // Whether to add standard rate limit headers to responses
  message?: string;        // Custom message for rate limit exceeded
  skipFailedRequests?: boolean; // Whether to skip failed requests (status >= 400)
  skipSuccessfulRequests?: boolean; // Whether to skip successful requests (status < 400)
  keyGenerator?: (req: Request) => string; // Function to generate keys
  skip?: (req: Request, res: Response) => boolean; // Function to skip requests
  handler?: (req: Request, res: Response, next: NextFunction) => void; // Custom handler
}

/**
 * Rate limiting middleware for Express
 * Limits the number of requests from an IP address within a time window
 */
export const rateLimit = (options: RateLimitOptions = {}) => {
  // Default options
  const defaultOptions: Required<RateLimitOptions> = {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per windowMs
    standardHeaders: true,
    message: 'Too many requests, please try again later',
    skipFailedRequests: false,
    skipSuccessfulRequests: false,
    keyGenerator: (req: Request) => {
      return req.ip || req.socket.remoteAddress || 'unknown';
    },
    skip: () => false,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        message: options.message || defaultOptions.message
      });
    }
  };

  // Merge options
  const config = {
    ...defaultOptions,
    ...options
  };

  return (req: Request, res: Response, next: NextFunction) => {
    // Skip if the skip function returns true
    if (config.skip(req, res)) {
      return next();
    }

    // Generate the key
    const key = config.keyGenerator(req);

    // Get the current time
    const now = Date.now();

    // Initialize or reset the request count if needed
    if (!ipRequests[key] || ipRequests[key].resetTime <= now) {
      ipRequests[key] = {
        count: 0,
        resetTime: now + config.windowMs
      };
    }

    // Increment the request count
    ipRequests[key].count++;

    // Calculate the remaining requests
    const remaining = Math.max(0, config.max - ipRequests[key].count);

    // Set headers if standardHeaders is true
    if (config.standardHeaders) {
      res.setHeader('X-RateLimit-Limit', config.max.toString());
      res.setHeader('X-RateLimit-Remaining', remaining.toString());
      res.setHeader('X-RateLimit-Reset', Math.ceil(ipRequests[key].resetTime / 1000).toString());
    }

    // Check if rate limit is exceeded
    if (ipRequests[key].count > config.max) {
      // Call the custom handler or use the default
      return config.handler(req, res, next);
    }

    // Store the original end function
    const originalEnd = res.end;

    // Override the end function to update the rate limit based on response status
    // @ts-ignore - This is a common pattern for overriding res.end
    res.end = function (chunk?: any, encoding?: string, callback?: () => void) {
      // Check if we should decrement the count based on response status
      if ((config.skipFailedRequests && res.statusCode >= 400) ||
          (config.skipSuccessfulRequests && res.statusCode < 400)) {
        ipRequests[key].count = Math.max(0, ipRequests[key].count - 1);
        
        // Update the remaining header
        if (config.standardHeaders) {
          res.setHeader('X-RateLimit-Remaining', (config.max - ipRequests[key].count).toString());
        }
      }

      // Call the original end function
      // @ts-ignore - This works even though TypeScript doesn't like it
      originalEnd.call(this, chunk, encoding, callback);
    };

    next();
  };
};

/**
 * Specific rate limit middleware for email sending
 * More restrictive than the general rate limit
 */
export const emailRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 emails per 15 minutes
  message: 'Too many emails sent. Please try again later.',
  // Only apply to email sending routes
  skip: (req) => !req.path.includes('/api/messages/send')
});

/**
 * Specific rate limit middleware for authentication attempts
 * Helps prevent brute force attacks
 */
export const authRateLimit = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 5, // 5 failed attempts per 30 minutes
  message: 'Too many failed authentication attempts. Please try again later.',
  // Only count failed authentication attempts
  skipSuccessfulRequests: true,
  // Only apply to authentication routes
  skip: (req) => !req.path.includes('/api/auth/login')
});

/**
 * General API rate limit middleware
 * Applies to all API routes
 */
export const generalApiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests. Please try again later.'
});

export default {
  rateLimit,
  emailRateLimit,
  authRateLimit,
  generalApiRateLimit
};
