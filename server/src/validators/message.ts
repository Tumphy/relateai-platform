import { z } from 'zod';

// Base schema for message data
const messageBaseSchema = z.object({
  userId: z.string().uuid({ message: 'Invalid user ID format' }).optional(),
  contactId: z.string().uuid({ message: 'Invalid contact ID format' }),
  accountId: z.string().uuid({ message: 'Invalid account ID format' }),
  subject: z.string().min(1, { message: 'Subject is required' }).max(200),
  content: z.string().min(1, { message: 'Content is required' }),
  channel: z.enum(['email', 'linkedin', 'twitter', 'sms', 'other'], {
    errorMap: () => ({ message: 'Invalid channel type' })
  }),
  direction: z.enum(['outbound', 'inbound'], {
    errorMap: () => ({ message: 'Invalid direction' })
  }).default('outbound'),
  aiGenerated: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

// Schema for creating a new message
export const createMessageSchema = messageBaseSchema.extend({
  status: z.enum(
    ['draft', 'sent', 'delivered', 'opened', 'replied', 'bounced', 'failed'],
    { errorMap: () => ({ message: 'Invalid status' }) }
  ).default('draft'),
  aiPrompt: z.object({
    recipientType: z.string().optional(),
    messageType: z.string().optional(),
    tone: z.string().optional(),
    length: z.string().optional(),
    customInstructions: z.string().optional()
  }).optional(),
  attachments: z.array(
    z.object({
      name: z.string().min(1),
      url: z.string().url({ message: 'Invalid attachment URL' }),
      type: z.string(),
      size: z.number().positive()
    })
  ).optional(),
  threadId: z.string().uuid({ message: 'Invalid thread ID format' }).optional(),
  parent: z.string().uuid({ message: 'Invalid parent message ID format' }).optional(),
  campaignId: z.string().uuid({ message: 'Invalid campaign ID format' }).optional()
});

// Schema for updating a message
export const updateMessageSchema = messageBaseSchema.partial().extend({
  status: z.enum(
    ['draft', 'sent', 'delivered', 'opened', 'replied', 'bounced', 'failed'],
    { errorMap: () => ({ message: 'Invalid status' }) }
  ).optional(),
});

// Schema for sending a message
export const sendMessageSchema = z.object({
  messageId: z.string().uuid({ message: 'Invalid message ID format' })
});

// Schema for generating a message with AI
export const generateMessageSchema = z.object({
  contactId: z.string().uuid({ message: 'Invalid contact ID format' }),
  accountId: z.string().uuid({ message: 'Invalid account ID format' }),
  recipientType: z.string().min(1, { message: 'Recipient type is required' }),
  messageType: z.string().min(1, { message: 'Message type is required' }),
  tone: z.string().min(1, { message: 'Tone is required' }),
  length: z.string().min(1, { message: 'Length is required' }),
  customInstructions: z.string().optional(),
  channel: z.enum(['email', 'linkedin', 'twitter', 'sms', 'other'], {
    errorMap: () => ({ message: 'Invalid channel type' })
  }).default('email')
});

// Schema for getting message history for a contact
export const messageHistorySchema = z.object({
  contactId: z.string().uuid({ message: 'Invalid contact ID format' })
});

// Schema for email tracking params
export const trackingParamsSchema = z.object({
  id: z.string().uuid({ message: 'Invalid message ID format' }),
  event: z.enum(['open', 'delivery'], {
    errorMap: () => ({ message: 'Invalid tracking event' })
  })
});

// Schema for webhook payload
export const webhookSchema = z.object({
  messageId: z.string().optional(),
  event: z.enum(['reply', 'bounce', 'complaint'], {
    errorMap: () => ({ message: 'Invalid webhook event' })
  }),
  emailId: z.string().optional(),
  threadId: z.string().optional(),
  inReplyTo: z.string().optional(),
  from: z.string().email({ message: 'Invalid from email' }),
  subject: z.string().optional(),
  text: z.string().optional(),
  html: z.string().optional()
}).refine((data) => {
  // Ensure we have at least one content field
  return data.text !== undefined || data.html !== undefined;
}, {
  message: 'Either text or html content is required',
  path: ['content']
}).refine((data) => {
  // Ensure we can identify the original message
  return data.inReplyTo !== undefined || data.threadId !== undefined;
}, {
  message: 'Either inReplyTo or threadId is required',
  path: ['messageIdentification']
});

export default {
  createMessageSchema,
  updateMessageSchema,
  sendMessageSchema,
  generateMessageSchema,
  messageHistorySchema,
  trackingParamsSchema,
  webhookSchema
};
