import React, { useState } from 'react';
import { useMessages } from '@/contexts/MessageContext';
import { useContacts } from '@/contexts/ContactContext';
import { Message, Contact } from '@/types/models';
import { 
  EnvelopeIcon, 
  ChatBubbleLeftRightIcon,
  UserIcon,
  TrashIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  ClockIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  EyeIcon,
  ArrowUturnLeftIcon,
  ExclamationTriangleIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface MessageDetailProps {
  message?: Message;
  onClose: () => void;
}

export default function MessageDetail({ message, onClose }: MessageDetailProps) {
  const { 
    deleteMessage,
    selectMessage,
    sendMessage
  } = useMessages();
  
  const { contacts } = useContacts();
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // Find the contact this message is for
  const contact = contacts.find(c => message && c._id.toString() === message.contactId.toString());
  
  if (!message) {
    return (
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center h-full">
        <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-300" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No message selected</h3>
        <p className="mt-1 text-sm text-gray-500">Select a message from the list to view details</p>
      </div>
    );
  }
  
  const handleDeleteClick = () => {
    setShowConfirmDelete(true);
  };
  
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await deleteMessage(message._id.toString());
      if (success) {
        onClose();
        selectMessage(null);
      }
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };
  
  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
  };
  
  const handleSendMessage = async () => {
    if (message.status !== 'draft') return;
    
    setIsSending(true);
    try {
      await sendMessage(message._id.toString());
    } finally {
      setIsSending(false);
    }
  };
  
  const formatDate = (dateString?: Date) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
      case 'sent':
        return <PaperAirplaneIcon className="h-5 w-5 text-blue-500" />;
      case 'delivered':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'opened':
        return <EyeIcon className="h-5 w-5 text-purple-500" />;
      case 'replied':
        return <ArrowUturnLeftIcon className="h-5 w-5 text-teal-500" />;
      case 'bounced':
      case 'failed':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'sent':
        return 'Sent';
      case 'delivered':
        return 'Delivered';
      case 'opened':
        return 'Opened';
      case 'replied':
        return 'Replied';
      case 'bounced':
        return 'Bounced';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  };
  
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <EnvelopeIcon className="h-5 w-5 text-gray-400" />;
      case 'linkedin':
      case 'twitter':
      case 'sms':
      default:
        return <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-400" />;
    }
  };
  
  const getChannelText = (channel: string) => {
    switch (channel) {
      case 'email':
        return 'Email';
      case 'linkedin':
        return 'LinkedIn';
      case 'twitter':
        return 'Twitter';
      case 'sms':
        return 'SMS';
      default:
        return 'Other';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center bg-blue-50 border-b border-blue-100">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full">
            {getChannelIcon(message.channel)}
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {message.subject || 'No Subject'}
            </h3>
            <p className="text-sm text-gray-500">
              {getChannelText(message.channel)} - {getStatusText(message.status)}
            </p>
          </div>
        </div>
        <div className="flex">
          {message.status === 'draft' && (
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={isSending}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2"
            >
              <PaperAirplaneIcon className="h-4 w-4 mr-1" />
              {isSending ? 'Sending...' : 'Send Now'}
            </button>
          )}
          <button
            type="button"
            onClick={handleDeleteClick}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            disabled={isDeleting}
          >
            <TrashIcon className="h-4 w-4 mr-1" /> Delete
          </button>
          <button
            type="button"
            onClick={onClose}
            className="ml-2 inline-flex items-center justify-center p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
      
      {/* Contact Information */}
      <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full">
              <UserIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-gray-900">
                {contact ? `${contact.firstName} ${contact.lastName}` : 'Unknown Contact'}
              </h4>
              <p className="text-xs text-gray-500">
                {contact?.title} at {contact?.company}
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {message.direction === 'outbound' ? 'To:' : 'From:'} {contact?.email}
          </div>
        </div>
      </div>
      
      {/* Message Content */}
      <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
        <div className="prose max-w-none">
          <div className="whitespace-pre-line">
            {message.content}
          </div>
        </div>
      </div>
      
      {/* Message Details */}
      <div className="px-4 py-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Status Details</h4>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="mt-0.5 mr-3">
                {getStatusIcon(message.status)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Status</p>
                <p className="text-sm text-gray-500">
                  {getStatusText(message.status)}
                </p>
              </div>
            </div>
            
            {message.sentAt && (
              <div className="flex items-start">
                <PaperAirplaneIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Sent</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(message.sentAt)}
                  </p>
                </div>
              </div>
            )}
            
            {message.deliveredAt && (
              <div className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Delivered</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(message.deliveredAt)}
                  </p>
                </div>
              </div>
            )}
            
            {message.openedAt && (
              <div className="flex items-start">
                <EyeIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Opened</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(message.openedAt)}
                  </p>
                </div>
              </div>
            )}
            
            {message.repliedAt && (
              <div className="flex items-start">
                <ArrowUturnLeftIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Replied</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(message.repliedAt)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Message Details</h4>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="mt-0.5 mr-3">
                {getChannelIcon(message.channel)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Channel</p>
                <p className="text-sm text-gray-500">
                  {getChannelText(message.channel)}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Created</p>
                <p className="text-sm text-gray-500">
                  {formatDate(message.createdAt)}
                </p>
              </div>
            </div>
            
            {message.aiGenerated && (
              <div className="flex items-start">
                <ArrowPathIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">AI Generated</p>
                  <p className="text-sm text-gray-500">
                    Generated using AI
                  </p>
                </div>
              </div>
            )}
            
            {message.aiPrompt && (
              <div className="flex items-start">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">AI Parameters</p>
                  <div className="text-xs text-gray-500 space-y-1 mt-1">
                    <p>Type: {message.aiPrompt.messageType}</p>
                    <p>Tone: {message.aiPrompt.tone}</p>
                    <p>Length: {message.aiPrompt.length}</p>
                  </div>
                </div>
              </div>
            )}
            
            {message.tags && message.tags.length > 0 && (
              <div className="flex items-start">
                <TagIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Tags</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {message.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
        <Link
          href={`/dashboard/messages/reply/${message._id}`}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowUturnLeftIcon className="h-4 w-4 mr-1" /> Reply
        </Link>
        <Link
          href={`/dashboard/contacts/${message.contactId}`}
          className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <UserIcon className="h-4 w-4 mr-1" /> View Contact
        </Link>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <TrashIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Message</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this message? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={handleCancelDelete}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
