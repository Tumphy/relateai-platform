# RelateAI Platform Testing Documentation

This document outlines the testing infrastructure and procedures for the RelateAI platform.

## Testing Infrastructure

### Frontend Testing

The frontend testing stack includes:

- **Jest**: Testing framework
- **React Testing Library**: Component testing utilities
- **MSW**: Mock Service Worker for API mocking
- **Testing Coverage**: Minimum 70% coverage target

The configuration can be found in:
- `jest.config.ts`: Main Jest configuration
- `jest.setup.ts`: Test environment setup
- `__mocks__/`: Mock implementations for assets and styles

### Backend Testing

The backend testing stack includes:

- **Jest**: Testing framework
- **Supertest**: HTTP assertion library
- **MongoDB Memory Server**: In-memory MongoDB for tests
- **Testing Coverage**: Minimum 70% coverage target

The configuration can be found in:
- `server/jest.config.js`: Main Jest configuration
- `server/src/utils/test-setup.ts`: Test environment setup

## Running Tests

### Frontend Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Backend Tests

```bash
# From the server directory
cd server

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Testing Practices

### Unit Tests

Unit tests should:
- Test a single component, function, or class in isolation
- Mock all dependencies
- Be fast and reliable
- Focus on functionality, not implementation details

Example:
```typescript
// Component test example
describe('AccountForm Component', () => {
  it('renders the form for creating a new account', () => {
    render(<AccountForm />);
    expect(screen.getByText('New Account')).toBeInTheDocument();
  });
});
```

### Integration Tests

Integration tests should:
- Test the interaction between multiple units
- Use real implementations where possible
- Mock external dependencies (APIs, databases)

Example:
```typescript
// API integration test
describe('Account API', () => {
  it('should create a new account', async () => {
    const response = await request(app)
      .post('/api/accounts')
      .send({ name: 'Test Account' });
    
    expect(response.status).toBe(201);
    expect(response.body.account).toHaveProperty('name', 'Test Account');
  });
});
```

### End-to-End Tests

E2E tests should:
- Test complete user flows
- Simulate real user interactions
- Verify critical business processes

Example (to be implemented with Cypress):
```javascript
// E2E test example
describe('Account Management', () => {
  it('should allow creating and editing an account', () => {
    cy.login();
    cy.visit('/dashboard/accounts/new');
    cy.fillAccountForm({ name: 'New E2E Account' });
    cy.get('button').contains('Create Account').click();
    cy.url().should('include', '/dashboard/accounts/');
    cy.contains('Account created successfully');
  });
});
```

## Mock Utilities

### Frontend Mocks

Common mocks are available in `src/utils/test-utils.ts`:

- `mockAccount`: Sample account data for tests
- `mockContact`: Sample contact data for tests
- `mockUser`: Sample user data for tests
- Custom render function with providers
- Form testing helpers (fillForm, selectOption, checkCheckbox)
- API mocking utilities

### Backend Mocks

Available in `server/src/utils/test-utils.ts`:

- `mockRequest`: Create mock Express request
- `mockResponse`: Create mock Express response
- `generateTestToken`: JWT token generator for authentication
- `createTestUser`, `createTestAccount`, etc.: Database entity creation
- `mockData` object with sample test data

## Test Coverage Requirements

The project aims for at least 70% test coverage across all code:

- **Statements**: 70%
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%

Critical components and services should have higher coverage (90%+):
- Authentication services
- Core business logic
- Data validation

## Testing Email Functionality

### Email Service Testing

Testing the email service requires special handling to avoid sending actual emails during tests:

1. **Mock Nodemailer**: The test setup mocks the nodemailer transport to avoid actual SMTP connections.

2. **Tracking Verification**: Tests for tracking ID generation and verification ensure security.

3. **Integration Tests**: Testing the email API routes verifies proper request handling.

Example email service test:

```typescript
describe('Email Service', () => {
  it('should generate tracking ID with HMAC signature', () => {
    // Test tracking ID generation
    const trackingId = emailService.generateTrackingId({
      messageId: 'test-message-123'
    });
    
    // Verify the tracking ID
    const result = emailService.verifyTrackingId(trackingId);
    
    expect(result.valid).toBe(true);
    expect(result.data.messageId).toBe('test-message-123');
  });
  
  it('should wrap links with tracking redirects', () => {
    const html = '<a href="https://example.com">Link</a>';
    const trackingId = 'test-tracking-id';
    
    const result = emailService.wrapLinksWithTracking(html, trackingId);
    
    expect(result).toContain('tracking.relateai.com/redirect');
    expect(result).toContain('test-tracking-id');
  });
});
```

### Email Controller Tests

Email controller tests validate the API endpoints for tracking and sending:

```typescript
describe('Email Controllers', () => {
  it('should handle pixel tracking request', async () => {
    // Setup tracking ID and mock messages
    const trackingId = emailService.generateTrackingId({
      messageId: 'test-message-123'
    });
    
    // Mock message update
    jest.spyOn(Message, 'findByIdAndUpdate').mockResolvedValue({});
    
    // Test pixel endpoint
    const response = await request(app)
      .get(`/api/email/pixel/${trackingId}`);
    
    expect(response.status).toBe(200);
    expect(response.header['content-type']).toBe('image/gif');
  });
  
  it('should send test email', async () => {
    // Mock email service
    jest.spyOn(emailService, 'sendEmail').mockResolvedValue({
      success: true,
      messageId: 'test-123'
    });
    
    // Test send endpoint
    const response = await request(app)
      .post('/api/email/test')
      .send({
        to: 'test@example.com',
        subject: 'Test Subject',
        content: 'Test content'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.messageId).toBe('test-123');
  });
});
```

### Frontend Email Component Tests

Tests for email-related UI components:

```typescript
describe('EmailTestForm', () => {
  it('renders the form correctly', () => {
    render(<EmailTestForm />);
    
    expect(screen.getByLabelText(/Recipient Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Content/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Test Email/i })).toBeInTheDocument();
  });
  
  it('validates email format', async () => {
    const user = userEvent.setup();
    render(<EmailTestForm />);
    
    // Fill form with invalid email
    await user.type(screen.getByLabelText(/Recipient Email/i), 'invalid-email');
    await user.type(screen.getByLabelText(/Subject/i), 'Test Subject');
    await user.type(screen.getByLabelText(/Content/i), 'Test content');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /Send Test Email/i }));
    
    // Check for validation error
    expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
  });
});
```

## Continuous Integration

Tests are automatically run on:
- Pull request creation/updates
- Merges to main branch
- Pre-deployment checks

Failed tests will block merges and deployments.

## Next Steps

- [ ] Implement E2E testing with Cypress
- [ ] Add more API integration tests for all endpoints
- [ ] Create test data generators for complex objects
- [ ] Add visual regression testing for UI components
- [ ] Expand test coverage for email functionality
