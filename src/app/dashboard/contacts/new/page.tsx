'use client';

import React from 'react';
import ContactForm from '@/components/contacts/ContactForm';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function NewContactPage() {
  return (
    <div className="h-full">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="mb-6">
            <Link 
              href="/dashboard/contacts"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Contacts
            </Link>
          </div>
          
          <h1 className="text-2xl font-semibold text-gray-900">New Contact</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add a new contact to your database
          </p>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
