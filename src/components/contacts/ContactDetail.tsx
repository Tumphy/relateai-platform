import React, { useState } from 'react';
import { useContacts } from '@/contexts/ContactContext';
import { useMessages } from '@/contexts/MessageContext';
import { useAccounts } from '@/contexts/AccountContext';
import { Contact, Account } from '@/types/models';
import { 
  EnvelopeIcon, 
  PhoneIcon,
  BuildingOfficeIcon, 
  LinkIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  CalendarIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface ContactDetailProps {
  contact?: Contact;
  onClose: () => void;
}

export default function ContactDetail({ contact, onClose }: ContactDetailProps) {
  const { 
    deleteContact,
    selectContact
  } = useContacts();
  
  const { getMessageHistory } = useMessages();
  const { accounts } = useAccounts();
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  // Find the account this contact belongs to
  const account = accounts.find(a => a._id.toString() === contact?.accountId.toString());
  
  if (!contact) {
    return (
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center h-full">
        <UserCircleIcon className="h-16 w-16 text-gray-300" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No contact selected</h3>
        <p className="mt-1 text-sm text-gray-500">Select a contact from the list to view details</p>
      </div>
    );
  }
  
  const handleDeleteClick = () => {
    setShowConfirmDelete(true);
  };
  
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await deleteContact(contact._id.toString());
      if (success) {
        onClose();
        selectContact(null);
      }
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };
  
  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
  };
  
  const handleViewMessages = () => {
    getMessageHistory(contact._id.toString());
  };
  
  const formatDate = (dateString?: Date) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center bg-blue-50 border-b border-blue-100">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center bg-blue-100 rounded-full">
            <UserCircleIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {contact.firstName} {contact.lastName}
            </h3>
            <p className="text-sm text-gray-500">
              {contact.title} at {contact.company}
            </p>
          </div>
        </div>
        <div className="flex">
          <Link 
            href={`/dashboard/contacts/${contact._id}/edit`}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2"
          >
            <PencilSquareIcon className="h-4 w-4 mr-1" /> Edit
          </Link>
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
      <div className="px-4 py-5 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-4">Contact Information</h4>
            <div className="space-y-3">
              <div className="flex items-start">
                <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <a 
                    href={`mailto:${contact.email}`} 
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {contact.email}
                  </a>
                </div>
              </div>
              
              {contact.phone && (
                <div className="flex items-start">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <a 
                      href={`tel:${contact.phone}`} 
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {contact.phone}
                    </a>
                  </div>
                </div>
              )}
              
              <div className="flex items-start">
                <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Company</p>
                  <Link 
                    href={`/dashboard/accounts/${contact.accountId}`} 
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {contact.company}
                  </Link>
                </div>
              </div>
              
              {contact.linkedInUrl && (
                <div className="flex items-start">
                  <LinkIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">LinkedIn</p>
                    <a 
                      href={contact.linkedInUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View Profile
                    </a>
                  </div>
                </div>
              )}
              
              {contact.twitterUrl && (
                <div className="flex items-start">
                  <LinkIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Twitter</p>
                    <a 
                      href={contact.twitterUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View Profile
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-4">Status Information</h4>
            <div className="space-y-3">
              <div className="flex items-start">
                <TagIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Status</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {contact.status}
                  </span>
                </div>
              </div>
              
              <div className="flex items-start">
                <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Last Contact</p>
                  <p className="text-sm text-gray-500">
                    {contact.lastContactDate 
                      ? formatDate(contact.lastContactDate)
                      : 'Never contacted'}
                  </p>
                </div>
              </div>
              
              {contact.icpFit && (
                <div className="flex items-start">
                  <TagIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">ICP Fit Score</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {contact.icpFit.score}/100
                    </span>
                  </div>
                </div>
              )}
              
              {contact.personaMatch && (
                <div className="flex items-start">
                  <TagIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Persona Match</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {contact.personaMatch.score}/100
                    </span>
                  </div>
                </div>
              )}
              
              {contact.tags && contact.tags.length > 0 && (
                <div className="flex items-start">
                  <TagIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Tags</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {contact.tags.map((tag, index) => (
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
      </div>
      
      {/* Notes */}
      {contact.notes && (
        <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Notes</h4>
          <div className="bg-gray-50 rounded-md p-3">
            <p className="text-sm text-gray-700 whitespace-pre-line">{contact.notes}</p>
          </div>
        </div>
      )}
      
      {/* Recent Activities */}
      {contact.recentActivities && contact.recentActivities.length > 0 && (
        <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-500 mb-4">Recent Activities</h4>
          <div className="flow-root">
            <ul className="-mb-8">
              {contact.recentActivities.map((activity, index) => (
                <li key={index}>
                  <div className="relative pb-8">
                    {index !== contact.recentActivities!.length - 1 ? (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <CalendarIcon className="h-5 w-5 text-blue-600" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-700">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-1">Source: {activity.source}</p>
                        </div>
                        <div className="text-right text-xs whitespace-nowrap text-gray-500">
                          {formatDate(activity.date)}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
        <Link
          href={`/dashboard/messages/new?contactId=${contact._id}`}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <EnvelopeIcon className="h-4 w-4 mr-1" /> New Message
        </Link>
        <button
          type="button"
          onClick={handleViewMessages}
          className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" /> View Messages
        </button>
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
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Contact</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete {contact.firstName} {contact.lastName}? This action cannot be undone.
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
