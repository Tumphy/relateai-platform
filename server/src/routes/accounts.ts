import express from 'express';
import Account from '../models/account';
import { auth } from '../middleware/auth';
import mongoose from 'mongoose';

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

/**
 * @route GET /api/accounts
 * @desc Get all accounts
 * @access Private
 */
router.get('/', async (req, res) => {
  try {
    const accounts = await Account.find({ owner: req.userId })
      .sort({ icpScore: -1 })
      .select('-__v');
    
    res.json({ accounts });
  } catch (err) {
    console.error('Error fetching accounts:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/accounts/:id
 * @desc Get account by ID
 * @access Private
 */
router.get('/:id', async (req, res) => {
  try {
    const account = await Account.findOne({
      _id: req.params.id,
      owner: req.userId
    }).select('-__v');

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.json({ account });
  } catch (err) {
    console.error('Error fetching account:', err);
    if (err instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: 'Invalid account ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/accounts
 * @desc Create a new account
 * @access Private
 */
router.post('/', async (req, res) => {
  try {
    const {
      name,
      website,
      industry,
      description,
      size,
      location,
      revenue,
      technologies,
      tags,
      icpScore,
      status,
      notes
    } = req.body;

    // Create new account
    const newAccount = new Account({
      name,
      website,
      industry,
      description,
      size,
      location,
      revenue,
      technologies,
      tags,
      icpScore,
      status,
      notes,
      owner: req.userId
    });

    const account = await newAccount.save();

    res.status(201).json({
      message: 'Account created successfully',
      account
    });
  } catch (err) {
    console.error('Error creating account:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route PUT /api/accounts/:id
 * @desc Update an account
 * @access Private
 */
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      website,
      industry,
      description,
      size,
      location,
      revenue,
      technologies,
      tags,
      icpScore,
      status,
      notes
    } = req.body;

    // Find account and check ownership
    let account = await Account.findOne({
      _id: req.params.id,
      owner: req.userId
    });

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Update account fields
    account.name = name || account.name;
    account.website = website || account.website;
    account.industry = industry || account.industry;
    account.description = description || account.description;
    account.size = size || account.size;
    account.location = location || account.location;
    account.revenue = revenue || account.revenue;
    account.technologies = technologies || account.technologies;
    account.tags = tags || account.tags;
    account.icpScore = icpScore || account.icpScore;
    account.status = status || account.status;
    account.notes = notes || account.notes;

    // Save updated account
    await account.save();

    res.json({
      message: 'Account updated successfully',
      account
    });
  } catch (err) {
    console.error('Error updating account:', err);
    if (err instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: 'Invalid account ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route DELETE /api/accounts/:id
 * @desc Delete an account
 * @access Private
 */
router.delete('/:id', async (req, res) => {
  try {
    // Find account and check ownership
    const account = await Account.findOne({
      _id: req.params.id,
      owner: req.userId
    });

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Delete account
    await account.deleteOne();

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Error deleting account:', err);
    if (err instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: 'Invalid account ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;