import React from 'react';
import { render, screen, waitFor } from '@/utils/test-utils';
import userEvent from '@testing-library/user-event';
import EmailTestForm from '@/components/messages/EmailTestForm';
import { emailService } from '@/lib/api';
import toast from 'react-hot-toast';

// Mock dependencies
jest.mock('@/lib/api', () => ({
  emailService: {
    sendTestEmail: jest.fn()
  }
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn()
}));

describe('EmailTestForm Component', () => {
  const user = userEvent.setup();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields correctly', () => {
    render(<EmailTestForm />);
    
    // Check for form fields
    expect(screen.getByLabelText(/Recipient Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Content/i)).toBeInTheDocument();
    
    // Check for submit button
    expect(screen.getByRole('button', { name: /Send Test Email/i })).toBeInTheDocument();
  });

  it('updates form values when typing', async () => {
    render(<EmailTestForm />);
    
    // Get form inputs
    const emailInput = screen.getByLabelText(/Recipient Email/i);
    const subjectInput = screen.getByLabelText(/Subject/i);
    const contentInput = screen.getByLabelText(/Content/i);
    
    // Type in form fields
    await user.type(emailInput, 'test@example.com');
    await user.type(subjectInput, 'Test Subject');
    await user.type(contentInput, 'This is a test email content');
    
    // Check values were updated
    expect(emailInput).toHaveValue('test@example.com');
    expect(subjectInput).toHaveValue('Test Subject');
    expect(contentInput).toHaveValue('This is a test email content');
  });

  it('validates required fields on submission', async () => {
    render(<EmailTestForm />);
    
    // Submit without filling form
    await user.click(screen.getByRole('button', { name: /Send Test Email/i }));
    
    // Should show error
    await waitFor(() => {
      expect(screen.getByText(/Please fill out all fields/i)).toBeInTheDocument();
    });
    
    // API should not be called
    expect(emailService.sendTestEmail).not.toHaveBeenCalled();
  });

  it('validates email format', async () => {
    render(<EmailTestForm />);
    
    // Fill form with invalid email
    await user.type(screen.getByLabelText(/Recipient Email/i), 'invalid-email');
    await user.type(screen.getByLabelText(/Subject/i), 'Test Subject');
    await user.type(screen.getByLabelText(/Content/i), 'Test content');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /Send Test Email/i }));
    
    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
    });
    
    // API should not be called
    expect(emailService.sendTestEmail).not.toHaveBeenCalled();
  });

  it('sends an email on valid form submission', async () => {
    // Mock successful API response
    (emailService.sendTestEmail as jest.Mock).mockResolvedValue({
      data: {
        success: true,
        messageId: 'test-message-123'
      }
    });
    
    // Mock callback
    const onSuccessMock = jest.fn();
    
    render(<EmailTestForm onSuccess={onSuccessMock} />);
    
    // Fill form with valid data
    await user.type(screen.getByLabelText(/Recipient Email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/Subject/i), 'Test Subject');
    await user.type(screen.getByLabelText(/Content/i), 'Test content');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /Send Test Email/i }));
    
    // Should call API
    await waitFor(() => {
      expect(emailService.sendTestEmail).toHaveBeenCalledWith(
        'test@example.com',
        'Test Subject',
        'Test content'
      );
    });
    
    // Should show success toast
    expect(toast.success).toHaveBeenCalledWith('Test email sent successfully!');
    
    // Should call onSuccess callback
    expect(onSuccessMock).toHaveBeenCalledWith('test-message-123');
    
    // Form should be reset
    await waitFor(() => {
      expect(screen.getByLabelText(/Recipient Email/i)).toHaveValue('');
      expect(screen.getByLabelText(/Subject/i)).toHaveValue('');
      expect(screen.getByLabelText(/Content/i)).toHaveValue('');
    });
  });

  it('handles API errors', async () => {
    // Mock API error
    const errorMessage = 'Failed to send email: SMTP error';
    (emailService.sendTestEmail as jest.Mock).mockRejectedValue({
      message: errorMessage
    });
    
    render(<EmailTestForm />);
    
    // Fill form with valid data
    await user.type(screen.getByLabelText(/Recipient Email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/Subject/i), 'Test Subject');
    await user.type(screen.getByLabelText(/Content/i), 'Test content');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /Send Test Email/i }));
    
    // Should call API
    await waitFor(() => {
      expect(emailService.sendTestEmail).toHaveBeenCalled();
    });
    
    // Should show error toast
    expect(toast.error).toHaveBeenCalledWith(errorMessage);
    
    // Should display error in the UI
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    
    // Form values should remain
    expect(screen.getByLabelText(/Recipient Email/i)).toHaveValue('test@example.com');
    expect(screen.getByLabelText(/Subject/i)).toHaveValue('Test Subject');
    expect(screen.getByLabelText(/Content/i)).toHaveValue('Test content');
  });

  it('disables submit button during API call', async () => {
    // Mock API call that takes time to resolve
    (emailService.sendTestEmail as jest.Mock).mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              success: true,
              messageId: 'test-message-123'
            }
          });
        }, 100);
      });
    });
    
    render(<EmailTestForm />);
    
    // Fill form with valid data
    await user.type(screen.getByLabelText(/Recipient Email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/Subject/i), 'Test Subject');
    await user.type(screen.getByLabelText(/Content/i), 'Test content');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /Send Test Email/i }));
    
    // Button should show loading state
    expect(screen.getByRole('button', { name: /Sending/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sending/i })).toBeDisabled();
    
    // Wait for API to resolve
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Send Test Email/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Send Test Email/i })).not.toBeDisabled();
    });
  });
});
