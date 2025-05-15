import axios from 'axios';
import queryString from 'query-string';

/**
 * LinkedIn API Service
 * 
 * This service handles interactions with LinkedIn's API for authentication,
 * profile data retrieval, and messaging.
 */
class LinkedInService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private apiUrl: string = 'https://api.linkedin.com/v2';
  private authUrl: string = 'https://www.linkedin.com/oauth/v2';

  constructor() {
    this.clientId = process.env.LINKEDIN_CLIENT_ID || '';
    this.clientSecret = process.env.LINKEDIN_CLIENT_SECRET || '';
    this.redirectUri = process.env.LINKEDIN_REDIRECT_URI || '';

    if (!this.clientId || !this.clientSecret || !this.redirectUri) {
      console.warn('LinkedIn API credentials are not properly configured');
    }
  }

  /**
   * Generate the OAuth authorization URL for LinkedIn
   */
  getAuthorizationUrl(state: string, scope: string[] = ['r_liteprofile', 'r_emailaddress', 'w_member_social']): string {
    const params = {
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      state,
      scope: scope.join(' ')
    };

    return `${this.authUrl}/authorization?${queryString.stringify(params)}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(code: string): Promise<{
    access_token: string;
    expires_in: number;
    refresh_token?: string;
  }> {
    try {
      const response = await axios.post(
        `${this.authUrl}/accessToken`,
        queryString.stringify({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.redirectUri,
          client_id: this.clientId,
          client_secret: this.clientSecret
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return {
        access_token: response.data.access_token,
        expires_in: response.data.expires_in,
        refresh_token: response.data.refresh_token
      };
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw new Error('Failed to exchange authorization code for access token');
    }
  }

  /**
   * Refresh an expired access token
   */
  async refreshToken(refreshToken: string): Promise<{
    access_token: string;
    expires_in: number;
    refresh_token?: string;
  }> {
    try {
      const response = await axios.post(
        `${this.authUrl}/accessToken`,
        queryString.stringify({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: this.clientId,
          client_secret: this.clientSecret
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return {
        access_token: response.data.access_token,
        expires_in: response.data.expires_in,
        refresh_token: response.data.refresh_token || refreshToken
      };
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Get the current user's LinkedIn profile
   */
  async getProfile(accessToken: string): Promise<any> {
    try {
      const response = await axios.get(`${this.apiUrl}/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      // Get additional email address information
      const emailResponse = await axios.get(`${this.apiUrl}/emailAddress?q=members&projection=(elements*(handle~))`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      // Combine the responses
      return {
        ...response.data,
        email: emailResponse.data.elements?.[0]?.['handle~']?.emailAddress
      };
    } catch (error) {
      console.error('Error fetching LinkedIn profile:', error);
      throw new Error('Failed to retrieve LinkedIn profile');
    }
  }

  /**
   * Search for people on LinkedIn
   * Note: This requires Partner or Marketing Developer Program access
   */
  async searchPeople(accessToken: string, keywords: string, start = 0, count = 10): Promise<any> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/search/blended?q=people&keywords=${encodeURIComponent(keywords)}&start=${start}&count=${count}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error searching LinkedIn people:', error);
      throw new Error('Failed to search LinkedIn people');
    }
  }

  /**
   * Get company information
   */
  async getCompany(accessToken: string, companyId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.apiUrl}/organizations/${companyId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching company information:', error);
      throw new Error('Failed to retrieve company information');
    }
  }

  /**
   * Create a LinkedIn Share (Post)
   * Note: This requires additional permissions
   */
  async createShare(
    accessToken: string,
    content: string,
    visibility: 'PUBLIC' | 'CONNECTIONS' = 'CONNECTIONS'
  ): Promise<any> {
    try {
      const authorUrn = 'urn:li:person:{id}'; // The {id} will need to be replaced with actual user ID

      const shareData = {
        owner: authorUrn,
        text: {
          text: content
        },
        distribution: {
          linkedInDistributionTarget: {
            visibleToGuest: visibility === 'PUBLIC'
          }
        }
      };

      const response = await axios.post(`${this.apiUrl}/shares`, shareData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error creating LinkedIn share:', error);
      throw new Error('Failed to create LinkedIn share');
    }
  }

  /**
   * Send a message to a LinkedIn connection
   * Note: This requires Marketing Developer Program access or LinkedIn Messaging API
   */
  async sendMessage(
    accessToken: string,
    recipientProfileUrn: string,
    messageText: string
  ): Promise<any> {
    try {
      // This is a simplified approach - the actual LinkedIn messaging API
      // is more complex and requires special access programs
      const messageData = {
        recipients: [recipientProfileUrn],
        body: messageText,
        subject: '',
        messageType: 'INMAIL'
      };

      const response = await axios.post(`${this.apiUrl}/messages`, messageData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error sending LinkedIn message:', error);
      throw new Error('Failed to send LinkedIn message');
    }
  }
}

export const linkedInService = new LinkedInService();
