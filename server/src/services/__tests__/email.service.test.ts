import { emailService } from '../../services/email.service';
import nodemailer from 'nodemailer';

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'test-message-id'
    })
  })
}));

describe('Email Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables for tests
    process.env.EMAIL_WEBHOOK_SECRET = 'test-webhook-secret';
    process.env.EMAIL_TRACKING_DOMAIN = 'tracking.relateai.com';
  });

  describe('sendEmail', () => {
    it('should send an email with tracking', async () => {
      // Test data
      const emailOptions = {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
        messageId: 'test-message-123',
        contactId: 'contact-123',
        accountId: 'account-123'
      };

      // Send email
      const result = await emailService.sendEmail(emailOptions);

      // Check result
      expect(result.success).toBe(true);
      expect(result.messageId).toBe('test-message-id');

      // Verify nodemailer was called with tracking pixel and wrapped links
      const sendMailMock = nodemailer.createTransport().sendMail;
      expect(sendMailMock).toHaveBeenCalledTimes(1);
      
      const sentOptions = sendMailMock.mock.calls[0][0];
      expect(sentOptions.to).toBe(emailOptions.to);
      expect(sentOptions.subject).toBe(emailOptions.subject);
      
      // Should include tracking pixel
      expect(sentOptions.html).toContain('<img src="https://tracking.relateai.com/pixel/');
      
      // Should have tracking ID header
      expect(sentOptions.headers).toHaveProperty('X-Tracking-ID');
    });

    it('should handle errors during email sending', async () => {
      // Mock nodemailer to throw an error
      const sendMailMock = nodemailer.createTransport().sendMail;
      sendMailMock.mockRejectedValueOnce(new Error('SMTP error'));

      // Test data
      const emailOptions = {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>'
      };

      // Send email
      const result = await emailService.sendEmail(emailOptions);

      // Check result
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('generateTrackingId and verifyTrackingId', () => {
    it('should generate a valid tracking ID with HMAC signature', () => {
      // Generate tracking ID
      const trackingData = {
        messageId: 'test-message-123',
        contactId: 'contact-123',
        accountId: 'account-123'
      };
      
      const trackingId = emailService['generateTrackingId'](trackingData);
      
      // Should be a base64 string
      expect(typeof trackingId).toBe('string');
      expect(trackingId.length).toBeGreaterThan(10);
      
      // Verify the tracking ID
      const verification = emailService.verifyTrackingId(trackingId);
      
      // Check verification result
      expect(verification.valid).toBe(true);
      expect(verification.data).toBeDefined();
      if (verification.data) {
        expect(verification.data.messageId).toBe(trackingData.messageId);
        expect(verification.data.contactId).toBe(trackingData.contactId);
        expect(verification.data.accountId).toBe(trackingData.accountId);
      }
    });

    it('should reject tampered tracking IDs', () => {
      // Generate legitimate tracking ID
      const trackingData = {
        messageId: 'test-message-123'
      };
      
      const trackingId = emailService['generateTrackingId'](trackingData);
      
      // Tamper with the tracking ID (decode, modify, re-encode)
      const decoded = JSON.parse(Buffer.from(trackingId, 'base64').toString());
      const tamperedData = JSON.parse(decoded.data);
      tamperedData.messageId = 'hacked-message-id';
      decoded.data = JSON.stringify(tamperedData);
      const tamperedId = Buffer.from(JSON.stringify(decoded)).toString('base64');
      
      // Verify the tampered tracking ID
      const verification = emailService.verifyTrackingId(tamperedId);
      
      // Should be invalid
      expect(verification.valid).toBe(false);
      expect(verification.data).toBeUndefined();
    });
  });

  describe('wrapLinksWithTracking', () => {
    it('should wrap links in HTML with tracking redirects', () => {
      // HTML with links
      const html = `
        <p>Check out our <a href="https://example.com">website</a></p>
        <p>Or visit our <a href="https://github.com/example">GitHub</a></p>
      `;
      
      const trackingId = 'test-tracking-id';
      
      // Wrap links
      const wrappedHtml = emailService['wrapLinksWithTracking'](html, trackingId);
      
      // Should include tracking domain
      expect(wrappedHtml).toContain('https://tracking.relateai.com/redirect/');
      
      // Should include tracking ID
      expect(wrappedHtml).toContain(trackingId);
      
      // Should include encoded URLs
      expect(wrappedHtml).toContain(encodeURIComponent('https://example.com'));
      expect(wrappedHtml).toContain(encodeURIComponent('https://github.com/example'));
      
      // Should not double-wrap already tracked links
      const doubleWrapped = emailService['wrapLinksWithTracking'](wrappedHtml, trackingId);
      expect(doubleWrapped).toBe(wrappedHtml);
    });
  });

  describe('generateTemplate', () => {
    it('should generate HTML and text templates', () => {
      // Template data
      const templateData = {
        subject: 'Hello World',
        content: 'This is a test message',
        signature: 'Test Signature'
      };
      
      // Generate basic template
      const basicTemplate = emailService.generateTemplate('basic', templateData);
      
      // Check template format
      expect(basicTemplate).toHaveProperty('html');
      expect(basicTemplate).toHaveProperty('text');
      
      // HTML should include content
      expect(basicTemplate.html).toContain(templateData.subject);
      expect(basicTemplate.html).toContain(templateData.content);
      expect(basicTemplate.html).toContain(templateData.signature);
      
      // Plain text should be defined
      expect(typeof basicTemplate.text).toBe('string');
      expect(basicTemplate.text).toBe(templateData.content);
      
      // Generate follow-up template
      const followUpTemplate = emailService.generateTemplate('followUp', templateData);
      
      // Should have different content
      expect(followUpTemplate.html).toContain('Following up');
      expect(followUpTemplate.text).toContain('Following up');
    });
  });

  describe('handleTrackingWebhook', () => {
    it('should process tracking webhooks for valid tracking IDs', async () => {
      // Generate tracking ID
      const trackingData = {
        messageId: 'test-message-123'
      };
      
      const trackingId = emailService['generateTrackingId'](trackingData);
      
      // Handle open event
      const result = await emailService.handleTrackingWebhook('open', trackingId);
      
      // Check result
      expect(result.success).toBe(true);
      expect(result.messageId).toBe('test-message-123');
    });

    it('should reject tracking webhooks for invalid tracking IDs', async () => {
      // Invalid tracking ID
      const invalidId = 'invalid-tracking-id';
      
      // Handle click event
      const result = await emailService.handleTrackingWebhook('click', invalidId);
      
      // Check result
      expect(result.success).toBe(false);
      expect(result.messageId).toBeUndefined();
    });
  });
});
