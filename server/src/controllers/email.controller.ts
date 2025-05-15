import { Request, Response } from 'express';
import { emailService } from '../services/email.service';
import { Message } from '../models/message';
import mongoose from 'mongoose';

/**
 * Handle pixel tracking for email opens
 */
export const trackPixel = async (req: Request, res: Response) => {
  const { trackingId } = req.params;

  if (!trackingId) {
    return res.status(400).send('Invalid tracking ID');
  }

  try {
    // Process the open event
    const result = await emailService.handleTrackingWebhook('open', trackingId);

    if (result.success && result.messageId) {
      // Update message tracking data in database
      await Message.findByIdAndUpdate(
        result.messageId,
        {
          $inc: { 'metadata.opens': 1 },
          $set: { 'metadata.lastOpened': new Date() }
        },
        { new: true }
      );
    }

    // Return a 1x1 transparent pixel
    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // 1x1 transparent GIF
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    return res.send(pixel);
  } catch (error) {
    console.error('Error tracking pixel:', error);
    
    // Still return the pixel to not break email rendering
    res.setHeader('Content-Type', 'image/gif');
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    return res.send(pixel);
  }
};

/**
 * Handle link redirect for click tracking
 */
export const trackRedirect = async (req: Request, res: Response) => {
  const { trackingId } = req.params;
  const { url } = req.query;

  if (!trackingId || !url) {
    return res.status(400).send('Invalid parameters');
  }

  try {
    // Process the click event
    const result = await emailService.handleTrackingWebhook('click', trackingId, { url });

    if (result.success && result.messageId) {
      // Update message tracking data in database
      await Message.findByIdAndUpdate(
        result.messageId,
        {
          $inc: { 'metadata.clicks': 1 },
          $set: { 'metadata.lastClicked': new Date() },
          $push: {
            'metadata.clickedLinks': {
              url: url as string,
              timestamp: new Date()
            }
          }
        },
        { new: true }
      );
    }

    // Redirect to the original URL
    return res.redirect(url as string);
  } catch (error) {
    console.error('Error tracking redirect:', error);
    return res.status(500).send('Error processing redirect');
  }
};

/**
 * Handle email replies
 */
export const handleReply = async (req: Request, res: Response) => {
  const { trackingId } = req.params;
  
  if (!trackingId) {
    return res.status(400).json({ success: false, message: 'Invalid tracking ID' });
  }

  try {
    // Process the reply event
    const result = await emailService.handleTrackingWebhook('reply', trackingId, req.body);

    if (result.success && result.messageId) {
      // Update message tracking data and create a new inbound message
      const message = await Message.findById(result.messageId);
      
      if (message) {
        // Update original message
        await Message.findByIdAndUpdate(
          result.messageId,
          {
            $inc: { 'metadata.replies': 1 },
            $set: { 'metadata.lastReplied': new Date() }
          },
          { new: true }
        );

        // Create a new inbound message for the reply
        const replyMessage = new Message({
          userId: message.userId,
          contactId: message.contactId,
          accountId: message.accountId,
          subject: req.body.subject || `Re: ${message.subject}`,
          content: req.body.text || req.body.html || '',
          channel: 'email',
          direction: 'inbound',
          status: 'received',
          parentMessageId: new mongoose.Types.ObjectId(result.messageId),
          metadata: {
            receivedAt: new Date(),
            originalRecipient: req.body.to || '',
            fromEmail: req.body.from || '',
            headers: req.body.headers || {}
          }
        });

        await replyMessage.save();
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error handling reply:', error);
    return res.status(500).json({ success: false, message: 'Error processing reply' });
  }
};

/**
 * Send a test email
 */
export const sendTestEmail = async (req: Request, res: Response) => {
  const { to, subject, content } = req.body;

  if (!to || !subject || !content) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required fields (to, subject, content)' 
    });
  }

  try {
    const { html, text } = emailService.generateTemplate('basic', { 
      subject, 
      content,
      signature: 'RelateAI Test Email'
    });

    const result = await emailService.sendEmail({
      to,
      subject,
      html,
      text
    });

    if (result.success) {
      return res.status(200).json({ 
        success: true, 
        message: 'Test email sent successfully',
        messageId: result.messageId
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send test email',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error sending test email',
      error
    });
  }
};
