import { Request, Response } from 'express';
import Message from '../models/message';
import Contact from '../models/contact';
import { asyncHandler } from '../middleware/error';
import pagination from '../utils/pagination';
import cache from '../utils/cache';
import logger from '../utils/logger';

/**
 * Get all messages with pagination, filtering, and sorting
 * @route GET /api/messages
 * @access Private
 */
export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  // Get pagination parameters
  const { page, limit, skip } = pagination.getPaginationParams(req);

  // Build filter query
  const filter: any = {};

  // Apply userId filter (usually the current user)
  if (req.query.userId) {
    filter.userId = req.query.userId;
  }

  // Apply contactId filter
  if (req.query.contactId) {
    filter.contactId = req.query.contactId;
  }

  // Apply accountId filter
  if (req.query.accountId) {
    filter.accountId = req.query.accountId;
  }

  // Apply status filter
  if (req.query.status) {
    if (Array.isArray(req.query.status)) {
      filter.status = { $in: req.query.status };
    } else {
      filter.status = req.query.status;
    }
  }

  // Apply direction filter
  if (req.query.direction) {
    filter.direction = req.query.direction;
  }

  // Apply channel filter
  if (req.query.channel) {
    if (Array.isArray(req.query.channel)) {
      filter.channel = { $in: req.query.channel };
    } else {
      filter.channel = req.query.channel;
    }
  }

  // Apply date range filters
  if (req.query.from || req.query.to) {
    filter.createdAt = {};
    
    if (req.query.from) {
      filter.createdAt.$gte = new Date(req.query.from as string);
    }
    
    if (req.query.to) {
      filter.createdAt.$lte = new Date(req.query.to as string);
    }
  }

  // Apply search filter
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search as string, 'i');
    filter.$or = [
      { subject: searchRegex },
      { content: searchRegex }
    ];
  }

  // Build sort options
  const sortField = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  const sort: any = { [sortField as string]: sortOrder };

  // Generate cache key based on query parameters
  const cacheKey = `messages:${JSON.stringify({ filter, sort, page, limit })}`;

  try {
    // Try to get from cache first
    const cachedResult = await cache.get(cacheKey);
    if (cachedResult) {
      // Set Link headers for pagination
      const headers = pagination.paginationLinks(
        req,
        cachedResult.pagination.total,
        cachedResult.pagination.page,
        cachedResult.pagination.limit
      );
      
      Object.entries(headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
      
      return res.status(200).json({
        success: true,
        ...cachedResult
      });
    }

    // Get total count (use projection for performance)
    const total = await Message.countDocuments(filter);

    // Get messages with pagination and populate contact and account info
    const messages = await Message.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('contactId', 'firstName lastName email')
      .populate('accountId', 'name')
      .select('-__v')
      .lean();

    // Create pagination result
    const result = pagination.paginateResponse(messages, total, page, limit);

    // Cache result for 2 minutes (messages change more frequently)
    await cache.set(cacheKey, result, 120);

    // Set Link headers for pagination
    const headers = pagination.paginationLinks(req, total, page, limit);
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Return paginated results
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Error getting messages', { error });
    throw error;
  }
});

/**
 * Get message by ID
 * @route GET /api/messages/:id
 * @access Private
 */
export const getMessage = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Generate cache key
  const cacheKey = `message:${id}`;

  try {
    // Try to get from cache first
    const cachedMessage = await cache.get(cacheKey);
    if (cachedMessage) {
      return res.status(200).json({
        success: true,
        message: cachedMessage
      });
    }

    // Get message from database
    const message = await Message.findById(id)
      .populate('contactId', 'firstName lastName email')
      .populate('accountId', 'name')
      .select('-__v')
      .lean();

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Cache message for 5 minutes
    await cache.set(cacheKey, message, 300);

    return res.status(200).json({
      success: true,
      message
    });
  } catch (error) {
    logger.error('Error getting message', { error, messageId: id });
    throw error;
  }
});

/**
 * Create new message
 * @route POST /api/messages
 * @access Private
 */
export const createMessage = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Create new message
    const message = await Message.create(req.body);

    // Invalidate messages cache
    await cache.clear('messages:*');

    return res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    logger.error('Error creating message', { error });
    throw error;
  }
});

/**
 * Update message
 * @route PUT /api/messages/:id
 * @access Private
 */
