import { messageService } from '@/services/api';

// Enhanced message sending functionality
export const sendMessage = async (messageId: string) => {
  try {
    const response = await messageService.sendMessage({ messageId });
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Error sending message:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to send message'
    };
  }
};