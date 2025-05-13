import { z } from 'zod';

// Message creation schema
export const messageCreateSchema = z.object({
  contactId: z.string().min(1, 'Contact ID is required'),
  accountId: z.string().min(1, 'Account ID is required'),
  subject: z.string().optional(),
  content: z.string().min(1, 'Message content is required'),
  channel: z.enum(['email', 'linkedin', 'twitter', 'sms', 'other']),
  aiGenerated: z.boolean().default(false),
  aiPrompt: z.object({
    recipientType: z.string().optional(),
    messageType: z.string().optional(),
    tone: z.string().optional(),
    length: z.string().optional(),
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

// Message update schema
export const messageUpdateSchema = z.object({
  subject: z.string().optional(),
  content: z.string().optional(),
  channel: z.enum(['email', 'linkedin', 'twitter', 'sms', 'other']).optional(),
  status: z.enum(['draft', 'sent', 'delivered', 'opened', 'replied', 'bounced', 'failed']).optional(),
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

// Message send schema
export const messageSendSchema = z.object({
  messageId: z.string().min(1, 'Message ID is required'),
});

// Message generation schema
export const messageGenerationSchema = z.object({
  contactId: z.string().min(1, 'Contact ID is required'),
  accountId: z.string().min(1, 'Account ID is required'),
  recipientType: z.string().min(1, 'Recipient type is required'),
  messageType: z.string().min(1, 'Message type is required'),
  tone: z.string().min(1, 'Tone is required'),
  length: z.string().min(1, 'Length is required'),
  customInstructions: z.string().optional(),
  channel: z.enum(['email', 'linkedin', 'twitter', 'sms', 'other']).optional().default('email'),
  includeCTA: z.boolean().optional().default(true),
  personalize: z.boolean().optional().default(true),
});

// Validator functions that return the validation result
export const validateMessageCreate = (data: any) => {
  return messageCreateSchema.safeParse(data);
};

export const validateMessageUpdate = (data: any) => {
  return messageUpdateSchema.safeParse(data);
};

export const validateMessageSend = (data: any) => {
  return messageSendSchema.safeParse(data);
};

export const validateMessageGeneration = (data: any) => {
  return messageGenerationSchema.safeParse(data);
};

export default {
  validateMessageCreate,
  validateMessageUpdate,
  validateMessageSend,
  validateMessageGeneration
};