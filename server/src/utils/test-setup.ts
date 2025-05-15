import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { config } from 'dotenv';

config(); // Load environment variables

let mongoServer: MongoMemoryServer;

// Setup before tests
beforeAll(async () => {
  // Start in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect Mongoose to the in-memory database
  await mongoose.connect(mongoUri);
});

// Clean up after each test
afterEach(async () => {
  // Clear all collections after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Clean up after all tests
afterAll(async () => {
  // Disconnect Mongoose and stop MongoDB server
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Mock environment variables that might be needed for tests
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.EMAIL_WEBHOOK_SECRET = 'test-webhook-secret';

// Suppress console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global mock for OpenAI
jest.mock('openai', () => {
  const mockChatCompletionResponse = {
    choices: [
      {
        message: {
          content: 'Mocked OpenAI response'
        }
      }
    ]
  };
  
  return {
    OpenAI: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue(mockChatCompletionResponse)
        }
      }
    }))
  };
});

// Mock Nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockImplementation(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'mocked-message-id' })
  }))
}));
