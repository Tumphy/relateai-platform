import express from 'express';
import axios from 'axios';
import OpenAI from 'openai';
import Account from '../models/account';
import Meddppicc from '../models/meddppicc';
import { auth } from '../middleware/auth';

const router = express.Router();

// Initialize OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Apply auth middleware to all routes
router.use(auth);

/**
 * @route POST /api/research/account
 * @desc Research company from website and generate account data
 * @access Private
 */
router.post('/account', async (req, res) => {
  try {
    const { url, name } = req.body;

    if (!url && !name) {
      return res.status(400).json({ message: 'URL or company name is required' });
    }

    // Generate research query
    const query = name || new URL(url).hostname.replace('www.', '');

    // First, gather publicly available information
    const companyData = await researchCompany(query);
    
    // Create a new account with the researched data
    const newAccount = new Account({
      name: companyData.name,
      website: companyData.website || url,
      industry: companyData.industry,
      description: companyData.description,
      size: companyData.size,
      location: companyData.location,
      revenue: companyData.revenue,
      technologies: companyData.technologies || [],
      tags: companyData.tags || [],
      icpScore: 0, // Will be calculated later based on ICP model
      status: 'Researching',
      notes: companyData.notes,
      owner: req.userId
    });

    // Save the account
    const account = await newAccount.save();

    // Generate MEDDPPICC assessment
    const meddppiccData = await generateMeddppiccAssessment(companyData);
    
    // Create MEDDPPICC assessment
    const newMeddppicc = new Meddppicc({
      account: account._id,
      metrics: meddppiccData.metrics,
      economicBuyer: meddppiccData.economicBuyer,
      decisionCriteria: meddppiccData.decisionCriteria,
      decisionProcess: meddppiccData.decisionProcess,
      paperProcess: meddppiccData.paperProcess,
      identifiedPain: meddppiccData.identifiedPain,
      champion: meddppiccData.champion,
      competition: meddppiccData.competition,
      nextSteps: meddppiccData.nextSteps || [],
      dealNotes: meddppiccData.dealNotes || '',
      lastUpdatedBy: req.userId
    });

    // Save MEDDPPICC assessment
    const assessment = await newMeddppicc.save();

    res.status(201).json({
      message: 'Account researched and created successfully',
      account,
      assessment
    });
  } catch (err) {
    console.error('Error researching account:', err);
    res.status(500).json({ 
      message: 'Error researching account',
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/research/meddppicc/:accountId
 * @desc Generate MEDDPPICC assessment for an existing account
 * @access Private
 */
router.post('/meddppicc/:accountId', async (req, res) => {
  try {
    // Find account and check ownership
    const account = await Account.findOne({
      _id: req.params.accountId,
      owner: req.userId
    });

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Check if MEDDPPICC assessment already exists
    const existingAssessment = await Meddppicc.findOne({
      account: req.params.accountId
    });

    if (existingAssessment) {
      return res.status(400).json({ message: 'MEDDPPICC assessment already exists for this account' });
    }

    // Generate MEDDPPICC assessment
    const companyData = {
      name: account.name,
      website: account.website,
      industry: account.industry,
      description: account.description,
      size: account.size,
      location: account.location,
      revenue: account.revenue,
      technologies: account.technologies,
      tags: account.tags
    };
    
    const meddppiccData = await generateMeddppiccAssessment(companyData);
    
    // Create new MEDDPPICC assessment
    const newMeddppicc = new Meddppicc({
      account: account._id,
      metrics: meddppiccData.metrics,
      economicBuyer: meddppiccData.economicBuyer,
      decisionCriteria: meddppiccData.decisionCriteria,
      decisionProcess: meddppiccData.decisionProcess,
      paperProcess: meddppiccData.paperProcess,
      identifiedPain: meddppiccData.identifiedPain,
      champion: meddppiccData.champion,
      competition: meddppiccData.competition,
      nextSteps: meddppiccData.nextSteps || [],
      dealNotes: meddppiccData.dealNotes || '',
      lastUpdatedBy: req.userId
    });

    // Save MEDDPPICC assessment
    const assessment = await newMeddppicc.save();

    res.status(201).json({
      message: 'MEDDPPICC assessment generated successfully',
      assessment
    });
  } catch (err) {
    console.error('Error generating MEDDPPICC assessment:', err);
    res.status(500).json({ 
      message: 'Error generating MEDDPPICC assessment',
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

/**
 * @route POST /api/research/icp/:accountId
 * @desc Calculate ICP score for an account
 * @access Private
 */
router.post('/icp/:accountId', async (req, res) => {
  try {
    // Find account and check ownership
    const account = await Account.findOne({
      _id: req.params.accountId,
      owner: req.userId
    });

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // In a real implementation, this would use a more sophisticated ICP model
    // For now, we'll use a simple scoring mechanism
    const icpScore = calculateIcpScore(account);
    
    // Update account with ICP score
    account.icpScore = icpScore;
    await account.save();

    res.json({
      message: 'ICP score calculated successfully',
      score: icpScore,
      account
    });
  } catch (err) {
    console.error('Error calculating ICP score:', err);
    res.status(500).json({ 
      message: 'Error calculating ICP score',
      error: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

/**
 * Research company information from public sources
 * @param query Company name or website domain
 * @returns Structured company data
 */
async function researchCompany(query: string) {
  try {
    // In a real implementation, this would use multiple data sources
    // For this example, we'll use the OpenAI API to generate mock data
    
    const prompt = `Research the company "${query}" and provide the following information in JSON format:
    {
      "name": "Full company name",
      "website": "Company website URL",
      "industry": "Main industry",
      "description": "Brief company description",
      "size": "Employee count range (e.g., '1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+')",
      "location": "HQ location",
      "revenue": "Annual revenue range or exact if known",
      "technologies": ["List", "of", "technologies", "used"],
      "tags": ["Relevant", "tags"],
      "notes": "Any additional relevant information"
    }
    
    If you can't find specific information, use "Unknown" as the value. For technologies and tags, provide empty arrays if unknown.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const response = completion.choices[0].message.content?.trim() || '';
    
    // Extract JSON from response
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || 
                     response.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0].replace(/```json\n|\n```/g, ''));
    }
    
    // Fallback to parsing the whole response if no JSON block is found
    return JSON.parse(response);
  } catch (error) {
    console.error('Error researching company:', error);
    // Return a basic structure with default values
    return {
      name: query,
      website: '',
      industry: 'Unknown',
      description: 'No description available',
      size: 'Unknown',
      location: 'Unknown',
      revenue: 'Unknown',
      technologies: [],
      tags: [],
      notes: 'Error occurred during research'
    };
  }
}

/**
 * Generate MEDDPPICC assessment based on company data
 * @param companyData Company information
 * @returns MEDDPPICC assessment data
 */
async function generateMeddppiccAssessment(companyData: any) {
  try {
    const prompt = `Based on the following company information, generate a MEDDPPICC sales qualification framework assessment in JSON format:
    
    Company: ${JSON.stringify(companyData)}
    
    Return a JSON object with the following structure:
    {
      "metrics": {
        "score": 1-3 (integer),
        "notes": "Assessment of metrics",
        "confidence": "low/medium/high"
      },
      "economicBuyer": {
        "score": 1-3 (integer),
        "notes": "Assessment of economic buyer",
        "confidence": "low/medium/high"
      },
      "decisionCriteria": {
        "score": 1-3 (integer),
        "notes": "Assessment of decision criteria",
        "confidence": "low/medium/high"
      },
      "decisionProcess": {
        "score": 1-3 (integer),
        "notes": "Assessment of decision process",
        "confidence": "low/medium/high"
      },
      "paperProcess": {
        "score": 1-3 (integer),
        "notes": "Assessment of paper process",
        "confidence": "low/medium/high"
      },
      "identifiedPain": {
        "score": 1-3 (integer),
        "notes": "Assessment of identified pain",
        "confidence": "low/medium/high"
      },
      "champion": {
        "score": 1-3 (integer),
        "notes": "Assessment of champion",
        "confidence": "low/medium/high"
      },
      "competition": {
        "score": 1-3 (integer),
        "notes": "Assessment of competition",
        "confidence": "low/medium/high"
      },
      "nextSteps": [
        {
          "text": "First next step",
          "dueDate": "2025-05-20T00:00:00.000Z"
        },
        {
          "text": "Second next step",
          "dueDate": "2025-05-25T00:00:00.000Z"
        }
      ],
      "dealNotes": "Overall notes about the deal"
    }
    
    Given the limited information provided, scores should generally start low (1-2) with appropriate confidence levels.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const response = completion.choices[0].message.content?.trim() || '';
    
    // Extract JSON from response
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || 
                     response.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0].replace(/```json\n|\n```/g, ''));
    }
    
    // Fallback to parsing the whole response if no JSON block is found
    return JSON.parse(response);
  } catch (error) {
    console.error('Error generating MEDDPPICC assessment:', error);
    // Return a basic structure with default values
    return {
      metrics: { score: 1, notes: 'Insufficient data', confidence: 'low' },
      economicBuyer: { score: 1, notes: 'Insufficient data', confidence: 'low' },
      decisionCriteria: { score: 1, notes: 'Insufficient data', confidence: 'low' },
      decisionProcess: { score: 1, notes: 'Insufficient data', confidence: 'low' },
      paperProcess: { score: 1, notes: 'Insufficient data', confidence: 'low' },
      identifiedPain: { score: 1, notes: 'Insufficient data', confidence: 'low' },
      champion: { score: 1, notes: 'Insufficient data', confidence: 'low' },
      competition: { score: 1, notes: 'Insufficient data', confidence: 'low' },
      nextSteps: [
        { text: 'Research company leadership', dueDate: new Date().toISOString() },
        { text: 'Identify potential pain points', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      dealNotes: 'Initial assessment based on limited information'
    };
  }
}

/**
 * Calculate ICP score based on account data
 * @param account Account data
 * @returns ICP score (0-100)
 */
function calculateIcpScore(account: any): number {
  // This is a simplified scoring mechanism
  // In a real implementation, this would use a trained ML model
  
  let score = 50; // Start with a neutral score

  // Industry match
  const targetIndustries = ['Technology', 'Software', 'Financial Services', 'Healthcare', 'E-commerce'];
  if (account.industry && targetIndustries.includes(account.industry)) {
    score += 10;
  }

  // Size match
  if (account.size && account.size.includes('1000+')) {
    score += 10;
  } else if (account.size && account.size.includes('500+')) {
    score += 5;
  }

  // Technology match
  const targetTechnologies = ['AWS', 'Azure', 'GCP', 'React', 'Node.js', 'Python', 'TensorFlow'];
  const techMatches = account.technologies.filter((tech: string) => 
    targetTechnologies.includes(tech)
  ).length;
  
  score += Math.min(techMatches * 5, 15);

  // Location match
  const targetLocations = ['United States', 'Canada', 'United Kingdom', 'Europe'];
  if (account.location) {
    for (const location of targetLocations) {
      if (account.location.includes(location)) {
        score += 5;
        break;
      }
    }
  }

  // Revenue match
  if (account.revenue && account.revenue.includes('$50M+')) {
    score += 10;
  } else if (account.revenue && account.revenue.includes('$10M+')) {
    score += 5;
  }

  // Tag match
  const targetTags = ['AI', 'Machine Learning', 'SaaS', 'Cloud', 'Enterprise'];
  const tagMatches = account.tags.filter((tag: string) => 
    targetTags.includes(tag)
  ).length;
  
  score += Math.min(tagMatches * 5, 10);

  // Ensure score is within range
  return Math.max(0, Math.min(score, 100));
}

export default router;