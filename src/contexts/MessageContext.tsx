import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Message, MessageFilterParams, MessageGenerationParams } from '../types/models';
import { messageService } from '../lib/api';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

interface MessageThreads {
  threadId: string;
  messages: Message[];
  lastMessageDate: Date;
  subject?: string;
}

interface MessageContextType {
  messages: Message[];
  selectedMessage: Message | null;
  loading: boolean;
  error: string | null;
  totalMessages: number;
  currentPage: number;
  totalPages: number;
  messageThreads: MessageThreads[];
  getMessages: (params?: MessageFilterParams) => Promise<void>;
  getMessagesByContact: (contactId: string, params?: Omit<MessageFilterParams, 'contactId'>) => Promise<void>;
  getMessagesByAccount: (accountId: string, params?: Omit<MessageFilterParams, 'accountId'>) => Promise<void>;
  getMessage: (id: string) => Promise<Message | null>;
  createMessage: (messageData: Partial<Message>) => Promise<Message | null>;
  updateMessage: (id: string, messageData: Partial<Message>) => Promise<Message | null>;
  deleteMessage: (id: string) => Promise<boolean>;
  selectMessage: (message: Message | null) => void;
  generateMessage: (params: MessageGenerationParams) => Promise<Message | null>;
  sendMessage: (messageId: string, scheduledFor?: Date) => Promise<boolean>;
  getMessageHistory: (contactId: string, page?: number, limit?: number) => Promise<void>;
  resetMessages: () => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function MessageProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalMessages, setTotalMessages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [messageThreads, setMessageThreads] = useState<MessageThreads[]>([]);
  const { isAuthenticated } = useAuth();

  // Reset state when auth changes
  useEffect(() => {
    if (!isAuthenticated) {
      resetMessages();
    }
  }, [isAuthenticated]);

  const resetMessages = () => {
    setMessages([]);
    setSelectedMessage(null);
    setTotalMessages(0);
    setCurrentPage(1);
    setTotalPages(1);
    setMessageThreads([]);
    setError(null);
  };

  const getMessages = async (params?: MessageFilterParams) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await messageService.getMessages(params);
      setMessages(response.data.messages);
      
