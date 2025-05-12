import express from 'express';
import mongoose from 'mongoose';
import Meddppicc from '../models/meddppicc';
import Account from '../models/account';
import { auth } from '../middleware/auth';

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

/**
 * @route GET /api/meddppicc/:accountId
 * @desc Get MEDDPPICC assessment for an account
 * @access Private
 */
router.get('/:accountId', async (req, res) => {
  try {
    // Check if account exists and belongs to user
    const account = await Account.findOne({
      _id: req.params.accountId,
      owner: req.userId
    });

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Find the MEDDPPICC assessment
    const assessment = await Meddppicc.findOne({
      account: req.params.accountId
    }).select('-__v');

    if (!assessment) {
      return res.status(404).json({ message: 'MEDDPPICC assessment not found' });
    }

    res.json({ assessment });
  } catch (err) {
    console.error('Error fetching MEDDPPICC assessment:', err);
    if (err instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: 'Invalid account ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/meddppicc/:accountId
 * @desc Create MEDDPPICC assessment for an account
 * @access Private
 */
router.post('/:accountId', async (req, res) => {
  try {
    // Check if account exists and belongs to user
    const account = await Account.findOne({
      _id: req.params.accountId,
      owner: req.userId
    });

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Check if assessment already exists
    const existingAssessment = await Meddppicc.findOne({
      account: req.params.accountId
    });

    if (existingAssessment) {
      return res.status(400).json({ message: 'MEDDPPICC assessment already exists for this account' });
    }

    // Extract assessment fields from request body
    const {
      metrics,
      economicBuyer,
      decisionCriteria,
      decisionProcess,
      paperProcess,
      identifiedPain,
      champion,
      competition,
      nextSteps,
      dealNotes
    } = req.body;

    // Create new assessment
    const newAssessment = new Meddppicc({
      account: req.params.accountId,
      metrics,
      economicBuyer,
      decisionCriteria,
      decisionProcess,
      paperProcess,
      identifiedPain,
      champion,
      competition,
      nextSteps,
      dealNotes,
      lastUpdatedBy: req.userId
    });

    // Save assessment
    const assessment = await newAssessment.save();

    res.status(201).json({
      message: 'MEDDPPICC assessment created successfully',
      assessment
    });
  } catch (err) {
    console.error('Error creating MEDDPPICC assessment:', err);
    if (err instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: 'Invalid account ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route PUT /api/meddppicc/:accountId
 * @desc Update MEDDPPICC assessment for an account
 * @access Private
 */
router.put('/:accountId', async (req, res) => {
  try {
    // Check if account exists and belongs to user
    const account = await Account.findOne({
      _id: req.params.accountId,
      owner: req.userId
    });

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Find assessment
    let assessment = await Meddppicc.findOne({
      account: req.params.accountId
    });

    if (!assessment) {
      return res.status(404).json({ message: 'MEDDPPICC assessment not found' });
    }

    // Extract updated fields
    const {
      metrics,
      economicBuyer,
      decisionCriteria,
      decisionProcess,
      paperProcess,
      identifiedPain,
      champion,
      competition,
      nextSteps,
      dealNotes
    } = req.body;

    // Update assessment fields
    if (metrics) assessment.metrics = metrics;
    if (economicBuyer) assessment.economicBuyer = economicBuyer;
    if (decisionCriteria) assessment.decisionCriteria = decisionCriteria;
    if (decisionProcess) assessment.decisionProcess = decisionProcess;
    if (paperProcess) assessment.paperProcess = paperProcess;
    if (identifiedPain) assessment.identifiedPain = identifiedPain;
    if (champion) assessment.champion = champion;
    if (competition) assessment.competition = competition;
    if (nextSteps) assessment.nextSteps = nextSteps;
    if (dealNotes) assessment.dealNotes = dealNotes;
    
    // Update lastUpdatedBy
    assessment.lastUpdatedBy = req.userId;

    // Save updated assessment
    await assessment.save();

    res.json({
      message: 'MEDDPPICC assessment updated successfully',
      assessment
    });
  } catch (err) {
    console.error('Error updating MEDDPPICC assessment:', err);
    if (err instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: 'Invalid account ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route DELETE /api/meddppicc/:accountId
 * @desc Delete MEDDPPICC assessment for an account
 * @access Private
 */
router.delete('/:accountId', async (req, res) => {
  try {
    // Check if account exists and belongs to user
    const account = await Account.findOne({
      _id: req.params.accountId,
      owner: req.userId
    });

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Find and delete assessment
    const assessment = await Meddppicc.findOneAndDelete({
      account: req.params.accountId
    });

    if (!assessment) {
      return res.status(404).json({ message: 'MEDDPPICC assessment not found' });
    }

    res.json({ message: 'MEDDPPICC assessment deleted successfully' });
  } catch (err) {
    console.error('Error deleting MEDDPPICC assessment:', err);
    if (err instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: 'Invalid account ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/meddppicc/:accountId/next-steps
 * @desc Add a next step to the MEDDPPICC assessment
 * @access Private
 */
router.post('/:accountId/next-steps', async (req, res) => {
  try {
    // Check if account exists and belongs to user
    const account = await Account.findOne({
      _id: req.params.accountId,
      owner: req.userId
    });

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Find assessment
    const assessment = await Meddppicc.findOne({
      account: req.params.accountId
    });

    if (!assessment) {
      return res.status(404).json({ message: 'MEDDPPICC assessment not found' });
    }

    // Extract next step details
    const { text, dueDate } = req.body;

    if (!text || !dueDate) {
      return res.status(400).json({ message: 'Text and due date are required' });
    }

    // Add next step
    assessment.nextSteps.push({
      text,
      dueDate: new Date(dueDate),
      completed: false
    });

    // Update lastUpdatedBy
    assessment.lastUpdatedBy = req.userId;

    // Save updated assessment
    await assessment.save();

    res.json({
      message: 'Next step added successfully',
      assessment
    });
  } catch (err) {
    console.error('Error adding next step:', err);
    if (err instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: 'Invalid account ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route PUT /api/meddppicc/:accountId/next-steps/:stepIndex
 * @desc Update a next step in the MEDDPPICC assessment
 * @access Private
 */
router.put('/:accountId/next-steps/:stepIndex', async (req, res) => {
  try {
    // Check if account exists and belongs to user
    const account = await Account.findOne({
      _id: req.params.accountId,
      owner: req.userId
    });

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Find assessment
    const assessment = await Meddppicc.findOne({
      account: req.params.accountId
    });

    if (!assessment) {
      return res.status(404).json({ message: 'MEDDPPICC assessment not found' });
    }

    // Check if step index is valid
    const stepIndex = parseInt(req.params.stepIndex);
    if (isNaN(stepIndex) || stepIndex < 0 || stepIndex >= assessment.nextSteps.length) {
      return res.status(404).json({ message: 'Next step not found' });
    }

    // Extract updated step details
    const { text, dueDate, completed } = req.body;

    // Update step fields
    if (text) assessment.nextSteps[stepIndex].text = text;
    if (dueDate) assessment.nextSteps[stepIndex].dueDate = new Date(dueDate);
    if (completed !== undefined) assessment.nextSteps[stepIndex].completed = completed;

    // Update lastUpdatedBy
    assessment.lastUpdatedBy = req.userId;

    // Save updated assessment
    await assessment.save();

    res.json({
      message: 'Next step updated successfully',
      assessment
    });
  } catch (err) {
    console.error('Error updating next step:', err);
    if (err instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: 'Invalid account ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;