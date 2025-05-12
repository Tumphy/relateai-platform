import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  id: string;
}

// Augment the Express Request interface
declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

/**
 * Middleware to authenticate and authorize requests using JWT
 */
export const auth = (req: Request, res: Response, next: NextFunction) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'default_secret'
    ) as DecodedToken;

    // Add user ID to request
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

/**
 * Admin access check middleware
 * Use this middleware after the auth middleware
 */
export const adminOnly = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get user from database
    const user = await User.findById(req.userId);
    
    // Check if user exists and is an admin
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin privileges required' });
    }
    
    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};