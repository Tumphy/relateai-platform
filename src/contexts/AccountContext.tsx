'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { accountService, researchService } from '@/lib/api';
import toast from 'react-hot-toast';

interface Account {
  _id: string;
  name: string;
  website: string;
  industry: string;
  description: string;
  size: string;
  location: string;
  revenue: string;
  technologies: string[];
  tags: string[];
  icpScore: number;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface AccountContextType {
  accounts: Account[];
  loading: boolean;
  error: string | null;
  fetchAccounts: () => Promise<void>;
  getAccount: (id: string) => Promise<Account | null>;
  createAccount: (data: any) => Promise<Account | null>;
  updateAccount: (id: string, data: any) => Promise<Account | null>;
  deleteAccount: (id: string) => Promise<boolean>;
  researchAccount: (data: { url?: string; name?: string }) => Promise<Account | null>;
  calculateIcpScore: (id: string) => Promise<number | null>;
}

const AccountContext = createContext<AccountContextType>({
  accounts: [],
  loading: false,
  error: null,
  fetchAccounts: async () => {},
  getAccount: async () => null,
  createAccount: async () => null,
  updateAccount: async () => null,
  deleteAccount: async () => false,
  researchAccount: async () => null,
  calculateIcpScore: async () => null
});

export const AccountProvider = ({ children }: { children: ReactNode }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch accounts on mount
  useEffect(() => {
    fetchAccounts();
  }, []);

  // Fetch all accounts
  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await accountService.getAccounts();
      setAccounts(response.data.accounts);
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError('Failed to fetch accounts');
      toast.error('Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  // Get a single account by ID
  const getAccount = async (id: string): Promise<Account | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await accountService.getAccount(id);
      return response.data.account;
    } catch (err) {
      console.error(`Error fetching account ${id}:`, err);
      setError('Failed to fetch account');
      toast.error('Failed to fetch account');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create a new account
  const createAccount = async (data: any): Promise<Account | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await accountService.createAccount(data);
      // Add the new account to the state
      setAccounts([...accounts, response.data.account]);
      toast.success('Account created successfully');
      return response.data.account;
    } catch (err) {
      console.error('Error creating account:', err);
      setError('Failed to create account');
      toast.error('Failed to create account');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update an account
  const updateAccount = async (id: string, data: any): Promise<Account | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await accountService.updateAccount(id, data);
      // Update the account in the state
      setAccounts(accounts.map(account => 
        account._id === id ? response.data.account : account
      ));
      toast.success('Account updated successfully');
      return response.data.account;
    } catch (err) {
      console.error(`Error updating account ${id}:`, err);
      setError('Failed to update account');
      toast.error('Failed to update account');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete an account
  const deleteAccount = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await accountService.deleteAccount(id);
      // Remove the account from the state
      setAccounts(accounts.filter(account => account._id !== id));
      toast.success('Account deleted successfully');
      return true;
    } catch (err) {
      console.error(`Error deleting account ${id}:`, err);
      setError('Failed to delete account');
      toast.error('Failed to delete account');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Research an account
  const researchAccount = async (data: { url?: string; name?: string }): Promise<Account | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await researchService.researchAccount(data);
      // Add the new account to the state
      setAccounts([...accounts, response.data.account]);
      toast.success('Account researched and created successfully');
      return response.data.account;
    } catch (err) {
      console.error('Error researching account:', err);
      setError('Failed to research account');
      toast.error('Failed to research account');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Calculate ICP score for an account
  const calculateIcpScore = async (id: string): Promise<number | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await researchService.calculateIcpScore(id);
      // Update the account in the state
      setAccounts(accounts.map(account => 
        account._id === id ? { ...account, icpScore: response.data.score } : account
      ));
      toast.success('ICP score calculated successfully');
      return response.data.score;
    } catch (err) {
      console.error(`Error calculating ICP score for account ${id}:`, err);
      setError('Failed to calculate ICP score');
      toast.error('Failed to calculate ICP score');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccountContext.Provider
      value={{
        accounts,
        loading,
        error,
        fetchAccounts,
        getAccount,
        createAccount,
        updateAccount,
        deleteAccount,
        researchAccount,
        calculateIcpScore
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export const useAccounts = () => useContext(AccountContext);