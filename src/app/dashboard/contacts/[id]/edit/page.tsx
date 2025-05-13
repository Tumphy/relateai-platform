'use client';

import React, { useState, useEffect } from 'react';
import ContactForm from '@/components/contacts/ContactForm';
import { useContacts } from '@/contexts/ContactContext';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface EditContactPageProps {
  params: {
    id: string;
  };
}

export default function EditContactPage({ params }: EditContactPageProps) {
  const { id } = params;
  const { getContact } = useContacts();
  const router = useRouter();
  
  const [contact, setContact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchContact() {
      try {
        const contactData = await getContact(id);
        if (contactData) {
          setContact(contactData);
        } else {
          setError('Contact not found');
          // Redirect back to contacts list after a delay
          setTimeout(() => {
            router.push('/dashboard/contacts');
          }, 3000);
        }
      } catch (err) {
        setError('Failed to load contact');
        console.error('Error loading contact:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchContact();
  }, [id, getContact, router]);
  
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
        </div>
        <p className="ml-2">Loading contact...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {error}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Redirecting back to contacts list...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
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
          
          <h1 className="text-2xl font-semibold text-gray-900">Edit Contact</h1>
          <p className="mt-1 text-sm text-gray-500">
            Update contact information for {contact?.firstName} {contact?.lastName}
          </p>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            {contact && <ContactForm contact={contact} isEdit={true} />}
          </div>
        </div>
      </div>
    </div>
  );
}
