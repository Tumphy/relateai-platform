import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/utils/test-utils';
import SendButton from '@/components/messages/SendButton';
import { useMessages } from '@/contexts/MessageContext';
import toast from 'react-hot-toast';

// Mock the dependencies
jest.mock('@/contexts/MessageContext', () => ({
  useMessages: jest.fn()
}));

jest.mock('react-hot-toast', () => ({
  error: jest.fn(),
  success: jest.fn()
}));

describe('SendButton Component', () => {
  // Set up the mock implementation for useMessages
  const mockSendMessage = jest.fn();
  const mockUseMessages = useMessages as jest.Mock;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMessages.mockReturnValue({
      sendMessage: mockSendMessage
    });
  });

  it('renders with default props', () => {
    render(<SendButton messageId="message-123" />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Send');
    expect(button).not.toBeDisabled();
  });

  it('renders in icon-only mode', () => {
    render(<SendButton messageId="message-123" iconOnly />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).not.toHaveTextContent('Send');
    // Should only contain the icon
    expect(button.textContent).toBe('');
  });

  it('applies different size classes', () => {
    const { rerender } = render(<SendButton messageId="message-123" size="sm" />);
    let button = screen.getByRole('button');
    
    // Small size
    expect(button).toHaveClass('px-3 py-1.5 text-xs');
    
    // Medium size
    rerender(<SendButton messageId="message-123" size="md" />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('px-4 py-2 text-sm');
    
    // Large size
    rerender(<SendButton messageId="message-123" size="lg" />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('px-5 py-2.5 text-base');
  });

  it('applies different variant classes', () => {
    const { rerender } = render(<SendButton messageId="message-123" variant="primary" />);
    let button = screen.getByRole('button');
    
    // Primary variant
    expect(button).toHaveClass('bg-primary-600 hover:bg-primary-700 text-white');
    
    // Secondary variant
    rerender(<SendButton messageId="message-123" variant="secondary" />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('bg-secondary-600 hover:bg-secondary-700 text-white');
    
    // Outline variant
    rerender(<SendButton messageId="message-123" variant="outline" />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50');
  });

  it('handles successful message sending', async () => {
    const onSuccessMock = jest.fn();
    mockSendMessage.mockResolvedValue(true);
    
    render(<SendButton messageId="message-123" onSuccess={onSuccessMock} />);
    
    // Click the button
    fireEvent.click(screen.getByRole('button'));
    
    // Button should show sending state
    expect(screen.getByRole('button')).toHaveTextContent('Sending...');
    expect(screen.getByRole('button')).toBeDisabled();
    
    // Wait for the send to complete
    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('message-123');
      expect(onSuccessMock).toHaveBeenCalled();
    });
  });

  it('handles failed message sending', async () => {
    mockSendMessage.mockRejectedValue(new Error('Send failed'));
    
    render(<SendButton messageId="message-123" />);
    
    // Click the button
    fireEvent.click(screen.getByRole('button'));
    
    // Wait for the send to complete
    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('message-123');
    });
  });

  it('shows error when messageId is missing', async () => {
    render(<SendButton messageId="" />);
    
    // Click the button
    fireEvent.click(screen.getByRole('button'));
    
    // Should show error toast
    expect(toast.error).toHaveBeenCalledWith('Message ID is required');
    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<SendButton messageId="message-123" className="custom-class" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });
  
  it('does not call sendMessage when button is disabled', () => {
    render(<SendButton messageId="message-123" />);
    
    // Set the button to disabled
    const button = screen.getByRole('button');
    button.setAttribute('disabled', 'true');
    
    // Click the button
    fireEvent.click(button);
    
    // Should not call sendMessage
    expect(mockSendMessage).not.toHaveBeenCalled();
  });
  
  it('handles icon rendering in different sizes', () => {
    const { rerender } = render(<SendButton messageId="message-123" iconOnly size="sm" />);
    
    // Small size
    let icon = screen.getByRole('button').querySelector('svg');
    expect(icon).toHaveClass('h-4 w-4');
    
    // Medium size
    rerender(<SendButton messageId="message-123" iconOnly size="md" />);
    icon = screen.getByRole('button').querySelector('svg');
    expect(icon).toHaveClass('h-4 w-4');
    
    // Large size
    rerender(<SendButton messageId="message-123" iconOnly size="lg" />);
    icon = screen.getByRole('button').querySelector('svg');
    expect(icon).toHaveClass('h-4 w-4');
  });
  
  it('calls onSuccess only when sendMessage returns true', async () => {
    const onSuccessMock = jest.fn();
    
    // Test when sendMessage returns false
    mockSendMessage.mockResolvedValue(false);
    
    render(<SendButton messageId="message-123" onSuccess={onSuccessMock} />);
    
    // Click the button
    fireEvent.click(screen.getByRole('button'));
    
    // Wait for the send to complete
    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('message-123');
      expect(onSuccessMock).not.toHaveBeenCalled();
    });
    
    // Reset mocks and test when sendMessage returns true
    jest.clearAllMocks();
    mockSendMessage.mockResolvedValue(true);
    
    fireEvent.click(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('message-123');
      expect(onSuccessMock).toHaveBeenCalled();
    });
  });
});
