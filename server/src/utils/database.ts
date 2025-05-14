import mongoose from 'mongoose';
import logger from './logger';

/**
 * Database utility functions
 * Handles connection, reconnection, and monitoring database health
 */

// Connection options
const mongooseOptions = {
  autoIndex: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4, // IPv4
  useNewUrlParser: true // Needed for MongoDB connection string parsing
};

// Track connection state
let isConnected = false;

/**
 * Connect to MongoDB
 */
export const connectDb = async (): Promise<void> => {
  if (isConnected) {
    logger.debug('Using existing database connection');
    return;
  }

  try {
    // Set mongoose options
    mongoose.set('strictQuery', true);
    
    // Connect to the database
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/relateai';
    await mongoose.connect(uri, mongooseOptions);
    
    isConnected = true;
    logger.info('MongoDB connected successfully');
    
    // Set up event listeners for monitoring connection
    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error', { error: err });
    });

    // Reconnect if disconnected
    mongoose.connection.on('disconnected', () => {
      logger.info('Attempting to reconnect to MongoDB...');
      setTimeout(connectDb, 5000);
    });

  } catch (error) {
    isConnected = false;
    logger.error('Error connecting to MongoDB', { error });
    throw error;
  }
};

/**
 * Disconnect from MongoDB
 */
export const disconnectDb = async (): Promise<void> => {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('MongoDB disconnected');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB', { error });
    throw error;
  }
};

/**
 * Check database connection health
 */
export const checkDbHealth = async (): Promise<boolean> => {
  try {
    // Execute simple command to check connection
    await mongoose.connection.db.admin().ping();
    return true;
  } catch (error) {
    logger.error('Database health check failed', { error });
    return false;
  }
};

/**
 * Get database connection status
 */
export const getDbStatus = (): { connected: boolean, readyState: number } => {
  return {
    connected: isConnected,
    readyState: mongoose.connection.readyState
  };
};

/**
 * Initialize database with indexes
 * Call this after connecting to ensure indexes are created
 */
export const initializeDb = async (): Promise<void> => {
  try {
    logger.info('Initializing database indexes...');
    
    // Ensure all model indexes are created
    await mongoose.connection.syncIndexes();
    
    logger.info('Database indexes initialized successfully');
  } catch (error) {
    logger.error('Error initializing database indexes', { error });
    throw error;
  }
};

export default {
  connectDb,
  disconnectDb,
  checkDbHealth,
  getDbStatus,
  initializeDb
};
