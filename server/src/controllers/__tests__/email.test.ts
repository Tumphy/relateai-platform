import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { sendMessage, trackMessage, processWebhook } from '../../../controllers/email';
import Message from '../../../models/message';
import Contact from '../../../models/contact';
import User from '../../../models/user';

// Mock dependencies
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'test-email-id-123'
    })
  })
}));

jest.mock('../../../models/message', () => ({
  findById: jest.fn(),
  findOne: jest.fn(),
  prototype: {
    save: jest.fn().mockResolvedValue(true)
  }
}));

jest.mock('../../../models/contact', () => ({
  findById: jest.fn()
}));

jest.mock('../../../models/user', () => ({
  findById: jest.fn()
}));

describe('Email Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup request and response objects
    req = {
      params: {},
      body: {},
      headers: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      set: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    
    // Set environment variables
    process.env.EMAIL_HOST = 'smtp.example.com';
    process.env.EMAIL_PORT = '587';
    process.env.EMAIL_USER = 'test@example.com';
    process.env.EMAIL_PASSWORD = 'password123';
    process.env.EMAIL_FROM = 'no-reply@example.com';
    process.env.EMAIL_WEBHOOK_SECRET = 'webhook-secret-123';
  });
  
  describe('sendMessage', () => {
    it('successfully sends an email message', async () => {
      // Mock message data
      const mockMessage = {
        _id: 'message-123',
        contactId: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com'
        },
        userId: {
          name: 'Test User',
          email: 'test.user@example.com'
        },
        subject: 'Test Subject',
        content: '<p>Test Content</p>',
        status: 'draft',
        channel: 'email',
        save: jest.fn().mockResolvedValue(true)
      };
      
      // Mock request body
      req.body = {
        messageId: 'message-123',
        validateMessageSend: jest.fn().mockReturnValue({ success: true })
      };
      
      // Mock dependencies
      (Message.findById as jest.Mock).mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockResolvedValue(mockMessage)
        }))
      }));
      
      // Call the function
      await sendMessage(req as Request, res as Response);
      
      // Assertions
      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        auth: {
          user: 'test@example.com',
          pass: 'password123'
        }
      });
      
      expect(mockMessage.save).toHaveBeenCalled();
      expect(mockMessage.status).toBe('sent');
      expect(mockMessage.sentAt).toBeInstanceOf(Date);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Message sent successfully',
        data: {
          messageId: 'message-123',
          emailId: 'test-email-id-123'
        }
      });
    });
    
    it('returns error when message is not found', async () => {
      // Mock request body
      req.body = {
        messageId: 'non-existent-message',
        validateMessageSend: jest.fn().mockReturnValue({ success: true })
      };
      
      // Mock Message.findById to return null
      (Message.findById as jest.Mock).mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockResolvedValue(null)
        }))
      }));
      
      // Call the function
      await sendMessage(req as Request, res as Response);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Message not found'
      });
    });
    
    it('returns error when message is not in draft status', async () => {
      // Mock message data with non-draft status
      const mockMessage = {
        _id: 'message-123',
        status: 'sent',
        channel: 'email'
      };
      
      // Mock request body
      req.body = {
        messageId: 'message-123',
        validateMessageSend: jest.fn().mockReturnValue({ success: true })
      };
      
      // Mock dependencies
      (Message.findById as jest.Mock).mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockResolvedValue(mockMessage)
        }))
      }));
      
      // Call the function
      await sendMessage(req as Request, res as Response);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Message has already been sent'
      });
    });
    
    it('returns error when message channel is not email', async () => {
      // Mock message data with non-email channel
      const mockMessage = {
        _id: 'message-123',
        status: 'draft',
        channel: 'linkedin'
      };
      
      // Mock request body
      req.body = {
        messageId: 'message-123',
        validateMessageSend: jest.fn().mockReturnValue({ success: true })
      };
      
      // Mock dependencies
      (Message.findById as jest.Mock).mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockResolvedValue(mockMessage)
        }))
      }));
      
      // Call the function
      await sendMessage(req as Request, res as Response);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'This endpoint only supports email messages. Current channel: linkedin'
      });
    });
    
    it('returns error when contact has no email', async () => {
      // Mock message data with contactId but no email
      const mockMessage = {
        _id: 'message-123',
        status: 'draft',
        channel: 'email',
        contactId: {
          firstName: 'John',
          lastName: 'Doe'
          // No email
        },
        userId: {
          name: 'Test User',
          email: 'test.user@example.com'
        }
      };
      
      // Mock request body
      req.body = {
        messageId: 'message-123',
        validateMessageSend: jest.fn().mockReturnValue({ success: true })
      };
      
      // Mock dependencies
      (Message.findById as jest.Mock).mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockResolvedValue(mockMessage)
        }))
      }));
      
      // Call the function
      await sendMessage(req as Request, res as Response);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Contact has no email address'
      });
    });
    
    it('handles validation error', async () => {
      // Mock validation error
      req.body = {
        validateMessageSend: jest.fn().mockReturnValue({
          success: false,
          error: { errors: [{ message: 'MessageId is required' }] }
        })
      };
      
      // Call the function
      await sendMessage(req as Request, res as Response);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation error',
        errors: [{ message: 'MessageId is required' }]
      });
    });
    
    it('handles general errors', async () => {
      // Mock an error being thrown
      (Message.findById as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });
      
      // Mock request body
      req.body = {
        messageId: 'message-123',
        validateMessageSend: jest.fn().mockReturnValue({ success: true })
      };
      
      // Call the function
      await sendMessage(req as Request, res as Response);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to send message',
        error: 'Database error'
      });
    });
  });
  
  describe('trackMessage', () => {
    it('updates message status when tracked for opens', async () => {
      // Mock message
      const mockMessage = {
        _id: 'message-123',
        status: 'delivered',
        save: jest.fn().mockResolvedValue(true)
      };
      
      // Mock request params
      req.params = {
        id: 'message-123',
        event: 'open'
      };
      
      // Mock dependencies
      (Message.findById as jest.Mock).mockResolvedValue(mockMessage);
      
      // Call the function
      await trackMessage(req as Request, res as Response);
      
      // Assertions
      expect(mockMessage.status).toBe('opened');
      expect(mockMessage.openedAt).toBeInstanceOf(Date);
      expect(mockMessage.save).toHaveBeenCalled();
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.set).toHaveBeenCalledWith('Content-Type', 'image/gif');
      expect(res.send).toHaveBeenCalled();
    });
    
    it('updates message status when tracked for delivery', async () => {
      // Mock message
      const mockMessage = {
        _id: 'message-123',
        status: 'sent',
        save: jest.fn().mockResolvedValue(true)
      };
      
      // Mock request params
      req.params = {
        id: 'message-123',
        event: 'delivery'
      };
      
      // Mock dependencies
      (Message.findById as jest.Mock).mockResolvedValue(mockMessage);
      
      // Call the function
      await trackMessage(req as Request, res as Response);
      
      // Assertions
      expect(mockMessage.status).toBe('delivered');
      expect(mockMessage.deliveredAt).toBeInstanceOf(Date);
      expect(mockMessage.save).toHaveBeenCalled();
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.set).toHaveBeenCalledWith('Content-Type', 'image/gif');
      expect(res.send).toHaveBeenCalled();
    });
    
    it('does not update status if message is already in replied status', async () => {
      // Mock message
      const mockMessage = {
        _id: 'message-123',
        status: 'replied',
        save: jest.fn().mockResolvedValue(true)
      };
      
      // Mock request params
      req.params = {
        id: 'message-123',
        event: 'open'
      };
      
      // Mock dependencies
      (Message.findById as jest.Mock).mockResolvedValue(mockMessage);
      
      // Call the function
      await trackMessage(req as Request, res as Response);
      
      // Assertions
      expect(mockMessage.status).toBe('replied'); // Status unchanged
      expect(mockMessage.save).not.toHaveBeenCalled(); // Save not called
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.set).toHaveBeenCalledWith('Content-Type', 'image/gif');
      expect(res.send).toHaveBeenCalled();
    });
    
    it('returns tracking pixel even if message not found', async () => {
      // Mock request params
      req.params = {
        id: 'non-existent-message',
        event: 'open'
      };
      
      // Mock dependencies
      (Message.findById as jest.Mock).mockResolvedValue(null);
      
      // Call the function
      await trackMessage(req as Request, res as Response);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.set).toHaveBeenCalledWith('Content-Type', 'image/gif');
      expect(res.send).toHaveBeenCalled();
    });
    
    it('returns tracking pixel on error', async () => {
      // Mock request params
      req.params = {
        id: 'message-123',
        event: 'open'
      };
      
      // Mock dependencies
      (Message.findById as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Call the function
      await trackMessage(req as Request, res as Response);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.set).toHaveBeenCalledWith('Content-Type', 'image/gif');
      expect(res.send).toHaveBeenCalled();
    });
  });
  
  describe('processWebhook', () => {
    it('processes a reply webhook successfully', async () => {
      // Mock original message
      const originalMessage = {
        _id: 'original-message-123',
        userId: 'user-123',
        contactId: 'contact-123',
        accountId: 'account-123',
        subject: 'Original Subject',
        content: '<p>Original Content</p>',
        status: 'delivered',
        channel: 'email',
        save: jest.fn().mockResolvedValue(true)
      };
      
      // Mock contact
      const mockContact = {
        _id: 'contact-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
      };
      
      // Mock request data
      req.headers = {
        'x-webhook-secret': 'webhook-secret-123'
      };
      
      req.body = {
        event: 'reply',
        inReplyTo: 'original-email-id-123',
        from: 'John Doe <john.doe@example.com>',
        subject: 'Re: Original Subject',
        text: 'This is a reply email',
        html: '<p>This is a reply email</p>'
      };
      
      // Mock dependencies
      (Message.findOne as jest.Mock).mockResolvedValue(originalMessage);
      (Contact.findById as jest.Mock).mockResolvedValue(mockContact);
      
      // Create spy for new Message
      const messageSpy = jest.spyOn(Message.prototype, 'save');
      
      // Call the function
      await processWebhook(req as Request, res as Response);
      
      // Assertions
      expect(originalMessage.status).toBe('replied');
      expect(originalMessage.repliedAt).toBeInstanceOf(Date);
      expect(originalMessage.save).toHaveBeenCalled();
      
      expect(messageSpy).toHaveBeenCalled();
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Webhook processed successfully'
      });
    });
    
    it('returns error when webhook secret is invalid', async () => {
      // Mock request data
      req.headers = {
        'x-webhook-secret': 'invalid-secret'
      };
      
      // Call the function
      await processWebhook(req as Request, res as Response);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized'
      });
    });
    
    it('returns error when original message not found', async () => {
      // Mock request data
      req.headers = {
        'x-webhook-secret': 'webhook-secret-123'
      };
      
      req.body = {
        event: 'reply',
        inReplyTo: 'non-existent-email-id',
        threadId: 'non-existent-thread-id'
      };
      
      // Mock dependencies
      (Message.findOne as jest.Mock).mockResolvedValue(null);
      
      // Call the function
      await processWebhook(req as Request, res as Response);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Original message not found'
      });
    });
    
    it('returns error when contact not found', async () => {
      // Mock original message
      const originalMessage = {
        _id: 'original-message-123',
        userId: 'user-123',
        contactId: 'non-existent-contact',
        status: 'delivered',
        save: jest.fn().mockResolvedValue(true)
      };
      
      // Mock request data
      req.headers = {
        'x-webhook-secret': 'webhook-secret-123'
      };
      
      req.body = {
        event: 'reply',
        inReplyTo: 'original-email-id-123',
        from: 'John Doe <john.doe@example.com>',
        subject: 'Re: Original Subject'
      };
      
      // Mock dependencies
      (Message.findOne as jest.Mock).mockResolvedValue(originalMessage);
      (Contact.findById as jest.Mock).mockResolvedValue(null);
      
      // Call the function
      await processWebhook(req as Request, res as Response);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Contact not found'
      });
    });
    
    it('handles general errors', async () => {
      // Mock request data
      req.headers = {
        'x-webhook-secret': 'webhook-secret-123'
      };
      
      // Mock dependencies
      (Message.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Call the function
      await processWebhook(req as Request, res as Response);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to process webhook',
        error: 'Database error'
      });
    });
  });
});
