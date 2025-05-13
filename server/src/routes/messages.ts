import express from 'express';
import { auth } from '../middleware/auth';
import Message from '../models/message';
import Contact from '../models/contact';
import Account from '../models/account';
import { messageValidators } from '../validators/message';
import mongoose from 'mongoose';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

/**
 * @route GET /api/messages
 * @desc Get all messages with filtering options
 * @access Private
 */
router.get('/', async (req, res) => {
  try {
    // Validate and parse query parameters
    const validationResult = messageValidators.filter.safeParse(req.query);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid query parameters', 
        errors: validationResult.error.errors 
      });
    }
    
    const {
      contactId,
      accountId,
      status,
      direction,
      channel,
      threadId,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      campaignId,
      tags,
      aiGenerated
    } = validationResult.data;
    
    // Build query
    const query: any = { userId: req.user.id };
    
    if (contactId) {
      query.contactId = new mongoose.Types.ObjectId(contactId);
    }
    
    if (accountId) {
      query.accountId = new mongoose.Types.ObjectId(accountId);
    }
    
    if (status) {
      query.status = status;
    }
    
    if (direction) {
      query.direction = direction;
    }
    
    if (channel) {
      query.channel = channel;
    }
    
    if (threadId) {
      query.threadId = threadId;
    }
    
    if (search) {
      query.$or = [
        { content: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }
    
    if (campaignId) {
      query.campaignId = new mongoose.Types.ObjectId(campaignId);
    }
    
    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }
    
    if (aiGenerated !== undefined) {
      query.aiGenerated = aiGenerated;
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute query with pagination and sorting
    const messages = await Message.find(query)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .populate('contactId', 'firstName lastName email')
      .populate('accountId', 'name')
      .lean();
    
    // Get total count for pagination info
    const totalMessages = await Message.countDocuments(query);
    
    res.json({
      messages,
      pagination: {
        totalMessages,
        totalPages: Math.ceil(totalMessages / limit),
        currentPage: page,
        limit
      }
    });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/messages
 * @desc Create a new message
 * @access Private
 */
router.post('/', async (req, res) => {
  try {
    // Validate request body
    const validationResult = messageValidators.create.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid message data', 
        errors: validationResult.error.errors 
      });
    }
    
    const messageData = validationResult.data;
    
    // Verify contact exists and belongs to user
    const contact = await Contact.findOne({
      _id: messageData.contactId,
      userId: req.user.id
    });
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found or unauthorized' });
    }
    
    // Verify account exists and belongs to user
    const account = await Account.findOne({
      _id: messageData.accountId,
      userId: req.user.id
    });
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found or unauthorized' });
    }
    
    // Create new message
    const newMessage = new Message({
      ...messageData,
      userId: req.user.id
    });
    
    await newMessage.save();
    
    res.status(201).json({
      message: 'Message created successfully',
      messageData: newMessage
    });
  } catch (err) {
    console.error('Error creating message:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/messages/:id
 * @desc Get message by ID
 * @access Private
 */
router.get('/:id', async (req, res) => {
  try {
    const message = await Message.findOne({
      _id: req.params.id,
      userId: req.user.id
    })
      .populate('contactId', 'firstName lastName email title company')
      .populate('accountId', 'name website industry')
      .populate('parent', 'content subject sentAt');
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    res.json(message);
  } catch (err) {
    console.error('Error fetching message:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route PUT /api/messages/:id
 * @desc Update a message
 * @access Private
 */
router.put('/:id', async (req, res) => {
  try {
    // Validate request body
    const validationResult = messageValidators.update.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid message data', 
        errors: validationResult.error.errors 
      });
    }
    
    const messageData = validationResult.data;
    
    // Check if message exists and belongs to user
    const message = await Message.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Don't allow updates to sent messages unless it's just status updates
    if (message.status !== 'draft' && Object.keys(messageData).some(key => !['status', 'deliveredAt', 'openedAt', 'repliedAt', 'tags'].includes(key))) {
      return res.status(400).json({ message: 'Cannot modify content of a message that has been sent' });
    }
    
    // Update message
    const updatedMessage = await Message.findByIdAndUpdate(
      req.params.id,
      { $set: messageData },
      { new: true }
    ).populate('contactId', 'firstName lastName email');
    
    res.json({
      message: 'Message updated successfully',
      messageData: updatedMessage
    });
  } catch (err) {
    console.error('Error updating message:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route DELETE /api/messages/:id
 * @desc Delete a message
 * @access Private
 */
router.delete('/:id', async (req, res) => {
  try {
    // Check if message exists and belongs to user
    const message = await Message.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Only allow deletion of draft messages
    if (message.status !== 'draft') {
      return res.status(400).json({ message: 'Cannot delete a message that has been sent' });
    }
    
    // Delete message
    await Message.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/messages/generate
 * @desc Generate a message using AI
 * @access Private
 */
router.post('/generate', async (req, res) => {
  try {
    // Validate request body
    const validationResult = messageValidators.generate.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid generation parameters', 
        errors: validationResult.error.errors 
      });
    }
    
    const {
      contactId,
      accountId,
      recipientType,
      messageType,
      tone,
      length,
      customInstructions,
      channel,
      includeCTA,
      personalize
    } = validationResult.data;
    
    // Verify contact exists and belongs to user
    const contact = await Contact.findOne({
      _id: contactId,
      userId: req.user.id
    });
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found or unauthorized' });
    }
    
    // Verify account exists and belongs to user
    const account = await Account.findOne({
      _id: accountId,
      userId: req.user.id
    }).populate('meddppicc');
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found or unauthorized' });
    }
    
    // Prepare prompt for OpenAI
    const prompt = `
    Generate a personalized ${messageType} message for ${contact.firstName} ${contact.lastName}, who works as ${contact.title || 'a professional'} at ${contact.company}.
    
    The message should be sent via ${channel} and should have a ${tone} tone.
    Length should be ${length}.
    ${includeCTA ? 'Include a clear call to action.' : 'Do not include a call to action.'}
    ${personalize ? 'Personalize the message based on the recipient\'s information.' : ''}
    
    Company Information:
    - Company Name: ${account.name}
    - Industry: ${account.industry || 'N/A'}
    - Size: ${account.size || 'N/A'}
    - Website: ${account.website || 'N/A'}
    ${account.meddppicc ? `
    - Key Metrics: ${account.meddppicc.metrics || 'N/A'}
    - Economic Buyer: ${account.meddppicc.economicBuyer || 'N/A'}
    - Decision Criteria: ${account.meddppicc.decisionCriteria || 'N/A'}
    - Decision Process: ${account.meddppicc.decisionProcess || 'N/A'}
    - Paper Process: ${account.meddppicc.paperProcess || 'N/A'}
    - Identified Pain: ${account.meddppicc.identifiedPain || 'N/A'}
    - Champion: ${account.meddppicc.champion || 'N/A'}
    - Competition: ${account.meddppicc.competition || 'N/A'}
    ` : ''}
    
    Additional Notes:
    ${contact.notes || 'N/A'}
    
    ${customInstructions ? `Custom Instructions: ${customInstructions}` : ''}
    
    If this is an email, include a subject line.
    `;
    
    // Call OpenAI API to generate message
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert sales assistant that generates personalized messages for sales outreach. Your messages are professional, engaging, and tailored to the specific recipient and company information provided.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });
    
    const generatedContent = completion.choices[0].message.content;
    
    // Parse subject line if this is an email
    let subject = '';
    let content = generatedContent || '';
    
    if (channel === 'email' && content.includes('Subject:')) {
      const parts = content.split(/Subject:|SUBJECT:/);
      if (parts.length > 1) {
        const subjectLine = parts[1].split('\n')[0].trim();
        subject = subjectLine;
        content = content.replace(/Subject:.*\n/i, '').trim();
      }
    }
    
    // Create a draft message with the generated content
    const newMessage = new Message({
      userId: req.user.id,
      contactId,
      accountId,
      content,
      subject,
      channel,
      status: 'draft',
      direction: 'outbound',
      aiGenerated: true,
      aiPrompt: {
        recipientType,
        messageType,
        tone,
        length,
        customInstructions
      }
    });
    
    await newMessage.save();
    
    res.status(201).json({
      message: 'AI message generated successfully',
      messageData: newMessage
    });
  } catch (err) {
    console.error('Error generating message:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/messages/send
 * @desc Send a message
 * @access Private
 */
router.post('/send', async (req, res) => {
  try {
    // Validate request body
    const validationResult = messageValidators.send.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid send parameters', 
        errors: validationResult.error.errors 
      });
    }
    
    const { messageId, scheduledFor } = validationResult.data;
    
    // Check if message exists and belongs to user
    const message = await Message.findOne({
      _id: messageId,
      userId: req.user.id
    }).populate('contactId', 'email firstName lastName');
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Only allow sending draft messages
    if (message.status !== 'draft') {
      return res.status(400).json({ message: 'Message has already been sent or is in another state' });
    }
    
    // TODO: Implement actual message sending logic based on channel
    // This would integrate with email APIs, LinkedIn, etc.
    
    // For now, simulate sending by updating status
    if (scheduledFor && new Date(scheduledFor) > new Date()) {
      // Handle scheduled messages
      // TODO: Implement scheduler for future sending
      
      res.json({
        message: 'Message scheduled successfully',
        scheduledFor
      });
    } else {
      // Send now
      message.status = 'sent';
      message.sentAt = new Date();
      await message.save();
      
      res.json({
        message: 'Message sent successfully',
        sentAt: message.sentAt
      });
    }
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/messages/history/:contactId
 * @desc Get message history with a contact
 * @access Private
 */
router.get('/history/:contactId', async (req, res) => {
  try {
    // Verify contact exists and belongs to user
    const contact = await Contact.findOne({
      _id: req.params.contactId,
      userId: req.user.id
    });
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found or unauthorized' });
    }
    
    // Get message history with pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    
    // Find messages for this contact
    const messages = await Message.find({
      contactId: req.params.contactId,
      userId: req.user.id
    })
      .sort({ sentAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('accountId', 'name')
      .lean();
    
    // Get total count for pagination info
    const totalMessages = await Message.countDocuments({
      contactId: req.params.contactId,
      userId: req.user.id
    });
    
    // Group messages by thread
    const messagesByThread: Record<string, any[]> = {};
    
    messages.forEach(msg => {
      const threadId = msg.threadId || msg._id.toString();
      
      if (!messagesByThread[threadId]) {
        messagesByThread[threadId] = [];
      }
      
      messagesByThread[threadId].push(msg);
    });
    
    // Sort threads by most recent message
    const threads = Object.values(messagesByThread).map(thread => {
      thread.sort((a, b) => {
        const dateA = a.sentAt || a.createdAt;
        const dateB = b.sentAt || b.createdAt;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
      
      return {
        threadId: thread[0].threadId || thread[0]._id,
        messages: thread,
        lastMessageDate: thread[0].sentAt || thread[0].createdAt,
        subject: thread[0].subject
      };
    });
    
    threads.sort((a, b) => new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime());
    
    res.json({
      contactId: req.params.contactId,
      contactName: `${contact.firstName} ${contact.lastName}`,
      threads,
      pagination: {
        totalMessages,
        totalPages: Math.ceil(totalMessages / limit),
        currentPage: page,
        limit
      }
    });
  } catch (err) {
    console.error('Error fetching message history:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
