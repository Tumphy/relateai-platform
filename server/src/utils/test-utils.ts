import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { Account } from '../models/account';
import { Contact } from '../models/contact';
import { User } from '../models/user';
import { Meddppicc } from '../models/meddppicc';

/**
 * Create a mock Express request object
 */
export const mockRequest = (overrides = {}) => {
  const req: Partial<Request> = {
    body: {},
    params: {},
    query: {},
    headers: {},
    cookies: {},
    user: { id: 'user-123', email: 'test@example.com' },
    ...overrides
  };
  return req as Request;
};

/**
 * Create a mock Express response object
 */
export const mockResponse = () => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    sendStatus: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis()
  };
  return res as Response;
};

/**
 * Generate a valid JWT token for testing
 */
export const generateTestToken = (userId = 'user-123') => {
  return jwt.sign(
    { id: userId, email: 'test@example.com' },
    process.env.JWT_SECRET || 'test-jwt-secret',
    { expiresIn: '1h' }
  );
};

/**
 * Create a test user in the database
 */
export const createTestUser = async (overrides = {}) => {
  const user = new User({
    email: 'test@example.com',
    password: 'hashedpassword123',
    firstName: 'Test',
    lastName: 'User',
    ...overrides
  });
  await user.save();
  return user;
};

/**
 * Create a test account in the database
 */
export const createTestAccount = async (overrides = {}) => {
  const account = new Account({
    name: 'Test Account',
    website: 'https://test.com',
    industry: 'Technology',
    description: 'A test account',
    size: '1-10',
    location: 'Test City',
    revenue: 'Under $1M',
    technologies: ['Test Tech'],
    tags: ['test'],
    icpScore: 50,
    status: 'active',
    ...overrides
  });
  await account.save();
  return account;
};

/**
 * Create a test contact in the database
 */
export const createTestContact = async (accountId: string, overrides = {}) => {
  const contact = new Contact({
    firstName: 'Test',
    lastName: 'Contact',
    email: 'contact@test.com',
    phone: '1234567890',
    title: 'Test Title',
    accountId,
    status: 'active',
    tags: ['test'],
    ...overrides
  });
  await contact.save();
  return contact;
};

/**
 * Create a test MEDDPPICC record in the database
 */
export const createTestMeddppicc = async (accountId: string, overrides = {}) => {
  const meddppicc = new Meddppicc({
    accountId,
    metrics: { score: 2, notes: 'Test metrics' },
    economicBuyer: { score: 2, notes: 'Test economic buyer' },
    decisionCriteria: { score: 2, notes: 'Test decision criteria' },
    decisionProcess: { score: 2, notes: 'Test decision process' },
    paperProcess: { score: 2, notes: 'Test paper process' },
    identifiedPain: { score: 2, notes: 'Test identified pain' },
    champion: { score: 2, notes: 'Test champion' },
    competition: { score: 2, notes: 'Test competition' },
    overallScore: 16,
    ...overrides
  });
  await meddppicc.save();
  return meddppicc;
};

/**
 * Create a random MongoDB ID for testing
 */
export const generateMongoId = () => new mongoose.Types.ObjectId().toString();

/**
 * Clean up the database - use cautiously, only in test environment
 */
export const cleanupDatabase = async () => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Cannot clean database outside of test environment');
  }
  
  await User.deleteMany({});
  await Account.deleteMany({});
  await Contact.deleteMany({});
  await Meddppicc.deleteMany({});
};

/**
 * Mock data for testing
 */
export const mockData = {
  user: {
    _id: 'user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    password: 'hashedpassword123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  account: {
    _id: 'account-123',
    name: 'Test Account',
    website: 'https://test.com',
    industry: 'Technology',
    description: 'A test account',
    size: '1-10',
    location: 'Test City',
    revenue: 'Under $1M',
    technologies: ['Test Tech'],
    tags: ['test'],
    icpScore: 50,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  contact: {
    _id: 'contact-123',
    firstName: 'Test',
    lastName: 'Contact',
    email: 'contact@test.com',
    phone: '1234567890',
    title: 'Test Title',
    accountId: 'account-123',
    status: 'active',
    tags: ['test'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  meddppicc: {
    _id: 'meddppicc-123',
    accountId: 'account-123',
    metrics: { score: 2, notes: 'Test metrics' },
    economicBuyer: { score: 2, notes: 'Test economic buyer' },
    decisionCriteria: { score: 2, notes: 'Test decision criteria' },
    decisionProcess: { score: 2, notes: 'Test decision process' },
    paperProcess: { score: 2, notes: 'Test paper process' },
    identifiedPain: { score: 2, notes: 'Test identified pain' },
    champion: { score: 2, notes: 'Test champion' },
    competition: { score: 2, notes: 'Test competition' },
    overallScore: 16,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
};
