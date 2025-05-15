import { Request, Response } from 'express';
import { linkedInService } from '../services/linkedin.service';
import { 
  LinkedInIntegration, 
  LinkedInConnection,
  LinkedInMessage 
} from '../models/linkedin';
import { Contact } from '../models/contact';
import crypto from 'crypto';

/**
 * Generate an OAuth authorization URL for LinkedIn
 */
export const getAuthUrl = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    // Generate a random state value for CSRF protection
    const state = crypto.randomBytes(16).toString('hex');
    
    // Store the state in the session or a temporary token
    // In a real implementation, this should be stored securely and validated when callback is received
    
    // Generate the authorization URL
    const authUrl = linkedInService.getAuthorizationUrl(state);
    
    return res.status(200).json({
      success: true,
      authUrl
    });
  } catch (error) {
    console.error('Error generating LinkedIn auth URL:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate LinkedIn authorization URL'
    });
  }
};

/**
 * Handle the callback from LinkedIn OAuth
 */
export const handleCallback = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { code, state } = req.query;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is missing'
      });
    }
    
    // Validate state parameter (anti-CSRF)
    // In a real implementation, this should be validated against the state generated in getAuthUrl
    
    // Exchange the code for an access token
    const tokenData = await linkedInService.getAccessToken(code as string);
    
    // Calculate token expiration date
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);
    
    // Get user profile from LinkedIn
    const profile = await linkedInService.getProfile(tokenData.access_token);
    
    // Check if the user already has a LinkedIn integration
    let integration = await LinkedInIntegration.findOne({ userId });
    
    if (integration) {
      // Update existing integration
      integration.accessToken = tokenData.access_token;
      integration.refreshToken = tokenData.refresh_token || integration.refreshToken;
      integration.expiresAt = expiresAt;
      integration.firstName = profile.localizedFirstName;
      integration.lastName = profile.localizedLastName;
      integration.headline = profile.headline;
      integration.industry = profile.industry;
      integration.email = profile.email;
      integration.lastSyncAt = new Date();
      
      await integration.save();
    } else {
      // Create a new integration
      integration = new LinkedInIntegration({
        userId,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt,
        linkedInId: profile.id,
        profileUrl: `https://www.linkedin.com/in/${profile.vanityName || profile.id}`,
        firstName: profile.localizedFirstName,
        lastName: profile.localizedLastName,
        headline: profile.headline,
        industry: profile.industry,
        email: profile.email,
        pictureUrl: profile.profilePicture?.displayImage || '',
        lastSyncAt: new Date()
      });
      
      await integration.save();
    }
    
    return res.status(200).json({
      success: true,
      message: 'LinkedIn integration successful',
      integration: {
        id: integration._id,
        firstName: integration.firstName,
        lastName: integration.lastName,
        profileUrl: integration.profileUrl
      }
    });
  } catch (error) {
    console.error('Error handling LinkedIn callback:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete LinkedIn integration'
    });
  }
};

/**
 * Get the current user's LinkedIn integration status
 */
export const getIntegrationStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    // Find the user's LinkedIn integration
    const integration = await LinkedInIntegration.findOne({ userId });
    
    if (!integration) {
      return res.status(200).json({
        success: true,
        integrated: false
      });
    }
    
    return res.status(200).json({
      success: true,
      integrated: true,
      integration: {
        id: integration._id,
        firstName: integration.firstName,
        lastName: integration.lastName,
        profileUrl: integration.profileUrl,
        headline: integration.headline,
        lastSyncAt: integration.lastSyncAt
      }
    });
  } catch (error) {
    console.error('Error getting LinkedIn integration status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get LinkedIn integration status'
    });
  }
};

/**
 * Disconnect LinkedIn integration
 */
export const disconnectIntegration = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    // Find and remove the user's LinkedIn integration
    const result = await LinkedInIntegration.deleteOne({ userId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'LinkedIn integration not found'
      });
    }
    
    // Optionally: Remove or update related connections and messages
    
    return res.status(200).json({
      success: true,
      message: 'LinkedIn integration disconnected successfully'
    });
  } catch (error) {
    console.error('Error disconnecting LinkedIn integration:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to disconnect LinkedIn integration'
    });
  }
};

/**
 * Sync LinkedIn connections with contacts
 */
