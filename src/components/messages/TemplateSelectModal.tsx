import React, { useState, useEffect } from 'react';
import { EmailTemplate } from '@/types/models';
import emailTemplateService from '@/services/emailTemplate.service';
import toast from 'react-hot-toast';

interface TemplateSelectModalProps {
  onSelect: (template: EmailTemplate) => void;
  onClose: () => void;
  isOpen: boolean;
  initialCategory?: string;
}

const TemplateSelectModal: React.FC<TemplateSelectModalProps> = ({
  onSelect,
  onClose,
  isOpen,
  initialCategory
}) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen, activeCategory]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const params: any = {
        limit: 50 // Higher limit to show more templates at once
      };

      // Add category filter if not "all"
      if (activeCategory !== 'all') {
        params.category = activeCategory;
      }

      // Add search filter if present
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const response = await emailTemplateService.getTemplates(params);

      if (response.data.success) {
        setTemplates(response.data.templates);
      } else {
        throw new Error('Failed to fetch templates');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTemplates();
  };

  const handleSelectTemplate = (template: EmailTemplate) => {
    onSelect(template);
    onClose();
  };

  // Filter templates based on search query (client-side)
  const filteredTemplates = templates.filter(template => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      template.name.toLowerCase().includes(query) ||
      template.description?.toLowerCase().includes(query) ||
      template.subject.toLowerCase().includes(query) ||
      template.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  });

  // Available template categories
  const categories = [
    { id: 'all', name: 'All' },
    { id: 'introduction', name: 'Introduction' },
    { id: 'follow-up', name: 'Follow-up' },
    { id: 'meeting', name: 'Meeting' },
    { id: 'proposal', name: 'Proposal' },
    { id: 'custom', name: 'Custom' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Select Email Template</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            &times;
          </button>
        </div>
        
        {/* Search and filters */}
        <div className="px-6 py-3 border-b border-gray-200">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search templates..."
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Search
            </button>
          </form>
        </div>
        
        {/* Category tabs */}
        <div className="px-6 pt-3 border-b border-gray-200">
          <div className="flex space-x-4 overflow-x-auto">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`pb-3 px-1 text-sm font-medium border-b-2 ${
                  activeCategory === category.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Templates list */}
        <div className="flex-grow overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Loading templates...</div>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">
                {searchQuery
                  ? 'No templates match your search criteria'
                  : 'No templates found in this category'}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map(template => (
                <div
                  key={template._id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleSelectTemplate(template)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-md font-medium text-gray-900">
                      {template.name}
                    </h3>
                    <div className="flex items-center">
                      {template.isDefault && (
                        <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                    {template.description || 'No description'}
                  </p>
                  <p className="text-sm text-gray-700 font-medium mb-2">
                    Subject: {template.subject}
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {template.content}
                  </p>
                  {template.tags && template.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {template.tags.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                          +{template.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelectModal;
