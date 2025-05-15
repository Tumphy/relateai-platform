import React from 'react';
import { render, screen, waitFor } from '@/utils/test-utils';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { authService } from '@/lib/api';

// Mock the API services
jest.mock('@/lib/api', () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    refreshToken: jest.fn(),
    getCurrentUser: jest.fn()
  }
}));

// Mock local storage
const mockLocalStorageData: Record<string, string> = {};

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn((key) => mockLocalStorageData[key] || null),
    setItem: jest.fn((key, value) => {
      mockLocalStorageData[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete mockLocalStorageData[key];
    }),
    clear: jest.fn(() => {
      Object.keys(mockLocalStorageData).forEach((key) => delete mockLocalStorageData[key]);
    })
  },
  writable: true
});

// Test component that uses the Auth context
const TestComponent = () => {
  const {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout
  } = useAuth();

  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'Authenticated' : 'Not authenticated'}</div>
      <div data-testid="error">{error || 'No error'}</div>
      <div data-testid="user">{user ? user.email : 'No user'}</div>
      <button data-testid="login-btn" onClick={() => login('test@example.com', 'password')}>
        Login
      </button>
      <button
        data-testid="register-btn"
        onClick={() =>
          register({
            email: 'new@example.com',
            password: 'password',
            firstName: 'New',
            lastName: 'User'
          })
        }
      >
        Register
      </button>
      <button data-testid="logout-btn" onClick={() => logout()}>
        Logout
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  it('provides the default authentication state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('authenticated')).toHaveTextContent('Not authenticated');
    expect(screen.getByTestId('user')).toHaveTextContent('No user');
    expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
    expect(screen.getByTestId('error')).toHaveTextContent('No error');
  });

  it('handles successful login', async () => {
    const mockUser = { _id: 'user-123', email: 'test@example.com', firstName: 'Test', lastName: 'User' };
    const mockToken = 'test-token';

    (authService.login as jest.Mock).mockResolvedValue({
      data: {
        success: true,
        user: mockUser,
        token: mockToken
      }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Trigger login
    screen.getByTestId('login-btn').click();

    // Wait for state update
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });

    // Check if login was called with correct arguments
    expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password');

    // Check if token was stored in localStorage
    expect(window.localStorage.setItem).toHaveBeenCalledWith('token', mockToken);
  });

  it('handles login failure', async () => {
    const errorMessage = 'Invalid credentials';
    (authService.login as jest.Mock).mockRejectedValue({
      response: {
        data: {
          success: false,
          message: errorMessage
        }
      }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Trigger login
    screen.getByTestId('login-btn').click();

    // Wait for error state update
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not authenticated');
      expect(screen.getByTestId('error')).toHaveTextContent(errorMessage);
    });
  });

  it('handles successful registration', async () => {
    const mockUser = {
      _id: 'user-123',
      email: 'new@example.com',
      firstName: 'New',
      lastName: 'User'
    };
    const mockToken = 'register-token';

    (authService.register as jest.Mock).mockResolvedValue({
      data: {
        success: true,
        user: mockUser,
        token: mockToken
      }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Trigger registration
    screen.getByTestId('register-btn').click();

    // Wait for state update
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user')).toHaveTextContent('new@example.com');
    });

    // Check if register was called with correct arguments
    expect(authService.register).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'password',
      firstName: 'New',
      lastName: 'User'
    });

    // Check if token was stored in localStorage
    expect(window.localStorage.setItem).toHaveBeenCalledWith('token', mockToken);
  });

  it('handles logout', async () => {
    // Set up initial authenticated state
    const mockUser = { _id: 'user-123', email: 'test@example.com', firstName: 'Test', lastName: 'User' };
    const mockToken = 'test-token';

    (authService.login as jest.Mock).mockResolvedValue({
      data: {
        success: true,
        user: mockUser,
        token: mockToken
      }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Log in first
    screen.getByTestId('login-btn').click();

    // Wait for logged in state
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
    });

    // Mock successful logout
    (authService.logout as jest.Mock).mockResolvedValue({
      data: { success: true }
    });

    // Trigger logout
    screen.getByTestId('logout-btn').click();

    // Wait for logged out state
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not authenticated');
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });

    // Check if token was removed from localStorage
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('token');
  });

  it('checks for existing token on mount', async () => {
    const mockUser = { _id: 'user-123', email: 'existing@example.com', firstName: 'Existing', lastName: 'User' };
    
    // Set existing token in localStorage
    window.localStorage.setItem('token', 'existing-token');
    
    // Mock getCurrentUser response
    (authService.getCurrentUser as jest.Mock).mockResolvedValue({
      data: {
        success: true,
        user: mockUser
      }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initially it should be in loading state
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');

    // Wait for authentication check to complete
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user')).toHaveTextContent('existing@example.com');
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
    });

    // Check if getCurrentUser was called
    expect(authService.getCurrentUser).toHaveBeenCalled();
  });
});
