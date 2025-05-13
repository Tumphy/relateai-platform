import { z } from 'zod';

// Schema for creating a new contact
export const createContactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  title: z.string().optional(),
  company: z.string().min(1, 'Company name is required'),
  accountId: z.string().min(1, 'Account ID is required'),
  linkedInUrl: z.string().url().optional().or(z.literal('')),
  twitterUrl: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
  status: z.enum(['active', 'inactive', 'prospect', 'customer', 'partner']).optional(),
  tags: z.array(z.string()).optional(),
});

// Schema for updating a contact
export const updateContactSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  title: z.string().optional(),
  company: z.string().min(1, 'Company name is required').optional(),
  linkedInUrl: z.string().url().optional().or(z.literal('')),
  twitterUrl: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
  status: z.enum(['active', 'inactive', 'prospect', 'customer', 'partner']).optional(),
  tags: z.array(z.string()).optional(),
  recentActivities: z.array(
    z.object({
      date: z.date().or(z.string()),
      description: z.string(),
      source: z.string(),
    })
  ).optional(),
  personaMatch: z.object({
    score: z.number().min(0).max(100),
    reasons: z.array(z.string()),
  }).optional(),
  icpFit: z.object({
    score: z.number().min(0).max(100),
    reasons: z.array(z.string()),
  }).optional(),
  lastContactDate: z.date().or(z.string()).optional(),
});

// Schema for contact filtering parameters
export const contactFilterSchema = z.object({
  accountId: z.string().optional(),
  status: z.enum(['active', 'inactive', 'prospect', 'customer', 'partner']).optional(),
  search: z.string().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().optional().default(20),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  tags: z.array(z.string()).optional(),
  minIcpScore: z.number().min(0).max(100).optional(),
  maxIcpScore: z.number().min(0).max(100).optional(),
});

// Schema for contact AI discovery
export const contactDiscoverySchema = z.object({
  accountId: z.string().min(1, 'Account ID is required'),
  targetRoles: z.array(z.string()).min(1, 'At least one target role is required'),
  discoveryDepth: z.enum(['basic', 'standard', 'deep']).optional().default('standard'),
  maxContacts: z.number().int().positive().optional().default(10),
});

// Export all schemas for use in routes
export const contactValidators = {
  create: createContactSchema,
  update: updateContactSchema,
  filter: contactFilterSchema,
  discovery: contactDiscoverySchema,
};
