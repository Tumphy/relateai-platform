import { Request, Response } from 'express';
import { EmailTemplate } from '../models/emailTemplate';
import { emailService } from '../services/email.service';

/**
 * Get all email templates for the current user
 */
export const getTemplates = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { category, search, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query: any = { userId };
    
    // Add category filter if provided
    if (category) {
      query.category = category;
    }
    
    // Add search filter if provided
    if (search) {
      query.$text = { $search: search };
    }
    
    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    // Execute query with pagination
    const templates = await EmailTemplate.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    // Get total count for pagination
    const total = await EmailTemplate.countDocuments(query);
    
    return res.status(200).json({
      success: true,
      templates,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching email templates:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch email templates'
    });
  }
};

/**
 * Get a single email template by ID
 */
export const getTemplateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    const template = await EmailTemplate.findOne({ _id: id, userId });
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Email template not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      template
    });
  } catch (error) {
    console.error('Error fetching email template:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch email template'
    });
  }
};

/**
 * Create a new email template
 */
export const createTemplate = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const {
      name,
      subject,
      content,
      category,
      description,
      isDefault,
      tags
    } = req.body;
    
    // Validate required fields
    if (!name || !subject || !content || !category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Generate HTML and plain text versions
    const { html, text: plainText } = emailService.generateTemplate('basic', {
      subject,
      content
    });
    
    // Extract variables from content (matches {{variableName}})
    const variableRegex = /{{([^{}]+)}}/g;
    const variables = [];
    let match;
    while ((match = variableRegex.exec(content)) !== null) {
      variables.push(match[1].trim());
    }
    
    // If setting as default, update any existing default template for this category
    if (isDefault) {
      await EmailTemplate.updateMany(
        { userId, category, isDefault: true },
        { $set: { isDefault: false } }
      );
    }
    
    // Create the template
    const template = new EmailTemplate({
      name,
      subject,
      content,
      category,
      description,
      html,
      plainText,
      variables: [...new Set(variables)], // Remove duplicates
      userId,
      isDefault: Boolean(isDefault),
      tags: tags || []
    });
    
    await template.save();
    
    return res.status(201).json({
      success: true,
      message: 'Email template created successfully',
      template
    });
  } catch (error) {
    console.error('Error creating email template:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create email template'
    });
  }
};

/**
 * Update an existing email template
 */
export const updateTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const updateData = req.body;
    
    // Find the template to update
    const template = await EmailTemplate.findOne({ _id: id, userId });
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Email template not found'
      });
    }
    
    // If content or subject is being updated, regenerate HTML and plain text
    if (updateData.content || updateData.subject) {
      const { html, text: plainText } = emailService.generateTemplate('basic', {
        subject: updateData.subject || template.subject,
        content: updateData.content || template.content
      });
      
      updateData.html = html;
      updateData.plainText = plainText;
    }
    
    // Extract variables if content is updated
    if (updateData.content) {
      const variableRegex = /{{([^{}]+)}}/g;
      const variables = [];
      let match;
      while ((match = variableRegex.exec(updateData.content)) !== null) {
        variables.push(match[1].trim());
      }
      updateData.variables = [...new Set(variables)]; // Remove duplicates
    }
    
    // If setting as default, update any existing default template for this category
    if (updateData.isDefault) {
      await EmailTemplate.updateMany(
        { userId, category: template.category, isDefault: true, _id: { $ne: id } },
        { $set: { isDefault: false } }
      );
    }
    
    // Update the template
    const updatedTemplate = await EmailTemplate.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );
    
    return res.status(200).json({
      success: true,
      message: 'Email template updated successfully',
      template: updatedTemplate
    });
  } catch (error) {
    console.error('Error updating email template:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update email template'
    });
  }
};

/**
 * Delete an email template
 */
export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    // Find the template to delete
    const template = await EmailTemplate.findOne({ _id: id, userId });
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Email template not found'
      });
    }
    
    // Delete the template
    await EmailTemplate.deleteOne({ _id: id, userId });
    
    return res.status(200).json({
      success: true,
      message: 'Email template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting email template:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete email template'
    });
  }
};

/**
 * Get default templates for each category
 */
export const getDefaultTemplates = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    // Get all categories
    const categories = ['introduction', 'follow-up', 'meeting', 'proposal', 'custom'];
    
    // Find default templates for each category
    const defaultTemplates = await Promise.all(
      categories.map(async (category) => {
        const template = await EmailTemplate.findOne({ 
          userId, 
          category, 
          isDefault: true 
        });
        
        return template;
      })
    );
    
    // Filter out null results and map to categories
    const result = categories.map((category, index) => ({
      category,
      template: defaultTemplates[index] || null
    }));
    
    return res.status(200).json({
      success: true,
      defaultTemplates: result
    });
  } catch (error) {
    console.error('Error fetching default templates:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch default templates'
    });
  }
};

/**
 * Preview a template with variables replaced
 */
export const previewTemplate = async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;
    const { variables } = req.body;
    const userId = req.user?.id;
    
    // Find the template
    const template = await EmailTemplate.findOne({ _id: templateId, userId });
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Email template not found'
      });
    }
    
    // Get the content to preview
    let content = template.content;
    let subject = template.subject;
    
    // Replace variables if provided
    if (variables && Object.keys(variables).length > 0) {
      // Replace variables in content
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        content = content.replace(regex, value as string);
        subject = subject.replace(regex, value as string);
      });
    }
    
    // Generate HTML and text versions
    const { html, text } = emailService.generateTemplate('basic', {
      subject,
      content
    });
    
    return res.status(200).json({
      success: true,
      preview: {
        subject,
        content,
        html,
        text
      }
    });
  } catch (error) {
    console.error('Error previewing template:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to preview template'
    });
  }
};
