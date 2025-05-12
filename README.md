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

## Project Structure

The project follows a feature-based structure:

```
src/
├── app/                  # Next.js app router
│   ├── dashboard/        # Dashboard pages
│   │   ├── accounts/     # Account management
│   │   ├── contacts/     # Contact management
│   │   └── campaigns/    # Campaign management
│   ├── login/            # Authentication pages
│   └── signup/           # User registration
├── components/           # Shared UI components
├── contexts/             # React context providers
├── lib/                  # Utility functions and API client
├── models/               # TypeScript type definitions
└── styles/               # Global styles and Tailwind config

server/
├── src/
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   ├── services/         # Business logic
│   └── validators/       # Input validation
├── .env                  # Environment variables
└── package.json          # Dependencies
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- OpenAI API key

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

5. Start the development servers:
```bash
# In the root directory (frontend)
npm run dev

# In the server directory (backend)
npm run dev
```

## User Workflow

1. **Onboarding & Setup**
   - User signs up and configures their ICP and persona preferences
   - Connects LinkedIn and Gmail integrations
   - Optional CRM sync

2. **Target Account Creation & Research**
   - Add companies manually or via CSV upload
   - AI automatically researches and builds company profiles
   - MEDDPPICC analysis is generated

3. **Contact Discovery & Persona Mapping**
   - AI matches roles to names at target companies
   - Profiles are enriched with recent activity and intent signals
   - Contacts are scored based on ICP fit

4. **Message Crafting & Sequencing**
   - AI generates personalized outreach based on contact data
   - Users can create multi-channel sequences with conditional logic
   - Messages are graded for effectiveness

5. **Engagement & Deal Progression**
   - Platform tracks replies and engagement
   - AI suggests follow-ups based on context
   - Deal stages are tracked in a visual pipeline

## Feature Roadmap

### Phase 1: Core Platform (Current)
- User authentication and dashboard
- Account research and MEDDPPICC framework
- Basic messaging capabilities

### Phase 2: Advanced Features (Upcoming)
- LinkedIn and Gmail integrations
- AI-powered response generation
- Campaign analytics and optimization

### Phase 3: Enterprise Features (Future)
- Team collaboration
- CRM integrations
- Advanced reporting and analytics

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

Proprietary - All rights reserved

## Contact

For questions about the project, contact [support@relateai.com](mailto:support@relateai.com).