import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'test-email-id-123'
    })
  })
}));

// Set up MongoDB memory server for testing
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Set up mongoose connection to in-memory MongoDB
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  // Disconnect mongoose and stop MongoDB memory server
  if (mongoose.connection) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// Clear all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Set test environment variables
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRY = '1h';
process.env.EMAIL_HOST = 'smtp.example.com';
process.env.EMAIL_PORT = '587';
process.env.EMAIL_USER = 'test@example.com';
process.env.EMAIL_PASSWORD = 'password123';
process.env.EMAIL_FROM = 'no-reply@example.com';
process.env.EMAIL_WEBHOOK_SECRET = 'webhook-secret-123';
