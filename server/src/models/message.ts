import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  userId: mongoose.Types.ObjectId;
  contactId: mongoose.Types.ObjectId;
  accountId: mongoose.Types.ObjectId;
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
  parent?: mongoose.Types.ObjectId;
  metadata?: Record<string, any>;
  tags?: string[];
  campaignId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contactId: {
      type: Schema.Types.ObjectId,
      ref: 'Contact',
      required: true,
    },
    accountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
    },
    channel: {
      type: String,
      enum: ['email', 'linkedin', 'twitter', 'sms', 'other'],
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'delivered', 'opened', 'replied', 'bounced', 'failed'],
      default: 'draft',
    },
    direction: {
      type: String,
      enum: ['outbound', 'inbound'],
      required: true,
    },
    sentAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    openedAt: {
      type: Date,
    },
    repliedAt: {
      type: Date,
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    aiPrompt: {
      recipientType: String,
      messageType: String,
      tone: String,
      length: String,
      customInstructions: String,
    },
    attachments: [
      {
        name: String,
        url: String,
        type: String,
        size: Number,
      },
    ],
    threadId: {
      type: String,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    tags: [String],
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
MessageSchema.index({ userId: 1 });
MessageSchema.index({ contactId: 1 });
MessageSchema.index({ accountId: 1 });
MessageSchema.index({ threadId: 1 });
MessageSchema.index({ status: 1 });
MessageSchema.index({ direction: 1 });
MessageSchema.index({ sentAt: -1 });
MessageSchema.index({ campaignId: 1 });

const Message = mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