export const syncConnections = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    // Find the user's LinkedIn integration
    const integration = await LinkedInIntegration.findOne({ userId });
    
    if (!integration) {
      return res.status(404).json({
        success: false,
        message: 'LinkedIn integration not found'
      });
    }
    
    // Check if the token is expired
    if (integration.isTokenExpired()) {
      // Refresh the token
      if (!integration.refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'LinkedIn access token expired and no refresh token available'
        });
      }
      
      try {
        const tokenData = await linkedInService.refreshToken(integration.refreshToken);
        
        // Update token information
        integration.accessToken = tokenData.access_token;
        integration.refreshToken = tokenData.refresh_token || integration.refreshToken;
        
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);
        integration.expiresAt = expiresAt;
        
        await integration.save();
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Failed to refresh LinkedIn access token'
        });
      }
    }
    
    // In a real implementation, this would:
    // 1. Fetch the user's LinkedIn connections
    // 2. Match them with existing contacts or create new ones
    // 3. Create or update LinkedInConnection records
    
    // For this example, we'll simulate a successful synchronization
    integration.lastSyncAt = new Date();
    await integration.save();
    
    return res.status(200).json({
      success: true,
      message: 'LinkedIn connections synced successfully',
      lastSyncAt: integration.lastSyncAt
    });
  } catch (error) {
    console.error('Error syncing LinkedIn connections:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to sync LinkedIn connections'
    });
  }
};

/**
 * Get LinkedIn connections for a user
 */
export const getConnections = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    // Get pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    
    // Find connections for the user
    const connections = await LinkedInConnection.find({ userId })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('contactId', 'firstName lastName email company title');
    
    // Get total count for pagination
    const total = await LinkedInConnection.countDocuments({ userId });
    
    return res.status(200).json({
      success: true,
      connections,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting LinkedIn connections:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get LinkedIn connections'
    });
  }
};

/**
 * Get LinkedIn connection details for a specific contact
 */
export const getConnectionByContact = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { contactId } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    // Find the connection
    const connection = await LinkedInConnection.findOne({ userId, contactId });
    
    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'LinkedIn connection not found for this contact'
      });
    }
    
    return res.status(200).json({
      success: true,
      connection
    });
  } catch (error) {
    console.error('Error getting LinkedIn connection:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get LinkedIn connection'
    });
  }
};

/**
 * Send a LinkedIn message to a contact
 */
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { contactId } = req.params;
    const { content } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }
    
    // Find the contact
    const contact = await Contact.findOne({ _id: contactId, userId });
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    // Find the LinkedIn connection
    const connection = await LinkedInConnection.findOne({ userId, contactId });
    
    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'LinkedIn connection not found for this contact'
      });
    }
    
    // Find the user's LinkedIn integration
    const integration = await LinkedInIntegration.findOne({ userId });
    
    if (!integration) {
      return res.status(404).json({
        success: false,
        message: 'LinkedIn integration not found'
      });
    }
    
    // Check if the token is expired and refresh if needed
    if (integration.isTokenExpired()) {
      if (!integration.refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'LinkedIn access token expired and no refresh token available'
        });
      }
      
      try {
        const tokenData = await linkedInService.refreshToken(integration.refreshToken);
        
        // Update token information
        integration.accessToken = tokenData.access_token;
        integration.refreshToken = tokenData.refresh_token || integration.refreshToken;
        
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);
        integration.expiresAt = expiresAt;
        
        await integration.save();
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Failed to refresh LinkedIn access token'
        });
      }
    }
    
    // In a real implementation, this would:
    // 1. Use the LinkedIn API to send a message
    // 2. Record the message in the database
    
    // For this example, we'll simulate a successful message send
    const now = new Date();
    const message = new LinkedInMessage({
      userId,
      contactId,
      connectionId: connection._id,
      messageId: `msg_${Date.now()}`,
      content,
      direction: 'outbound',
      status: 'sent',
      sentAt: now
    });
    
    await message.save();
    
    // Update the connection record
    connection.lastMessageSent = now;
    connection.lastInteractionDate = now;
    await connection.save();
    
    return res.status(200).json({
      success: true,
      message: 'LinkedIn message sent successfully',
      messageData: message
    });
  } catch (error) {
    console.error('Error sending LinkedIn message:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send LinkedIn message'
    });
  }
};

