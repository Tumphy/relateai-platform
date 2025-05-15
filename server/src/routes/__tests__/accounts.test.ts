import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Account } from '../../models/account';
import { User } from '../../models/user';
import {
  mockData,
  generateTestToken,
  createTestUser,
  createTestAccount
} from '../../utils/test-utils';

const API_BASE = '/api/accounts';

describe('Account API Endpoints', () => {
  let authToken: string;
  let testAccountId: string;
  
  beforeAll(async () => {
    // Create test user and generate auth token
    const user = await createTestUser();
    authToken = generateTestToken(user._id.toString());
  });
  
  afterAll(async () => {
    // Clean up created resources
    await User.deleteMany({});
    await Account.deleteMany({});
  });
  
  describe('POST /api/accounts', () => {
    it('should create a new account', async () => {
      const accountData = {
        name: 'Test Account API',
        website: 'https://testaccount.com',
        industry: 'Technology',
        description: 'API test account',
        size: '1-10',
        location: 'Test Location',
        revenue: 'Under $1M'
      };
      
      const response = await request(app)
        .post(API_BASE)
        .set('Authorization', `Bearer ${authToken}`)
        .send(accountData);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.account).toHaveProperty('_id');
      expect(response.body.account.name).toBe(accountData.name);
      
      // Save account ID for subsequent tests
      testAccountId = response.body.account._id;
    });
    
    it('should return validation error for invalid data', async () => {
      const invalidData = {
        // Missing required 'name' field
        website: 'https://invalid.com'
      };
      
      const response = await request(app)
        .post(API_BASE)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
    
    it('should require authentication', async () => {
      const response = await request(app)
        .post(API_BASE)
        .send({ name: 'Unauthenticated Account' });
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('GET /api/accounts', () => {
    it('should retrieve all accounts', async () => {
      const response = await request(app)
        .get(API_BASE)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.accounts)).toBe(true);
      expect(response.body.accounts.length).toBeGreaterThan(0);
    });
    
    it('should require authentication', async () => {
      const response = await request(app)
        .get(API_BASE);
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('GET /api/accounts/:id', () => {
    it('should retrieve a single account by ID', async () => {
      const response = await request(app)
        .get(`${API_BASE}/${testAccountId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.account).toHaveProperty('_id', testAccountId);
    });
    
    it('should return 404 for non-existent account', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      
      const response = await request(app)
        .get(`${API_BASE}/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('PUT /api/accounts/:id', () => {
    it('should update an existing account', async () => {
      const updateData = {
        name: 'Updated Account Name',
        industry: 'Finance'
      };
      
      const response = await request(app)
        .put(`${API_BASE}/${testAccountId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.account.name).toBe(updateData.name);
      expect(response.body.account.industry).toBe(updateData.industry);
    });
    
    it('should return 404 for updating a non-existent account', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      
      const response = await request(app)
        .put(`${API_BASE}/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Non-existent Account' });
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('DELETE /api/accounts/:id', () => {
    it('should delete an existing account', async () => {
      const response = await request(app)
        .delete(`${API_BASE}/${testAccountId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Verify account is deleted
      const getResponse = await request(app)
        .get(`${API_BASE}/${testAccountId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(getResponse.status).toBe(404);
    });
    
    it('should return 404 for deleting a non-existent account', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      
      const response = await request(app)
        .delete(`${API_BASE}/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
