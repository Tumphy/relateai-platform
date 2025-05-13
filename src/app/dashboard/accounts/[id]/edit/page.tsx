'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AccountForm from '@/components/accounts/AccountForm';
import { useAccounts } from '@/contexts/AccountContext';

export default function EditAccountPage() {
  const { id } = useParams();
  const { getAccount } = useAccounts();
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccount = async () => {
      if (id) {
        const accountId = Array.isArray(id) ? id[0] : id;
        setLoading(true);
        const accountData = await getAccount(accountId);
        setAccount(accountData);
        setLoading(false);
      }
    };

    fetchAccount();
  }, [id, getAccount]);

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
        <p className="text-neutral-600 mb-6">The account you're trying to edit doesn't exist or you don't have access to it.</p>
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
            href={`/dashboard/accounts/${account._id}`} 
            className="mr-4 text-neutral-500 hover:text-neutral-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Edit Account</h1>
        </div>
      </div>
      
      {/* Account form */}
      <AccountForm accountId={Array.isArray(id) ? id[0] : id} initialData={account} />
    </div>
  );
}