'use client';

import React, { useState, useEffect } from 'react';
import MessageForm from '@/components/messages/MessageForm';
import { useMessages } from '@/contexts/MessageContext';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ReplyMessagePageProps {
  params: {
    id: string;
  };
}

export default function ReplyMessagePage({ params }: ReplyMessagePageProps) {
  const { id } = params;
  const { getMessage } = useMessages();
  const router = useRouter();
  
  const [originalMessage, setOriginalMessage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchMessage() {
      try {
        const messageData = await getMessage(id);
        if (messageData) {
          setOriginalMessage(messageData);
        } else {
          setError('Original message not found');
          // Redirect back to messages list after a delay
          setTimeout(() => {
            router.push('/dashboard/messages');
          }, 3000);
        }
      } catch (err) {
        setError('Failed to load original message');
        console.error('Error loading message:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchMessage();
  }, [id, getMessage, router]);
  
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
        </div>
        <p className="ml-2">Loading message...</p>
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
                <p>Redirecting back to messages list...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Prepare a new reply message based on the original
  const replyMessage = originalMessage ? {
    _id: 'new',
    contactId: originalMessage.contactId,
    accountId: originalMessage.accountId,
    subject: originalMessage.subject ? `Re: ${originalMessage.subject.startsWith('Re:') ? originalMessage.subject.slice(4).trim() : originalMessage.subject}` : '',
    content: '',
    channel: originalMessage.channel,
    status: 'draft',
    direction: 'outbound',
    parent: originalMessage._id,
    threadId: originalMessage.threadId || originalMessage._id,
    createdAt: new Date(),
    updatedAt: new Date()
  } : null;
  
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
          
          <h1 className="text-2xl font-semibold text-gray-900">Reply to Message</h1>
          <p className="mt-1 text-sm text-gray-500">
            Compose a reply to the selected message
          </p>
        </div>
        
        {originalMessage && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-4">
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h2 className="text-sm font-medium text-gray-700 mb-2">Original Message</h2>
              {originalMessage.subject && (
                <p className="text-sm font-semibold text-gray-900 mb-1">{originalMessage.subject}</p>
              )}
              <p className="text-sm text-gray-700 whitespace-pre-line">{originalMessage.content}</p>
            </div>
          </div>
        )}
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            {replyMessage && <MessageForm message={replyMessage} isReply={true} />}
          </div>
        </div>
      </div>
    </div>
  );
}
