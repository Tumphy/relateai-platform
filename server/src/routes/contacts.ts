import express from 'express';
import { auth } from '../middleware/auth';
import Contact from '../models/contact';
import { contactValidators } from '../validators/contact';
import Account from '../models/account';
import mongoose from 'mongoose';

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

/**
 * @route GET /api/contacts
 * @desc Get all contacts with filtering options
 * @access Private
 */
router.get('/', async (req, res) => {
  try {
    // Validate and parse query parameters
    const validationResult = contactValidators.filter.safeParse(req.query);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid query parameters', 
        errors: validationResult.error.errors 
      });
    }
    
    const {
      accountId,
      status,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      tags,
      minIcpScore,
      maxIcpScore
    } = validationResult.data;
    
    // Build query
    const query: any = { userId: req.user.id };
    
    if (accountId) {
      query.accountId = new mongoose.Types.ObjectId(accountId);
    }
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }
    
    if (minIcpScore !== undefined || maxIcpScore !== undefined) {
      query.icpFit = {};
      
      if (minIcpScore !== undefined) {
        query.icpFit.score = { $gte: minIcpScore };
      }
      
      if (maxIcpScore !== undefined) {
        if (query.icpFit.score) {
          query.icpFit.score.$lte = maxIcpScore;
        } else {
          query.icpFit.score = { $lte: maxIcpScore };
        }
      }
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute query with pagination and sorting
    const contacts = await Contact.find(query)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .populate('accountId', 'name website')
      .lean();
    
    // Get total count for pagination info
    const totalContacts = await Contact.countDocuments(query);
    
    res.json({
      contacts,
      pagination: {
        totalContacts,
        totalPages: Math.ceil(totalContacts / limit),
        currentPage: page,
        limit
      }
    });
  } catch (err) {
    console.error('Error fetching contacts:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/contacts
 * @desc Create a new contact
 * @access Private
 */
router.post('/', async (req, res) => {
  try {
    // Validate request body
    const validationResult = contactValidators.create.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid contact data', 
        errors: validationResult.error.errors 
      });
    }
    
    const contactData = validationResult.data;
    
    // Verify account exists and belongs to user
    const account = await Account.findOne({
      _id: contactData.accountId,
      userId: req.user.id
    });
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found or unauthorized' });
    }
    
    // Check if contact with same email already exists
    const existingContact = await Contact.findOne({ email: contactData.email });
    
    if (existingContact) {
      return res.status(409).json({ message: 'Contact with this email already exists' });
    }
    
    // Create new contact
    const newContact = new Contact({
      ...contactData,
      userId: req.user.id
    });
    
    await newContact.save();
    
    res.status(201).json({
      message: 'Contact created successfully',
      contact: newContact
    });
  } catch (err) {
    console.error('Error creating contact:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/contacts/:id
 * @desc Get contact by ID
 * @access Private
 */
router.get('/:id', async (req, res) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('accountId', 'name website industry');
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    
    res.json(contact);
  } catch (err) {
    console.error('Error fetching contact:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route PUT /api/contacts/:id
 * @desc Update a contact
 * @access Private
 */
router.put('/:id', async (req, res) => {
  try {
    // Validate request body
    const validationResult = contactValidators.update.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid contact data', 
        errors: validationResult.error.errors 
      });
    }
    
    const contactData = validationResult.data;
    
    // Check if contact exists and belongs to user
    const contact = await Contact.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    
    // If email is being updated, check if it already exists on another contact
    if (contactData.email && contactData.email !== contact.email) {
      const existingContact = await Contact.findOne({ 
        email: contactData.email,
        _id: { $ne: contact._id }
      });
      
      if (existingContact) {
        return res.status(409).json({ message: 'Another contact with this email already exists' });
      }
    }
    
    // Update contact
    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      { $set: contactData },
      { new: true }
    ).populate('accountId', 'name website industry');
    
    res.json({
      message: 'Contact updated successfully',
      contact: updatedContact
    });
  } catch (err) {
    console.error('Error updating contact:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route DELETE /api/contacts/:id
 * @desc Delete a contact
 * @access Private
 */
router.delete('/:id', async (req, res) => {
  try {
    // Check if contact exists and belongs to user
    const contact = await Contact.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    
    // Delete contact
    await Contact.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Contact deleted successfully' });
  } catch (err) {
    console.error('Error deleting contact:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/contacts/discover
 * @desc Discover contacts using AI
 * @access Private
 */
router.post('/discover', async (req, res) => {
  try {
    // Validate request body
    const validationResult = contactValidators.discovery.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid discovery parameters', 
        errors: validationResult.error.errors 
      });
    }
    
    const { accountId, targetRoles, discoveryDepth, maxContacts } = validationResult.data;
    
    // Verify account exists and belongs to user
    const account = await Account.findOne({
      _id: accountId,
      userId: req.user.id
    });
    
    if (!account) {
      return res.status(404).json({ message: 'Account not found or unauthorized' });
    }
    
    // TODO: Implement AI-based contact discovery
    // This would integrate with OpenAI, LinkedIn scraping, etc.
    
    // For now, return a placeholder response
    res.json({
      message: 'Contact discovery initiated',
      status: 'pending',
      estimatedTime: '30-60 seconds',
      requestId: 'discovery-' + Math.random().toString(36).substring(2, 9)
    });
  } catch (err) {
    console.error('Error during contact discovery:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
