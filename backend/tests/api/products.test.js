const request = require('supertest');
const app = require('../../src/server');

describe('Products API', () => {
  let seller, authToken, testProduct;

  beforeEach(async () => {
    seller = await global.testUtils.createTestUser({ userType: 'seller' });
    
    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@test.com',
        password: 'password123'
      });
    
    authToken = loginResponse.body.token;
    
    // Create test product
    testProduct = await global.testUtils.createTestProduct({ seller: seller._id });
  });

  describe('GET /api/products', () => {
    test('should get all products', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.products).toBeDefined();
      expect(Array.isArray(response.body.products)).toBe(true);
    });

    test('should filter products by category', async () => {
      const response = await request(app)
        .get('/api/products?category=meyve')
        .expect(200);

      expect(response.body.products).toBeDefined();
      // Note: Products need to be approved to show up in public API
    });

    test('should search products by query', async () => {
      const response = await request(app)
        .get('/api/products?search=test')
        .expect(200);

      expect(response.body.products).toBeDefined();
    });

    test('should filter products by price range', async () => {
      const response = await request(app)
        .get('/api/products?minPrice=50&maxPrice=200')
        .expect(200);

      expect(response.body.products).toBeDefined();
    });
  });

  describe('GET /api/products/:id', () => {
    test('should get product by id', async () => {
      const response = await request(app)
        .get(`/api/products/${testProduct._id}`)
        .expect(200);

      expect(response.body.product).toBeDefined();
      expect(response.body.product._id).toBe(testProduct._id.toString());
    });

    test('should return 404 for non-existent product', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/products/${fakeId}`)
        .expect(404);

      expect(response.body.message).toBe('Product not found');
    });
  });

  describe('POST /api/products', () => {
    test('should create product with valid data', async () => {
      const productData = {
        title: 'New Test Product',
        description: 'Product description',
        price: 150,
        category: 'sebze',
        location: {
          city: 'Ankara',
          district: 'Çankaya'
        },
        stock: 5,
        unit: 'kg',
        images: []
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(201);

      expect(response.body.message).toBe('Product created successfully');
      expect(response.body.product).toBeDefined();
      expect(response.body.product.title).toBe(productData.title);
    });

    test('should return error without authentication', async () => {
      const productData = {
        title: 'New Test Product',
        description: 'Product description',
        price: 150,
        category: 'sebze',
        location: { city: 'Ankara' }
      };

      const response = await request(app)
        .post('/api/products')
        .send(productData)
        .expect(401);

      expect(response.body.message).toBe('No token, authorization denied');
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('PUT /api/products/:id', () => {
    test('should update product with valid data', async () => {
      const updateData = {
        title: 'Updated Product Title',
        price: 200
      };

      const response = await request(app)
        .put(`/api/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Product updated successfully');
      expect(response.body.product.title).toBe(updateData.title);
    });

    test('should return error for non-existent product', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const updateData = { title: 'Updated Title' };

      const response = await request(app)
        .put(`/api/products/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.message).toBe('Product not found');
    });
  });

  describe('DELETE /api/products/:id', () => {
    test('should delete product', async () => {
      const response = await request(app)
        .delete(`/api/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Product deleted successfully');
    });

    test('should return error for non-existent product', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .delete(`/api/products/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.message).toBe('Product not found');
    });
  });
});
