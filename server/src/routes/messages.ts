import express from 'express';
import { auth } from '../middleware/auth';
import messageController from '../controllers/message';
import emailController from '../controllers/email';

const router = express.Router();

// Get all messages (with filtering options)
router.get('/', auth, messageController.getMessages);

// Get a message by ID
router.get('/:id', auth, messageController.getMessage);

// Create a new message
router.post('/', auth, messageController.createMessage);

// Update a message
router.put('/:id', auth, messageController.updateMessage);

// Delete a message
router.delete('/:id', auth, messageController.deleteMessage);

// Get message history for a contact
router.get('/history/:contactId', auth, messageController.getMessageHistory);

// Generate a message using AI
router.post('/generate', auth, messageController.generateMessage);

// Send a message
router.post('/send', auth, emailController.sendMessage);

// Track message open or delivery (public endpoint)
router.get('/track/:id/:event', emailController.trackMessage);

// Process email webhook (public but secured with webhook secret)
router.post('/webhook', emailController.processWebhook);

export default router;