const User = require('../../src/models/User');

describe('User Model', () => {
  describe('User Creation', () => {
    test('should create a user with valid data', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123',
        phone: '05551234567',
        userType: 'buyer'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.name).toBe(userData.name);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.phone).toBe(userData.phone);
      expect(savedUser.userType).toBe(userData.userType);
      expect(savedUser.password).not.toBe(userData.password); // Should be hashed
    });

    test('should hash password before saving', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123',
        phone: '05551234567',
        userType: 'buyer'
      };

      const user = new User(userData);
      await user.save();

      expect(user.password).not.toBe('password123');
      expect(user.password.length).toBeGreaterThan(20); // bcrypt hash length
    });

    test('should validate required fields', async () => {
      const user = new User({});

      await expect(user.save()).rejects.toThrow();
    });

    test('should validate email format', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
        phone: '05551234567',
        userType: 'buyer'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    test('should validate phone format', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123',
        phone: 'invalid-phone',
        userType: 'buyer'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });
  });

  describe('Password Comparison', () => {
    test('should compare password correctly', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123',
        phone: '05551234567',
        userType: 'buyer'
      };

      const user = new User(userData);
      await user.save();

      const isMatch = await user.comparePassword('password123');
      expect(isMatch).toBe(true);

      const isNotMatch = await user.comparePassword('wrongpassword');
      expect(isNotMatch).toBe(false);
    });
  });

  describe('User Roles', () => {
    test('should set userRoles and activeRole based on userType', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123',
        phone: '05551234567',
        userType: 'seller'
      };

      const user = new User(userData);
      await user.save();

      expect(user.userRoles).toContain('seller');
      expect(user.activeRole).toBe('seller');
    });
  });

  describe('JSON Output', () => {
    test('should not include password in JSON output', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123',
        phone: '05551234567',
        userType: 'buyer'
      };

      const user = new User(userData);
      await user.save();

      const userJSON = user.toJSON();
      expect(userJSON.password).toBeUndefined();
    });
  });
});