export const updateMessage = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Update message
    const message = await Message.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Invalidate cache
    const cacheKey = `message:${id}`;
    await cache.del(cacheKey);
    await cache.clear('messages:*');

    return res.status(200).json({
      success: true,
      message
    });
  } catch (error) {
    logger.error('Error updating message', { error, messageId: id });
    throw error;
  }
});

/**
 * Delete message
 * @route DELETE /api/messages/:id
 * @access Private
 */
export const deleteMessage = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Delete message
    const message = await Message.findByIdAndDelete(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Invalidate cache
    const cacheKey = `message:${id}`;
    await cache.del(cacheKey);
    await cache.clear('messages:*');

    return res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting message', { error, messageId: id });
    throw error;
  }
});

/**
 * Get message history for a contact
 * @route GET /api/messages/history/:contactId
 * @access Private
 */
export const getMessageHistory = asyncHandler(async (req: Request, res: Response) => {
  const { contactId } = req.params;

  // Get pagination parameters
  const { page, limit, skip } = pagination.getPaginationParams(req);

  // Generate cache key
  const cacheKey = `messageHistory:${contactId}:${page}:${limit}`;

  try {
    // Try to get from cache first
    const cachedResult = await cache.get(cacheKey);
    if (cachedResult) {
      // Set Link headers for pagination
      const headers = pagination.paginationLinks(
        req,
        cachedResult.pagination.total,
        cachedResult.pagination.page,
        cachedResult.pagination.limit
      );
      
      Object.entries(headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
      
      return res.status(200).json({
        success: true,
        ...cachedResult
      });
    }

    // Check if contact exists
    const contact = await Contact.exists({ _id: contactId });
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Build filter
    const filter = { contactId };

    // Get total count
    const total = await Message.countDocuments(filter);

    // Get message history with threading
    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('contactId', 'firstName lastName email')
      .populate('accountId', 'name')
      .select('-__v')
      .lean();

    // Group messages by thread
    const messagesByThread: Record<string, any[]> = {};
    
    messages.forEach(message => {
      const threadId = message.threadId || message._id;
      if (!messagesByThread[threadId]) {
        messagesByThread[threadId] = [];
      }
      messagesByThread[threadId].push(message);
    });

    // Sort messages within each thread by createdAt
    Object.keys(messagesByThread).forEach(threadId => {
      messagesByThread[threadId].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });

    // Flatten and prepare result
    const threadedMessages = Object.values(messagesByThread)
      .map(thread => {
        const firstMessage = thread[0];
        return {
          threadId: firstMessage.threadId || firstMessage._id,
          subject: firstMessage.subject,
          messages: thread,
          lastUpdated: thread[thread.length - 1].createdAt
        };
      })
      .sort((a, b) => 
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      );

    // Create pagination result
    const result = pagination.paginateResponse(threadedMessages, total, page, limit);

    // Cache result for 2 minutes
    await cache.set(cacheKey, result, 120);

    // Set Link headers for pagination
    const headers = pagination.paginationLinks(req, total, page, limit);
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Error getting message history', { error, contactId });
    throw error;
  }
});

/**
 * Generate a message using AI
 * @route POST /api/messages/generate
 * @access Private
 */
export const generateMessage = asyncHandler(async (req: Request, res: Response) => {
  const {
    contactId,
    accountId,
    recipientType,
    messageType,
    tone,
    length,
    customInstructions,
    channel = 'email'
  } = req.body;

  try {
    // Check if contact exists
    const contact = await Contact.findById(contactId).select('firstName lastName email').lean();
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // In a real implementation, this would call OpenAI or similar
    // For this example, use a mock generated message
    const generatedContent = `
      <p>Hello ${contact.firstName},</p>
      <p>I hope this message finds you well. I wanted to reach out about our innovative solution that can help your team...</p>
      <p>Would you be available for a brief call next week to discuss this further?</p>
      <p>Best regards,</p>
      <p>Sales Team</p>
    `;

    // Create message object
    const message = await Message.create({
      userId: req.body.userId || 'user-123', // In reality, get from authenticated user
      contactId,
      accountId,
      subject: `Follow-up: ${messageType}`,
      content: generatedContent.trim(),
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

    // Invalidate messages cache
    await cache.clear('messages:*');

    return res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    logger.error('Error generating message', { error });
    throw error;
  }
});

export default {
  getMessages,
  getMessage,
  createMessage,
  updateMessage,
  deleteMessage,
  getMessageHistory,
  generateMessage
};
