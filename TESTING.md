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

### Backend Mocks

- `mockUser`: Sample user data
- `mockAccount`: Sample account data
- `mockToken`: JWT token generator for authentication

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

## Continuous Integration

Tests are automatically run on:
- Pull request creation/updates
- Merges to main branch
- Pre-deployment checks

Failed tests will block merges and deployments.

## Next Steps

- [ ] Implement E2E testing with Cypress
- [ ] Add API integration tests for all endpoints
- [ ] Create test data generators for complex objects
- [ ] Add visual regression testing for UI components
