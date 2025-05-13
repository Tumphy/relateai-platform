import React, { useEffect, useState } from 'react';
import { useMessages } from '@/contexts/MessageContext';
import { useContacts } from '@/contexts/ContactContext';
import { Message, MessageFilterParams } from '@/types/models';
import { 
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function MessageList() {
  const { 
    messages, 
    loading, 
    error, 
    totalMessages, 
    currentPage, 
    totalPages, 
    getMessages,
    selectMessage
  } = useMessages();
  
  const { contacts } = useContacts();
  
  const [filters, setFilters] = useState<MessageFilterParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    getMessages(filters);
  }, [filters]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };
  
  const handleFilterChange = (filterName: string, value: any) => {
    setFilters(prev => ({ ...prev, [filterName]: value, page: 1 }));
  };
  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };
  
  const handleMessageClick = (message: Message) => {
    selectMessage(message);
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'opened':
        return 'bg-purple-100 text-purple-800';
      case 'replied':
        return 'bg-teal-100 text-teal-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'bounced':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatDate = (date?: Date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };
  
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <EnvelopeIcon className="h-4 w-4" />;
      case 'linkedin':
      case 'twitter':
      case 'sms':
      default:
        return <ChatBubbleLeftRightIcon className="h-4 w-4" />;
    }
  };
  
  // Function to get the contact name from contact ID
  const getContactName = (contactId: string) => {
    const contact = contacts.find(c => c._id.toString() === contactId);
    return contact ? `${contact.firstName} ${contact.lastName}` : 'Unknown Contact';
  };
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Messages</h3>
        <div className="flex items-center space-x-2">
          <Link 
            href="/dashboard/messages/new" 
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Compose
          </Link>
        </div>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="w-full sm:w-96 mb-3 sm:mb-0">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              name="search"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              <button 
                type="submit" 
                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Search
              </button>
            </div>
          </div>
        </form>
        
        <button
          type="button"
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FunnelIcon className="h-4 w-4 mr-2" />
          Filters {showFilters ? '▲' : '▼'}
        </button>
      </div>
      
      {showFilters && (
        <div className="border-t border-gray-200 px-4 py-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700">Status</label>
            <select
              id="statusFilter"
              name="status"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="opened">Opened</option>
              <option value="replied">Replied</option>
              <option value="bounced">Bounced</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="channelFilter" className="block text-sm font-medium text-gray-700">Channel</label>
            <select
              id="channelFilter"
              name="channel"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={filters.channel || ''}
              onChange={(e) => handleFilterChange('channel', e.target.value || undefined)}
            >
              <option value="">All Channels</option>
              <option value="email">Email</option>
              <option value="linkedin">LinkedIn</option>
              <option value="twitter">Twitter</option>
              <option value="sms">SMS</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="directionFilter" className="block text-sm font-medium text-gray-700">Direction</label>
            <select
              id="directionFilter"
              name="direction"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={filters.direction || ''}
              onChange={(e) => handleFilterChange('direction', e.target.value || undefined)}
            >
              <option value="">All Directions</option>
              <option value="outbound">Outbound</option>
              <option value="inbound">Inbound</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="contactFilter" className="block text-sm font-medium text-gray-700">Contact</label>
            <select
              id="contactFilter"
              name="contactId"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={filters.contactId || ''}
              onChange={(e) => handleFilterChange('contactId', e.target.value || undefined)}
            >
              <option value="">All Contacts</option>
              {contacts.map(contact => (
                <option key={contact._id.toString()} value={contact._id.toString()}>
                  {contact.firstName} {contact.lastName}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="aiGeneratedFilter" className="block text-sm font-medium text-gray-700">Source</label>
            <select
              id="aiGeneratedFilter"
              name="aiGenerated"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={filters.aiGenerated === undefined ? '' : filters.aiGenerated ? 'true' : 'false'}
              onChange={(e) => {
                if (e.target.value === '') {
                  handleFilterChange('aiGenerated', undefined);
                } else {
                  handleFilterChange('aiGenerated', e.target.value === 'true');
                }
              }}
            >
              <option value="">All Sources</option>
              <option value="true">AI Generated</option>
              <option value="false">Manually Created</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700">Sort By</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <select
                id="sortBy"
                name="sortBy"
                className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="createdAt">Created Date</option>
                <option value="sentAt">Sent Date</option>
                <option value="status">Status</option>
                <option value="channel">Channel</option>
              </select>
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm"
                onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {filters.sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="px-4 py-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
          <p className="mt-2 text-sm text-gray-500">Loading messages...</p>
        </div>
      ) : error ? (
        <div className="px-4 py-6 text-center">
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <XMarkIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading messages</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : messages.length === 0 ? (
        <div className="px-4 py-6 text-center border-t border-gray-200">
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">No messages found</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Try adjusting your filters or compose a new message.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Channel
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {messages.map((message) => (
                  <tr 
                    key={message._id.toString()} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleMessageClick(message)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full">
                          <UserIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {getContactName(message.contactId.toString())}
                          </div>
                          <div className="text-xs text-gray-500">
                            {message.direction === 'outbound' ? 'To' : 'From'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {message.subject && (
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {message.subject}
                        </div>
                      )}
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {message.content}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="p-1 bg-gray-100 rounded-md mr-2">
                          {getChannelIcon(message.channel)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {message.channel}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(message.status)}`}>
                        {message.status}
                      </span>
                      {message.aiGenerated && (
                        <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          AI
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
                        {message.status === 'draft' 
                          ? formatDate(message.createdAt) 
                          : formatDate(message.sentAt)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * filters.limit! + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * filters.limit!, totalMessages)}
                  </span>{' '}
                  of <span className="font-medium">{totalMessages}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                      currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    &laquo;
                  </button>
                  
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    // Logic to show pages around current page
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border ${
                          currentPage === pageNum
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        } text-sm font-medium`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                      currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    &raquo;
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
