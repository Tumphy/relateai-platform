'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Building2, 
  Edit, 
  Eye, 
  Globe, 
  MapPin, 
  Phone, 
  Share2, 
  Tag, 
  Trash2, 
  Users,
  BarChart4,
  ListChecks
} from 'lucide-react';
import { useAccounts } from '@/contexts/AccountContext';
import { useMeddppicc } from '@/contexts/MeddppiccContext';

export default function AccountDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { getAccount, deleteAccount } = useAccounts();
  const { getMeddppicc, generateMeddppicc } = useMeddppicc();
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [hasMeddppicc, setHasMeddppicc] = useState(false);

  // Fetch account and MEDDPPICC data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (id) {
        const accountId = Array.isArray(id) ? id[0] : id;
        const accountData = await getAccount(accountId);
        if (accountData) {
          setAccount(accountData);
          
          // Check if MEDDPPICC assessment exists
          const meddppiccData = await getMeddppicc(accountId);
          setHasMeddppicc(!!meddppiccData);
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [id, getAccount, getMeddppicc]);

  const handleDelete = async () => {
    if (id) {
      const accountId = Array.isArray(id) ? id[0] : id;
      const success = await deleteAccount(accountId);
      if (success) {
        router.push('/dashboard/accounts');
      }
    }
    setDeleteModalOpen(false);
  };

  const handleGenerateMeddppicc = async () => {
    if (account) {
      await generateMeddppicc(account._id);
      setHasMeddppicc(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center flex-col">
        <h2 className="text-2xl font-bold text-neutral-800 mb-4">Account not found</h2>
        <p className="text-neutral-600 mb-6">The account you're looking for doesn't exist or you don't have access to it.</p>
        <Link 
          href="/dashboard/accounts" 
          className="flex items-center text-primary-600 hover:text-primary-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to accounts
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          <Link 
            href="/dashboard/accounts" 
            className="mr-4 text-neutral-500 hover:text-neutral-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{account.name}</h1>
        </div>
        <div className="flex space-x-3">
          <Link
            href={`/dashboard/accounts/${account._id}/meddppicc`}
            className="flex items-center text-sm font-medium text-neutral-700 rounded-md border border-neutral-300 bg-white px-4 py-2 hover:bg-neutral-50"
          >
            <ListChecks className="h-4 w-4 mr-2" />
            {hasMeddppicc ? 'View MEDDPPICC' : 'Add MEDDPPICC'}
          </Link>
          <Link 
            href={`/dashboard/accounts/${account._id}/edit`} 
            className="flex items-center text-sm font-medium text-neutral-700 rounded-md border border-neutral-300 bg-white px-4 py-2 hover:bg-neutral-50"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
          <button 
            onClick={() => setDeleteModalOpen(true)}
            className="flex items-center text-sm font-medium text-red-700 rounded-md border border-neutral-300 bg-white px-4 py-2 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Account info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="md:col-span-2 card space-y-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-16 w-16 rounded-md bg-primary-100 text-primary-700 flex items-center justify-center">
              <Building2 className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-bold text-neutral-900">{account.name}</h2>
              <div className="flex flex-wrap mt-2 gap-2">
                {account.industry && (
                  <span className="inline-flex items-center rounded-md bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700">
                    {account.industry}
                  </span>
                )}
                {account.size && (
                  <span className="inline-flex items-center rounded-md bg-neutral-50 px-2 py-1 text-xs font-medium text-neutral-700">
                    {account.size}
                  </span>
                )}
                {account.revenue && (
                  <span className="inline-flex items-center rounded-md bg-secondary-50 px-2 py-1 text-xs font-medium text-secondary-700">
                    {account.revenue}
                  </span>
                )}
                {account.icpScore !== undefined && (
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                    account.icpScore >= 90 ? 'bg-success-50 text-success-700' :
                    account.icpScore >= 80 ? 'bg-primary-50 text-primary-700' :
                    account.icpScore >= 70 ? 'bg-warning-50 text-warning-700' :
                    'bg-neutral-50 text-neutral-700'
                  }`}>
                    ICP Score: {account.icpScore}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {account.description && (
            <div>
              <h3 className="text-sm font-medium text-neutral-500">Description</h3>
              <p className="mt-1 text-sm text-neutral-900">{account.description}</p>
            </div>
          )}

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {account.website && (
              <div className="flex items-center">
                <Globe className="h-5 w-5 text-neutral-400 mr-2" />
                <a href={account.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:text-primary-800 hover:underline">
                  {account.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            {account.location && (
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-neutral-400 mr-2" />
                <span className="text-sm text-neutral-900">{account.location}</span>
              </div>
            )}
            {account.phone && (
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-neutral-400 mr-2" />
                <span className="text-sm text-neutral-900">{account.phone}</span>
              </div>
            )}
            {account.size && (
              <div className="flex items-center">
                <Users className="h-5 w-5 text-neutral-400 mr-2" />
                <span className="text-sm text-neutral-900">{account.size} employees</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {account.tags && account.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-neutral-500 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {account.tags.map((tag: string, index: number) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                  >
                    <Tag className="mr-1 h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar cards */}
        <div className="space-y-6">
          {/* MEDDPPICC card */}
          <div className="card">
            <h3 className="text-lg font-medium text-neutral-900 mb-3">MEDDPPICC</h3>
            {hasMeddppicc ? (
              <div className="space-y-4">
                <div className="w-full bg-neutral-200 rounded-full h-2.5">
                  <div 
                    className="bg-primary-600 h-2.5 rounded-full" 
                    style={{ width: '65%' }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-neutral-100 p-2 rounded">
                    <div className="font-medium">Metrics</div>
                    <div className="text-primary-600">✓</div>
                  </div>
                  <div className="bg-neutral-100 p-2 rounded">
                    <div className="font-medium">Economic Buyer</div>
                    <div className="text-primary-600">✓</div>
                  </div>
                  <div className="bg-neutral-100 p-2 rounded">
                    <div className="font-medium">Decision Criteria</div>
                    <div className="text-primary-600">✓</div>
                  </div>
                  <div className="bg-neutral-100 p-2 rounded">
                    <div className="font-medium">Decision Process</div>
                    <div className="text-neutral-400">–</div>
                  </div>
                  <div className="bg-neutral-100 p-2 rounded">
                    <div className="font-medium">Paper Process</div>
                    <div className="text-primary-600">✓</div>
                  </div>
                  <div className="bg-neutral-100 p-2 rounded">
                    <div className="font-medium">Identified Pain</div>
                    <div className="text-primary-600">✓</div>
                  </div>
                  <div className="bg-neutral-100 p-2 rounded">
                    <div className="font-medium">Champion</div>
                    <div className="text-neutral-400">–</div>
                  </div>
                  <div className="bg-neutral-100 p-2 rounded">
                    <div className="font-medium">Competition</div>
                    <div className="text-primary-600">✓</div>
                  </div>
                </div>
                <Link
                  href={`/dashboard/accounts/${account._id}/meddppicc`}
                  className="w-full flex justify-center items-center text-sm font-medium text-primary-600 hover:text-primary-800"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View full assessment
                </Link>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-neutral-600 mb-4">No MEDDPPICC assessment has been created for this account yet.</p>
                <div className="space-y-2">
                  <button
                    onClick={handleGenerateMeddppicc}
                    className="w-full flex justify-center items-center text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 py-2 px-4 rounded-md"
                  >
                    <BarChart4 className="h-4 w-4 mr-2" />
                    Generate with AI
                  </button>
                  <Link
                    href={`/dashboard/accounts/${account._id}/meddppicc`}
                    className="w-full flex justify-center items-center text-sm font-medium text-primary-600 hover:text-primary-800 py-2 px-4 rounded-md border border-neutral-300 hover:bg-neutral-50"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Create manually
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions card */}
          <div className="card">
            <h3 className="text-lg font-medium text-neutral-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href={`/dashboard/contacts/new?accountId=${account._id}`}
                className="flex justify-between items-center text-sm text-neutral-900 p-2 hover:bg-neutral-50 rounded-md"
              >
                <span>Add contact</span>
                <Users className="h-4 w-4 text-neutral-500" />
              </Link>
              <Link
                href={`/dashboard/messages/new?accountId=${account._id}`}
                className="flex justify-between items-center text-sm text-neutral-900 p-2 hover:bg-neutral-50 rounded-md"
              >
                <span>Create message</span>
                <Share2 className="h-4 w-4 text-neutral-500" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Delete modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-neutral-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-neutral-900">
                      Delete account
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-neutral-500">
                        Are you sure you want to delete this account? All data associated with this account will be permanently removed. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-neutral-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-neutral-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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