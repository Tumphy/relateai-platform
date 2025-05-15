import express from 'express';
import {
  getAuthUrl,
  handleCallback,
  getIntegrationStatus,
  disconnectIntegration,
  syncConnections,
  getConnections,
  getConnectionByContact,
  sendMessage,
  getMessages,
  searchProfiles,
  linkContactToProfile
} from '../controllers/linkedin.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// LinkedIn OAuth
router.get('/auth', getAuthUrl);
router.get('/callback', handleCallback);

// Integration management
router.get('/status', getIntegrationStatus);
router.delete('/disconnect', disconnectIntegration);
router.post('/sync', syncConnections);

// Connections management
router.get('/connections', getConnections);
router.get('/connections/:contactId', getConnectionByContact);
router.post('/connections/:contactId', linkContactToProfile);

// Messaging
router.post('/messages/:contactId', sendMessage);
router.get('/messages/:contactId', getMessages);

// Profile search
router.get('/search', searchProfiles);

export default router;
