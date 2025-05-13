import { ObjectId } from 'mongoose';

// Common types
export type ID = string | ObjectId;

// User interface
export interface User {
  _id: ID;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Account interface
export interface Account {
  _id: ID;
  name: string;
  website?: string;
  industry?: string;
  size?: string;
  location?: string;
  description?: string;
  logo?: string;
  userId: ID;
  createdAt: Date;
  updatedAt: Date;
}

// Contact interface
export interface Contact {
  _id: ID;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  title?: string;
  company: string;
  accountId: ID;
  userId: ID;
  linkedInUrl?: string;
  twitterUrl?: string;
  notes?: string;
  recentActivities?: {
    date: Date;
    description: string;
    source: string;
  }[];
  personaMatch?: {
    score: number;
    reasons: string[];
  };
  icpFit?: {
    score: number;
    reasons: string[];
  };
  status: 'active' | 'inactive' | 'prospect' | 'customer' | 'partner';
  tags?: string[];
  lastContactDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Message interface
export interface Message {
  _id: ID;
  userId: ID;
  contactId: ID;
  accountId: ID;
  content: string;
  subject?: string;
  channel: 'email' | 'linkedin' | 'twitter' | 'sms' | 'other';
  status: 'draft' | 'sent' | 'delivered' | 'opened' | 'replied' | 'bounced' | 'failed';
  direction: 'outbound' | 'inbound';
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  repliedAt?: Date;
  aiGenerated: boolean;
  aiPrompt?: {
    recipientType: string;
    messageType: string;
    tone: string;
    length: string;
    customInstructions?: string;
  };
  attachments?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  threadId?: string;
  parent?: ID;
  metadata?: Record<string, any>;
  tags?: string[];
  campaignId?: ID;
  createdAt: Date;
  updatedAt: Date;
}

// MEDDPPICC interface
export interface Meddppicc {
  _id: ID;
  account: ID;
  metrics?: string;
  economicBuyer?: string;
  decisionCriteria?: string;
  decisionProcess?: string;
  paperProcess?: string;
  identifiedPain?: string;
  champion?: string;
  competition?: string;
  nextSteps?: {
    text: string;
    dueDate: Date;
    completed: boolean;
  }[];
  dealNotes?: string;
  lastUpdatedBy: ID;
  createdAt: Date;
  updatedAt: Date;
}

// Contact filter parameters
export interface ContactFilterParams {
  accountId?: string;
  status?: 'active' | 'inactive' | 'prospect' | 'customer' | 'partner';
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  tags?: string[];
  minIcpScore?: number;
  maxIcpScore?: number;
}

// Message filter parameters
export interface MessageFilterParams {
  contactId?: string;
  accountId?: string;
  status?: 'draft' | 'sent' | 'delivered' | 'opened' | 'replied' | 'bounced' | 'failed';
  direction?: 'outbound' | 'inbound';
  channel?: 'email' | 'linkedin' | 'twitter' | 'sms' | 'other';
  threadId?: string;
  search?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  campaignId?: string;
  tags?: string[];
  aiGenerated?: boolean;
}

// Message generation parameters
export interface MessageGenerationParams {
  contactId: string;
  accountId: string;
  recipientType: string;
  messageType: string;
  tone: string;
  length: string;
  customInstructions?: string;
  channel?: 'email' | 'linkedin' | 'twitter' | 'sms' | 'other';
  includeCTA?: boolean;
  personalize?: boolean;
}

// Contact Discovery Parameters
export interface ContactDiscoveryParams {
  accountId: string;
  targetRoles: string[];
  discoveryDepth?: 'basic' | 'standard' | 'deep';
  maxContacts?: number;
}

// Pagination Response
export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}
