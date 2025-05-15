import axios from 'axios';
import {
  Contact,
  ContactFilterParams,
  Message,
  MessageFilterParams,
  MessageGenerationParams,
  ContactDiscoveryParams,
  PaginationResponse,
  EmailTemplate
} from '../types/models';

// Define API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // For browser environments
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['x-auth-token'] = token;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Redirect to login page on auth error
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },
  
  getCurrentUser: async () => {
    return api.get('/auth/me');
  },
  
  isAuthenticated: () => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('token');
    }
    return false;
  }
};

// Account services
export const accountService = {
  getAccounts: async () => {
    return api.get('/accounts');
  },
  
  getAccount: async (id: string) => {
    return api.get(`/accounts/${id}`);
  },
  
  createAccount: async (accountData: any) => {
    return api.post('/accounts', accountData);
  },
  
  updateAccount: async (id: string, accountData: any) => {
    return api.put(`/accounts/${id}`, accountData);
  },
  
  deleteAccount: async (id: string) => {
    return api.delete(`/accounts/${id}`);
  }
};

// MEDDPPICC services
export const meddppiccService = {
  getMeddppicc: async (accountId: string) => {
    return api.get(`/meddppicc/${accountId}`);
  },
  
  createMeddppicc: async (accountId: string, assessmentData: any) => {
    return api.post(`/meddppicc/${accountId}`, assessmentData);
  },
  
  updateMeddppicc: async (accountId: string, assessmentData: any) => {
    return api.put(`/meddppicc/${accountId}`, assessmentData);
  },
  
  deleteMeddppicc: async (accountId: string) => {
    return api.delete(`/meddppicc/${accountId}`);
  },
  
  addNextStep: async (accountId: string, stepData: any) => {
    return api.post(`/meddppicc/${accountId}/next-steps`, stepData);
  },
  
  updateNextStep: async (accountId: string, stepIndex: number, stepData: any) => {
    return api.put(`/meddppicc/${accountId}/next-steps/${stepIndex}`, stepData);
  }
};

// Research services
export const researchService = {
  researchAccount: async (data: { url?: string; name?: string }) => {
    return api.post('/research/account', data);
  },
  
  generateMeddppicc: async (accountId: string) => {
    return api.post(`/research/meddppicc/${accountId}`);
  },
  
  calculateIcpScore: async (accountId: string) => {
    return api.post(`/research/icp/${accountId}`);
  }
};

// Contact services
export const contactService = {
  getContacts: async (params?: ContactFilterParams) => {
    return api.get<{ contacts: Contact[], pagination: any }>('/contacts', { params });
  },
  
  getContact: async (id: string) => {
    return api.get<Contact>(`/contacts/${id}`);
  },
  
  createContact: async (contactData: Partial<Contact>) => {
    return api.post<{ message: string, contact: Contact }>('/contacts', contactData);
  },
  
  updateContact: async (id: string, contactData: Partial<Contact>) => {
    return api.put<{ message: string, contact: Contact }>(`/contacts/${id}`, contactData);
  },
  
  deleteContact: async (id: string) => {
    return api.delete<{ message: string }>(`/contacts/${id}`);
  },

  discoverContacts: async (discoveryParams: ContactDiscoveryParams) => {
    return api.post<{ message: string, status: string, requestId: string }>('/contacts/discover', discoveryParams);
  },

  getContactsByAccount: async (accountId: string, params?: Omit<ContactFilterParams, 'accountId'>) => {
    return api.get<{ contacts: Contact[], pagination: any }>('/contacts', { 
      params: { ...params, accountId } 
    });
  }
};

// Message services
export const messageService = {
  getMessages: async (params?: MessageFilterParams) => {
    return api.get<{ messages: Message[], pagination: any }>('/messages', { params });
  },

  getMessage: async (id: string) => {
    return api.get<Message>(`/messages/${id}`);
  },

  createMessage: async (messageData: Partial<Message>) => {
    return api.post<{ message: string, messageData: Message }>('/messages', messageData);
  },

  updateMessage: async (id: string, messageData: Partial<Message>) => {
    return api.put<{ message: string, messageData: Message }>(`/messages/${id}`, messageData);
  },

  deleteMessage: async (id: string) => {
    return api.delete<{ message: string }>(`/messages/${id}`);
  },
  
  generateMessage: async (params: MessageGenerationParams) => {
    return api.post<{ message: string, messageData: Message }>('/messages/generate', params);
  },
  
  sendMessage: async (messageId: string, scheduledFor?: Date) => {
    return api.post<{ message: string, sentAt?: Date }>('/messages/send', { 
      messageId, 
      scheduledFor 
    });
  },
  
  getMessageHistory: async (contactId: string, page?: number, limit?: number) => {
    return api.get<{ 
      contactId: string, 
      contactName: string, 
      threads: Array<{
        threadId: string,
        messages: Message[],
        lastMessageDate: Date,
        subject?: string
      }>,
      pagination: {
        totalMessages: number,
        totalPages: number,
        currentPage: number,
        limit: number
      }
    }>(`/messages/history/${contactId}`, { 
      params: { page, limit } 
    });
  },

  getMessagesByContact: async (contactId: string, params?: Omit<MessageFilterParams, 'contactId'>) => {
    return api.get<{ messages: Message[], pagination: any }>('/messages', { 
      params: { ...params, contactId } 
    });
  },

  getMessagesByAccount: async (accountId: string, params?: Omit<MessageFilterParams, 'accountId'>) => {
    return api.get<{ messages: Message[], pagination: any }>('/messages', { 
      params: { ...params, accountId } 
    });
  }
};

// Email services
export const emailService = {
  sendTestEmail: async (to: string, subject: string, content: string) => {
    return api.post<{ success: boolean, message: string, messageId?: string }>('/email/test', {
      to,
      subject,
      content
    });
  },

  sendEmail: async (data: {
    to: string;
    subject: string;
    content: string;
    templateId?: string;
    from?: string;
    replyTo?: string;
    contactId?: string;
    accountId?: string;
    messageId?: string;
  }) => {
    return api.post<{ success: boolean, message: string, messageId?: string }>('/messages/email/send', data);
  },

  getEmailTemplates: async () => {
    return api.get<{ templates: EmailTemplate[] }>('/messages/templates');
  },

  getEmailTemplate: async (id: string) => {
    return api.get<{ template: EmailTemplate }>(`/messages/templates/${id}`);
  },

  createEmailTemplate: async (templateData: Partial<EmailTemplate>) => {
    return api.post<{ message: string, template: EmailTemplate }>('/messages/templates', templateData);
  },

  updateEmailTemplate: async (id: string, templateData: Partial<EmailTemplate>) => {
    return api.put<{ message: string, template: EmailTemplate }>(`/messages/templates/${id}`, templateData);
  },

  deleteEmailTemplate: async (id: string) => {
    return api.delete<{ message: string }>(`/messages/templates/${id}`);
  },

  getMessageTrackingStats: async (messageId: string) => {
    return api.get<{
      opens: number,
      clicks: number,
      replies: number,
      lastOpened?: Date,
      lastClicked?: Date,
      lastReplied?: Date,
      clickedLinks?: Array<{ url: string, timestamp: Date }>
    }>(`/messages/${messageId}/tracking`);
  }
};

export default {
  auth: authService,
  accounts: accountService,
  meddppicc: meddppiccService,
  research: researchService,
  contacts: contactService,
  messages: messageService,
  email: emailService
};