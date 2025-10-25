const request = require('supertest');
const app = require('../../src/server');

describe('End-to-End User Journey', () => {
  let authToken, userId, productId;

  describe('Complete User Registration and Product Management Flow', () => {
    test('should complete full user journey', async () => {
      // Step 1: Register a new user
      const registerData = {
        name: 'E2E Test User',
        email: 'e2e@test.com',
        password: 'password123',
        phone: '05551234567',
        userType: 'seller'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(registerData)
        .expect(201);

      expect(registerResponse.body.token).toBeDefined();
      expect(registerResponse.body.user.email).toBe(registerData.email);
      
      authToken = registerResponse.body.token;
      userId = registerResponse.body.user.id;

      // Step 2: Login with registered user
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: registerData.email,
          password: registerData.password
        })
        .expect(200);

      expect(loginResponse.body.token).toBeDefined();

      // Step 3: Update user profile
      const profileUpdateData = {
        sellerInfo: {
          businessName: 'E2E Test Business',
          businessType: 'Toptan Satış',
          address: 'Test Address, İstanbul'
        }
      };

      const profileResponse = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileUpdateData)
        .expect(200);

      expect(profileResponse.body.message).toBe('Profile updated successfully');

      // Step 4: Create a product
      const productData = {
        title: 'E2E Test Product',
        description: 'This is a test product for E2E testing',
        price: 250,
        category: 'meyve',
        location: {
          city: 'İstanbul',
          district: 'Kadıköy'
        },
        stock: 100,
        unit: 'kg',
        images: []
      };

      const productResponse = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(201);

      expect(productResponse.body.message).toBe('Product created successfully');
      expect(productResponse.body.product.title).toBe(productData.title);
      
      productId = productResponse.body.product._id;

      // Step 5: Get user's products
      const myProductsResponse = await request(app)
        .get('/api/products/seller/my-products')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(myProductsResponse.body.products).toBeDefined();
      expect(myProductsResponse.body.products.length).toBeGreaterThan(0);

      // Step 6: Update the product
      const updateData = {
        title: 'Updated E2E Test Product',
        price: 300
      };

      const updateResponse = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.message).toBe('Product updated successfully');
      expect(updateResponse.body.product.title).toBe(updateData.title);

      // Step 7: Get product details
      const productDetailResponse = await request(app)
        .get(`/api/products/${productId}`)
        .expect(200);

      expect(productDetailResponse.body.product).toBeDefined();
      expect(productDetailResponse.body.product._id).toBe(productId);

      // Step 8: Delete the product
      const deleteResponse = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(deleteResponse.body.message).toBe('Product deleted successfully');
    });
  });

  describe('Admin Workflow', () => {
    let adminToken, adminId;

    beforeEach(async () => {
      // Create admin user
      const adminData = {
        name: 'E2E Admin',
        email: 'admin@test.com',
        password: 'admin123',
        phone: '05559876543',
        userType: 'admin'
      };

      const adminResponse = await request(app)
        .post('/api/auth/register')
        .send(adminData);

      adminToken = adminResponse.body.token;
      adminId = adminResponse.body.user.id;
    });

    test('should complete admin workflow', async () => {
      // Step 1: Get admin dashboard
      const dashboardResponse = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(dashboardResponse.body.stats).toBeDefined();
      expect(dashboardResponse.body.stats.totalUsers).toBeGreaterThanOrEqual(1);

      // Step 2: Get all users
      const usersResponse = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(usersResponse.body.users).toBeDefined();
      expect(Array.isArray(usersResponse.body.users)).toBe(true);

      // Step 3: Get pending products (if any)
      const pendingProductsResponse = await request(app)
        .get('/api/admin/products/pending')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(pendingProductsResponse.body.products).toBeDefined();

      // Step 4: Search users
      const searchResponse = await request(app)
        .get('/api/admin/users/search?q=e2e')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(searchResponse.body.users).toBeDefined();
    });
  });

  describe('Public API Access', () => {
    test('should access public endpoints without authentication', async () => {
      // Test public product listing
      const productsResponse = await request(app)
        .get('/api/products')
        .expect(200);

      expect(productsResponse.body.products).toBeDefined();

      // Test product categories
      const categoriesResponse = await request(app)
        .get('/api/products/categories')
        .expect(200);

      expect(categoriesResponse.body.categories).toBeDefined();
      expect(Array.isArray(categoriesResponse.body.categories)).toBe(true);

      // Test health check
      const healthResponse = await request(app)
        .get('/api/health')
        .expect(200);

      expect(healthResponse.body.status).toBe('OK');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid routes gracefully', async () => {
      const response = await request(app)
        .get('/api/invalid-route')
        .expect(404);

      expect(response.body.message).toBe('Route not found');
    });

    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);
    });

    test('should handle server errors gracefully', async () => {
      // This would test error handling middleware
      const response = await request(app)
        .get('/api/products')
        .expect(200); // Should not crash the server
    });
  });
});
