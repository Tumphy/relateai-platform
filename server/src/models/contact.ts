import mongoose, { Schema, Document } from 'mongoose';

export interface IContact extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  title?: string;
  company: string;
  accountId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
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

const ContactSchema: Schema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    accountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    linkedInUrl: {
      type: String,
      trim: true,
    },
    twitterUrl: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
    },
    recentActivities: [
      {
        date: {
          type: Date,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        source: {
          type: String,
          required: true,
        },
      },
    ],
    personaMatch: {
      score: {
        type: Number,
        min: 0,
        max: 100,
      },
      reasons: [String],
    },
    icpFit: {
      score: {
        type: Number,
        min: 0,
        max: 100,
      },
      reasons: [String],
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'prospect', 'customer', 'partner'],
      default: 'prospect',
    },
    tags: [String],
    lastContactDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for faster queries
ContactSchema.index({ accountId: 1 });
ContactSchema.index({ userId: 1 });
ContactSchema.index({ email: 1 });
ContactSchema.index({ status: 1 });

const Contact = mongoose.model<IContact>('Contact', ContactSchema);

export default Contact;
