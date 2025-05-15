import express from 'express';
import { 
  trackPixel, 
  trackRedirect, 
  handleReply, 
  sendTestEmail 
} from '../controllers/email.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Public tracking routes (no authentication required)
router.get('/pixel/:trackingId', trackPixel);
router.get('/redirect/:trackingId', trackRedirect);

// Webhook for email replies (secured by webhook secret)
router.post('/webhook/reply/:trackingId', handleReply);

// Test email route (authenticated)
router.post('/test', authenticate, sendTestEmail);

export default router;
