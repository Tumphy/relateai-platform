'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccounts } from '@/contexts/AccountContext';
import { 
  Building2, 
  Globe, 
  Tag, 
  MapPin, 
  Users, 
  DollarSign, 
  Briefcase,
  Plus,
  X
} from 'lucide-react';

interface AccountFormProps {
  accountId?: string;
  initialData?: any;
}

export default function AccountForm({ accountId, initialData }: AccountFormProps) {
  const router = useRouter();
  const { createAccount, updateAccount, getAccount, researchAccount } = useAccounts();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    industry: '',
    description: '',
    size: '',
    location: '',
    revenue: '',
    tags: [''],
    technologies: ['']
  });
  const [researchUrl, setResearchUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // If editing, load account data
  useEffect(() => {
    if (accountId) {
      const fetchAccount = async () => {
        if (initialData) {
          setFormData({
            name: initialData.name || '',
            website: initialData.website || '',
            industry: initialData.industry || '',
            description: initialData.description || '',
            size: initialData.size || '',
            location: initialData.location || '',
            revenue: initialData.revenue || '',
            tags: initialData.tags?.length ? initialData.tags : [''],
            technologies: initialData.technologies?.length ? initialData.technologies : ['']
          });
        } else {
          const account = await getAccount(accountId);
          if (account) {
            setFormData({
              name: account.name || '',
              website: account.website || '',
              industry: account.industry || '',
              description: account.description || '',
              size: account.size || '',
              location: account.location || '',
              revenue: account.revenue || '',
              tags: account.tags?.length ? account.tags : [''],
              technologies: account.technologies?.length ? account.technologies : ['']
            });
          }
        }
      };
      
      fetchAccount();
    }
  }, [accountId, initialData, getAccount]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Account name is required';
    }
    
    // Validate website URL format if provided
    if (formData.website && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(formData.website)) {
      newErrors.website = 'Please enter a valid website URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleArrayChange = (index: number, value: string, field: 'tags' | 'technologies') => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const addArrayItem = (field: 'tags' | 'technologies') => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (index: number, field: 'tags' | 'technologies') => {
    const newArray = [...formData[field]];
    newArray.splice(index, 1);
    setFormData(prev => ({ 
      ...prev, 
      [field]: newArray.length ? newArray : ['']
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Filter out empty values for arrays
      const processedData = {
        ...formData,
        tags: formData.tags.filter(tag => tag.trim() !== ''),
        technologies: formData.technologies.filter(tech => tech.trim() !== '')
      };
      
      if (accountId) {
        await updateAccount(accountId, processedData);
        router.push(`/dashboard/accounts/${accountId}`);
      } else {
        const account = await createAccount(processedData);
        if (account) {
          router.push(`/dashboard/accounts/${account._id}`);
        }
      }
    } catch (error) {
      console.error('Error saving account:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResearchAccount = async () => {
    if (!researchUrl) {
      setErrors(prev => ({ ...prev, researchUrl: 'Please enter a website URL' }));
      return;
    }
    
    setIsResearching(true);
    
    try {
      const account = await researchAccount({ url: researchUrl });
      if (account) {
        router.push(`/dashboard/accounts/${account._id}`);
      }
    } catch (error) {
      console.error('Error researching account:', error);
    } finally {
      setIsResearching(false);
    }
  };

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-neutral-900">
          {accountId ? 'Edit Account' : 'New Account'}
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          {accountId ? 'Update account information' : 'Enter account details or research a company'}
        </p>
      </div>
      
      {/* Research section (only for new accounts) */}
      {!accountId && (
        <div className="mb-8 p-4 bg-primary-50 rounded-md">
          <h3 className="text-md font-semibold text-primary-700 mb-2">Research a company</h3>
          <p className="text-sm text-primary-600 mb-4">
            Enter a company website to automatically research and create an account
          </p>
          <div className="flex">
            <div className="flex-grow">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  type="text"
                  value={researchUrl}
                  onChange={(e) => {
                    setResearchUrl(e.target.value);
                    if (errors.researchUrl) {
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.researchUrl;
                        return newErrors;
                      });
                    }
                  }}
                  placeholder="Enter company website (e.g., acme.com)"
                  className={`block w-full rounded-md pl-10 py-2 sm:text-sm ${
                    errors.researchUrl ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-neutral-300 focus:ring-primary-500 focus:border-primary-500'
                  }`}
                />
              </div>
              {errors.researchUrl && (
                <p className="mt-1 text-sm text-red-600">{errors.researchUrl}</p>
              )}
            </div>
            <button
              type="button"
              onClick={handleResearchAccount}
              disabled={isResearching}
              className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isResearching ? 'Researching...' : 'Research'}
            </button>
          </div>
          <div className="mt-4 text-sm text-primary-600">
            Or fill out the form below to manually create an account
          </div>
        </div>
      )}
      
      {/* Account form */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic info */}
          <div>
            <h3 className="text-lg font-medium text-neutral-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
                  Account Name <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 sm:text-sm rounded-md ${
                      errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-neutral-300 focus:ring-primary-500 focus:border-primary-500'
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
              
              <div className="sm:col-span-4">
                <label htmlFor="website" className="block text-sm font-medium text-neutral-700">
                  Website
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                    className={`block w-full pl-10 sm:text-sm rounded-md ${
                      errors.website ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-neutral-300 focus:ring-primary-500 focus:border-primary-500'
                    }`}
                  />
                </div>
                {errors.website && (
                  <p className="mt-1 text-sm text-red-600">{errors.website}</p>
                )}
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="industry" className="block text-sm font-medium text-neutral-700">
                  Industry
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    className="block w-full pl-10 sm:text-sm rounded-md border-neutral-300 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="location" className="block text-sm font-medium text-neutral-700">
                  Location
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="block w-full pl-10 sm:text-sm rounded-md border-neutral-300 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="size" className="block text-sm font-medium text-neutral-700">
                  Company Size
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    id="size"
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    placeholder="e.g., 100-500 employees"
                    className="block w-full pl-10 sm:text-sm rounded-md border-neutral-300 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="revenue" className="block text-sm font-medium text-neutral-700">
                  Annual Revenue
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    id="revenue"
                    name="revenue"
                    value={formData.revenue}
                    onChange={handleInputChange}
                    placeholder="e.g., $10M-50M"
                    className="block w-full pl-10 sm:text-sm rounded-md border-neutral-300 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-neutral-700">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="block w-full sm:text-sm rounded-md border-neutral-300 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Tags */}
          <div>
            <h3 className="text-lg font-medium text-neutral-900 mb-4">Tags</h3>
            <p className="text-sm text-neutral-500 mb-4">
              Add tags to help categorize and find this account later
            </p>
            <div className="space-y-2">
              {formData.tags.map((tag, index) => (
                <div key={`tag-${index}`} className="flex items-center">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Tag className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => handleArrayChange(index, e.target.value, 'tags')}
                      placeholder="Add a tag"
                      className="block w-full pl-10 sm:text-sm rounded-md border-neutral-300 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeArrayItem(index, 'tags')}
                    className="ml-2 flex-shrink-0 p-1 text-neutral-500 hover:text-red-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('tags')}
                className="mt-1 flex items-center text-sm text-primary-600 hover:text-primary-800"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add tag
              </button>
            </div>
          </div>
          
          {/* Technologies */}
          <div>
            <h3 className="text-lg font-medium text-neutral-900 mb-4">Technologies</h3>
            <p className="text-sm text-neutral-500 mb-4">
              Add technologies used by this account
            </p>
            <div className="space-y-2">
              {formData.technologies.map((tech, index) => (
                <div key={`tech-${index}`} className="flex items-center">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      value={tech}
                      onChange={(e) => handleArrayChange(index, e.target.value, 'technologies')}
                      placeholder="Add a technology"
                      className="block w-full sm:text-sm rounded-md border-neutral-300 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeArrayItem(index, 'technologies')}
                    className="ml-2 flex-shrink-0 p-1 text-neutral-500 hover:text-red-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('technologies')}
                className="mt-1 flex items-center text-sm text-primary-600 hover:text-primary-800"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add technology
              </button>
            </div>
          </div>
          
          {/* Form actions */}
          <div className="pt-5 border-t border-neutral-200">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                className="py-2 px-4 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : accountId ? 'Update Account' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}