import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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
import database from './utils/database';
import cache from './utils/cache';

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

// Connect to MongoDB and initialize
const initializeServer = async () => {
  try {
    // Connect to database
    await database.connectDb();
    
    // Initialize database indexes
    await database.initializeDb();
    
    // Log cache status
    const cacheEnabled = cache.isEnabled();
    logger.info(`Redis cache ${cacheEnabled ? 'enabled' : 'disabled'}`);
    
    // Start server after successful database connection
    app.listen(port, () => {
      logger.info(`Server running in ${environment} mode on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to initialize server', { error });
    process.exit(1);
  }
};

// API Routes
app.use('/api', routes);

// Enhanced health check endpoint
app.get('/health', async (req, res) => {
  // Check database connection
  const dbStatus = await database.checkDbHealth();
  
  // Check cache status
  const cacheStatus = cache.isEnabled();
  
  res.status(dbStatus ? 200 : 503).json({ 
    status: dbStatus ? 'ok' : 'degraded', 
    message: dbStatus ? 'RelateAI API is running' : 'Database connection issues',
    services: {
      database: dbStatus ? 'connected' : 'disconnected',
      cache: cacheStatus ? 'enabled' : 'disabled'
    },
    environment,
    timestamp: new Date().toISOString()
  });
});

// Handle 404 errors for routes not found
app.use(notFoundHandler);

// Global error handling middleware
app.use(errorHandler);

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  // Close cache connection
  await cache.close();
  logger.info('Redis connection closed');
  
  // Close database connection
  await database.disconnectDb();
  logger.info('MongoDB connection closed');
  
  // Exit process
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error });
  
  // Attempt to disconnect services before exiting
  Promise.all([
    cache.close().catch(() => {}),
    database.disconnectDb().catch(() => {})
  ])
    .then(() => process.exit(1))
    .catch(() => process.exit(1));
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled promise rejection', { reason, promise });
  
  // Attempt to disconnect services before exiting
  Promise.all([
    cache.close().catch(() => {}),
    database.disconnectDb().catch(() => {})
  ])
    .then(() => process.exit(1))
    .catch(() => process.exit(1));
});

// Initialize server
initializeServer().catch(error => {
  logger.error('Server initialization failed', { error });
  process.exit(1);
});

export default app;
