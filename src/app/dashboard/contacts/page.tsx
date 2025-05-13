'use client';

import React, { useState, useEffect } from 'react';
import { useContacts } from '@/contexts/ContactContext';
import ContactList from '@/components/contacts/ContactList';
import ContactDetail from '@/components/contacts/ContactDetail';

export default function ContactsPage() {
  const { selectedContact, selectContact } = useContacts();
  const [showDetail, setShowDetail] = useState(false);
  
  // Show detail panel when a contact is selected
  useEffect(() => {
    if (selectedContact) {
      setShowDetail(true);
    }
  }, [selectedContact]);
  
  const handleCloseDetail = () => {
    setShowDetail(false);
    // Optionally clear selected contact
    // selectContact(null);
  };

  return (
    <div className="h-full">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Contacts</h1>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Main content */}
          <div className="py-4">
            <div className="flex flex-col lg:flex-row h-full space-y-4 lg:space-y-0 lg:space-x-4">
              {/* Contact List - always visible */}
              <div className={`${showDetail ? 'lg:w-1/2' : 'w-full'}`}>
                <ContactList />
              </div>
              
              {/* Contact Detail - visible when a contact is selected */}
              {showDetail && (
                <div className="lg:w-1/2">
                  <ContactDetail contact={selectedContact || undefined} onClose={handleCloseDetail} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
