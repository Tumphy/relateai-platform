import React, { useState, useEffect } from 'react';
import { EmailTemplate } from '@/types/models';
import emailTemplateService from '@/services/emailTemplate.service';
import toast from 'react-hot-toast';

interface TemplatePreviewProps {
  template: EmailTemplate;
  variables?: Record<string, string>;
  onClose?: () => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  variables = {},
  onClose
}) => {
  const [preview, setPreview] = useState<{
    subject: string;
    content: string;
    html: string;
    text: string;
  } | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [customVariables, setCustomVariables] = useState<Record<string, string>>(variables);
  const [editMode, setEditMode] = useState<boolean>(Object.keys(variables).length === 0);
  
  // Extract variables from the template content
  const [templateVariables, setTemplateVariables] = useState<string[]>([]);
  
  useEffect(() => {
    // Extract variables from template content
    if (template.content) {
      const matches = template.content.match(/{{([^{}]+)}}/g) || [];
      const extractedVars = matches.map(match => match.slice(2, -2).trim());
      setTemplateVariables([...new Set(extractedVars)]); // Remove duplicates
      
      // Initialize custom variables with empty values for any missing variables
      const initialVars = { ...customVariables };
      extractedVars.forEach(variable => {
        if (!initialVars[variable]) {
          initialVars[variable] = `[${variable}]`; // Default placeholder
        }
      });
      setCustomVariables(initialVars);
    }
    
    // Generate initial preview
    generatePreview();
  }, [template]);
  
  const generatePreview = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the API to generate the preview
      const response = await emailTemplateService.previewTemplate(
        template._id.toString(),
        customVariables
      );
      
      if (response.data.success) {
        setPreview(response.data.preview);
      } else {
        throw new Error('Failed to generate preview');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate preview');
      toast.error(err.message || 'Failed to generate preview');
      
      // Fallback to a simple preview
      setPreview({
        subject: template.subject,
        content: template.content,
        html: template.html || '<div>' + template.content + '</div>',
        text: template.plainText || template.content
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleVariableChange = (variable: string, value: string) => {
    setCustomVariables({
      ...customVariables,
      [variable]: value
    });
  };
  
  const handleUpdatePreview = () => {
    generatePreview();
    setEditMode(false);
  };
  
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
        <h2 className="text-xl font-semibold">Template Preview: {template.name}</h2>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            &times;
          </button>
        )}
      </div>
      
      {/* Variables editor */}
      {templateVariables.length > 0 && (
        <div className={`px-6 py-4 border-b border-gray-200 ${editMode ? 'block' : 'hidden'}`}>
          <h3 className="text-md font-medium mb-3">Customize Variables</h3>
          <div className="space-y-3">
            {templateVariables.map(variable => (
              <div key={variable} className="flex gap-3">
                <label className="w-1/3 text-sm font-medium text-gray-700 mt-2">
                  {variable}:
                </label>
                <input
                  type="text"
                  value={customVariables[variable] || ''}
                  onChange={(e) => handleVariableChange(variable, e.target.value)}
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`Enter value for ${variable}`}
                />
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleUpdatePreview}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Update Preview
            </button>
          </div>
        </div>
      )}
      
      {/* Toggle variables editor button */}
      {templateVariables.length > 0 && (
        <div className="px-6 py-2 border-b border-gray-200">
          <button
            onClick={toggleEditMode}
            className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            {editMode ? 'Hide Variables' : 'Edit Variables'}
          </button>
        </div>
      )}
      
      {/* Preview content */}
      <div className="px-6 py-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading preview...</div>
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <div className="text-red-500 mb-2">{error}</div>
            <button
              onClick={generatePreview}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Try Again
            </button>
          </div>
        ) : preview ? (
          <div>
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-1">Subject</h3>
              <div className="p-3 bg-gray-50 rounded-md">
                {preview.subject}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Content</h3>
              <div className="p-4 bg-gray-50 rounded-md">
                {/* HTML preview - dangerouslySetInnerHTML is relatively safe here as this is from our own backend */}
                <div 
                  dangerouslySetInnerHTML={{ __html: preview.html }} 
                  className="prose max-w-none"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <details className="text-sm text-gray-700">
                <summary className="cursor-pointer">View Plain Text Version</summary>
                <div className="mt-2 p-3 bg-gray-50 rounded-md whitespace-pre-wrap font-mono text-sm">
                  {preview.text}
                </div>
              </details>
            </div>
          </div>
        ) : null}
      </div>
      
      {/* Template details */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-700">
          <div>
            <span className="font-medium">Category:</span>{' '}
            <span className="capitalize">{template.category}</span>
          </div>
          {template.tags && template.tags.length > 0 && (
            <div>
              <span className="font-medium">Tags:</span>{' '}
              {template.tags.join(', ')}
            </div>
          )}
          <div>
            <span className="font-medium">Created:</span>{' '}
            {new Date(template.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;
