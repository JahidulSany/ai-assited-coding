const request = require('supertest');
const { setupTestDatabase, closeTestDatabase, clearTestDatabase } = require('./setup');
const { createTestApp } = require('./testApp');

require('dotenv').config();

let app;
let testDb;
let token;
let userId;

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
  token = response.body.token;
  userId = response.body.user.id;
});

afterAll(async () => {
  await closeTestDatabase();
});

describe('User Routes', () => {
  describe('GET /api/users', () => {
    test('should return all users with valid token', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.users).toBeDefined();
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users.length).toBe(1);
      expect(response.body.users[0].username).toBe('testuser');
    });

    test('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/users');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access token required');
    });
  });

  describe('GET /api/users/profile', () => {
    test('should return current user profile', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.username).toBe('testuser');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.id).toBe(userId);
    });

    test('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/users/profile');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access token required');
    });
  });

  describe('GET /api/users/:id', () => {
    test('should return user by ID with valid token', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.id).toBe(userId);
      expect(response.body.user.username).toBe('testuser');
    });

    test('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/99999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
    });

    test('should return 401 without token', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access token required');
    });
  });

  describe('PUT /api/users/:id', () => {
    test('should update user profile successfully', async () => {
      const response = await request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: 'updateduser',
          email: 'updated@example.com',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('User updated successfully');
      expect(response.body.user.username).toBe('updateduser');
      expect(response.body.user.email).toBe('updated@example.com');
    });

    test('should return 400 if username is missing', async () => {
      const response = await request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: 'updated@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('required');
    });

    test('should return 400 if email is missing', async () => {
      const response = await request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: 'updateduser',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('required');
    });

    test('should return 409 if new username already exists', async () => {
      // Create another user
      const user2 = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'user2',
          email: 'user2@example.com',
          password: 'password123',
        });

      // Try to update first user with second user's username
      const response = await request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: 'user2',
          email: 'test@example.com',
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toContain('already exists');
    });

    test('should return 403 when trying to update another user', async () => {
      // Create another user
      const user2 = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'user2',
          email: 'user2@example.com',
          password: 'password123',
        });

      // Try to update user2 with token of user1
      const response = await request(app)
        .put(`/api/users/${user2.body.user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          username: 'hacker',
          email: 'hacker@example.com',
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Cannot update other users');
    });

    test('should return 401 without token', async () => {
      const response = await request(app)
        .put(`/api/users/${userId}`)
        .send({
          username: 'updateduser',
          email: 'updated@example.com',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access token required');
    });
  });

  describe('DELETE /api/users/:id', () => {
    test('should delete user account successfully', async () => {
      const response = await request(app)
        .delete(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('User deleted successfully');
    });

    test('should return 403 when trying to delete another user', async () => {
      // Create another user
      const user2 = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'user2',
          email: 'user2@example.com',
          password: 'password123',
        });

      // Try to delete user2 with token of user1
      const response = await request(app)
        .delete(`/api/users/${user2.body.user.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Cannot delete other users');
    });

    test('should return 401 without token', async () => {
      const response = await request(app)
        .delete(`/api/users/${userId}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access token required');
    });
  });
});
