import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AccountProvider } from '@/contexts/AccountContext';
import { MessageProvider } from '@/contexts/MessageContext';
import { MeddppiccProvider } from '@/contexts/MeddppiccContext';
import { ContactProvider } from '@/contexts/ContactContext';
import { AuthProvider } from '@/contexts/AuthContext';
import userEvent from '@testing-library/user-event';

// Mock any needed services
jest.mock('@/lib/api', () => ({
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
  },
  contactService: {
    getContacts: jest.fn(),
    getContact: jest.fn(),
    createContact: jest.fn(),
    updateContact: jest.fn(),
    deleteContact: jest.fn()
  },
  authService: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    refreshToken: jest.fn(),
    getCurrentUser: jest.fn()
  },
  researchService: {
    researchAccount: jest.fn(),
    calculateIcpScore: jest.fn(),
    researchContact: jest.fn()
  }
}));

// Mock the API response format
export const mockApiResponse = (data: any) => {
  return { data };
};

// Create a mock for the Next.js router
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn()
  }
};

// Create an All Providers wrapper for testing
const AllProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <AccountProvider>
        <ContactProvider>
          <MeddppiccProvider>
            <MessageProvider>
              {children}
            </MessageProvider>
          </MeddppiccProvider>
        </ContactProvider>
      </AccountProvider>
    </AuthProvider>
  );
};

// Custom render with providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: AllProviders, ...options })
  };
};

// Helper to find element by test ID or throw error
export const getByTestIdOrFail = (container: HTMLElement, testId: string) => {
  const element = container.querySelector(`[data-testid="${testId}"]`);
  if (!element) {
    throw new Error(`Could not find element with data-testid: ${testId}`);
  }
  return element;
};

// Helper to wait for API calls to resolve
export const waitForApiCall = async (apiMock: jest.Mock) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      expect(apiMock).toHaveBeenCalled();
      resolve(true);
    }, 0);
  });
};

// Helper to mock form submission
export const mockFormSubmit = (form: HTMLFormElement) => {
  const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
  form.dispatchEvent(submitEvent);
};

// Export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Mock data
export const mockUser = {
  _id: 'user-123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z'
};

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
  status: 'active',
  notes: 'This is a sample account for testing',
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
  linkedin: 'https://linkedin.com/in/johndoe',
  notes: 'Key contact for the account',
  lastContact: '2025-01-15T00:00:00.000Z',
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
  metadata: {
    opens: 0,
    clicks: 0,
    replies: 0,
  },
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z'
};

export const mockSentMessage = {
  ...mockMessage,
  _id: 'message-124',
  status: 'sent',
  sentAt: '2025-01-01T01:00:00.000Z',
  metadata: {
    opens: 2,
    clicks: 1,
    replies: 1,
  }
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

// Mock API handlers for MSW
export const mockHandlers = [
  // Add MSW handlers here when implemented
];

// Form test helpers
export const fillForm = async (user: ReturnType<typeof userEvent.setup>, formData: Record<string, string>) => {
  for (const [name, value] of Object.entries(formData)) {
    const input = document.querySelector(`[name="${name}"]`) as HTMLInputElement;
    if (input) {
      await user.clear(input);
      await user.type(input, value);
    }
  }
};

export const selectOption = async (user: ReturnType<typeof userEvent.setup>, selectName: string, optionValue: string) => {
  const select = document.querySelector(`[name="${selectName}"]`) as HTMLSelectElement;
  if (select) {
    await user.selectOptions(select, optionValue);
  }
};

export const checkCheckbox = async (user: ReturnType<typeof userEvent.setup>, checkboxName: string, checked: boolean = true) => {
  const checkbox = document.querySelector(`[name="${checkboxName}"]`) as HTMLInputElement;
  if (checkbox) {
    if ((checkbox.checked && !checked) || (!checkbox.checked && checked)) {
      await user.click(checkbox);
    }
  }
};
