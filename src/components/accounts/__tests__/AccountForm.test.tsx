import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/utils/test-utils';
import AccountForm from '@/components/accounts/AccountForm';
import { useRouter } from 'next/navigation';
import { useAccounts } from '@/contexts/AccountContext';
import { mockAccount } from '@/utils/test-utils';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

jest.mock('@/contexts/AccountContext', () => ({
  useAccounts: jest.fn()
}));

describe('AccountForm Component', () => {
  // Set up mocks
  const mockRouter = {
    back: jest.fn(),
    push: jest.fn()
  };
  
  const mockGetAccount = jest.fn();
  const mockCreateAccount = jest.fn();
  const mockUpdateAccount = jest.fn();
  const mockResearchAccount = jest.fn();
  
  const mockUseRouter = useRouter as jest.Mock;
  const mockUseAccounts = useAccounts as jest.Mock;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseRouter.mockReturnValue(mockRouter);
    
    mockUseAccounts.mockReturnValue({
      getAccount: mockGetAccount,
      createAccount: mockCreateAccount,
      updateAccount: mockUpdateAccount,
      researchAccount: mockResearchAccount
    });
  });
  
  it('renders the form for creating a new account', () => {
    render(<AccountForm />);
    
    // Form title should indicate creating a new account
    expect(screen.getByText('New Account')).toBeInTheDocument();
    
    // Research section should be visible for new accounts
    expect(screen.getByText('Research a company')).toBeInTheDocument();
    
    // Form fields should be empty
    expect(screen.getByLabelText(/Account Name/i)).toHaveValue('');
    expect(screen.getByLabelText(/Website/i)).toHaveValue('');
  });
  
  it('renders the form for editing an existing account', async () => {
    // Set up mock for getAccount
    mockGetAccount.mockResolvedValue(mockAccount);
    
    render(<AccountForm accountId="account-123" />);
    
    // Wait for account data to load
    await waitFor(() => {
      expect(mockGetAccount).toHaveBeenCalledWith('account-123');
    });
    
    // Form title should indicate editing an account
    expect(screen.getByText('Edit Account')).toBeInTheDocument();
    
    // Research section should not be visible for editing
    expect(screen.queryByText('Research a company')).not.toBeInTheDocument();
    
    // Form fields should have account data
    expect(screen.getByLabelText(/Account Name/i)).toHaveValue(mockAccount.name);
    expect(screen.getByLabelText(/Website/i)).toHaveValue(mockAccount.website);
  });
  
  it('validates form fields on submission', async () => {
    render(<AccountForm />);
    
    // Submit form without required fields
    const submitButton = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(submitButton);
    
    // Should show validation error for required fields
    await waitFor(() => {
      expect(screen.getByText('Account name is required')).toBeInTheDocument();
    });
    
    // Fill in the required field
    fireEvent.change(screen.getByLabelText(/Account Name/i), {
      target: { value: 'Test Account' }
    });
    
    // Submit form again
    fireEvent.click(submitButton);
    
    // Should not show validation error for name
    await waitFor(() => {
      expect(screen.queryByText('Account name is required')).not.toBeInTheDocument();
    });
  });
  
  it('validates website format', async () => {
    render(<AccountForm />);
    
    // Enter invalid website
    fireEvent.change(screen.getByLabelText(/Website/i), {
      target: { value: 'invalid-website' }
    });
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(submitButton);
    
    // Should show validation error for website
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid website URL')).toBeInTheDocument();
    });
    
    // Enter valid website
    fireEvent.change(screen.getByLabelText(/Website/i), {
      target: { value: 'https://example.com' }
    });
    
    // Submit form again
    fireEvent.click(submitButton);
    
    // Should not show validation error for website
    await waitFor(() => {
      expect(screen.queryByText('Please enter a valid website URL')).not.toBeInTheDocument();
    });
  });
  
  it('creates a new account on valid submission', async () => {
    mockCreateAccount.mockResolvedValue({ ...mockAccount, _id: 'new-account-123' });
    
    render(<AccountForm />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Account Name/i), {
      target: { value: 'New Test Account' }
    });
    
    fireEvent.change(screen.getByLabelText(/Website/i), {
      target: { value: 'https://example.com' }
    });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(submitButton);
    
    // Should call createAccount
    await waitFor(() => {
      expect(mockCreateAccount).toHaveBeenCalledWith(expect.objectContaining({
        name: 'New Test Account',
        website: 'https://example.com'
      }));
    });
    
    // Should redirect to account page
    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/accounts/new-account-123');
  });
  
  it('updates an existing account on valid submission', async () => {
    // Set up mock for getAccount
    mockGetAccount.mockResolvedValue(mockAccount);
    mockUpdateAccount.mockResolvedValue({ ...mockAccount, name: 'Updated Account' });
    
    render(<AccountForm accountId="account-123" />);
    
    // Wait for account data to load
    await waitFor(() => {
      expect(mockGetAccount).toHaveBeenCalledWith('account-123');
    });
    
    // Update name field
    fireEvent.change(screen.getByLabelText(/Account Name/i), {
      target: { value: 'Updated Account' }
    });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Update Account/i });
    fireEvent.click(submitButton);
    
    // Should call updateAccount
    await waitFor(() => {
      expect(mockUpdateAccount).toHaveBeenCalledWith('account-123', expect.objectContaining({
        name: 'Updated Account',
        website: mockAccount.website
      }));
    });
    
    // Should redirect to account page
    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/accounts/account-123');
  });
  
  it('handles cancel button click', () => {
    render(<AccountForm />);
    
    // Click cancel button
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);
    
    // Should call router.back
    expect(mockRouter.back).toHaveBeenCalled();
  });
  
  it('allows adding and removing tags', async () => {
    render(<AccountForm />);
    
    // Initially one empty tag input
    const tagInputs = screen.getAllByPlaceholderText(/Add a tag/i);
    expect(tagInputs.length).toBe(1);
    
    // Add a tag
    fireEvent.change(tagInputs[0], {
      target: { value: 'enterprise' }
    });
    
    // Click add tag button
    const addTagButton = screen.getByText(/Add tag/i);
    fireEvent.click(addTagButton);
    
    // Should have two tag inputs now
    await waitFor(() => {
      const updatedTagInputs = screen.getAllByPlaceholderText(/Add a tag/i);
      expect(updatedTagInputs.length).toBe(2);
      expect(updatedTagInputs[0]).toHaveValue('enterprise');
      expect(updatedTagInputs[1]).toHaveValue('');
    });
    
    // Remove first tag
    const removeButtons = screen.getAllByRole('button', { name: '' });
    // Find the remove button next to the first tag
    const removeTagButton = removeButtons.find(button => 
      button.parentElement?.querySelector('input')?.value === 'enterprise'
    );
    
    fireEvent.click(removeTagButton!);
    
    // Should have one empty tag input again
    await waitFor(() => {
      const finalTagInputs = screen.getAllByPlaceholderText(/Add a tag/i);
      expect(finalTagInputs.length).toBe(1);
      expect(finalTagInputs[0]).toHaveValue('');
    });
  });
  
  it('handles research account functionality', async () => {
    mockResearchAccount.mockResolvedValue({ ...mockAccount, _id: 'researched-account-123' });
    
    render(<AccountForm />);
    
    // Enter website to research
    const researchInput = screen.getByPlaceholderText(/Enter company website/i);
    fireEvent.change(researchInput, {
      target: { value: 'acme.com' }
    });
    
    // Click research button
    const researchButton = screen.getByRole('button', { name: /Research/i });
    fireEvent.click(researchButton);
    
    // Should call researchAccount
    await waitFor(() => {
      expect(mockResearchAccount).toHaveBeenCalledWith({ url: 'acme.com' });
    });
    
    // Should redirect to account page
    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/accounts/researched-account-123');
  });
  
  it('validates research URL', async () => {
    render(<AccountForm />);
    
    // Click research button without URL
    const researchButton = screen.getByRole('button', { name: /Research/i });
    fireEvent.click(researchButton);
    
    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText('Please enter a website URL')).toBeInTheDocument();
    });
  });
  
  it('loads account data from initialData if provided', async () => {
    // Render with initialData
    render(<AccountForm accountId="account-123" initialData={mockAccount} />);
    
    // Should not call getAccount
    expect(mockGetAccount).not.toHaveBeenCalled();
    
    // Form fields should have account data
    expect(screen.getByLabelText(/Account Name/i)).toHaveValue(mockAccount.name);
    expect(screen.getByLabelText(/Website/i)).toHaveValue(mockAccount.website);
  });
});
