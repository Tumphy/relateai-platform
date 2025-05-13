'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AccountForm from '@/components/accounts/AccountForm';

export default function NewAccountPage() {
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
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Create Account</h1>
        </div>
      </div>
      
      {/* Account form */}
      <AccountForm />
    </div>
  );
}