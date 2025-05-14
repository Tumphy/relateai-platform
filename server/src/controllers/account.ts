import { Request, Response } from 'express';
import Account from '../models/account';
import { asyncHandler } from '../middleware/error';
import pagination from '../utils/pagination';
import cache from '../utils/cache';
import logger from '../utils/logger';

/**
 * Get all accounts with pagination, filtering, and sorting
 * @route GET /api/accounts
 * @access Private
 */
export const getAccounts = asyncHandler(async (req: Request, res: Response) => {
  // Get pagination parameters
  const { page, limit, skip } = pagination.getPaginationParams(req);

  // Build filter query
  const filter: any = {};

  // Apply search filter if provided
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search as string, 'i');
    filter.$or = [
      { name: searchRegex },
      { description: searchRegex },
      { industry: searchRegex },
      { tags: searchRegex }
    ];
  }

  // Apply industry filter if provided
  if (req.query.industry) {
    filter.industry = new RegExp(req.query.industry as string, 'i');
  }

  // Apply size filter if provided
  if (req.query.size) {
    filter.size = new RegExp(req.query.size as string, 'i');
  }

  // Apply ICP score filter if provided
  if (req.query.icpScoreMin || req.query.icpScoreMax) {
    filter.icpScore = {};
    
    if (req.query.icpScoreMin) {
      filter.icpScore.$gte = parseInt(req.query.icpScoreMin as string);
    }
    
    if (req.query.icpScoreMax) {
      filter.icpScore.$lte = parseInt(req.query.icpScoreMax as string);
    }
  }

  // Apply tags filter if provided
  if (req.query.tags) {
    const tags = (req.query.tags as string).split(',');
    filter.tags = { $in: tags };
  }

  // Build sort options
  const sortField = req.query.sortBy || 'name';
  const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
  const sort: any = { [sortField as string]: sortOrder };

  // Generate cache key based on query parameters
  const cacheKey = `accounts:${JSON.stringify({ filter, sort, page, limit })}`;

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
    const total = await Account.countDocuments(filter);

    // Get accounts with pagination
    const accounts = await Account.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-__v')
      .lean();

    // Create pagination result
    const result = pagination.paginateResponse(accounts, total, page, limit);

    // Cache result for 5 minutes
    await cache.set(cacheKey, result, 300);

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
    logger.error('Error getting accounts', { error });
    throw error;
  }
});

/**
 * Get account by ID
 * @route GET /api/accounts/:id
 * @access Private
 */
export const getAccount = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Generate cache key
  const cacheKey = `account:${id}`;

  try {
    // Try to get from cache first
    const cachedAccount = await cache.get(cacheKey);
    if (cachedAccount) {
      return res.status(200).json({
        success: true,
        account: cachedAccount
      });
    }

    // Get account from database
    const account = await Account.findById(id).select('-__v').lean();

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    // Cache account for 10 minutes
    await cache.set(cacheKey, account, 600);

    return res.status(200).json({
      success: true,
      account
    });
  } catch (error) {
    logger.error('Error getting account', { error, accountId: id });
    throw error;
  }
});

/**
 * Create new account
 * @route POST /api/accounts
 * @access Private
 */
export const createAccount = asyncHandler(async (req: Request, res: Response) => {
  try {
    // Create new account
    const account = await Account.create(req.body);

    return res.status(201).json({
      success: true,
      account
    });
  } catch (error) {
    logger.error('Error creating account', { error });
    throw error;
  }
});

/**
 * Update account
 * @route PUT /api/accounts/:id
 * @access Private
 */
export const updateAccount = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Update account
    const account = await Account.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    // Invalidate cache
    const cacheKey = `account:${id}`;
    await cache.del(cacheKey);
    await cache.clear('accounts:*');

    return res.status(200).json({
      success: true,
      account
    });
  } catch (error) {
    logger.error('Error updating account', { error, accountId: id });
    throw error;
  }
});

/**
 * Delete account
 * @route DELETE /api/accounts/:id
 * @access Private
 */
export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Delete account
    const account = await Account.findByIdAndDelete(id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    // Invalidate cache
    const cacheKey = `account:${id}`;
    await cache.del(cacheKey);
    await cache.clear('accounts:*');

    return res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting account', { error, accountId: id });
    throw error;
  }
});

/**
 * Research account using AI
 * @route POST /api/accounts/research
 * @access Private
 */
export const researchAccount = asyncHandler(async (req: Request, res: Response) => {
  const { url, name } = req.body;

  try {
    // Create mock research data (in production, this would call an AI service)
    const researchData = {
      name: name || 'Acme Corporation',
      website: url || 'https://acme.com',
      industry: 'Technology',
      description: 'A leading provider of innovative solutions.',
      size: '1000-5000',
      location: 'San Francisco, CA',
      revenue: '$10M-$50M',
      tags: ['enterprise', 'technology'],
      technologies: ['AWS', 'React'],
      icpScore: 85
    };

    // Create new account with research data
    const account = await Account.create(researchData);

    // Invalidate accounts cache
    await cache.clear('accounts:*');

    return res.status(201).json({
      success: true,
      account
    });
  } catch (error) {
    logger.error('Error researching account', { error, url, name });
    throw error;
  }
});

export default {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  researchAccount
};
