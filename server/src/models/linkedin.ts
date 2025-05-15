import mongoose, { Schema, Document } from 'mongoose';

export interface LinkedInIntegrationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  linkedInId: string;
  profileUrl: string;
  firstName: string;
  lastName: string;
  headline?: string;
  industry?: string;
  email?: string;
  pictureUrl?: string;
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LinkedInIntegrationSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    accessToken: {
      type: String,
      required: true
    },
    refreshToken: {
      type: String
    },
    expiresAt: {
      type: Date,
      required: true
    },
    linkedInId: {
      type: String,
      required: true
    },
    profileUrl: {
      type: String,
      required: true
    },
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    headline: {
      type: String
    },
    industry: {
      type: String
    },
    email: {
      type: String
    },
    pictureUrl: {
      type: String
    },
    lastSyncAt: {
      type: Date
    }
  },
  { timestamps: true }
);

// Method to check if the token is expired
LinkedInIntegrationSchema.methods.isTokenExpired = function(): boolean {
  return this.expiresAt <= new Date();
};

// Static method to find by user ID
LinkedInIntegrationSchema.statics.findByUserId = function(userId: mongoose.Types.ObjectId) {
  return this.findOne({ userId });
};

export const LinkedInIntegration = mongoose.model<LinkedInIntegrationDocument>(
  'LinkedInIntegration',
  LinkedInIntegrationSchema
);

// LinkedIn Connection model for storing contact connections via LinkedIn
export interface LinkedInConnectionDocument extends Document {
  userId: mongoose.Types.ObjectId;
  contactId: mongoose.Types.ObjectId;
  linkedInId: string;
  profileUrl: string;
  firstName: string;
  lastName: string;
  headline?: string;
  industry?: string;
  pictureUrl?: string;
  position?: string;
  company?: string;
  connectionDegree?: number;
  connectionDate?: Date;
  lastInteractionDate?: Date;
  lastMessageSent?: Date;
  lastMessageReceived?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LinkedInConnectionSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    contactId: {
      type: Schema.Types.ObjectId,
      ref: 'Contact',
      required: true
    },
    linkedInId: {
      type: String,
      required: true
    },
    profileUrl: {
      type: String,
      required: true
    },
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    headline: {
      type: String
    },
    industry: {
      type: String
    },
    pictureUrl: {
      type: String
    },
    position: {
      type: String
    },
    company: {
      type: String
    },
    connectionDegree: {
      type: Number,
      enum: [1, 2, 3],
      default: 1
    },
    connectionDate: {
      type: Date
    },
    lastInteractionDate: {
      type: Date
    },
    lastMessageSent: {
      type: Date
    },
    lastMessageReceived: {
      type: Date
    },
    notes: {
      type: String
    }
  },
  { timestamps: true }
);

// Create a compound index for userId and contactId
LinkedInConnectionSchema.index({ userId: 1, contactId: 1 }, { unique: true });

// Create an index for linkedInId
LinkedInConnectionSchema.index({ linkedInId: 1 });

// Static method to find by contact ID
LinkedInConnectionSchema.statics.findByContactId = function(
  userId: mongoose.Types.ObjectId,
  contactId: mongoose.Types.ObjectId
) {
  return this.findOne({ userId, contactId });
};

export const LinkedInConnection = mongoose.model<LinkedInConnectionDocument>(
  'LinkedInConnection',
  LinkedInConnectionSchema
);

// LinkedIn Message model for storing messages sent/received via LinkedIn
export interface LinkedInMessageDocument extends Document {
  userId: mongoose.Types.ObjectId;
  contactId: mongoose.Types.ObjectId;
  connectionId: mongoose.Types.ObjectId;
  messageId: string;
  content: string;
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  sentAt: Date;
  deliveredAt?: Date;
  readAt?: Date;
  failedReason?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const LinkedInMessageSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    contactId: {
      type: Schema.Types.ObjectId,
      ref: 'Contact',
      required: true
    },
    connectionId: {
      type: Schema.Types.ObjectId,
      ref: 'LinkedInConnection',
      required: true
    },
    messageId: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    direction: {
      type: String,
      enum: ['inbound', 'outbound'],
      required: true
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read', 'failed'],
      required: true
    },
    sentAt: {
      type: Date,
      required: true
    },
    deliveredAt: {
      type: Date
    },
    readAt: {
      type: Date
    },
    failedReason: {
      type: String
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed
    }
  },
  { timestamps: true }
);

// Create indexes for efficient queries
LinkedInMessageSchema.index({ userId: 1, contactId: 1 });
LinkedInMessageSchema.index({ connectionId: 1 });
LinkedInMessageSchema.index({ messageId: 1 });

export const LinkedInMessage = mongoose.model<LinkedInMessageDocument>(
  'LinkedInMessage',
  LinkedInMessageSchema
);
