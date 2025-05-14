import { z } from 'zod';

// URL regex pattern for validation
const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\/[a-zA-Z0-9._~:/?#[\]@!$&'()*+,;=]*)?$/;

// Base schema for account data
const accountBaseSchema = z.object({
  name: z.string().min(1, { message: 'Account name is required' }).max(200),
  website: z.string().regex(urlPattern, { message: 'Please enter a valid website URL' }).optional(),
  industry: z.string().optional(),
  description: z.string().optional(),
  size: z.string().optional(),
  location: z.string().optional(),
  revenue: z.string().optional(),
  phone: z.string().optional(),
  tags: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
  icpScore: z.number().min(0).max(100).optional()
});

// Schema for creating a new account
export const createAccountSchema = accountBaseSchema;

// Schema for updating an account
export const updateAccountSchema = accountBaseSchema.partial();

// Schema for research request
export const researchAccountSchema = z.object({
  url: z.string().regex(urlPattern, { message: 'Please enter a valid website URL' }),
  name: z.string().optional()
}).refine((data) => {
  // Ensure we have either a URL or a name
  return data.url !== undefined || data.name !== undefined;
}, {
  message: 'Either URL or name is required',
  path: ['research']
});

// Schema for account request params
export const accountParamsSchema = z.object({
  id: z.string().uuid({ message: 'Invalid account ID format' })
});

// Schema for account query params
export const accountQuerySchema = z.object({
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  search: z.string().optional(),
  industry: z.string().optional(),
  size: z.string().optional(),
  tags: z.string().optional(),
  icpScoreMin: z.string().regex(/^\d+$/).transform(Number).optional(),
  icpScoreMax: z.string().regex(/^\d+$/).transform(Number).optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'icpScore']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

export default {
  createAccountSchema,
  updateAccountSchema,
  researchAccountSchema,
  accountParamsSchema,
  accountQuerySchema
};
