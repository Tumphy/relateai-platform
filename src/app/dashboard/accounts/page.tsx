'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowUpDown, 
  Building2, 
  Download, 
  Filter, 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Tag,
  ChevronDown
} from 'lucide-react';

// Mock data for accounts
const accounts = [
  {
    id: 1,
    name: 'Finastra',
    industry: 'Financial Services',
    country: 'United Kingdom',
    revenue: '$1.9B',
    employees: '10,000+',
    tags: ['Banking', 'Financial Software'],
    icpScore: 94,
    signals: 7,
    status: 'Researching'
  },
  {
    id: 2,
    name: 'Stripe',
    industry: 'Financial Technology',
    country: 'United States',
    revenue: '$7.4B',
    employees: '5,000+',
    tags: ['Payments', 'API'],
    icpScore: 88,
    signals: 4,
    status: 'Contacted'
  },
  {
    id: 3,
    name: 'IBM',
    industry: 'Technology',
    country: 'United States',
    revenue: '$77.1B',
    employees: '280,000+',
    tags: ['Cloud', 'Enterprise'],
    icpScore: 78,
    signals: 5,
    status: 'Engaged'
  },
  {
    id: 4,
    name: 'Siemens',
    industry: 'Manufacturing',
    country: 'Germany',
    revenue: '$62.3B',
    employees: '303,000+',
    tags: ['Industrial', 'IoT'],
    icpScore: 82,
    signals: 2,
    status: 'Qualifying'
  },
  {
    id: 5,
    name: 'Adobe',
    industry: 'Software',
    country: 'United States',
    revenue: '$15.8B',
    employees: '26,000+',
    tags: ['Creative', 'SaaS'],
    icpScore: 85,
    signals: 3,
    status: 'Negotiating'
  },
  {
    id: 6,
    name: 'Shopify',
    industry: 'E-commerce',
    country: 'Canada',
    revenue: '$4.6B',
    employees: '10,000+',
    tags: ['Retail', 'Platform'],
    icpScore: 91,
    signals: 6,
    status: 'Researching'
  },
  {
    id: 7,
    name: 'Salesforce',
    industry: 'Software',
    country: 'United States',
    revenue: '$26.5B',
    employees: '60,000+',
    tags: ['CRM', 'Cloud'],
    icpScore: 89,
    signals: 4,
    status: 'Contacted'
  },
  {
    id: 8,
    name: 'Atlassian',
    industry: 'Software',
    country: 'Australia',
    revenue: '$2.8B',
    employees: '7,000+',
    tags: ['Collaboration', 'DevOps'],
    icpScore: 87,
    signals: 3,
    status: 'Engaged'
  },
];

