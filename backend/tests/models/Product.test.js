const Product = require('../../src/models/Product');
const User = require('../../src/models/User');

describe('Product Model', () => {
  let seller;

  beforeEach(async () => {
    seller = await global.testUtils.createTestUser({ userType: 'seller' });
  });

  describe('Product Creation', () => {
    test('should create a product with valid data', async () => {
      const productData = {
        title: 'Test Product',
        description: 'Test product description',
        price: 100,
        category: 'meyve',
        seller: seller._id,
        location: {
          city: 'İstanbul',
          district: 'Kadıköy'
        },
        stock: 10,
        unit: 'kg'
      };

      const product = new Product(productData);
      const savedProduct = await product.save();

      expect(savedProduct._id).toBeDefined();
      expect(savedProduct.title).toBe(productData.title);
      expect(savedProduct.price).toBe(productData.price);
      expect(savedProduct.category).toBe(productData.category);
      expect(savedProduct.seller.toString()).toBe(seller._id.toString());
    });

    test('should validate required fields', async () => {
      const product = new Product({});

      await expect(product.save()).rejects.toThrow();
    });

    test('should validate price is not negative', async () => {
      const productData = {
        title: 'Test Product',
        description: 'Test product description',
        price: -100,
        category: 'meyve',
        seller: seller._id,
        location: { city: 'İstanbul' }
      };

      const product = new Product(productData);
      await expect(product.save()).rejects.toThrow();
    });

    test('should validate category enum', async () => {
      const productData = {
        title: 'Test Product',
        description: 'Test description',
        price: 100,
        category: 'invalid-category',
        seller: seller._id,
        location: { city: 'İstanbul' }
      };

      const product = new Product(productData);
      await expect(product.save()).rejects.toThrow();
    });
  });

  describe('Product Methods', () => {
    let product;

    beforeEach(async () => {
      const productData = {
        title: 'Test Product',
        description: 'Test product description',
        price: 100,
        category: 'meyve',
        seller: seller._id,
        location: { city: 'İstanbul' }
      };

      product = new Product(productData);
      await product.save();
    });

    test('should increment views', async () => {
      const initialViews = product.views;
      await product.incrementViews();
      
      expect(product.views).toBe(initialViews + 1);
    });

    test('should toggle favorite', async () => {
      const buyer = await global.testUtils.createTestUser({ userType: 'buyer' });
      
      // Add to favorites
      await product.toggleFavorite(buyer._id);
      expect(product.favorites).toContain(buyer._id);
      
      // Remove from favorites
      await product.toggleFavorite(buyer._id);
      expect(product.favorites).not.toContain(buyer._id);
    });
  });

  describe('Product Virtuals', () => {
    test('should return primary image', async () => {
      const productData = {
        title: 'Test Product',
        description: 'Test description',
        price: 100,
        category: 'meyve',
        seller: seller._id,
        location: { city: 'İstanbul' },
        images: [
          { url: 'image1.jpg', isPrimary: false },
          { url: 'image2.jpg', isPrimary: true },
          { url: 'image3.jpg', isPrimary: false }
        ]
      };

      const product = new Product(productData);
      await product.save();

      expect(product.primaryImage).toBe('image2.jpg');
    });

    test('should return first image if no primary', async () => {
      const productData = {
        title: 'Test Product',
        description: 'Test description',
        price: 100,
        category: 'meyve',
        seller: seller._id,
        location: { city: 'İstanbul' },
        images: [
          { url: 'image1.jpg', isPrimary: false },
          { url: 'image2.jpg', isPrimary: false }
        ]
      };

      const product = new Product(productData);
      await product.save();

      expect(product.primaryImage).toBe('image1.jpg');
    });
  });
});
