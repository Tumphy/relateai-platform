# RelateAI Platform - Backend Server

This directory contains the backend server for the RelateAI platform, a sales and outreach solution powered by AI.

## Overview

The backend provides RESTful APIs for:
- User authentication and management
- Account and contact management
- Message creation, generation, and delivery
- MEDDPPICC sales qualification framework
- AI-powered research and personalization

## Tech Stack

- **Node.js** and **Express**: Core server framework
- **TypeScript**: Type-safe JavaScript
- **MongoDB** with **Mongoose**: Database and ORM
- **OpenAI API**: AI models for text generation
- **Nodemailer**: Email sending capabilities
- **JWT**: Authentication
- **Zod**: Schema validation

## Project Structure

```
src/
├── controllers/      # Request handlers
│   ├── auth.ts       # Authentication controllers
│   ├── account.ts    # Account management
│   ├── contact.ts    # Contact management
│   ├── message.ts    # Message management
│   ├── email.ts      # Email functionality
│   ├── meddppicc.ts  # MEDDPPICC framework
│   └── research.ts   # AI research capabilities
├── middleware/       # Express middleware
│   ├── auth.ts       # JWT authentication
│   ├── errorHandler.ts # Error handling
│   └── validation.ts   # Request validation
├── models/           # Mongoose schemas
│   ├── user.ts       # User model
│   ├── account.ts    # Account model
│   ├── contact.ts    # Contact model
│   ├── message.ts    # Message model
│   └── meddppicc.ts  # MEDDPPICC model
├── routes/           # API routes
│   ├── auth.ts       # Auth routes
│   ├── accounts.ts   # Account routes
│   ├── contacts.ts   # Contact routes
│   ├── messages.ts   # Message routes
│   ├── meddppicc.ts  # MEDDPPICC routes
│   └── research.ts   # AI research routes
├── validators/       # Zod validation schemas
│   ├── auth.ts       # Auth validation
│   ├── account.ts    # Account validation
│   ├── contact.ts    # Contact validation
│   ├── message.ts    # Message validation
│   └── meddppicc.ts  # MEDDPPICC validation
├── utils/            # Utility functions
│   ├── ai.ts         # AI-related utilities
│   ├── email.ts      # Email utilities
│   └── helpers.ts    # General helpers
└── index.ts          # Server entry point
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/relateai
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=24h
OPENAI_API_KEY=your_openai_api_key
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=no-reply@example.com
EMAIL_WEBHOOK_SECRET=your_webhook_secret
```

3. Start the development server:
```bash
npm run dev
```

4. For production:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Log in and get JWT token
- `GET /api/auth/me`: Get current user info

### Accounts
- `GET /api/accounts`: Get all accounts
- `GET /api/accounts/:id`: Get account by ID
- `POST /api/accounts`: Create a new account
- `PUT /api/accounts/:id`: Update an account
- `DELETE /api/accounts/:id`: Delete an account

### Contacts
- `GET /api/contacts`: Get all contacts
- `GET /api/contacts/:id`: Get contact by ID
- `POST /api/contacts`: Create a new contact
- `PUT /api/contacts/:id`: Update a contact
- `DELETE /api/contacts/:id`: Delete a contact
- `POST /api/contacts/discover`: AI-powered contact discovery

### Messages
- `GET /api/messages`: Get all messages
- `GET /api/messages/:id`: Get message by ID
- `POST /api/messages`: Create a new message
- `PUT /api/messages/:id`: Update a message
- `DELETE /api/messages/:id`: Delete a message
- `POST /api/messages/generate`: Generate a message using AI
- `POST /api/messages/send`: Send a message
- `GET /api/messages/track/:id/:event`: Track message opens/delivery
- `POST /api/messages/webhook`: Process email replies
- `GET /api/messages/history/:contactId`: Get message history with a contact

### MEDDPPICC
- `GET /api/meddppicc/:accountId`: Get MEDDPPICC for an account
- `POST /api/meddppicc/:accountId`: Create MEDDPPICC assessment
- `PUT /api/meddppicc/:accountId`: Update MEDDPPICC assessment
- `DELETE /api/meddppicc/:accountId`: Delete MEDDPPICC assessment
- `POST /api/meddppicc/:accountId/next-steps`: Add next step
- `PUT /api/meddppicc/:accountId/next-steps/:index`: Update next step

### Research
- `POST /api/research/account`: Research account using AI
- `POST /api/research/meddppicc/:accountId`: Generate MEDDPPICC using AI
- `POST /api/research/icp/:accountId`: Calculate ICP score

## Testing

```bash
npm test
```

## Deployment

This server can be deployed to any Node.js hosting platform:
- Heroku
- DigitalOcean
- AWS Elastic Beanstalk
- Google Cloud Run
- Vercel

## Webhook Setup

For processing email replies, set up a webhook endpoint at:
```
POST /api/messages/webhook
```

This endpoint should be accessible from the internet and configured with your email provider.

## License

Proprietary - All rights reserved