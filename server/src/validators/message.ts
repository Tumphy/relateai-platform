import { z } from 'zod';

// Schema for creating a new message
export const createMessageSchema = z.object({
  contactId: z.string().min(1, 'Contact ID is required'),
  accountId: z.string().min(1, 'Account ID is required'),
  content: z.string().min(1, 'Message content is required'),
  subject: z.string().optional(),
  channel: z.enum(['email', 'linkedin', 'twitter', 'sms', 'other']),
  status: z.enum(['draft', 'sent', 'delivered', 'opened', 'replied', 'bounced', 'failed']).default('draft'),
  direction: z.enum(['outbound', 'inbound']).default('outbound'),
  sentAt: z.date().or(z.string()).optional(),
  aiGenerated: z.boolean().default(false),
  aiPrompt: z.object({
    recipientType: z.string(),
    messageType: z.string(),
    tone: z.string(),
    length: z.string(),
    customInstructions: z.string().optional(),
  }).optional(),
  attachments: z.array(
    z.object({
      name: z.string(),
      url: z.string(),
      type: z.string(),
      size: z.number(),
    })
  ).optional(),
  threadId: z.string().optional(),
  parent: z.string().optional(),
  tags: z.array(z.string()).optional(),
  campaignId: z.string().optional(),
});

// Schema for updating a message
export const updateMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required').optional(),
  subject: z.string().optional(),
  status: z.enum(['draft', 'sent', 'delivered', 'opened', 'replied', 'bounced', 'failed']).optional(),
  sentAt: z.date().or(z.string()).optional(),
  deliveredAt: z.date().or(z.string()).optional(),
  openedAt: z.date().or(z.string()).optional(),
  repliedAt: z.date().or(z.string()).optional(),
  attachments: z.array(
    z.object({
      name: z.string(),
      url: z.string(),
      type: z.string(),
      size: z.number(),
    })
  ).optional(),
  tags: z.array(z.string()).optional(),
});

// Schema for message filtering parameters
export const messageFilterSchema = z.object({
  contactId: z.string().optional(),
  accountId: z.string().optional(),
  status: z.enum(['draft', 'sent', 'delivered', 'opened', 'replied', 'bounced', 'failed']).optional(),
  direction: z.enum(['outbound', 'inbound']).optional(),
  channel: z.enum(['email', 'linkedin', 'twitter', 'sms', 'other']).optional(),
  threadId: z.string().optional(),
  search: z.string().optional(),
  startDate: z.date().or(z.string()).optional(),
  endDate: z.date().or(z.string()).optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().optional().default(20),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  campaignId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  aiGenerated: z.boolean().optional(),
});

// Schema for generating a message with AI
export const generateMessageSchema = z.object({
  contactId: z.string().min(1, 'Contact ID is required'),
  accountId: z.string().min(1, 'Account ID is required'),
  recipientType: z.string().min(1, 'Recipient type is required'),
  messageType: z.string().min(1, 'Message type is required'),
  tone: z.string().min(1, 'Tone is required'),
  length: z.string().min(1, 'Length is required'),
  customInstructions: z.string().optional(),
  channel: z.enum(['email', 'linkedin', 'twitter', 'sms', 'other']).default('email'),
  includeCTA: z.boolean().optional().default(true),
  personalize: z.boolean().optional().default(true),
});

// Schema for sending a message
export const sendMessageSchema = z.object({
  messageId: z.string().min(1, 'Message ID is required'),
  scheduledFor: z.date().or(z.string()).optional(),
});

// Export all schemas for use in routes
export const messageValidators = {
  create: createMessageSchema,
  update: updateMessageSchema,
  filter: messageFilterSchema,
  generate: generateMessageSchema,
  send: sendMessageSchema,
};
