# RelateAI Platform

RelateAI is an AI-powered sales and outreach platform that helps sales representatives build better relationships with prospects through intelligent research, account planning, and personalized messaging.

## Project Overview

The RelateAI platform combines several AI-driven features to streamline the sales process:

1. **Account Research & Planning**: Automatically research target accounts and build comprehensive account plans using AI.
2. **MEDDPPICC Framework Integration**: Use the proven MEDDPPICC sales qualification framework to score and track deal progress.  
3. **Personalized Outreach**: Generate hyper-personalized messages based on prospect data and engagement signals.
4. **Engagement Tracking**: Monitor prospect engagement across channels and intelligently follow up.

## Technical Architecture

The platform is built using a modern tech stack:

### Frontend
- **Framework**: Next.js 14 with React 18 and TypeScript
- **UI**: Tailwind CSS with custom components
- **State Management**: Context API and Zustand
- **API Client**: Axios

### Backend
- **API**: Node.js with Express
- **Database**: MongoDB with Mongoose
- **AI Integration**: OpenAI API (Claude & GPT-4o)
- **Authentication**: JWT-based auth system
- **Email Integration**: Nodemailer with tracking and webhooks

## Project Structure

The project follows a feature-based structure:

```
src/
├── app/                  # Next.js app router
│   ├── dashboard/        # Dashboard pages
│   │   ├── accounts/     # Account management
│   │   ├── contacts/     # Contact management
│   │   └── messages/     # Message management
│   ├── login/            # Authentication pages
│   └── signup/           # User registration
├── components/           # Shared UI components
├── contexts/             # React context providers
├── lib/                  # Utility functions 
├── services/             # API services
├── types/                # TypeScript type definitions
└── styles/               # Global styles and Tailwind config

server/
├── src/
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── controllers/      # Route handlers
│   ├── middleware/       # Express middleware
│   ├── validators/       # Input validation
│   └── utils/            # Utility functions
├── .env                  # Environment variables
└── package.json          # Dependencies
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- OpenAI API key
- SMTP server for email functionality

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Tumphy/relateai-platform.git
cd relateai-platform
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd server
npm install
```

4. Create environment files:
   - Create `.env.local` in the root directory for frontend
   - Create `.env` in the `server` directory for backend

   #### Backend Environment Variables
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/relateai
   JWT_SECRET=your_jwt_secret
   OPENAI_API_KEY=your_openai_api_key
   EMAIL_HOST=smtp.example.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@example.com
   EMAIL_PASSWORD=your_email_password
   EMAIL_FROM=no-reply@example.com
   EMAIL_WEBHOOK_SECRET=your_webhook_secret
   ```

   #### Frontend Environment Variables
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

5. Start the development servers:
```bash
# In the root directory (frontend)
npm run dev

# In the server directory (backend)
npm run dev
```

## Current Features

### Account Management
- Create, view, edit, and delete accounts
- AI-powered account research
- MEDDPPICC framework integration
- Account scoring and prioritization

### Contact Management
- Comprehensive contact profiles
- Contact filtering and search
- ICP fit scoring
- Activity tracking

### Messaging
- Multi-channel messaging (email, LinkedIn, etc.)
- AI-generated personalized messages
- Email sending with tracking
- Message threading and history

## Feature Roadmap

### Phase 1: Core Platform (Completed)
- User authentication and dashboard
- Account research and MEDDPPICC framework
- Basic messaging capabilities
- Email integration

### Phase 2: Advanced Features (In Progress)
- LinkedIn integration
- Campaign sequencing
- Advanced analytics
- Team collaboration

### Phase 3: Enterprise Features (Future)
- CRM integrations
- Advanced reporting
- Custom workflows
- Enterprise SSO

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Current focus areas for contribution:
- LinkedIn integration
- Campaign management system
- Test coverage
- UI/UX improvements

## License

Proprietary - All rights reserved

## Contact

For questions about the project, contact [support@relateai.com](mailto:support@relateai.com)