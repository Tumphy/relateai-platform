import { messageService } from '@/services/api';
import { sendMessage } from '@/lib/messageSender';

// Add the sendMessage method to the messageService
messageService.sendMessage = async (data: { messageId: string }) => {
  return await messageService.client.post('/messages/send', data);
};