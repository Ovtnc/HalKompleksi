const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

// Setup test database before all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  console.log('🧪 Test database connected');
});

// Clean up after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Close database connection after all tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
  
  console.log('🧪 Test database disconnected');
});

// Global test utilities
global.testUtils = {
  createTestUser: async (userData = {}) => {
    const User = require('../src/models/User');
    const defaultUser = {
      name: 'Test User',
      email: 'test@test.com',
      password: 'password123',
      phone: '05551234567',
      userType: 'buyer',
      ...userData
    };
    
    const user = new User(defaultUser);
    await user.save();
    return user;
  },
  
  createTestProduct: async (productData = {}) => {
    const Product = require('../src/models/Product');
    const User = require('../src/models/User');
    
    // Create a test seller first
    const seller = await global.testUtils.createTestUser({ userType: 'seller' });
    
    const defaultProduct = {
      title: 'Test Product',
      description: 'Test product description',
      price: 100,
      category: 'meyve',
      seller: seller._id,
      location: {
        city: 'Test City',
        district: 'Test District'
      },
      ...productData
    };
    
    const product = new Product(defaultProduct);
    await product.save();
    return product;
  }
};
