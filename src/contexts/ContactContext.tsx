import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Contact, ContactFilterParams } from '../types/models';
import { contactService } from '../lib/api';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

interface ContactContextType {
  contacts: Contact[];
  selectedContact: Contact | null;
  loading: boolean;
  error: string | null;
  totalContacts: number;
  currentPage: number;
  totalPages: number;
  getContacts: (params?: ContactFilterParams) => Promise<void>;
  getContactsByAccount: (accountId: string, params?: Omit<ContactFilterParams, 'accountId'>) => Promise<void>;
  getContact: (id: string) => Promise<Contact | null>;
  createContact: (contactData: Partial<Contact>) => Promise<Contact | null>;
  updateContact: (id: string, contactData: Partial<Contact>) => Promise<Contact | null>;
  deleteContact: (id: string) => Promise<boolean>;
  selectContact: (contact: Contact | null) => void;
  discoverContacts: (accountId: string, targetRoles: string[], depth?: 'basic' | 'standard' | 'deep') => Promise<{ requestId: string } | null>;
  resetContacts: () => void;
}

const ContactContext = createContext<ContactContextType | undefined>(undefined);

export function ContactProvider({ children }: { children: ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalContacts, setTotalContacts] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const { isAuthenticated } = useAuth();

  // Reset state when auth changes
  useEffect(() => {
    if (!isAuthenticated) {
      resetContacts();
    }
  }, [isAuthenticated]);

  const resetContacts = () => {
    setContacts([]);
    setSelectedContact(null);
    setTotalContacts(0);
    setCurrentPage(1);
    setTotalPages(1);
    setError(null);
  };

  const getContacts = async (params?: ContactFilterParams) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await contactService.getContacts(params);
      setContacts(response.data.contacts);
      
      // Update pagination
      const { totalContacts, totalPages, currentPage } = response.data.pagination;
      setTotalContacts(totalContacts);
      setTotalPages(totalPages);
      setCurrentPage(currentPage);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch contacts');
      toast.error('Failed to fetch contacts');
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const getContactsByAccount = async (accountId: string, params?: Omit<ContactFilterParams, 'accountId'>) => {
    if (!isAuthenticated || !accountId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await contactService.getContactsByAccount(accountId, params);
      setContacts(response.data.contacts);
      
      // Update pagination
      const { totalContacts, totalPages, currentPage } = response.data.pagination;
      setTotalContacts(totalContacts);
      setTotalPages(totalPages);
      setCurrentPage(currentPage);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch contacts for account');
      toast.error('Failed to fetch contacts for this account');
      console.error('Error fetching contacts for account:', err);
    } finally {
      setLoading(false);
    }
  };

  const getContact = async (id: string): Promise<Contact | null> => {
    if (!isAuthenticated || !id) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await contactService.getContact(id);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch contact');
      toast.error('Failed to fetch contact details');
      console.error('Error fetching contact:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createContact = async (contactData: Partial<Contact>): Promise<Contact | null> => {
    if (!isAuthenticated) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await contactService.createContact(contactData);
      // Update local state
      setContacts(prevContacts => [...prevContacts, response.data.contact]);
      setTotalContacts(prev => prev + 1);
      toast.success('Contact created successfully');
      return response.data.contact;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create contact');
      toast.error(err.response?.data?.message || 'Failed to create contact');
      console.error('Error creating contact:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateContact = async (id: string, contactData: Partial<Contact>): Promise<Contact | null> => {
    if (!isAuthenticated || !id) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await contactService.updateContact(id, contactData);
      
      // Update local state
      setContacts(prevContacts => 
        prevContacts.map(contact => 
          contact._id === id ? response.data.contact : contact
        )
      );
      
      // Update selected contact if it's the one being edited
      if (selectedContact && selectedContact._id === id) {
        setSelectedContact(response.data.contact);
      }
      
      toast.success('Contact updated successfully');
      return response.data.contact;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update contact');
      toast.error(err.response?.data?.message || 'Failed to update contact');
      console.error('Error updating contact:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteContact = async (id: string): Promise<boolean> => {
    if (!isAuthenticated || !id) return false;

    setLoading(true);
    setError(null);

    try {
      await contactService.deleteContact(id);
      
      // Update local state
      setContacts(prevContacts => prevContacts.filter(contact => contact._id !== id));
      setTotalContacts(prev => prev - 1);
      
      // Clear selected contact if it's the one being deleted
      if (selectedContact && selectedContact._id === id) {
        setSelectedContact(null);
      }
      
      toast.success('Contact deleted successfully');
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete contact');
      toast.error('Failed to delete contact');
      console.error('Error deleting contact:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const selectContact = (contact: Contact | null) => {
    setSelectedContact(contact);
  };

  const discoverContacts = async (
    accountId: string, 
    targetRoles: string[], 
    depth: 'basic' | 'standard' | 'deep' = 'standard'
  ): Promise<{ requestId: string } | null> => {
    if (!isAuthenticated || !accountId || !targetRoles.length) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await contactService.discoverContacts({
        accountId,
        targetRoles,
        discoveryDepth: depth,
      });
      
      toast.success('Contact discovery initiated');
      return { requestId: response.data.requestId };
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initiate contact discovery');
      toast.error('Failed to discover contacts');
      console.error('Error discovering contacts:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    contacts,
    selectedContact,
    loading,
    error,
    totalContacts,
    currentPage,
    totalPages,
    getContacts,
    getContactsByAccount,
    getContact,
    createContact,
    updateContact,
    deleteContact,
    selectContact,
    discoverContacts,
    resetContacts
  };

  return (
    <ContactContext.Provider value={value}>
      {children}
    </ContactContext.Provider>
  );
}

export function useContacts() {
  const context = useContext(ContactContext);
  if (context === undefined) {
    throw new Error('useContacts must be used within a ContactProvider');
  }
  return context;
}