/**
 * Get messages for a specific LinkedIn connection
 */
export const getMessages = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { contactId } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    // Get pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    
    // Find the LinkedIn connection
    const connection = await LinkedInConnection.findOne({ userId, contactId });
    
    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'LinkedIn connection not found for this contact'
      });
    }
    
    // Find messages for the connection
    const messages = await LinkedInMessage.find({
      userId,
      contactId,
      connectionId: connection._id
    })
      .sort({ sentAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await LinkedInMessage.countDocuments({
      userId,
      contactId,
      connectionId: connection._id
    });
    
    return res.status(200).json({
      success: true,
      messages,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting LinkedIn messages:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get LinkedIn messages'
    });
  }
};

/**
 * Search for LinkedIn profiles
 */
export const searchProfiles = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { query } = req.query;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    // Find the user's LinkedIn integration
    const integration = await LinkedInIntegration.findOne({ userId });
    
    if (!integration) {
      return res.status(404).json({
        success: false,
        message: 'LinkedIn integration not found'
      });
    }
    
    // Check if the token is expired and refresh if needed
    if (integration.isTokenExpired()) {
      if (!integration.refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'LinkedIn access token expired and no refresh token available'
        });
      }
      
      try {
        const tokenData = await linkedInService.refreshToken(integration.refreshToken);
        
        // Update token information
        integration.accessToken = tokenData.access_token;
        integration.refreshToken = tokenData.refresh_token || integration.refreshToken;
        
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);
        integration.expiresAt = expiresAt;
        
        await integration.save();
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Failed to refresh LinkedIn access token'
        });
      }
    }
    
    // In a real implementation, this would:
    // 1. Use the LinkedIn API to search for profiles
    // 2. Return the search results
    
    // For this example, we'll simulate a successful search
    const mockResults = [
      {
        id: 'profile-1',
        firstName: 'John',
        lastName: 'Doe',
        headline: 'Software Engineer at Acme Corp',
        industry: 'Technology',
        profileUrl: 'https://www.linkedin.com/in/johndoe',
        pictureUrl: 'https://example.com/profile1.jpg'
      },
      {
        id: 'profile-2',
        firstName: 'Jane',
        lastName: 'Smith',
        headline: 'Marketing Manager at XYZ Inc',
        industry: 'Marketing',
        profileUrl: 'https://www.linkedin.com/in/janesmith',
        pictureUrl: 'https://example.com/profile2.jpg'
      }
    ];
    
    return res.status(200).json({
      success: true,
      profiles: mockResults
    });
  } catch (error) {
    console.error('Error searching LinkedIn profiles:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search LinkedIn profiles'
    });
  }
};

/**
 * Link an existing contact with a LinkedIn profile
 */
export const linkContactToProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { contactId } = req.params;
    const { linkedInId, profileUrl, firstName, lastName, headline, industry, position, company } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    if (!linkedInId || !profileUrl) {
      return res.status(400).json({
        success: false,
        message: 'LinkedIn ID and profile URL are required'
      });
    }
    
    // Find the contact
    const contact = await Contact.findOne({ _id: contactId, userId });
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    
    // Check if a connection already exists
    let connection = await LinkedInConnection.findOne({ userId, contactId });
    
    if (connection) {
      // Update existing connection
      connection.linkedInId = linkedInId;
      connection.profileUrl = profileUrl;
      connection.firstName = firstName || contact.firstName;
      connection.lastName = lastName || contact.lastName;
      connection.headline = headline;
      connection.industry = industry;
      connection.position = position;
      connection.company = company;
      
      await connection.save();
    } else {
      // Create a new connection
      connection = new LinkedInConnection({
        userId,
        contactId,
        linkedInId,
        profileUrl,
        firstName: firstName || contact.firstName,
        lastName: lastName || contact.lastName,
        headline,
        industry,
        position,
        company,
        connectionDegree: 1,
        connectionDate: new Date()
      });
      
      await connection.save();
    }
    
    return res.status(200).json({
      success: true,
      message: 'Contact linked to LinkedIn profile successfully',
      connection
    });
  } catch (error) {
    console.error('Error linking contact to LinkedIn profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to link contact to LinkedIn profile'
    });
  }
};
