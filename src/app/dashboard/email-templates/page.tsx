'use client';

import React from 'react';
import EmailTemplateList from '@/components/messages/EmailTemplateList';
import { EmailTemplate } from '@/types/models';
import toast from 'react-hot-toast';

export default function EmailTemplatesPage() {
  const handleSelectTemplate = (template: EmailTemplate) => {
    // In a real application, this could navigate to the message composer
    // with the selected template pre-loaded
    toast.success(`Selected template: ${template.name}`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Email Templates</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="mb-6 text-gray-600">
            Create and manage email templates for your outreach campaigns. Templates can include 
            variables for personalization and can be organized by category.
          </p>
          
          <EmailTemplateList onSelectTemplate={handleSelectTemplate} />
        </div>
      </div>
    </div>
  );
}
