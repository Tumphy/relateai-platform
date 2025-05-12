# RelateAI Server API

This is the backend API for the RelateAI platform, providing authentication, data management, and AI-powered features.

## API Overview

The RelateAI API includes the following resources:

- **Authentication**: User registration, login, and token management
- **Accounts**: Target account management with AI research
- **MEDDPPICC**: Deal qualification framework management
- **Contacts**: Prospect contact management
- **Messages**: Message generation and management
- **Research**: AI-powered company and contact research

## API Endpoints

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register a new user |
| `/api/auth/login` | POST | Login and get auth token |
| `/api/auth/me` | GET | Get current user info |

### Accounts

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/accounts` | GET | Get all accounts |
| `/api/accounts/:id` | GET | Get account by ID |
| `/api/accounts` | POST | Create a new account |
| `/api/accounts/:id` | PUT | Update an account |
| `/api/accounts/:id` | DELETE | Delete an account |

### MEDDPPICC

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/meddppicc/:accountId` | GET | Get MEDDPPICC assessment for an account |
| `/api/meddppicc/:accountId` | POST | Create MEDDPPICC assessment |
| `/api/meddppicc/:accountId` | PUT | Update MEDDPPICC assessment |
| `/api/meddppicc/:accountId` | DELETE | Delete MEDDPPICC assessment |
| `/api/meddppicc/:accountId/next-steps` | POST | Add next step |
| `/api/meddppicc/:accountId/next-steps/:stepIndex` | PUT | Update next step |

### Contacts

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/contacts` | GET | Get all contacts |
| `/api/contacts/:id` | GET | Get contact by ID |
| `/api/contacts` | POST | Create a new contact |
| `/api/contacts/:id` | PUT | Update a contact |
| `/api/contacts/:id` | DELETE | Delete a contact |

### Messages

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/messages` | GET | Get all messages |
| `/api/messages/generate` | POST | Generate a message using AI |
| `/api/messages/send` | POST | Send a message |
| `/api/messages/history/:contactId` | GET | Get message history with a contact |

### Research

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/research/account` | POST | Research company and generate account data |
| `/api/research/meddppicc/:accountId` | POST | Generate MEDDPPICC assessment |
| `/api/research/icp/:accountId` | POST | Calculate ICP score |

## Data Models

### User

```typescript
{
  _id: string;
  email: string;
  password: string; // Hashed
  firstName: string;
  lastName: string;
  company: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Account

```typescript
{
  _id: string;
  name: string;
  website: string;
  industry: string;
  description: string;
  size: string;
  location: string;
  revenue: string;
  technologies: string[];
  tags: string[];
  icpScore: number;
  status: string;
  notes: string;
  owner: ObjectId; // Reference to User
  createdAt: Date;
  updatedAt: Date;
}
```

### MEDDPPICC

```typescript
{
  _id: string;
  account: ObjectId; // Reference to Account
  metrics: {
    score: number;
    notes: string;
    confidence: 'low' | 'medium' | 'high';
  };
  economicBuyer: {
    score: number;
    notes: string;
    confidence: 'low' | 'medium' | 'high';
  };
  decisionCriteria: {
    score: number;
    notes: string;
    confidence: 'low' | 'medium' | 'high';
  };
  decisionProcess: {
    score: number;
    notes: string;
    confidence: 'low' | 'medium' | 'high';
  };
  paperProcess: {
    score: number;
    notes: string;
    confidence: 'low' | 'medium' | 'high';
  };
  identifiedPain: {
    score: number;
    notes: string;
    confidence: 'low' | 'medium' | 'high';
  };
  champion: {
    score: number;
    notes: string;
    confidence: 'low' | 'medium' | 'high';
  };
  competition: {
    score: number;
    notes: string;
    confidence: 'low' | 'medium' | 'high';
  };
  overallScore: number;
  dealHealth: string;
  nextSteps: Array<{
    text: string;
    completed: boolean;
    dueDate: Date;
  }>;
  dealNotes: string;
  lastUpdatedBy: ObjectId; // Reference to User
  createdAt: Date;
  updatedAt: Date;
}
```

## Setup

### Prerequisites

- Node.js 18+
- MongoDB instance
- OpenAI API key

### Environment Variables

Create a `.env` file in the server directory with the following:

```
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/relateai
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d

# API Keys
OPENAI_API_KEY=your_openai_api_key_here
LINKEDIN_API_KEY=your_linkedin_api_key_here
GMAIL_API_KEY=your_gmail_api_key_here

# Feature Flags
ENABLE_ACCOUNT_RESEARCH=true
ENABLE_CONTACT_DISCOVERY=true
ENABLE_AI_MESSAGING=true
```

### Installation

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start server
npm start

# Start in development mode
npm run dev
```

## Authentication

The API uses JWT-based authentication. Include the token in the `x-auth-token` header:

```
x-auth-token: your.jwt.token
```

## Error Handling

The API returns standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

Error responses include a message:

```json
{
  "message": "Error message description"
}
```

## Rate Limiting

API requests are limited to 100 requests per minute per IP address.

## Future Improvements

- WebSocket support for real-time updates
- GraphQL API
- OAuth integration for LinkedIn and Gmail
- Webhooks for integration with external services