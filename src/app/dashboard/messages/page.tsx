'use client';

import React, { useState, useEffect } from 'react';
import { useMessages } from '@/contexts/MessageContext';
import MessageList from '@/components/messages/MessageList';
import MessageDetail from '@/components/messages/MessageDetail';

export default function MessagesPage() {
  const { selectedMessage, selectMessage } = useMessages();
  const [showDetail, setShowDetail] = useState(false);
  
  // Show detail panel when a message is selected
  useEffect(() => {
    if (selectedMessage) {
      setShowDetail(true);
    }
  }, [selectedMessage]);
  
  const handleCloseDetail = () => {
    setShowDetail(false);
    // Optionally clear selected message
    // selectMessage(null);
  };

  return (
    <div className="h-full">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Messages</h1>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Main content */}
          <div className="py-4">
            <div className="flex flex-col lg:flex-row h-full space-y-4 lg:space-y-0 lg:space-x-4">
              {/* Message List - always visible */}
              <div className={`${showDetail ? 'lg:w-1/2' : 'w-full'}`}>
                <MessageList />
              </div>
              
              {/* Message Detail - visible when a message is selected */}
              {showDetail && (
                <div className="lg:w-1/2">
                  <MessageDetail message={selectedMessage || undefined} onClose={handleCloseDetail} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
