import mongoose, { Schema, Document } from 'mongoose';

export interface EmailTemplateDocument extends Document {
  name: string;
  description?: string;
  subject: string;
  content: string;
  category: 'introduction' | 'follow-up' | 'meeting' | 'proposal' | 'custom';
  html: string;
  plainText: string;
  variables?: string[];
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  isDefault?: boolean;
  tags?: string[];
}

const EmailTemplateSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      trim: true
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true,
      enum: ['introduction', 'follow-up', 'meeting', 'proposal', 'custom'],
      default: 'custom'
    },
    html: {
      type: String,
      required: true
    },
    plainText: {
      type: String,
      required: true
    },
    variables: {
      type: [String],
      default: []
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    tags: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

// Add text index for search functionality
EmailTemplateSchema.index({ 
  name: 'text', 
  description: 'text', 
  subject: 'text', 
  content: 'text' 
});

// Ensure default template uniqueness within a category
EmailTemplateSchema.index(
  { category: 1, isDefault: 1, userId: 1 },
  { 
    unique: true, 
    partialFilterExpression: { isDefault: true } 
  }
);

// Static methods for template operations
EmailTemplateSchema.statics.findDefaultByCategory = function(category: string, userId: mongoose.Types.ObjectId) {
  return this.findOne({ category, isDefault: true, userId });
};

EmailTemplateSchema.statics.findByUserAndCategory = function(userId: mongoose.Types.ObjectId, category: string) {
  return this.find({ userId, category }).sort({ updatedAt: -1 });
};

// Create and export the model
export const EmailTemplate = mongoose.model<EmailTemplateDocument>('EmailTemplate', EmailTemplateSchema);
