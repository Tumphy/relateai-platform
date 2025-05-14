import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';
import routes from './routes';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/error';
import { csrfProtection, getCSRFToken } from './middleware/csrf';
import { generalApiRateLimit } from './middleware/rate-limit';
import logger, { requestLogger } from './utils/logger';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 5000;
const environment = process.env.NODE_ENV || 'development';

// Create logs directory if it doesn't exist
const logDir = process.env.LOG_DIR || 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Security middleware
app.use(helmet()); // Set security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));

// Request parsing middleware
app.use(express.json({ limit: '1mb' })); // Limit request size
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser()); // Parse cookies for CSRF

// Add request logging
app.use(requestLogger);

// Apply rate limiting to all API routes
app.use('/api', generalApiRateLimit);

// Apply CSRF protection in production
if (environment === 'production') {
  app.use(csrfProtection());
  app.get('/api/csrf-token', getCSRFToken);
}

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Set mongoose options
    mongoose.set('strictQuery', true);
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/relateai');
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error', { error });
    process.exit(1);
  }
};

connectDB();

// API Routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'RelateAI API is running',
    environment,
    timestamp: new Date().toISOString()
  });
});

// Handle 404 errors for routes not found
app.use(notFoundHandler);

// Global error handling middleware
app.use(errorHandler);

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  mongoose.connection.close(false, () => {
    logger.info('MongoDB connection closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled promise rejection', { reason, promise });
  process.exit(1);
});

// Start server
app.listen(port, () => {
  logger.info(`Server running in ${environment} mode on port ${port}`);
});

export default app;
