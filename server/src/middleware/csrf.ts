import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * CSRF protection middleware for Express
 * 
 * This implementation:
 * - Generates CSRF tokens using a cryptographically secure random value
 * - Sets tokens in cookies with Secure, HttpOnly, and SameSite options
 * - Validates tokens with double-submit cookie pattern
 * - Allows configuring exempt routes
 */

interface CSRFOptions {
  cookie?: {
    key?: string;
    path?: string;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: boolean | 'lax' | 'strict' | 'none';
    maxAge?: number;
  };
  header?: string;
  ignoreMethods?: string[];
  exemptRoutes?: string[];
}

export const csrfProtection = (options: CSRFOptions = {}) => {
  // Default options
  const defaultOptions: CSRFOptions = {
    cookie: {
      key: 'csrf-token',
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
    header: 'X-CSRF-Token',
    ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
    exemptRoutes: ['/api/auth/login', '/api/auth/register', '/api/webhooks']
  };

  // Merge options
  const config = {
    ...defaultOptions,
    cookie: { ...defaultOptions.cookie, ...options.cookie },
    header: options.header || defaultOptions.header,
    ignoreMethods: options.ignoreMethods || defaultOptions.ignoreMethods,
    exemptRoutes: options.exemptRoutes || defaultOptions.exemptRoutes
  };

  return (req: Request, res: Response, next: NextFunction) => {
    // Skip CSRF check for exempt routes
    if (config.exemptRoutes?.some(route => req.path.startsWith(route))) {
      return next();
    }

    // Skip CSRF check for ignored methods
    if (config.ignoreMethods?.includes(req.method)) {
      // Generate token if it doesn't exist
      const existingToken = req.cookies[config.cookie!.key!];
      if (!existingToken) {
        const newToken = generateToken();
        setTokenCookie(res, newToken, config);
      }
      return next();
    }

    // For all other methods, verify the token
    const cookieToken = req.cookies[config.cookie!.key!];
    const headerToken = req.headers[config.header!.toLowerCase()];

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      return res.status(403).json({
        success: false,
        message: 'CSRF token validation failed',
        error: 'Invalid or missing CSRF token'
      });
    }

    // Rotate token after successful verification
    const newToken = generateToken();
    setTokenCookie(res, newToken, config);

    next();
  };
};

/**
 * Generate a cryptographically secure random token
 */
const generateToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Set the CSRF token cookie
 */
const setTokenCookie = (res: Response, token: string, config: CSRFOptions) => {
  res.cookie(config.cookie!.key!, token, {
    path: config.cookie!.path,
    httpOnly: config.cookie!.httpOnly,
    secure: config.cookie!.secure,
    sameSite: config.cookie!.sameSite,
    maxAge: config.cookie!.maxAge
  });
};

/**
 * Middleware to provide a CSRF token to the client
 */
export const getCSRFToken = (req: Request, res: Response) => {
  // Generate CSRF token if it doesn't exist
  const token = req.cookies['csrf-token'] || generateToken();

  // Set token in cookie
  if (!req.cookies['csrf-token']) {
    res.cookie('csrf-token', token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });
  }

  // Return token to client
  return res.status(200).json({
    success: true,
    token
  });
};

export default {
  csrfProtection,
  getCSRFToken
};
