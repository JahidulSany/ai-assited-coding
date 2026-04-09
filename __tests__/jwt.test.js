const request = require('supertest');
const jwt = require('jsonwebtoken');
const { setupTestDatabase, closeTestDatabase, clearTestDatabase } = require('./setup');
const { createTestApp } = require('./testApp');

require('dotenv').config();

let app;
let testDb;
let validToken;

beforeAll(async () => {
  testDb = await setupTestDatabase();
  app = createTestApp(testDb);
});

beforeEach(async () => {
  await clearTestDatabase();
  // Register and login to get token
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });
  validToken = response.body.token;
});

afterAll(async () => {
  await closeTestDatabase();
});

describe('JWT Token Validation', () => {
  test('should allow access to protected routes with valid token', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${validToken}`);

    expect(response.status).toBe(200);
    expect(response.body.users).toBeDefined();
    expect(Array.isArray(response.body.users)).toBe(true);
  });

  test('should deny access to protected routes without token', async () => {
    const response = await request(app)
      .get('/api/users');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Access token required');
  });

  test('should deny access with invalid token format', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', 'Bearer InvalidTokenFormat');

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Invalid token');
  });

  test('should deny access with malformed Bearer token', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', 'Bearer invalid.token.here');

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Invalid token');
  });

  test('should decode valid token and attach user info to request', async () => {
    // Get profile should work with valid token
    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${validToken}`);

    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
    expect(response.body.user.username).toBe('testuser');
    expect(response.body.user.email).toBe('test@example.com');
  });

  test('should verify JWT contains correct user information', () => {
    const decoded = jwt.verify(validToken, process.env.JWT_SECRET);

    expect(decoded.username).toBe('testuser');
    expect(decoded.email).toBe('test@example.com');
    expect(decoded.id).toBeDefined();
  });

  test('should work with Authorization header in Bearer format', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${validToken}`);

    expect(response.status).toBe(200);
  });

  test('should handle expired tokens (JWT signed with past expiry)', async () => {
    // Create an expired token
    const expiredToken = jwt.sign(
      { id: 1, username: 'testuser', email: 'test@example.com' },
      process.env.JWT_SECRET,
      { expiresIn: '-1h' }, // Expired 1 hour ago
    );

    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Token expired');
  });
});
