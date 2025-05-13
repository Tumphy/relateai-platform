import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useContacts } from '@/contexts/ContactContext';
import { useAccounts } from '@/contexts/AccountContext';
import { Contact } from '@/types/models';
import { 
  EnvelopeIcon, 
  PhoneIcon,
  BuildingOfficeIcon, 
  LinkIcon,
  UserIcon, 
  TagIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface ContactFormProps {
  contact?: Contact;
  isEdit?: boolean;
}

export default function ContactForm({ contact, isEdit = false }: ContactFormProps) {
  const { createContact, updateContact } = useContacts();
  const { accounts } = useAccounts();
  const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<string[]>(contact?.tags || []);
  const [tagInput, setTagInput] = useState('');
  
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    defaultValues: contact ? {
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone || '',
      title: contact.title || '',
      company: contact.company,
      accountId: contact.accountId.toString(),
      linkedInUrl: contact.linkedInUrl || '',
      twitterUrl: contact.twitterUrl || '',
      notes: contact.notes || '',
      status: contact.status
    } : {
      status: 'prospect'
    }
  });
  
  // Reset form when contact changes
  useEffect(() => {
    if (contact) {
      reset({
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone || '',
        title: contact.title || '',
        company: contact.company,
        accountId: contact.accountId.toString(),
        linkedInUrl: contact.linkedInUrl || '',
        twitterUrl: contact.twitterUrl || '',
        notes: contact.notes || '',
        status: contact.status
      });
      setTags(contact.tags || []);
    }
  }, [contact, reset]);
  
  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    // Add tags to the data
    data.tags = tags;
    
    try {
      if (isEdit && contact) {
        // Update existing contact
        await updateContact(contact._id.toString(), data);
        router.push('/dashboard/contacts');
      } else {
        // Create new contact
        await createContact(data);
        router.push('/dashboard/contacts');
      }
    } catch (error) {
      console.error('Error saving contact:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          {isEdit ? 'Edit Contact' : 'New Contact'}
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          {isEdit 
            ? 'Update contact information' 
            : 'Enter contact details to create a new contact'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* First Name */}
            <div className="sm:col-span-3">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  id="firstName"
                  className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md ${
                    errors.firstName ? 'border-red-300' : ''
                  }`}
                  placeholder="John"
                  {...register('firstName', { required: 'First name is required' })}
                />
              </div>
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName.message?.toString()}</p>
              )}
            </div>
            
            {/* Last Name */}
            <div className="sm:col-span-3">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  id="lastName"
                  className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md ${
                    errors.lastName ? 'border-red-300' : ''
                  }`}
                  placeholder="Doe"
                  {...register('lastName', { required: 'Last name is required' })}
                />
              </div>
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName.message?.toString()}</p>
              )}
            </div>
            
            {/* Email */}
            <div className="sm:col-span-3">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="email"
                  id="email"
                  className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md ${
                    errors.email ? 'border-red-300' : ''
                  }`}
                  placeholder="john.doe@example.com"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message?.toString()}</p>
              )}
            </div>
            
            {/* Phone */}
            <div className="sm:col-span-3">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PhoneIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="+1 (555) 123-4567"
                  {...register('phone')}
                />
              </div>
            </div>
            
            {/* Title */}
            <div className="sm:col-span-3">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Job Title
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="title"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Director of Sales"
                  {...register('title')}
                />
              </div>
            </div>
            
            {/* Account */}
            <div className="sm:col-span-3">
              <label htmlFor="accountId" className="block text-sm font-medium text-gray-700">
                Account
              </label>
              <div className="mt-1">
                <select
                  id="accountId"
                  className={`focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                    errors.accountId ? 'border-red-300' : ''
                  }`}
                  {...register('accountId', { required: 'Account is required' })}
                >
                  <option value="">Select an account</option>
                  {accounts.map(account => (
                    <option key={account._id.toString()} value={account._id.toString()}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.accountId && (
                <p className="mt-1 text-sm text-red-600">{errors.accountId.message?.toString()}</p>
              )}
            </div>
            
            {/* Company (Auto-filled from account but can be overridden) */}
            <div className="sm:col-span-3">
              <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                Company
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  id="company"
                  className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md ${
                    errors.company ? 'border-red-300' : ''
                  }`}
                  placeholder="Acme Inc."
                  {...register('company', { required: 'Company is required' })}
                />
              </div>
              {errors.company && (
                <p className="mt-1 text-sm text-red-600">{errors.company.message?.toString()}</p>
              )}
            </div>
            
            {/* Status */}
            <div className="sm:col-span-3">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <div className="mt-1">
                <select
                  id="status"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  {...register('status')}
                >
                  <option value="prospect">Prospect</option>
                  <option value="customer">Customer</option>
                  <option value="partner">Partner</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            
            {/* LinkedIn URL */}
            <div className="sm:col-span-3">
              <label htmlFor="linkedInUrl" className="block text-sm font-medium text-gray-700">
                LinkedIn URL
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="url"
                  id="linkedInUrl"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="https://linkedin.com/in/johndoe"
                  {...register('linkedInUrl')}
                />
              </div>
            </div>
            
            {/* Twitter URL */}
            <div className="sm:col-span-3">
              <label htmlFor="twitterUrl" className="block text-sm font-medium text-gray-700">
                Twitter URL
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="url"
                  id="twitterUrl"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="https://twitter.com/johndoe"
                  {...register('twitterUrl')}
                />
              </div>
            </div>
            
            {/* Tags */}
            <div className="sm:col-span-6">
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                Tags
              </label>
              <div className="mt-1">
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1.5 h-4 w-4 flex items-center justify-center rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600 focus:outline-none"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <TagIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    id="tagInput"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Add a tag and press Enter"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Press Enter to add a tag
                </p>
              </div>
            </div>
            
            {/* Notes */}
            <div className="sm:col-span-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <div className="mt-1">
                <textarea
                  id="notes"
                  rows={4}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Add any additional notes about this contact..."
                  {...register('notes')}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.push('/dashboard/contacts')}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Contact' : 'Create Contact'}
          </button>
        </div>
      </form>
    </div>
  );
}
