const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');

// Use test database
process.env.NODE_ENV = 'test';
process.env.MONGO_URI_TEST = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/blogplatform_test';
process.env.JWT_SECRET = 'test_jwt_secret_key_for_testing';

describe('Auth API', () => {
  beforeAll(async () => {
    // Connect handled in app.js via connectDB
    await new Promise((res) => setTimeout(res, 500));
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  // ── Register ──────────────────────────────────────────────────────────────
  describe('POST /api/auth/register', () => {
    it('should register a new user and return token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password1',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe('test@example.com');
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    it('should fail with duplicate email', async () => {
      await User.create({ name: 'Existing', email: 'test@example.com', password: 'Password1' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'New', email: 'test@example.com', password: 'Password1' });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should fail with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'not-an-email', password: 'Password1' });

      expect(res.statusCode).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should fail with weak password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'test@example.com', password: '123' });

      expect(res.statusCode).toBe(422);
    });

    it('should fail with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' });

      expect(res.statusCode).toBe(422);
    });
  });

  // ── Login ─────────────────────────────────────────────────────────────────
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({ name: 'Test User', email: 'test@example.com', password: 'Password1' });
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'Password1' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
    });

    it('should fail with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'WrongPass' });

      expect(res.statusCode).toBe(401);
    });

    it('should fail with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'Password1' });

      expect(res.statusCode).toBe(401);
    });
  });

  // ── Protected routes ──────────────────────────────────────────────────────
  describe('GET /api/auth/me', () => {
    it('should return authenticated user', async () => {
      // Register then use token
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test User', email: 'test@example.com', password: 'Password1' });

      const { token } = registerRes.body.data;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.user.email).toBe('test@example.com');
    });

    it('should reject request without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });

    it('should reject request with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken123');
      expect(res.statusCode).toBe(401);
    });
  });
});
