import axios from 'axios';

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
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
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
    if (error.response?.status === 401) {
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
    localStorage.setItem('token', response.data.token);
    return response.data;
  },
  
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    localStorage.setItem('token', response.data.token);
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
  },
  
  getCurrentUser: async () => {
    return api.get('/auth/me');
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
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
  getContacts: async () => {
    return api.get('/contacts');
  },
  
  getContact: async (id: string) => {
    return api.get(`/contacts/${id}`);
  },
  
  createContact: async (contactData: any) => {
    return api.post('/contacts', contactData);
  },
  
  updateContact: async (id: string, contactData: any) => {
    return api.put(`/contacts/${id}`, contactData);
  },
  
  deleteContact: async (id: string) => {
    return api.delete(`/contacts/${id}`);
  }
};

// Message services
export const messageService = {
  getMessages: async () => {
    return api.get('/messages');
  },
  
  generateMessage: async (messageParams: any) => {
    return api.post('/messages/generate', messageParams);
  },
  
  sendMessage: async (messageData: any) => {
    return api.post('/messages/send', messageData);
  },
  
  getMessageHistory: async (contactId: string) => {
    return api.get(`/messages/history/${contactId}`);
  }
};

export default {
  auth: authService,
  accounts: accountService,
  meddppicc: meddppiccService,
  research: researchService,
  contacts: contactService,
  messages: messageService
};