export default function AccountsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedAccounts, setSelectedAccounts] = useState<number[]>([]);
  const [sortField, setSortField] = useState('icpScore');
  const [sortDirection, setSortDirection] = useState('desc');

  // Filter accounts based on search query
  const filteredAccounts = accounts.filter(account => 
    account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Sort accounts
  const sortedAccounts = [...filteredAccounts].sort((a, b) => {
    if (sortField === 'name') {
      return sortDirection === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    } else if (sortField === 'icpScore') {
      return sortDirection === 'asc' 
        ? a.icpScore - b.icpScore 
        : b.icpScore - a.icpScore;
    } else if (sortField === 'signals') {
      return sortDirection === 'asc' 
        ? a.signals - b.signals 
        : b.signals - a.signals;
    }
    return 0;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSelectAll = () => {
    if (selectedAccounts.length === sortedAccounts.length) {
      setSelectedAccounts([]);
    } else {
      setSelectedAccounts(sortedAccounts.map(account => account.id));
    }
  };

  const handleSelectAccount = (id: number) => {
    if (selectedAccounts.includes(id)) {
      setSelectedAccounts(selectedAccounts.filter(accountId => accountId !== id));
    } else {
      setSelectedAccounts([...selectedAccounts, id]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Accounts</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-neutral-400" />
            </div>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search accounts..."
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-neutral-900 ring-1 ring-inset ring-neutral-300 placeholder:text-neutral-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6"
            />
          </div>
          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center text-sm font-medium text-neutral-700 hover:text-neutral-900 rounded-md border border-neutral-300 bg-white px-4 py-2 hover:bg-neutral-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
            <button 
              type="button" 
              className="flex items-center text-sm font-medium text-neutral-700 hover:text-neutral-900 rounded-md border border-neutral-300 bg-white px-4 py-2 hover:bg-neutral-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <Link
              href="/dashboard/accounts/new"
              className="flex items-center text-sm font-medium text-white rounded-md bg-primary-600 px-4 py-2 hover:bg-primary-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Account
            </Link>
          </div>
        </div>
      </div>

      {/* Filters panel (conditionally rendered) */}
      {filterOpen && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Filters</h3>
            <button
              type="button"
              onClick={() => setFilterOpen(false)}
              className="text-neutral-500 hover:text-neutral-700"
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="industry-filter" className="label">Industry</label>
              <select
                id="industry-filter"
                className="input"
              >
                <option value="">All industries</option>
                <option value="financial-services">Financial Services</option>
                <option value="technology">Technology</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="software">Software</option>
                <option value="e-commerce">E-commerce</option>
              </select>
            </div>
            <div>
              <label htmlFor="country-filter" className="label">Country</label>
              <select
                id="country-filter"
                className="input"
              >
                <option value="">All countries</option>
                <option value="united-states">United States</option>
                <option value="united-kingdom">United Kingdom</option>
                <option value="germany">Germany</option>
                <option value="canada">Canada</option>
                <option value="australia">Australia</option>
              </select>
            </div>
            <div>
              <label htmlFor="status-filter" className="label">Status</label>
              <select
                id="status-filter"
                className="input"
              >
                <option value="">All statuses</option>
                <option value="researching">Researching</option>
                <option value="contacted">Contacted</option>
                <option value="engaged">Engaged</option>
                <option value="qualifying">Qualifying</option>
                <option value="negotiating">Negotiating</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label htmlFor="icp-filter" className="label">ICP Score</label>
              <div className="flex items-center">
                <input
                  type="number"
                  id="icp-filter-min"
                  placeholder="Min"
                  min="0"
                  max="100"
                  className="input"
                />
                <span className="mx-2">-</span>
                <input
                  type="number"
                  id="icp-filter-max"
                  placeholder="Max"
                  min="0"
                  max="100"
                  className="input"
                />
              </div>
            </div>
            <div>
              <label htmlFor="tags-filter" className="label">Tags</label>
              <div className="relative">
                <input
                  type="text"
                  id="tags-filter"
                  placeholder="Search tags..."
                  className="input"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {['Banking', 'API', 'Cloud', 'SaaS', 'Enterprise'].map(tag => (
                    <div key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      <span>{tag}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              className="text-sm font-medium text-neutral-700 rounded-md border border-neutral-300 bg-white px-4 py-2 hover:bg-neutral-50"
            >
              Reset
            </button>
            <button
              type="button"
              className="text-sm font-medium text-white rounded-md bg-primary-600 px-4 py-2 hover:bg-primary-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Accounts table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th scope="col" className="relative px-6 py-3 w-12">
                  <input
                    type="checkbox"
                    className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    checked={selectedAccounts.length === sortedAccounts.length && sortedAccounts.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    <span>Account</span>
                    <ArrowUpDown className={`ml-1 h-4 w-4 ${sortField === 'name' ? 'text-neutral-700' : 'text-neutral-400'}`} />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Industry
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Tags
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('icpScore')}
                >
                  <div className="flex items-center">
                    <span>ICP Score</span>
                    <ArrowUpDown className={`ml-1 h-4 w-4 ${sortField === 'icpScore' ? 'text-neutral-700' : 'text-neutral-400'}`} />
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('signals')}
                >
                  <div className="flex items-center">
                    <span>Signals</span>
                    <ArrowUpDown className={`ml-1 h-4 w-4 ${sortField === 'signals' ? 'text-neutral-700' : 'text-neutral-400'}`} />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {sortedAccounts.map((account) => (
                <tr key={account.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      checked={selectedAccounts.includes(account.id)}
                      onChange={() => handleSelectAccount(account.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-md bg-primary-100 text-primary-700 font-semibold">
                        {account.name.substring(0, 2)}
                      </div>
                      <div className="ml-4">
                        <Link href={`/dashboard/accounts/${account.id}`} className="text-sm font-medium text-neutral-900 hover:text-primary-600">
                          {account.name}
                        </Link>
                        <div className="text-xs text-neutral-500">
                          {account.revenue} • {account.employees}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {account.industry}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {account.country}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex flex-wrap gap-1">
                      {account.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`
                        w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium
                        ${account.icpScore >= 90 ? 'bg-success-100 text-success-800' : 
                          account.icpScore >= 80 ? 'bg-primary-100 text-primary-800' : 
                          account.icpScore >= 70 ? 'bg-warning-100 text-warning-800' : 
                          'bg-neutral-100 text-neutral-500'}
                      `}>
                        {account.icpScore}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    <div className="flex items-center">
                      <span className="bg-primary-100 text-primary-800 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                        {account.signals} new
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${account.status === 'Researching' ? 'bg-neutral-100 text-neutral-800' : 
                        account.status === 'Contacted' ? 'bg-primary-100 text-primary-800' : 
                        account.status === 'Engaged' ? 'bg-secondary-100 text-secondary-800' : 
                        account.status === 'Qualifying' ? 'bg-warning-100 text-warning-800' : 
                        'bg-success-100 text-success-800'}
                    `}>
                      {account.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      type="button"
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <ChevronDown className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-neutral-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              type="button"
              className="relative inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50"
            >
              Previous
            </button>
            <button
              type="button"
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-neutral-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{sortedAccounts.length}</span> of <span className="font-medium">{sortedAccounts.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  type="button"
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-neutral-300 bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="relative inline-flex items-center px-4 py-2 border border-neutral-300 bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  1
                </button>
                <button
                  type="button"
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-neutral-300 bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}