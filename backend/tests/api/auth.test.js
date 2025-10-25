const request = require('supertest');
const app = require('../../src/server');

describe('Authentication API', () => {
  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123',
        phone: '05551234567',
        userType: 'buyer'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(userData.email);
    });

    test('should return error for duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123',
        phone: '05551234567',
        userType: 'buyer'
      };

      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.message).toBe('User already exists with this email');
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toBeDefined();
    });

    test('should validate email format', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
        phone: '05551234567',
        userType: 'buyer'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await global.testUtils.createTestUser();
    });

    test('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@test.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(loginData.email);
    });

    test('should return error for invalid credentials', async () => {
      const loginData = {
        email: 'test@test.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.message).toBe('Invalid credentials');
    });

    test('should return error for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@test.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.message).toBe('Invalid credentials');
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('GET /api/auth/me', () => {
    let testUser, authToken;

    beforeEach(async () => {
      testUser = await global.testUtils.createTestUser();
      
      // Login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'password123'
        });
      
      authToken = loginResponse.body.token;
    });

    test('should return current user with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('test@test.com');
    });

    test('should return error without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.message).toBe('No token, authorization denied');
    });

    test('should return error with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.message).toBe('Token is not valid');
    });
  });
});
