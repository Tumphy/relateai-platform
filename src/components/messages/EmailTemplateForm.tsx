import React, { useState, useEffect } from 'react';
import { EmailTemplate } from '@/types/models';
import emailTemplateService from '@/services/emailTemplate.service';
import toast from 'react-hot-toast';

interface EmailTemplateFormProps {
  templateId?: string;
  onSuccess?: (template: EmailTemplate) => void;
  onCancel?: () => void;
}

const EmailTemplateForm: React.FC<EmailTemplateFormProps> = ({
  templateId,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState<Partial<EmailTemplate>>({
    name: '',
    subject: '',
    content: '',
    category: 'custom',
    description: '',
    isDefault: false,
    tags: []
  });
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newTag, setNewTag] = useState<string>('');
  const [variablesList, setVariablesList] = useState<string[]>([]);
  
  // Load template data if editing
  useEffect(() => {
    if (templateId) {
      setIsEditing(true);
      fetchTemplate(templateId);
    }
  }, [templateId]);
  
  // Extract variables from content when it changes
  useEffect(() => {
    if (formData.content) {
      const matches = formData.content.match(/{{([^{}]+)}}/g) || [];
      const extractedVars = matches.map(match => match.slice(2, -2).trim());
      setVariablesList([...new Set(extractedVars)]); // Remove duplicates
    } else {
      setVariablesList([]);
    }
  }, [formData.content]);
  
  const fetchTemplate = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await emailTemplateService.getTemplate(id);
      
      if (response.data.success) {
        setFormData(response.data.template);
      } else {
        setError('Failed to load template');
        toast.error('Failed to load template');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load template');
      toast.error(err.message || 'Failed to load template');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (error) setError(null);
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag)
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validate form
      if (!formData.name || !formData.subject || !formData.content || !formData.category) {
        throw new Error('Please fill in all required fields');
      }
      
      let response;
      
      if (isEditing && templateId) {
        // Update existing template
        response = await emailTemplateService.updateTemplate(templateId, formData);
      } else {
        // Create new template
        response = await emailTemplateService.createTemplate(formData);
      }
      
      if (response.data.success) {
        toast.success(response.data.message);
        
        if (onSuccess) {
          onSuccess(response.data.template);
        }
      } else {
        throw new Error(response.data.message || 'Operation failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      toast.error(err.message || 'Failed to save template');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePreview = async () => {
    try {
      if (!formData.content || !formData.subject) {
        toast.error('Please add content and subject to preview');
        return;
      }
      
      // If we don't have a templateId (creating new template),
      // we use a simpler preview method
      if (!isEditing || !templateId) {
        // Temporary template preview - handled in UI
        toast.success('Preview mode - variables will be shown as placeholders');
        return;
      }
      
      // For existing templates, use the API preview endpoint
      const variables: Record<string, string> = {};
      variablesList.forEach(variable => {
        variables[variable] = `[${variable}]`; // Placeholder values
      });
      
      const response = await emailTemplateService.previewTemplate(templateId, variables);
      
      if (response.data.success) {
        // Here you would typically show a modal with the preview
        // For simplicity, we're just showing a toast
        toast.success('Preview generated successfully');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate preview');
    }
  };
  
  const categoryOptions = [
    { value: 'introduction', label: 'Introduction' },
    { value: 'follow-up', label: 'Follow-up' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'custom', label: 'Custom' }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6">
        {isEditing ? 'Edit Email Template' : 'Create Email Template'}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Template Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Template Name*
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="E.g., Welcome Email, Follow-up #1"
            required
          />
        </div>
        
        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category*
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          >
            {categoryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Brief description of this template"
          />
        </div>
        
        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Subject Line*
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Email subject line"
            required
          />
        </div>
        
        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Email Content*
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Write your email content here. Use {{variable}} for dynamic content."
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Use variables like {{firstName}}, {{companyName}}, etc. for personalization.
          </p>
        </div>
        
        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <div className="flex items-center mb-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add a tag"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add
            </button>
          </div>
          
          {/* Display existing tags */}
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tags?.map((tag, index) => (
              <div
                key={index}
                className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Default Template */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isDefault"
            name="isDefault"
            checked={!!formData.isDefault}
            onChange={handleCheckboxChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
            Set as default template for this category
          </label>
        </div>
        
        {/* Detected Variables */}
        {variablesList.length > 0 && (
          <div className="p-4 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Detected Variables
            </h3>
            <div className="flex flex-wrap gap-2">
              {variablesList.map((variable, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800"
                >
                  {variable}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handlePreview}
            className="px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Preview
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              loading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading
              ? 'Saving...'
              : isEditing
              ? 'Update Template'
              : 'Create Template'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmailTemplateForm;
