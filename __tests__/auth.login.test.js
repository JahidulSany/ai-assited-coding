const request = require('supertest');
const { setupTestDatabase, closeTestDatabase, clearTestDatabase } = require('./setup');
const { createTestApp } = require('./testApp');

require('dotenv').config();

let app;
let testDb;
let testToken;
let testUserId;

beforeAll(async () => {
  testDb = await setupTestDatabase();
  app = createTestApp(testDb);
});

beforeEach(async () => {
  await clearTestDatabase();
  // Register a test user
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });
  testToken = response.body.token;
  testUserId = response.body.user.id;
});

afterAll(async () => {
  await closeTestDatabase();
});

describe('Auth Login Endpoint', () => {
  test('should login successfully with correct credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'password123',
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Login successful');
    expect(response.body.user.username).toBe('testuser');
    expect(response.body.user.email).toBe('test@example.com');
    expect(response.body.token).toBeDefined();
  });

  test('should return 400 if username is missing', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        password: 'password123',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('required');
  });

  test('should return 400 if password is missing', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('required');
  });

  test('should return 401 if user does not exist', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'nonexistent',
        password: 'password123',
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid username or password');
  });

  test('should return 401 if password is incorrect', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'wrongpassword',
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid username or password');
  });

  test('should generate a valid JWT token', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'password123',
      });

    expect(response.status).toBe(200);
    const token = response.body.token;

    // Use token in protected request
    const protectedResponse = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(protectedResponse.status).toBe(200);
    expect(protectedResponse.body.user.username).toBe('testuser');
  });
});
