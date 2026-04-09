# Testing Guide

This project uses Jest for unit and integration testing of the Node.js/Express REST API.

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode (re-run on file changes)
```bash
npm run test:watch
```

### Run tests with coverage report
```bash
npm run test:coverage
```

## Test Structure

Tests are located in the `__tests__/` directory and organized by feature:

- **`auth.register.test.js`** - Authentication registration endpoint tests
  - Successful registration
  - Validation error handling (missing fields)
  - Duplicate user detection (username/email)
  - Token generation

- **`auth.login.test.js`** - Authentication login endpoint tests
  - Successful login
  - Invalid credentials
  - Validation error handling
  - Token generation and verification

- **`jwt.test.js`** - JWT token validation and authorization tests
  - Protected route access with valid tokens
  - Access denial without tokens
  - Invalid/malformed token handling
  - Expired token detection
  - User information extraction from tokens

- **`users.test.js`** - User management routes tests
  - Get all users (protected)
  - Get user profile (protected)
  - Get user by ID (protected)
  - Update user profile
  - Delete user account
  - Authorization checks (can only modify own account)

## Test Utilities

### `__tests__/setup.js`
Provides database setup and teardown utilities:
- `setupTestDatabase()` - Creates an in-memory SQLite database for testing
- `getTestDatabase()` - Returns the current test database instance
- `closeTestDatabase()` - Closes the test database connection
- `clearTestDatabase()` - Clears all data from the test database

### `__tests__/testApp.js`
Exports `createTestApp(testDb)` function that creates an Express application instance configured to use a test database instead of the production database.

## Test Database

Tests use an **in-memory SQLite database** (`:memory:`) to ensure:
- Tests are isolated and don't affect production data
- Tests run fast without file I/O overhead
- Database is automatically reset between test suites
- Each test has a fresh database state via `clearTestDatabase()` in `beforeEach()` hooks

## Test Coverage

The test suite covers:
- ✅ 36 test cases across 4 test files
- ✅ Authentication (register, login, JWT validation)
- ✅ User CRUD operations
- ✅ Authorization and access control
- ✅ Error handling (validation, auth, permissions)
- ✅ Protected route access

## Environment Variables

Make sure your `.env` file includes:
```
JWT_SECRET=your_secret_key_here
PORT=3000
```

The same `JWT_SECRET` is used for both development and testing.

## Common Test Patterns

### Testing a protected endpoint
```javascript
const response = await request(app)
  .get('/api/users')
  .set('Authorization', `Bearer ${token}`);

expect(response.status).toBe(200);
```

### Testing error handling
```javascript
const response = await request(app)
  .post('/api/auth/register')
  .send({ username: 'user' }); // Missing email and password

expect(response.status).toBe(400);
expect(response.body.error).toContain('required');
```

### Testing authorization
```javascript
// Try to update another user's account
const response = await request(app)
  .put(`/api/users/${otherUserId}`)
  .set('Authorization', `Bearer ${myToken}`)
  .send({ username: 'hacker', email: 'hack@example.com' });

expect(response.status).toBe(403);
```

## Debugging Tests

To run a single test file:
```bash
npx jest __tests__/auth.register.test.js
```

To run tests matching a pattern:
```bash
npx jest --testNamePattern="should register"
```

To run with detailed output:
```bash
npx jest --verbose
```

## Adding New Tests

1. Create a new file in `__tests__/` with the `.test.js` suffix
2. Import required testing utilities
3. Set up database in `beforeAll()` and `beforeEach()` hooks
4. Write test cases using Jest's `test()` or `describe()` blocks
5. Clean up in `afterAll()` hook

Example:
```javascript
const request = require('supertest');
const { setupTestDatabase, closeTestDatabase, clearTestDatabase } = require('./setup');
const { createTestApp } = require('./testApp');

let app;
let testDb;

beforeAll(async () => {
  testDb = await setupTestDatabase();
  app = createTestApp(testDb);
});

afterEach(async () => {
  await clearTestDatabase();
});

afterAll(async () => {
  await closeTestDatabase();
});

describe('My Feature', () => {
  test('should do something', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
  });
});
```
