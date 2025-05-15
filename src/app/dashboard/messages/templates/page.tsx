'use client';

import React from 'react';
import EmailTemplateList from '@/components/messages/EmailTemplateList';
import { EmailTemplate } from '@/types/models';
import toast from 'react-hot-toast';

export default function EmailTemplatesPage() {
  const handleSelectTemplate = (template: EmailTemplate) => {
    // In a real application, this could redirect to the message composer
    // with this template pre-selected, or open a modal to use the template
    toast.success(`Template "${template.name}" selected`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
        <p className="text-gray-600 mt-2">
          Create and manage reusable email templates with personalization variables.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <EmailTemplateList onSelectTemplate={handleSelectTemplate} />
      </div>
    </div>
  );
}
