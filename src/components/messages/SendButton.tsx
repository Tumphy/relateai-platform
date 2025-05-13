'use client';

import { useState } from 'react';
import { SendIcon } from 'lucide-react';
import { useMessages } from '@/contexts/MessageContext';
import toast from 'react-hot-toast';

interface SendButtonProps {
  messageId: string;
  onSuccess?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  iconOnly?: boolean;
}

export default function SendButton({ 
  messageId, 
  onSuccess, 
  className = '',
  variant = 'primary',
  size = 'md',
  iconOnly = false
}: SendButtonProps) {
  const { sendMessage } = useMessages();
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!messageId) {
      toast.error('Message ID is required');
      return;
    }

    setSending(true);
    try {
      const success = await sendMessage(messageId);
      if (success && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  // Determine button styles based on variant and size
  const getVariantClass = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary-600 hover:bg-primary-700 text-white';
      case 'secondary':
        return 'bg-secondary-600 hover:bg-secondary-700 text-white';
      case 'outline':
        return 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50';
      default:
        return 'bg-primary-600 hover:bg-primary-700 text-white';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return iconOnly ? 'p-2' : 'px-3 py-1.5 text-xs';
      case 'md':
        return iconOnly ? 'p-2.5' : 'px-4 py-2 text-sm';
      case 'lg':
        return iconOnly ? 'p-3' : 'px-5 py-2.5 text-base';
      default:
        return iconOnly ? 'p-2.5' : 'px-4 py-2 text-sm';
    }
  };

  return (
    <button
      type="button"
      onClick={handleSend}
      disabled={sending}
      className={`
        ${getVariantClass()} 
        ${getSizeClass()} 
        flex items-center justify-center rounded-md font-medium 
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
        transition-colors duration-200 ease-in-out
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      <SendIcon className={`h-4 w-4 ${iconOnly ? '' : 'mr-2'}`} />
      {!iconOnly && (sending ? 'Sending...' : 'Send')}
    </button>
  );
}