'use client';

import React from 'react';
import MessageForm from '@/components/messages/MessageForm';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function NewMessagePage() {
  const searchParams = useSearchParams();
  const contactId = searchParams.get('contactId');

  return (
    <div className="h-full">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="mb-6">
            <Link 
              href="/dashboard/messages"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Messages
            </Link>
          </div>
          
          <h1 className="text-2xl font-semibold text-gray-900">Compose New Message</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create a new message to send to a contact
          </p>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <MessageForm initialContactId={contactId || undefined} />
          </div>
        </div>
      </div>
    </div>
  );
}
