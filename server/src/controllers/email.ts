import nodemailer from 'nodemailer';
import { Request, Response } from 'express';
import Message from '../models/message';
import Contact from '../models/contact';
import User from '../models/user';
import { validateMessageSend } from '../validators/message';

// Configure email transport
const createTransporter = () => {
  // Check for environment variables
  const { 
    EMAIL_HOST, 
    EMAIL_PORT, 
    EMAIL_USER, 
    EMAIL_PASSWORD,
    EMAIL_FROM
  } = process.env;

  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASSWORD) {
    throw new Error('Email configuration is incomplete');
  }

  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: parseInt(EMAIL_PORT, 10),
    secure: parseInt(EMAIL_PORT, 10) === 465, // true for 465, false for other ports
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  });
};

/**
 * Send a message via email
 * @route POST /api/messages/send
 * @access Private
 */
export const sendMessage = async (req: Request, res: Response) => {
  try {
    // Validate request
    const validation = validateMessageSend(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: validation.error.errors 
      });
    }

    const { messageId } = req.body;
    
    // Find the message
    const message = await Message.findById(messageId)
      .populate('contactId', 'firstName lastName email')
      .populate('userId', 'name email');
    
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    
    // Check message status
    if (message.status !== 'draft') {
      return res.status(400).json({ 
        success: false, 
        message: `Message has already been ${message.status}` 
      });
    }
    
    // Check channel
    if (message.channel !== 'email') {
      return res.status(400).json({ 
        success: false, 
        message: `This endpoint only supports email messages. Current channel: ${message.channel}` 
      });
    }

    // Get contact email
    const contact = message.contactId as any;
    if (!contact || !contact.email) {
      return res.status(400).json({ success: false, message: 'Contact has no email address' });
    }

    // Get user (sender) info
    const user = message.userId as any;
    
    // Create email transporter
    const transporter = createTransporter();
    
    // Default from address
    const fromAddress = process.env.EMAIL_FROM || user.email;
    
    // Send email
    const info = await transporter.sendMail({
      from: `"${user.name}" <${fromAddress}>`,
      to: `"${contact.firstName} ${contact.lastName}" <${contact.email}>`,
      subject: message.subject || 'No Subject',
      html: message.content,
      // Optional tracking pixel for open tracking
      headers: {
        'X-Entity-Ref-ID': message._id.toString()
      }
    });
    
    // Update message status
    message.status = 'sent';
    message.sentAt = new Date();
    await message.save();
    
    return res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        messageId: message._id,
        emailId: info.messageId
      }
    });
    
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to send message',
      error: (error as Error).message
    });
  }
};

/**
 * Track message open or delivery status
 * @route POST /api/messages/track/:id/:event
 * @access Public
 */
export const trackMessage = async (req: Request, res: Response) => {
  try {
    const { id, event } = req.params;
    
    // Find the message
    const message = await Message.findById(id);
    if (!message) {
      // Return a tracking pixel anyway (1x1 transparent gif)
      return res.status(200)
        .set('Content-Type', 'image/gif')
        .send(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'));
    }
    
    // Update message status based on event
    if (event === 'open' && message.status !== 'replied') {
      message.status = 'opened';
      message.openedAt = new Date();
    } else if (event === 'delivery' && message.status === 'sent') {
      message.status = 'delivered';
      message.deliveredAt = new Date();
    }
    
    await message.save();
    
    // Return a tracking pixel (1x1 transparent gif)
    return res.status(200)
      .set('Content-Type', 'image/gif')
      .send(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'));
    
  } catch (error) {
    console.error('Error tracking message:', error);
    // Still return a tracking pixel even if there's an error
    return res.status(200)
      .set('Content-Type', 'image/gif')
      .send(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'));
  }
};

/**
 * Process email webhook for replies
 * @route POST /api/messages/webhook
 * @access Public (but secured with webhook secret)
 */
export const processWebhook = async (req: Request, res: Response) => {
  try {
    // Validate webhook secret
    const webhookSecret = req.headers['x-webhook-secret'];
    if (webhookSecret !== process.env.EMAIL_WEBHOOK_SECRET) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const { 
      messageId,
      event,
      emailId,
      threadId,
      inReplyTo,
      from,
      subject,
      text,
      html
    } = req.body;
    
    // Find the original message by email ID or in-reply-to header
    let originalMessage;
    if (inReplyTo) {
      originalMessage = await Message.findOne({ 'metadata.emailId': inReplyTo });
    }
    
    if (!originalMessage && threadId) {
      originalMessage = await Message.findOne({ threadId });
    }
    
    if (!originalMessage) {
      return res.status(404).json({ success: false, message: 'Original message not found' });
    }
    
    // Update original message status
    if (event === 'reply' && originalMessage.status !== 'replied') {
      originalMessage.status = 'replied';
      originalMessage.repliedAt = new Date();
      await originalMessage.save();
    }
    
    // If it's a reply, create a new message for the reply
    if (event === 'reply') {
      // Extract email from the from field (usually in format "Name <email@example.com>")
      const emailRegex = /<([^>]+)>/;
      const match = from.match(emailRegex);
      const fromEmail = match ? match[1] : from;
      
      // Find the contact
      const contact = await Contact.findById(originalMessage.contactId);
      if (!contact) {
        return res.status(404).json({ success: false, message: 'Contact not found' });
      }
      
      // Create a new message for the reply
      const reply = new Message({
        userId: originalMessage.userId,
        contactId: originalMessage.contactId,
        accountId: originalMessage.accountId,
        subject: subject || `Re: ${originalMessage.subject}`,
        content: html || text || '',
        channel: 'email',
        status: 'replied',
        direction: 'inbound',
        threadId: originalMessage.threadId || originalMessage._id,
        parent: originalMessage._id,
        sentAt: new Date(),
        deliveredAt: new Date(),
        metadata: {
          emailId: emailId || null
        }
      });
      
      await reply.save();
    }
    
    return res.status(200).json({ success: true, message: 'Webhook processed successfully' });
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to process webhook',
      error: (error as Error).message
    });
  }
};

export default {
  sendMessage,
  trackMessage,
  processWebhook
};