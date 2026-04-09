const request = require('supertest');
const { setupTestDatabase, getTestDatabase, closeTestDatabase, clearTestDatabase } = require('./setup');
const { createTestApp } = require('./testApp');

require('dotenv').config();

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

describe('Auth Register Endpoint', () => {
  test('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User registered successfully');
    expect(response.body.user.username).toBe('testuser');
    expect(response.body.user.email).toBe('test@example.com');
    expect(response.body.token).toBeDefined();
  });

  test('should return 400 if username is missing', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('required');
  });

  test('should return 400 if email is missing', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        password: 'password123',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('required');
  });

  test('should return 400 if password is missing', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('required');
  });

  test('should return 409 if username already exists', async () => {
    // Register first user
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test1@example.com',
        password: 'password123',
      });

    // Try to register with same username
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test2@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(409);
    expect(response.body.error).toContain('already exists');
  });

  test('should return 409 if email already exists', async () => {
    // Register first user
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser1',
        email: 'test@example.com',
        password: 'password123',
      });

    // Try to register with same email
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser2',
        email: 'test@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(409);
    expect(response.body.error).toContain('already exists');
  });
});
