import request from 'supertest';
import { app } from '../../app';
import { emailService } from '../../services/email.service';
import { Message } from '../../models/message';
import { mockRequest, mockResponse } from '../../utils/test-utils';
import { 
  trackPixel, 
  trackRedirect, 
  handleReply, 
  sendTestEmail 
} from '../../controllers/email.controller';

// Mock email service
jest.mock('../../services/email.service', () => ({
  emailService: {
    sendEmail: jest.fn(),
    handleTrackingWebhook: jest.fn(),
    generateTemplate: jest.fn(),
    verifyTrackingId: jest.fn()
  }
}));

// Mock Message model
jest.mock('../../models/message', () => ({
  Message: {
    findByIdAndUpdate: jest.fn(),
    findById: jest.fn()
  }
}));

describe('Email Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('trackPixel', () => {
    it('should handle pixel tracking and return a transparent GIF', async () => {
      // Mock successful tracking
      (emailService.handleTrackingWebhook as jest.Mock).mockResolvedValue({
        success: true,
        messageId: 'test-message-123'
      });
      
      // Mock database update
      (Message.findByIdAndUpdate as jest.Mock).mockResolvedValue({});
      
      // Create mock request/response
      const req = mockRequest({
        params: {
          trackingId: 'test-tracking-id'
        }
      });
      
      const res = mockResponse();
      
      // Call controller
      await trackPixel(req, res);
      
      // Check response headers
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/gif');
      expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache, no-store, must-revalidate');
      
      // Should call tracking handler
      expect(emailService.handleTrackingWebhook).toHaveBeenCalledWith('open', 'test-tracking-id');
      
      // Should update message
      expect(Message.findByIdAndUpdate).toHaveBeenCalledWith(
        'test-message-123',
        expect.objectContaining({
          $inc: { 'metadata.opens': 1 }
        }),
        expect.anything()
      );
      
      // Should send response
      expect(res.send).toHaveBeenCalled();
    });

    it('should handle missing tracking ID', async () => {
      // Create mock request/response with no tracking ID
      const req = mockRequest({
        params: {}
      });
      
      const res = mockResponse();
      
      // Call controller
      await trackPixel(req, res);
      
      // Should return error
      expect(res.status).toHaveBeenCalledWith(400);
      
      // Should not call tracking handler
      expect(emailService.handleTrackingWebhook).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully and still return an image', async () => {
      // Mock tracking error
      (emailService.handleTrackingWebhook as jest.Mock).mockRejectedValue(new Error('Tracking error'));
      
      // Create mock request/response
      const req = mockRequest({
        params: {
          trackingId: 'test-tracking-id'
        }
      });
      
      const res = mockResponse();
      
      // Call controller
      await trackPixel(req, res);
      
      // Should still return image/gif content type
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/gif');
      
      // Should still send response
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe('trackRedirect', () => {
    it('should track link clicks and redirect to the original URL', async () => {
      // Mock successful tracking
      (emailService.handleTrackingWebhook as jest.Mock).mockResolvedValue({
        success: true,
        messageId: 'test-message-123'
      });
      
      // Mock database update
      (Message.findByIdAndUpdate as jest.Mock).mockResolvedValue({});
      
      // Target URL
      const targetUrl = 'https://example.com';
      
      // Create mock request/response
      const req = mockRequest({
        params: {
          trackingId: 'test-tracking-id'
        },
        query: {
          url: targetUrl
        }
      });
      
      const res = mockResponse();
      
      // Call controller
      await trackRedirect(req, res);
      
      // Should call tracking handler
      expect(emailService.handleTrackingWebhook).toHaveBeenCalledWith(
        'click', 
        'test-tracking-id',
        { url: targetUrl }
      );
      
      // Should update message
      expect(Message.findByIdAndUpdate).toHaveBeenCalledWith(
        'test-message-123',
        expect.objectContaining({
          $inc: { 'metadata.clicks': 1 }
        }),
        expect.anything()
      );
      
      // Should redirect to original URL
      expect(res.redirect).toHaveBeenCalledWith(targetUrl);
    });

    it('should handle missing parameters', async () => {
      // Create mock request/response with missing URL
      const req = mockRequest({
        params: {
          trackingId: 'test-tracking-id'
        },
        query: {}
      });
      
      const res = mockResponse();
      
      // Call controller
      await trackRedirect(req, res);
      
      // Should return error
      expect(res.status).toHaveBeenCalledWith(400);
      
      // Should not call tracking handler
      expect(emailService.handleTrackingWebhook).not.toHaveBeenCalled();
    });
  });

  describe('handleReply', () => {
    it('should process email replies and create a new inbound message', async () => {
      // Mock successful tracking
      (emailService.handleTrackingWebhook as jest.Mock).mockResolvedValue({
        success: true,
        messageId: 'test-message-123'
      });
      
      // Mock finding original message
      (Message.findById as jest.Mock).mockResolvedValue({
        _id: 'test-message-123',
        userId: 'user-123',
        contactId: 'contact-123',
        accountId: 'account-123',
        subject: 'Original Subject'
      });
      
      // Create mock request/response
      const req = mockRequest({
        params: {
          trackingId: 'test-tracking-id'
        },
        body: {
          subject: 'Re: Original Subject',
          text: 'This is my reply',
          html: '<p>This is my reply</p>',
          from: 'contact@example.com',
          to: 'user@relateai.com',
          headers: {
            'message-id': 'reply-123'
          }
        }
      });
      
      const res = mockResponse();
      
      // Call controller
      await handleReply(req, res);
      
      // Should call tracking handler
      expect(emailService.handleTrackingWebhook).toHaveBeenCalledWith(
        'reply', 
        'test-tracking-id', 
        req.body
      );
      
      // Should return success
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true
      }));
    });

    it('should handle missing tracking ID', async () => {
      // Create mock request/response with no tracking ID
      const req = mockRequest({
        params: {},
        body: {
          subject: 'Reply',
          text: 'This is a reply'
        }
      });
      
      const res = mockResponse();
      
      // Call controller
      await handleReply(req, res);
      
      // Should return error
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false
      }));
      
      // Should not call tracking handler
      expect(emailService.handleTrackingWebhook).not.toHaveBeenCalled();
    });
  });

  describe('sendTestEmail', () => {
    it('should send a test email with tracking', async () => {
      // Mock template generation
      (emailService.generateTemplate as jest.Mock).mockReturnValue({
        html: '<p>Test HTML</p>',
        text: 'Test text'
      });
      
      // Mock successful email sending
      (emailService.sendEmail as jest.Mock).mockResolvedValue({
        success: true,
        messageId: 'test-message-id'
      });
      
      // Create mock request/response
      const req = mockRequest({
        body: {
          to: 'test@example.com',
          subject: 'Test Subject',
          content: 'Test content'
        }
      });
      
      const res = mockResponse();
      
      // Call controller
      await sendTestEmail(req, res);
      
      // Should generate template
      expect(emailService.generateTemplate).toHaveBeenCalledWith('basic', expect.objectContaining({
        subject: 'Test Subject',
        content: 'Test content'
      }));
      
      // Should send email
      expect(emailService.sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
        text: 'Test text'
      }));
      
      // Should return success
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        messageId: 'test-message-id'
      }));
    });

    it('should validate required fields', async () => {
      // Create mock request/response with missing fields
      const req = mockRequest({
        body: {
          to: 'test@example.com',
          // Missing subject and content
        }
      });
      
      const res = mockResponse();
      
      // Call controller
      await sendTestEmail(req, res);
      
      // Should return error
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false
      }));
      
      // Should not send email
      expect(emailService.sendEmail).not.toHaveBeenCalled();
    });

    it('should handle email sending errors', async () => {
      // Mock template generation
      (emailService.generateTemplate as jest.Mock).mockReturnValue({
        html: '<p>Test HTML</p>',
        text: 'Test text'
      });
      
      // Mock email sending error
      (emailService.sendEmail as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Email sending error'
      });
      
      // Create mock request/response
      const req = mockRequest({
        body: {
          to: 'test@example.com',
          subject: 'Test Subject',
          content: 'Test content'
        }
      });
      
      const res = mockResponse();
      
      // Call controller
      await sendTestEmail(req, res);
      
      // Should return error
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false
      }));
    });
  });
});