      // Update pagination
      const { totalMessages, totalPages, currentPage } = response.data.pagination;
      setTotalMessages(totalMessages);
      setTotalPages(totalPages);
      setCurrentPage(currentPage);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch messages');
      toast.error('Failed to fetch messages');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMessagesByContact = async (contactId: string, params?: Omit<MessageFilterParams, 'contactId'>) => {
    if (!isAuthenticated || !contactId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await messageService.getMessagesByContact(contactId, params);
      setMessages(response.data.messages);
      
      // Update pagination
      const { totalMessages, totalPages, currentPage } = response.data.pagination;
      setTotalMessages(totalMessages);
      setTotalPages(totalPages);
      setCurrentPage(currentPage);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch messages for contact');
      toast.error('Failed to fetch messages for this contact');
      console.error('Error fetching messages for contact:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMessagesByAccount = async (accountId: string, params?: Omit<MessageFilterParams, 'accountId'>) => {
    if (!isAuthenticated || !accountId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await messageService.getMessagesByAccount(accountId, params);
      setMessages(response.data.messages);
      
      // Update pagination
      const { totalMessages, totalPages, currentPage } = response.data.pagination;
      setTotalMessages(totalMessages);
      setTotalPages(totalPages);
      setCurrentPage(currentPage);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch messages for account');
      toast.error('Failed to fetch messages for this account');
      console.error('Error fetching messages for account:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMessage = async (id: string): Promise<Message | null> => {
    if (!isAuthenticated || !id) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await messageService.getMessage(id);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch message');
      toast.error('Failed to fetch message details');
      console.error('Error fetching message:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createMessage = async (messageData: Partial<Message>): Promise<Message | null> => {
    if (!isAuthenticated) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await messageService.createMessage(messageData);
      // Update local state
      setMessages(prevMessages => [...prevMessages, response.data.messageData]);
      setTotalMessages(prev => prev + 1);
      toast.success('Message created successfully');
      return response.data.messageData;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create message');
      toast.error(err.response?.data?.message || 'Failed to create message');
      console.error('Error creating message:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateMessage = async (id: string, messageData: Partial<Message>): Promise<Message | null> => {
    if (!isAuthenticated || !id) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await messageService.updateMessage(id, messageData);
      
      // Update local state
      setMessages(prevMessages => 
        prevMessages.map(message => 
          message._id === id ? response.data.messageData : message
        )
      );
      
      // Update selected message if it's the one being edited
      if (selectedMessage && selectedMessage._id === id) {
        setSelectedMessage(response.data.messageData);
      }
      
      toast.success('Message updated successfully');
      return response.data.messageData;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update message');
      toast.error(err.response?.data?.message || 'Failed to update message');
      console.error('Error updating message:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = async (id: string): Promise<boolean> => {
    if (!isAuthenticated || !id) return false;

    setLoading(true);
    setError(null);

    try {
      await messageService.deleteMessage(id);
      
      // Update local state
      setMessages(prevMessages => prevMessages.filter(message => message._id !== id));
      setTotalMessages(prev => prev - 1);
      
      // Clear selected message if it's the one being deleted
      if (selectedMessage && selectedMessage._id === id) {
        setSelectedMessage(null);
      }
      
      toast.success('Message deleted successfully');
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete message');
      toast.error('Failed to delete message');
      console.error('Error deleting message:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const selectMessage = (message: Message | null) => {
    setSelectedMessage(message);
  };

  const generateMessage = async (params: MessageGenerationParams): Promise<Message | null> => {
    if (!isAuthenticated) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await messageService.generateMessage(params);
      // Add the new message to the list
      setMessages(prevMessages => [...prevMessages, response.data.messageData]);
      toast.success('Message generated successfully');
      return response.data.messageData;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate message');
      toast.error('Failed to generate message');
      console.error('Error generating message:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (messageId: string, scheduledFor?: Date): Promise<boolean> => {
    if (!isAuthenticated || !messageId) return false;

    setLoading(true);
    setError(null);

    try {
      const response = await messageService.sendMessage(messageId, scheduledFor);
      
      // Update message status in local state
      setMessages(prevMessages => 
        prevMessages.map(message => {
          if (message._id === messageId) {
            return {
              ...message,
              status: 'sent',
              sentAt: response.data.sentAt || new Date()
            };
          }
          return message;
        })
      );
      
      // Update selected message if it's the one being sent
      if (selectedMessage && selectedMessage._id === messageId) {
        setSelectedMessage({
          ...selectedMessage,
          status: 'sent',
          sentAt: response.data.sentAt || new Date()
        });
      }
      
      if (scheduledFor) {
        toast.success('Message scheduled successfully');
      } else {
        toast.success('Message sent successfully');
      }
      
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message');
      toast.error('Failed to send message');
      console.error('Error sending message:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getMessageHistory = async (contactId: string, page = 1, limit = 20) => {
    if (!isAuthenticated || !contactId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await messageService.getMessageHistory(contactId, page, limit);
      setMessageThreads(response.data.threads);
      
      // Update pagination
      const { totalMessages, totalPages, currentPage } = response.data.pagination;
      setTotalMessages(totalMessages);
      setTotalPages(totalPages);
      setCurrentPage(currentPage);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch message history');
      toast.error('Failed to fetch message history');
      console.error('Error fetching message history:', err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    messages,
    selectedMessage,
    loading,
    error,
    totalMessages,
    currentPage,
    totalPages,
    messageThreads,
    getMessages,
    getMessagesByContact,
    getMessagesByAccount,
    getMessage,
    createMessage,
    updateMessage,
    deleteMessage,
    selectMessage,
    generateMessage,
    sendMessage,
    getMessageHistory,
    resetMessages
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
}
