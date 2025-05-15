import { EmailTemplate } from '@/types/models';
import api from '@/lib/api';

/**
 * Email template service for managing email templates
 */
export const emailTemplateService = {
  /**
   * Get all email templates
   */
  getTemplates: async (params?: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    return api.get<{
      success: boolean;
      templates: EmailTemplate[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>('/email-templates', { params });
  },

  /**
   * Get a specific email template by ID
   */
  getTemplate: async (id: string) => {
    return api.get<{
      success: boolean;
      template: EmailTemplate;
    }>(`/email-templates/${id}`);
  },

  /**
   * Create a new email template
   */
  createTemplate: async (templateData: Partial<EmailTemplate>) => {
    return api.post<{
      success: boolean;
      message: string;
      template: EmailTemplate;
    }>('/email-templates', templateData);
  },

  /**
   * Update an existing email template
   */
  updateTemplate: async (id: string, templateData: Partial<EmailTemplate>) => {
    return api.put<{
      success: boolean;
      message: string;
      template: EmailTemplate;
    }>(`/email-templates/${id}`, templateData);
  },

  /**
   * Delete an email template
   */
  deleteTemplate: async (id: string) => {
    return api.delete<{
      success: boolean;
      message: string;
    }>(`/email-templates/${id}`);
  },

  /**
   * Get default templates for each category
   */
  getDefaultTemplates: async () => {
    return api.get<{
      success: boolean;
      defaultTemplates: Array<{
        category: string;
        template: EmailTemplate | null;
      }>;
    }>('/email-templates/defaults');
  },

  /**
   * Preview a template with variables replaced
   */
  previewTemplate: async (
    templateId: string,
    variables: Record<string, string>
  ) => {
    return api.post<{
      success: boolean;
      preview: {
        subject: string;
        content: string;
        html: string;
        text: string;
      };
    }>(`/email-templates/${templateId}/preview`, { variables });
  },
};

export default emailTemplateService;
