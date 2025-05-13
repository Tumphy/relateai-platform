import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMessages } from '@/contexts/MessageContext';
import { useContacts } from '@/contexts/ContactContext';
import { useAccounts } from '@/contexts/AccountContext';
import { Message, MessageGenerationParams, Contact } from '@/types/models';
import { 
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
  TagIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface MessageFormProps {
  message?: Message;
  initialContactId?: string;
  isEdit?: boolean;
  isReply?: boolean;
}

export default function MessageForm({ message, initialContactId, isEdit = false, isReply = false }: MessageFormProps) {
  const { createMessage, updateMessage, sendMessage, generateMessage } = useMessages();
  const { contacts, getContact } = useContacts();
  const { accounts } = useAccounts();
  const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [tags, setTags] = useState<string[]>(message?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showAIOptions, setShowAIOptions] = useState(false);
  
  // Form for message content
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    defaultValues: message ? {
      contactId: message.contactId.toString(),
      accountId: message.accountId.toString(),
      subject: message.subject || '',
      content: message.content,
      channel: message.channel
    } : {
      contactId: initialContactId || '',
      channel: 'email'
    }
  });
  
  // Form for AI generation
  const { register: registerAI, handleSubmit: handleSubmitAI } = useForm({
    defaultValues: {
      recipientType: 'prospect',
      messageType: 'introduction',
      tone: 'professional',
      length: 'medium',
      customInstructions: ''
    }
  });
  
  const watchedContactId = watch('contactId');
  
  // Load contact info when contact ID changes
  useEffect(() => {
    if (watchedContactId) {
      const loadContact = async () => {
        const contact = await getContact(watchedContactId);
        setSelectedContact(contact);
        
        if (contact && contact.accountId) {
          setValue('accountId', contact.accountId.toString());
        }
      };
      
      loadContact();
    }
  }, [watchedContactId, getContact, setValue]);
  
  // Set initial contact when provided
  useEffect(() => {
    if (initialContactId && !isEdit) {
      setValue('contactId', initialContactId);
    }
  }, [initialContactId, isEdit, setValue]);
  
  // Reset form when message changes
  useEffect(() => {
    if (message) {
      reset({
        contactId: message.contactId.toString(),
        accountId: message.accountId.toString(),
        subject: message.subject || '',
        content: message.content,
        channel: message.channel
      });
      setTags(message.tags || []);
    }
  }, [message, reset]);
  
  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    // Add tags to the data
    data.tags = tags;
    
    try {
      if (isEdit && message) {
        // Update existing message
        await updateMessage(message._id.toString(), data);
        router.push('/dashboard/messages');
      } else {
        // Create new message
        const newMessage = await createMessage({
          ...data,
          direction: 'outbound',
          status: 'draft'
        });
        
        if (newMessage) {
          router.push('/dashboard/messages');
        }
      }
    } catch (error) {
      console.error('Error saving message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const onGenerateWithAI = async (aiData: any) => {
    if (!watchedContactId) {
      alert('Please select a contact first');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const params: MessageGenerationParams = {
        contactId: watchedContactId,
        accountId: selectedContact!.accountId.toString(),
        recipientType: aiData.recipientType,
        messageType: aiData.messageType,
        tone: aiData.tone,
        length: aiData.length,
        customInstructions: aiData.customInstructions,
        channel: watch('channel')
      };
      
      const generatedMessage = await generateMessage(params);
      
      if (generatedMessage) {
        // Update the form with generated content
        setValue('subject', generatedMessage.subject || '');
        setValue('content', generatedMessage.content);
        
        // Close AI options panel
        setShowAIOptions(false);
      }
    } catch (error) {
      console.error('Error generating message:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSendNow = async () => {
    // First save the message if it's new
    if (!isEdit && !message) {
      const data = {
        contactId: watchedContactId,
        accountId: selectedContact!.accountId.toString(),
        subject: watch('subject'),
        content: watch('content'),
        channel: watch('channel'),
        tags,
        direction: 'outbound',
        status: 'draft'
      };
      
      setIsSending(true);
      
      try {
        const newMessage = await createMessage(data);
        
        if (newMessage) {
          // Now send the message
          await sendMessage(newMessage._id.toString());
          router.push('/dashboard/messages');
        }
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setIsSending(false);
      }
    } else if (message) {
      // Send existing message
      setIsSending(true);
      
      try {
        await sendMessage(message._id.toString());
        router.push('/dashboard/messages');
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setIsSending(false);
      }
    }
  };
  
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          {isEdit ? 'Edit Message' : isReply ? 'Reply' : 'Compose New Message'}
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          {isEdit 
            ? 'Update message content' 
            : isReply 
              ? 'Compose a reply message'
              : 'Create a new message to send to a contact'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Contact Selection */}
            <div className="sm:col-span-3">
              <label htmlFor="contactId" className="block text-sm font-medium text-gray-700">
                Recipient
              </label>
              <div className="mt-1">
                <select
                  id="contactId"
                  className={`focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                    errors.contactId ? 'border-red-300' : ''
                  }`}
                  {...register('contactId', { required: 'Contact is required' })}
                  disabled={isEdit || isReply}
                >
                  <option value="">Select a contact</option>
                  {contacts.map(contact => (
                    <option key={contact._id.toString()} value={contact._id.toString()}>
                      {contact.firstName} {contact.lastName} - {contact.email}
                    </option>
                  ))}
                </select>
              </div>
              {errors.contactId && (
                <p className="mt-1 text-sm text-red-600">{errors.contactId.message?.toString()}</p>
              )}
            </div>
            
            {/* Channel Selection */}
            <div className="sm:col-span-3">
              <label htmlFor="channel" className="block text-sm font-medium text-gray-700">
                Channel
              </label>
              <div className="mt-1">
                <select
                  id="channel"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  {...register('channel')}
                  disabled={isEdit}
                >
                  <option value="email">Email</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="twitter">Twitter</option>
                  <option value="sms">SMS</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            {/* Subject (only for email) */}
            {watch('channel') === 'email' && (
              <div className="sm:col-span-6">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                  Subject
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="subject"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter subject line..."
                    {...register('subject')}
                  />
                </div>
              </div>
            )}
            
            {/* Message Content */}
            <div className="sm:col-span-6">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Message
              </label>
              <div className="mt-1">
                <textarea
                  id="content"
                  rows={10}
                  className={`focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                    errors.content ? 'border-red-300' : ''
                  }`}
                  placeholder="Enter your message here..."
                  {...register('content', { required: 'Message content is required' })}
                />
              </div>
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message?.toString()}</p>
              )}
            </div>
            
            {/* Tags */}
            <div className="sm:col-span-6">
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                Tags
              </label>
              <div className="mt-1">
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1.5 h-4 w-4 flex items-center justify-center rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600 focus:outline-none"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <TagIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    id="tagInput"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Add a tag and press Enter"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Press Enter to add a tag
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* AI Message Generation */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">AI Message Generation</h4>
            <button
              type="button"
              onClick={() => setShowAIOptions(!showAIOptions)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              {showAIOptions ? 'Hide AI Options' : 'Generate with AI'}
            </button>
          </div>
          
          {showAIOptions && (
            <form onSubmit={handleSubmitAI(onGenerateWithAI)} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="recipientType" className="block text-sm font-medium text-gray-700">
                  Recipient Type
                </label>
                <select
                  id="recipientType"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  {...registerAI('recipientType')}
                >
                  <option value="prospect">Prospect</option>
                  <option value="customer">Customer</option>
                  <option value="partner">Partner</option>
                  <option value="vendor">Vendor</option>
                  <option value="influencer">Influencer</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="messageType" className="block text-sm font-medium text-gray-700">
                  Message Type
                </label>
                <select
                  id="messageType"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  {...registerAI('messageType')}
                >
                  <option value="introduction">Introduction</option>
                  <option value="followUp">Follow-up</option>
                  <option value="proposal">Proposal</option>
                  <option value="meetingRequest">Meeting Request</option>
                  <option value="thankYou">Thank You</option>
                  <option value="valueProposition">Value Proposition</option>
                  <option value="requestForInfo">Request for Information</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="tone" className="block text-sm font-medium text-gray-700">
                  Tone
                </label>
                <select
                  id="tone"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  {...registerAI('tone')}
                >
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                  <option value="casual">Casual</option>
                  <option value="formal">Formal</option>
                  <option value="enthusiastic">Enthusiastic</option>
                  <option value="direct">Direct</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="length" className="block text-sm font-medium text-gray-700">
                  Length
                </label>
                <select
                  id="length"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  {...registerAI('length')}
                >
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </select>
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="customInstructions" className="block text-sm font-medium text-gray-700">
                  Custom Instructions (Optional)
                </label>
                <textarea
                  id="customInstructions"
                  rows={3}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Any specific instructions for the AI..."
                  {...registerAI('customInstructions')}
                />
              </div>
              
              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isGenerating || !watchedContactId}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <ArrowPathIcon className="h-4 w-4 mr-1" />
                      Generate Message
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
        
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 flex justify-end space-x-3 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.push('/dashboard/messages')}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleSendNow}
            disabled={isSending || !watchedContactId || !watch('content')}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {isSending ? (
              <span className="flex items-center">
                <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
                Sending...
              </span>
            ) : (
              <span className="flex items-center">
                <PaperAirplaneIcon className="h-4 w-4 mr-1" />
                Send Now
              </span>
            )}
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save as Draft'}
          </button>
        </div>
      </form>
    </div>
  );
}
