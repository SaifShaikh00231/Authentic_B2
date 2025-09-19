const request = require('supertest');
const mongoose = require('mongoose');
require('dotenv').config();

const app = require('../app');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

beforeAll(async () => {
  // Connect to test database
  await mongoose.connect(process.env.MONGODB_URI_TEST || process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  // Clear users collection before each test
  await User.deleteMany({});
});

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'testuser@example.com',
          password: 'password123',
          role: 'user',
          address: '123 Main St',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');

      // Verify JWT payload
      const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
      expect(decoded).toHaveProperty('id');
      expect(decoded).toHaveProperty('role', 'user');

      expect(res.body.user).toMatchObject({
        email: 'testuser@example.com',
        username: 'testuser',
        role: 'user',
        address: '123 Main St',
      });
    });

    it('should not register user with existing email', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'testuser@example.com',
          password: 'password123',
          role: 'user',
        });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'anotheruser',
          email: 'testuser@example.com',
          password: 'password123',
          role: 'user',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Email already registered.');
    });

    it('should fail registration if username is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: '123456' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('Please provide all required fields.');
    });

    it('should fail registration if email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: '123456' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('Please provide all required fields.');
    });

    it('should fail registration if password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', email: 'test@example.com' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('Please provide all required fields.');
    });

    it('should handle server error gracefully', async () => {
      // Mock User.save to throw error
      jest.spyOn(User.prototype, 'save').mockImplementationOnce(() => {
        throw new Error('DB error');
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'testuser2@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(500);
      expect(res.body.message).toBe('Server error');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Register user before login tests
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'testuser@example.com',
          password: 'password123',
          role: 'user',
          address: '123 Main St',
        });
    });

    it('should login an existing user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');

      const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
      expect(decoded).toHaveProperty('id');
      expect(decoded).toHaveProperty('role', 'user');

      expect(res.body.user).toMatchObject({
        email: 'testuser@example.com',
        username: 'testuser',
        role: 'user',
        address: '123 Main St',
      });
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid credentials.');
    });

    it('should reject login for non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nouser@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid credentials.');
    });

    it('should fail login if email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'password123' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('Please provide email and password.');
    });

    it('should fail login if password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'testuser@example.com' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('Please provide email and password.');
    });

    it('should handle server error gracefully', async () => {
      jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
        throw new Error('DB error');
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'testuser@example.com', password: 'password123' });

      expect(res.statusCode).toEqual(500);
      expect(res.body.message).toBe('Server error');
    });
  });
});
