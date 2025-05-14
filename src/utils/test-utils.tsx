import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AccountProvider } from '@/contexts/AccountContext';
import { MessageProvider } from '@/contexts/MessageContext';
import { MeddppiccProvider } from '@/contexts/MeddppiccContext';

// Mock any needed services
jest.mock('@/services/api', () => ({
  accountService: {
    getAccounts: jest.fn(),
    getAccount: jest.fn(),
    createAccount: jest.fn(),
    updateAccount: jest.fn(),
    deleteAccount: jest.fn()
  },
  messageService: {
    getMessages: jest.fn(),
    getMessage: jest.fn(),
    createMessage: jest.fn(),
    updateMessage: jest.fn(),
    deleteMessage: jest.fn(),
    sendMessage: jest.fn(),
    generateMessage: jest.fn(),
    getMessageHistory: jest.fn()
  },
  meddppiccService: {
    getMeddppicc: jest.fn(),
    createMeddppicc: jest.fn(),
    updateMeddppicc: jest.fn(),
    deleteMeddppicc: jest.fn(),
    generateMeddppicc: jest.fn()
  }
}));

// Mock the API response format
export const mockApiResponse = (data: any) => {
  return { data };
};

// Create an All Providers wrapper for testing
const AllProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AccountProvider>
      <MessageProvider>
        <MeddppiccProvider>
          {children}
        </MeddppiccProvider>
      </MessageProvider>
    </AccountProvider>
  );
};

// Custom render with providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

// Export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Mock data
export const mockAccount = {
  _id: 'account-123',
  name: 'Acme Corporation',
  website: 'https://acme.com',
  industry: 'Technology',
  description: 'A fictional company that makes everything',
  size: '1000-5000',
  location: 'San Francisco, CA',
  revenue: '$10M-$50M',
  tags: ['enterprise', 'technology'],
  technologies: ['AWS', 'React'],
  icpScore: 85,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z'
};

export const mockContact = {
  _id: 'contact-123',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@acme.com',
  phone: '+1234567890',
  title: 'CEO',
  accountId: 'account-123',
  status: 'active',
  icpScore: 85,
  tags: ['decision-maker', 'c-level'],
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z'
};

export const mockMessage = {
  _id: 'message-123',
  userId: 'user-123',
  contactId: 'contact-123',
  accountId: 'account-123',
  content: '<p>Hello, this is a test message.</p>',
  subject: 'Test Message',
  channel: 'email',
  status: 'draft',
  direction: 'outbound',
  aiGenerated: false,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z'
};

export const mockMeddppicc = {
  _id: 'meddppicc-123',
  accountId: 'account-123',
  metrics: {
    score: 3,
    notes: 'Clear ROI established'
  },
  economicBuyer: {
    score: 2,
    notes: 'CFO identified but not engaged'
  },
  decisionCriteria: {
    score: 3,
    notes: 'Decision criteria documented'
  },
  decisionProcess: {
    score: 1,
    notes: 'Process unclear'
  },
  paperProcess: {
    score: 2,
    notes: 'Contract review process identified'
  },
  identifiedPain: {
    score: 3,
    notes: 'Pain points well documented'
  },
  champion: {
    score: 1,
    notes: 'No clear champion'
  },
  competition: {
    score: 2,
    notes: 'Two competitors identified'
  },
  overallScore: 17,
  nextSteps: [
    {
      action: 'Schedule meeting with CFO',
      dueDate: '2025-02-01',
      completed: false
    }
  ],
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z'
};
