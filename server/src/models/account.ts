import mongoose from 'mongoose';

export interface IAccount extends mongoose.Document {
  name: string;
  website: string;
  industry: string;
  description: string;
  size: string;
  location: string;
  revenue: string;
  technologies: string[];
  tags: string[];
  icpScore: number;
  status: string;
  notes: string;
  owner: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AccountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    size: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    revenue: {
      type: String,
      trim: true,
    },
    technologies: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    icpScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Researching', 'Contacted', 'Engaged', 'Qualifying', 'Negotiating', 'Closed Won', 'Closed Lost'],
      default: 'Researching',
    },
    notes: {
      type: String,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better search performance
AccountSchema.index({ name: 'text', industry: 'text', tags: 'text' });
AccountSchema.index({ owner: 1 });
AccountSchema.index({ icpScore: -1 });
AccountSchema.index({ status: 1 });

const Account = mongoose.model<IAccount>('Account', AccountSchema);

export default Account;