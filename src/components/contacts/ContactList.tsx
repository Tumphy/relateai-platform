import React, { useEffect, useState } from 'react';
import { useContacts } from '@/contexts/ContactContext';
import { useAccounts } from '@/contexts/AccountContext';
import { Contact, ContactFilterParams } from '@/types/models';
import { 
  EnvelopeIcon, 
  PhoneIcon,
  TagIcon, 
  UserIcon, 
  BuildingOfficeIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function ContactList() {
  const { 
    contacts, 
    loading, 
    error, 
    totalContacts, 
    currentPage, 
    totalPages, 
    getContacts,
    selectContact
  } = useContacts();
  
  const { accounts } = useAccounts();
  
  const [filters, setFilters] = useState<ContactFilterParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    getContacts(filters);
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
  
  const handleContactClick = (contact: Contact) => {
    selectContact(contact);
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'prospect':
        return 'bg-blue-100 text-blue-800';
      case 'customer':
        return 'bg-green-100 text-green-800';
      case 'partner':
        return 'bg-purple-100 text-purple-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getScoreBadgeClass = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-800';
    
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-lime-100 text-lime-800';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800';
    if (score >= 20) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Contacts</h3>
        <div className="flex items-center space-x-2">
          <Link 
            href="/dashboard/contacts/new" 
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Contact
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
              placeholder="Search contacts..."
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
              <option value="prospect">Prospect</option>
              <option value="customer">Customer</option>
              <option value="partner">Partner</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="accountFilter" className="block text-sm font-medium text-gray-700">Account</label>
            <select
              id="accountFilter"
              name="accountId"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={filters.accountId || ''}
              onChange={(e) => handleFilterChange('accountId', e.target.value || undefined)}
            >
              <option value="">All Accounts</option>
              {accounts.map(account => (
                <option key={account._id.toString()} value={account._id.toString()}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="icpScoreFilter" className="block text-sm font-medium text-gray-700">Min ICP Score</label>
            <input
              type="number"
              name="minIcpScore"
              id="icpScoreFilter"
              min="0"
              max="100"
              className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              value={filters.minIcpScore || ''}
              onChange={(e) => handleFilterChange('minIcpScore', e.target.value ? parseInt(e.target.value) : undefined)}
            />
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
                <option value="firstName">First Name</option>
                <option value="lastName">Last Name</option>
                <option value="lastContactDate">Last Contact</option>
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
          <p className="mt-2 text-sm text-gray-500">Loading contacts...</p>
        </div>
      ) : error ? (
        <div className="px-4 py-6 text-center">
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <XMarkIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading contacts</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : contacts.length === 0 ? (
        <div className="px-4 py-6 text-center border-t border-gray-200">
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <TagIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">No contacts found</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Try adjusting your filters or add a new contact.</p>
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
                    Company
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ICP Fit
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Contact
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <tr 
                    key={contact._id.toString()} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleContactClick(contact)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full">
                          <UserIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {contact.firstName} {contact.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            <div className="flex items-center">
                              <EnvelopeIcon className="mr-1 h-4 w-4 text-gray-400" />
                              {contact.email}
                            </div>
                            {contact.phone && (
                              <div className="flex items-center mt-1">
                                <PhoneIcon className="mr-1 h-4 w-4 text-gray-400" />
                                {contact.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <BuildingOfficeIcon className="mr-1 h-5 w-5 text-gray-400" />
                        <div className="text-sm text-gray-900">{contact.company}</div>
                      </div>
                      {contact.title && (
                        <div className="text-sm text-gray-500 mt-1">{contact.title}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(contact.status)}`}>
                        {contact.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {contact.icpFit ? (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getScoreBadgeClass(contact.icpFit.score)}`}>
                          {contact.icpFit.score}/100
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">Not scored</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.lastContactDate ? (
                        new Date(contact.lastContactDate).toLocaleDateString()
                      ) : (
                        <span className="text-gray-400">Never</span>
                      )}
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
                    {Math.min(currentPage * filters.limit!, totalContacts)}
                  </span>{' '}
                  of <span className="font-medium">{totalContacts}</span> results
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
