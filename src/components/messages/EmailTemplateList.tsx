import React, { useState, useEffect } from 'react';
import { EmailTemplate } from '@/types/models';
import emailTemplateService from '@/services/emailTemplate.service';
import EmailTemplateForm from './EmailTemplateForm';
import toast from 'react-hot-toast';

interface EmailTemplateListProps {
  onSelectTemplate?: (template: EmailTemplate) => void;
  selectedCategory?: string;
}

const EmailTemplateList: React.FC<EmailTemplateListProps> = ({
  onSelectTemplate,
  selectedCategory
}) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filteredTemplates, setFilteredTemplates] = useState<EmailTemplate[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>(selectedCategory || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  // Fetch templates on mount and when category changes
  useEffect(() => {
    fetchTemplates();
  }, [activeCategory, pagination.page]);

  // Update filtered templates when templates or search query changes
  useEffect(() => {
    filterTemplates();
  }, [templates, searchQuery]);

  // If selectedCategory prop changes, update activeCategory
  useEffect(() => {
    if (selectedCategory && selectedCategory !== activeCategory) {
      setActiveCategory(selectedCategory);
    }
  }, [selectedCategory]);

  // Fetch templates from API
  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);

    try {
      const params: any = {
        page: pagination.page,
        limit: pagination.limit
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
        setPagination({
          ...pagination,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages
        });
      } else {
        throw new Error('Failed to fetch templates');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch templates');
      toast.error(err.message || 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  // Filter templates based on search query
  const filterTemplates = () => {
    if (!searchQuery.trim()) {
      setFilteredTemplates(templates);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = templates.filter(template => 
      template.name.toLowerCase().includes(query) ||
      template.description?.toLowerCase().includes(query) ||
      template.subject.toLowerCase().includes(query) ||
      template.tags?.some(tag => tag.toLowerCase().includes(query))
    );

    setFilteredTemplates(filtered);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle category filter change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setPagination({ ...pagination, page: 1 }); // Reset to first page
  };

  // Handle template selection
  const handleSelectTemplate = (template: EmailTemplate) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
  };

  // Handle template deletion
  const handleDeleteTemplate = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        const response = await emailTemplateService.deleteTemplate(id);

        if (response.data.success) {
          toast.success('Template deleted successfully');
          // Remove the template from the list
          setTemplates(templates.filter(template => template._id !== id));
        } else {
          throw new Error(response.data.message || 'Failed to delete template');
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete template');
      }
    }
  };

  // Handle template edit button click
  const handleEditTemplate = (id: string) => {
    setEditingTemplateId(id);
    setShowAddForm(false); // Close add form if open
  };

  // Handle template form submission success
  const handleTemplateFormSuccess = (template: EmailTemplate) => {
    if (editingTemplateId) {
      // Update the template in the list
      setTemplates(templates.map(t => 
        t._id === template._id ? template : t
      ));
      setEditingTemplateId(null);
    } else {
      // Add the new template to the list
      setTemplates([template, ...templates]);
      setShowAddForm(false);
    }
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  // Available template categories
  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'introduction', name: 'Introduction' },
    { id: 'follow-up', name: 'Follow-up' },
    { id: 'meeting', name: 'Meeting' },
    { id: 'proposal', name: 'Proposal' },
    { id: 'custom', name: 'Custom' }
  ];

  // Render category tabs
  const renderCategoryTabs = () => (
    <div className="mb-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                activeCategory === category.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {category.name}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );

  // Render the templates list
  const renderTemplatesList = () => {
    if (loading && templates.length === 0) {
      return (
        <div className="flex justify-center py-8">
          <div className="text-gray-500">Loading templates...</div>
        </div>
      );
    }

    if (error && templates.length === 0) {
      return (
        <div className="flex justify-center py-8">
          <div className="text-red-500">{error}</div>
        </div>
      );
    }

    if (filteredTemplates.length === 0) {
      return (
        <div className="flex justify-center py-8">
          <div className="text-gray-500">
            {searchQuery
              ? 'No templates match your search criteria'
              : 'No templates found in this category'}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredTemplates.map(template => (
          <div
            key={template._id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {template.description || 'No description'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {template.isDefault && (
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    Default
                  </span>
                )}
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full capitalize">
                  {template.category}
                </span>
              </div>
            </div>

            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700">
                Subject: {template.subject}
              </p>
            </div>

            {template.tags && template.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {template.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 flex justify-between items-center">
              <div className="text-xs text-gray-500">
                Last updated: {new Date(template.updatedAt).toLocaleDateString()}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSelectTemplate(template)}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
                >
                  Use
                </button>
                <button
                  onClick={() => handleEditTemplate(template._id.toString())}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 focus:outline-none"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTemplate(template._id.toString())}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800 focus:outline-none"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render pagination controls
  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    return (
      <div className="flex justify-center mt-6">
        <nav className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className={`px-3 py-1 rounded-md ${
              pagination.page === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>

          {/* Page number display */}
          <span className="px-3 py-1 text-gray-700">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className={`px-3 py-1 rounded-md ${
              pagination.page === pagination.totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Next
          </button>
        </nav>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Email Templates</h2>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingTemplateId(null);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {showAddForm ? 'Cancel' : 'Create Template'}
        </button>
      </div>

      {/* Add/Edit Template Form */}
      {(showAddForm || editingTemplateId) && (
        <div className="mb-6">
          <EmailTemplateForm
            templateId={editingTemplateId || undefined}
            onSuccess={handleTemplateFormSuccess}
            onCancel={() => {
              setShowAddForm(false);
              setEditingTemplateId(null);
            }}
          />
        </div>
      )}

      {/* Search and filter controls */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-grow">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search templates..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <button
              onClick={() => fetchTemplates()}
              className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      {renderCategoryTabs()}

      {/* Templates List */}
      {renderTemplatesList()}

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};

export default EmailTemplateList;
