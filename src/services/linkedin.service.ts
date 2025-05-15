import api from '@/lib/api';

// Define types for LinkedIn-related data
export interface LinkedInIntegration {
  id: string;
  firstName: string;
  lastName: string;
  profileUrl: string;
  headline?: string;
  lastSyncAt?: Date;
}

export interface LinkedInConnection {
  _id: string;
  contactId: string;
  linkedInId: string;
  profileUrl: string;
  firstName: string;
  lastName: string;
  headline?: string;
  industry?: string;
  pictureUrl?: string;
  position?: string;
  company?: string;
  connectionDegree?: number;
  connectionDate?: string;
  lastInteractionDate?: string;
  lastMessageSent?: string;
  lastMessageReceived?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LinkedInMessage {
  _id: string;
  userId: string;
  contactId: string;
  connectionId: string;
  messageId: string;
  content: string;
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  failedReason?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  headline?: string;
  industry?: string;
  profileUrl: string;
  pictureUrl?: string;
}

/**
 * LinkedIn API service for frontend
 */
export const linkedInService = {
  /**
   * Get authorization URL for LinkedIn OAuth
   */
  getAuthUrl: async () => {
    return api.get<{
      success: boolean;
      authUrl: string;
    }>('/linkedin/auth');
  },

  /**
   * Get the current user's LinkedIn integration status
   */
  getIntegrationStatus: async () => {
    return api.get<{
      success: boolean;
      integrated: boolean;
      integration?: LinkedInIntegration;
    }>('/linkedin/status');
  },

  /**
   * Disconnect LinkedIn integration
   */
  disconnectIntegration: async () => {
    return api.delete<{
      success: boolean;
      message: string;
    }>('/linkedin/disconnect');
  },

  /**
   * Sync LinkedIn connections
   */
  syncConnections: async () => {
    return api.post<{
      success: boolean;
      message: string;
      lastSyncAt: string;
    }>('/linkedin/sync');
  },

  /**
   * Get LinkedIn connections for the current user
   */
  getConnections: async (page = 1, limit = 20) => {
    return api.get<{
      success: boolean;
      connections: LinkedInConnection[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>('/linkedin/connections', {
      params: { page, limit }
    });
  },

  /**
   * Get LinkedIn connection details for a specific contact
   */
  getConnectionByContact: async (contactId: string) => {
    return api.get<{
      success: boolean;
      connection: LinkedInConnection;
    }>(`/linkedin/connections/${contactId}`);
  },

  /**
   * Link an existing contact with a LinkedIn profile
   */
  linkContactToProfile: async (
    contactId: string,
    profileData: {
      linkedInId: string;
      profileUrl: string;
      firstName?: string;
      lastName?: string;
      headline?: string;
      industry?: string;
      position?: string;
      company?: string;
    }
  ) => {
    return api.post<{
      success: boolean;
      message: string;
      connection: LinkedInConnection;
    }>(`/linkedin/connections/${contactId}`, profileData);
  },

  /**
   * Send a LinkedIn message to a contact
   */
  sendMessage: async (contactId: string, content: string) => {
    return api.post<{
      success: boolean;
      message: string;
      messageData: LinkedInMessage;
    }>(`/linkedin/messages/${contactId}`, { content });
  },

  /**
   * Get messages for a specific LinkedIn connection
   */
  getMessages: async (contactId: string, page = 1, limit = 20) => {
    return api.get<{
      success: boolean;
      messages: LinkedInMessage[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>(`/linkedin/messages/${contactId}`, {
      params: { page, limit }
    });
  },

  /**
   * Search for LinkedIn profiles
   */
  searchProfiles: async (query: string) => {
    return api.get<{
      success: boolean;
      profiles: LinkedInProfile[];
    }>('/linkedin/search', {
      params: { query }
    });
  }
};

export default linkedInService;
