import nodemailer from 'nodemailer';
import { createHmac } from 'crypto';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  trackingId?: string;
  contactId?: string;
  accountId?: string;
  messageId?: string;
}

interface TrackingData {
  messageId: string;
  contactId?: string;
  accountId?: string;
}

/**
 * Email service for sending and tracking emails
 */
class EmailService {
  private transporter: nodemailer.Transporter;
  private from: string;
  private trackingDomain: string;
  private webhookSecret: string;

  constructor() {
    // Initialize email transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    this.from = process.env.EMAIL_FROM || 'no-reply@relateai.com';
    this.trackingDomain = process.env.EMAIL_TRACKING_DOMAIN || 'tracking.relateai.com';
    this.webhookSecret = process.env.EMAIL_WEBHOOK_SECRET || 'development-secret';
  }

  /**
   * Send an email
   */
  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: any }> {
    try {
      const trackingId = options.trackingId || this.generateTrackingId({
        messageId: options.messageId || '',
        contactId: options.contactId,
        accountId: options.accountId
      });

      const trackingPixel = this.generateTrackingPixel(trackingId);
      const trackedHtml = `${options.html}${trackingPixel}`;
      const enhancedLinks = this.wrapLinksWithTracking(trackedHtml, trackingId);

      const result = await this.transporter.sendMail({
        from: options.from || this.from,
        to: options.to,
        subject: options.subject,
        html: enhancedLinks,
        text: options.text,
        replyTo: options.replyTo,
        headers: {
          'X-Tracking-ID': trackingId
        }
      });

      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error
      };
    }
  }

  /**
   * Generate a tracking ID for email tracking
   */
  private generateTrackingId(data: TrackingData): string {
    // Create a unique tracking ID based on message data and a timestamp
    const timestamp = Date.now();
    const trackingData = JSON.stringify({
      ...data,
      timestamp
    });

    // Sign the tracking data to prevent tampering
    const hmac = createHmac('sha256', this.webhookSecret);
    hmac.update(trackingData);
    const signature = hmac.digest('hex');

    // Create Base64 encoded tracking ID
    return Buffer.from(
      JSON.stringify({
        data: trackingData,
        sig: signature
      })
    ).toString('base64');
  }

  /**
   * Verify a tracking ID from webhooks
   */
  verifyTrackingId(trackingId: string): { valid: boolean; data?: TrackingData & { timestamp: number } } {
    try {
      // Decode the tracking ID
      const decoded = JSON.parse(Buffer.from(trackingId, 'base64').toString());
      const { data, sig } = decoded;

      // Verify signature
      const hmac = createHmac('sha256', this.webhookSecret);
      hmac.update(data);
      const expectedSignature = hmac.digest('hex');

      if (sig !== expectedSignature) {
        return { valid: false };
      }

      // Return the decoded data
      return {
        valid: true,
        data: JSON.parse(data)
      };
    } catch (error) {
      console.error('Error verifying tracking ID:', error);
      return { valid: false };
    }
  }

  /**
   * Generate a tracking pixel HTML for email open tracking
   */
  private generateTrackingPixel(trackingId: string): string {
    return `<img src="https://${this.trackingDomain}/pixel/${trackingId}" alt="" width="1" height="1" style="display:none;" />`;
  }

  /**
   * Wrap links in HTML with tracking redirects
   */
  private wrapLinksWithTracking(html: string, trackingId: string): string {
    // Simple regex to find links in HTML
    const linkRegex = /<a\s+(?:[^>]*?\s+)?href=["']([^"']*)["']([^>]*)>/gi;

    return html.replace(linkRegex, (match, url, rest) => {
      if (url.includes(this.trackingDomain)) {
        return match; // Skip already tracked links
      }

      const encodedUrl = encodeURIComponent(url);
      const trackedUrl = `https://${this.trackingDomain}/redirect/${trackingId}?url=${encodedUrl}`;
      return `<a href="${trackedUrl}"${rest}>`;
    });
  }

  /**
   * Handle webhook event for email tracking
   */
  async handleTrackingWebhook(
    type: 'open' | 'click' | 'reply',
    trackingId: string,
    payload?: any
  ): Promise<{ success: boolean; messageId?: string }> {
    const verification = this.verifyTrackingId(trackingId);

    if (!verification.valid || !verification.data) {
      return { success: false };
    }

    const { messageId } = verification.data;

    // At this point, you would update the message in the database
    // to record the tracking event (open, click, reply)
    // This would be implemented in the MessageService or a similar service

    return {
      success: true,
      messageId
    };
  }

  /**
   * Create email templates
   */
  generateTemplate(templateName: string, data: Record<string, any>): { html: string; text: string } {
    // Simple template system - in a real app, you would use a more robust template engine
    let html = '';
    let text = '';

    switch (templateName) {
      case 'basic':
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">${data.subject || 'Message from RelateAI'}</h1>
            <div style="margin: 20px 0; line-height: 1.5;">
              ${data.content || ''}
            </div>
            <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
              ${data.signature || 'Sent via RelateAI'}
            </div>
          </div>
        `;
        text = data.content || '';
        break;

      case 'followUp':
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Following up</h1>
            <p>I wanted to follow up on our previous conversation.</p>
            <div style="margin: 20px 0; line-height: 1.5;">
              ${data.content || ''}
            </div>
            <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
              ${data.signature || 'Sent via RelateAI'}
            </div>
          </div>
        `;
        text = `Following up\n\nI wanted to follow up on our previous conversation.\n\n${data.content || ''}`;
        break;

      default:
        html = `<div>${data.content || ''}</div>`;
        text = data.content || '';
    }

    return { html, text };
  }
}

export const emailService = new EmailService();
