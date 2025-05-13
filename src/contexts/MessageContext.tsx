'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { messageService } from '@/services/api';
import { sendMessage as sendMessageUtil } from '@/lib/messageSender';
import toast from 'react-hot-toast';

interface Message {
  _id: string;
  userId: string;
  contactId: string;
  accountId: string;
  content: string;
  subject?: string;
  channel: 'email' | 'linkedin' | 'twitter' | 'sms' | 'other';
  status: 'draft' | 'sent' | 'delivered' | 'opened' | 'replied' | 'bounced' | 'failed';
  direction: 'outbound' | 'inbound';
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  repliedAt?: string;
  aiGenerated: boolean;
  aiPrompt?: {
    recipientType: string;
    messageType: string;
    tone: string;
    length: string;
    customInstructions?: string;
  };
  attachments?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  threadId?: string;
  parent?: string;
  metadata?: Record<string, any>;
  tags?: string[];
  campaignId?: string;
  createdAt: string;
  updatedAt: string;
}

interface MessageContextType {
  messages: Message[];
  currentMessage: Message | null;
  loading: boolean;
  error: string | null;
  fetchMessages: () => Promise<void>;
  getMessage: (id: string) => Promise<Message | null>;
  createMessage: (data: any) => Promise<Message | null>;
  updateMessage: (id: string, data: any) => Promise<Message | null>;
  deleteMessage: (id: string) => Promise<boolean>;
  sendMessage: (id: string) => Promise<boolean>;
  generateMessage: (params: any) => Promise<Message | null>;
  getMessageHistory: (contactId: string) => Promise<Message[]>;
}

const MessageContext = createContext<MessageContextType>({
  messages: [],
  currentMessage: null,
  loading: false,
  error: null,
  fetchMessages: async () => {},
  getMessage: async () => null,
  createMessage: async () => null,
  updateMessage: async () => null,
  deleteMessage: async () => false,
  sendMessage: async () => false,
  generateMessage: async () => null,
  getMessageHistory: async () => []
});

export const MessageProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch messages on mount
  useEffect(() => {
    fetchMessages();
  }, []);

  // Fetch all messages
  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await messageService.getMessages();
      setMessages(response.data.messages);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to fetch messages');
      toast.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  // Get a single message by ID
  const getMessage = async (id: string): Promise<Message | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await messageService.getMessage(id);
      setCurrentMessage(response.data.message);
      return response.data.message;
    } catch (err) {
      console.error(`Error fetching message ${id}:`, err);
      setError('Failed to fetch message');
      toast.error('Failed to fetch message');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create a new message
  const createMessage = async (data: any): Promise<Message | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await messageService.createMessage(data);
      // Add the new message to the state
      setMessages([...messages, response.data.message]);
      toast.success('Message created successfully');
      return response.data.message;
    } catch (err) {
      console.error('Error creating message:', err);
      setError('Failed to create message');
      toast.error('Failed to create message');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update a message
  const updateMessage = async (id: string, data: any): Promise<Message | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await messageService.updateMessage(id, data);
      // Update the message in the state
      setMessages(messages.map(message => 
        message._id === id ? response.data.message : message
      ));
      if (currentMessage?._id === id) {
        setCurrentMessage(response.data.message);
      }
      toast.success('Message updated successfully');
      return response.data.message;
    } catch (err) {
      console.error(`Error updating message ${id}:`, err);
      setError('Failed to update message');
      toast.error('Failed to update message');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete a message
  const deleteMessage = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await messageService.deleteMessage(id);
      // Remove the message from the state
      setMessages(messages.filter(message => message._id !== id));
      if (currentMessage?._id === id) {
        setCurrentMessage(null);
      }
      toast.success('Message deleted successfully');
      return true;
    } catch (err) {
      console.error(`Error deleting message ${id}:`, err);
      setError('Failed to delete message');
      toast.error('Failed to delete message');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Send a message
  const sendMessage = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const result = await sendMessageUtil(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Update the message status in the state
      const updatedMessages = messages.map(message => 
        message._id === id ? { 
          ...message, 
          status: 'sent', 
          sentAt: new Date().toISOString() 
        } : message
      );
      
      setMessages(updatedMessages);
      
      if (currentMessage?._id === id) {
        setCurrentMessage({
          ...currentMessage,
          status: 'sent',
          sentAt: new Date().toISOString()
        });
      }
      
      toast.success('Message sent successfully');
      return true;
    } catch (err) {
      console.error(`Error sending message ${id}:`, err);
      setError('Failed to send message');
      toast.error(typeof err === 'string' ? err : 'Failed to send message');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Generate a message using AI
  const generateMessage = async (params: any): Promise<Message | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await messageService.generateMessage(params);
      // Add the new message to the state
      setMessages([...messages, response.data.message]);
      toast.success('Message generated successfully');
      return response.data.message;
    } catch (err) {
      console.error('Error generating message:', err);
      setError('Failed to generate message');
      toast.error('Failed to generate message');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get message history for a contact
  const getMessageHistory = async (contactId: string): Promise<Message[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await messageService.getMessageHistory(contactId);
      return response.data.messages;
    } catch (err) {
      console.error(`Error fetching message history for contact ${contactId}:`, err);
      setError('Failed to fetch message history');
      toast.error('Failed to fetch message history');
      return [];
    } finally {
      setLoading(false);
    }
  };

  return (
    <MessageContext.Provider
      value={{
        messages,
        currentMessage,
        loading,
        error,
        fetchMessages,
        getMessage,
        createMessage,
        updateMessage,
        deleteMessage,
        sendMessage,
        generateMessage,
        getMessageHistory
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => useContext(MessageContext);