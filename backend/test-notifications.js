const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const User = require('./src/models/User');
const Notification = require('./src/models/Notification');
const ProductRequest = require('./src/models/ProductRequest');
const { 
  createNotification, 
  notifyProductPending, 
  notifyProductApproved, 
  notifyProductRejected, 
  notifyProductFeatured, 
  notifyMatchingBuyers 
} = require('./src/utils/notifications');

require('dotenv').config();

// Test configuration
const TEST_CONFIG = {
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/hal-kompleksi',
  TEST_USER_EMAIL: 'test@example.com',
  TEST_SELLER_EMAIL: 'seller@example.com',
  TEST_ADMIN_EMAIL: 'admin@example.com'
};

// Test data
const testUsers = {
  buyer: {
    name: 'Test Buyer',
    email: TEST_CONFIG.TEST_USER_EMAIL,
    password: 'test123',
    phone: '05301234567',
    userType: 'buyer'
  },
  seller: {
    name: 'Test Seller',
    email: TEST_CONFIG.TEST_SELLER_EMAIL,
    password: 'test123',
    phone: '05301234568',
    userType: 'seller'
  },
  admin: {
    name: 'Test Admin',
    email: TEST_CONFIG.TEST_ADMIN_EMAIL,
    password: 'test123',
    phone: '05301234569',
    userType: 'admin'
  }
};

const testProduct = {
  title: 'Test Elma - Organik',
  description: 'Taze ve organik elma, soğuk hava deposunda saklanmış',
  price: 25,
  currency: 'TL',
  category: 'meyve',
  location: {
    city: 'İstanbul',
    district: 'Kadıköy'
  },
  stock: 100,
  unit: 'kg',
  categoryData: {
    organic: true,
    coldStorage: true,
    variety: 'Amasya elması'
  },
  tags: ['organik', 'taze', 'elma']
};

const testProductRequest = {
  category: 'meyve',
  keywords: ['organik', 'elma'],
  city: 'İstanbul'
};

class NotificationTester {
  constructor() {
    this.testResults = [];
    this.testUsers = {};
    this.testProduct = null;
    this.testRequest = null;
  }

  async connectDB() {
    try {
      await mongoose.connect(TEST_CONFIG.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
      });
      console.log('✅ MongoDB Connected for testing');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
  }

  async cleanup() {
    try {
      console.log('🧹 Cleaning up test data...');
      
      // Delete test users
      await User.deleteMany({ 
        email: { $in: [TEST_CONFIG.TEST_USER_EMAIL, TEST_CONFIG.TEST_SELLER_EMAIL, TEST_CONFIG.TEST_ADMIN_EMAIL] } 
      });
      
      // Delete test notifications
      await Notification.deleteMany({ 
        title: { $regex: /Test|test/ } 
      });
      
      // Delete test product requests
      await ProductRequest.deleteMany({ 
        category: 'meyve',
        keywords: { $in: ['organik', 'elma'] }
      });
      
      // Delete test products
      await Product.deleteMany({ 
        title: { $regex: /Test|test/ } 
      });
      
      console.log('✅ Cleanup completed');
    } catch (error) {
      console.error('❌ Cleanup error:', error);
    }
  }

  async createTestUsers() {
    console.log('👥 Creating test users...');
    
    for (const [role, userData] of Object.entries(testUsers)) {
      try {
        // Check if user already exists
        let user = await User.findOne({ email: userData.email });
        
        if (!user) {
          user = new User(userData);
          await user.save();
          console.log(`✅ Created ${role}: ${userData.email}`);
        } else {
          console.log(`ℹ️  ${role} already exists: ${userData.email}`);
        }
        
        this.testUsers[role] = user;
      } catch (error) {
        console.error(`❌ Error creating ${role}:`, error);
        throw error;
      }
    }
  }

  async createTestProduct() {
    console.log('📦 Creating test product...');
    
    try {
      const product = new Product({
        ...testProduct,
        seller: this.testUsers.seller._id,
        images: [{
          url: 'https://via.placeholder.com/400x300?text=Test+Product',
          isPrimary: true,
          type: 'image'
        }]
      });
      
      await product.save();
      this.testProduct = product;
      console.log(`✅ Created test product: ${product.title} (ID: ${product._id})`);
    } catch (error) {
      console.error('❌ Error creating test product:', error);
      throw error;
    }
  }

  async createTestProductRequest() {
    console.log('📋 Creating test product request...');
    
    try {
      const request = new ProductRequest({
        ...testProductRequest,
        user: this.testUsers.buyer._id
      });
      
      await request.save();
      this.testRequest = request;
      console.log(`✅ Created test product request: ${request.category} (ID: ${request._id})`);
    } catch (error) {
      console.error('❌ Error creating test product request:', error);
      throw error;
    }
  }

  async testBasicNotificationCreation() {
    console.log('\n🧪 Testing basic notification creation...');
    
    try {
      const notification = await createNotification(
        this.testUsers.buyer._id,
        'system',
        'Test Bildirimi',
        'Bu bir test bildirimidir.',
        null,
        { testData: 'test' }
      );
      
      if (notification) {
        console.log('✅ Basic notification creation: PASSED');
        this.testResults.push({ test: 'Basic Notification Creation', status: 'PASSED' });
      } else {
        console.log('❌ Basic notification creation: FAILED');
        this.testResults.push({ test: 'Basic Notification Creation', status: 'FAILED' });
      }
    } catch (error) {
      console.error('❌ Basic notification creation error:', error);
      this.testResults.push({ test: 'Basic Notification Creation', status: 'FAILED', error: error.message });
    }
  }

  async testProductPendingNotification() {
    console.log('\n🧪 Testing product pending notification...');
    
    try {
      const notification = await notifyProductPending(
        this.testUsers.seller._id,
        this.testProduct._id,
        this.testProduct.title
      );
      
      if (notification) {
        console.log('✅ Product pending notification: PASSED');
        this.testResults.push({ test: 'Product Pending Notification', status: 'PASSED' });
      } else {
        console.log('❌ Product pending notification: FAILED');
        this.testResults.push({ test: 'Product Pending Notification', status: 'FAILED' });
      }
    } catch (error) {
      console.error('❌ Product pending notification error:', error);
      this.testResults.push({ test: 'Product Pending Notification', status: 'FAILED', error: error.message });
    }
  }

  async testProductApprovedNotification() {
    console.log('\n🧪 Testing product approved notification...');
    
    try {
      const notification = await notifyProductApproved(
        this.testUsers.seller._id,
        this.testProduct._id,
        this.testProduct.title
      );
      
      if (notification) {
        console.log('✅ Product approved notification: PASSED');
        this.testResults.push({ test: 'Product Approved Notification', status: 'PASSED' });
      } else {
        console.log('❌ Product approved notification: FAILED');
        this.testResults.push({ test: 'Product Approved Notification', status: 'FAILED' });
      }
    } catch (error) {
      console.error('❌ Product approved notification error:', error);
      this.testResults.push({ test: 'Product Approved Notification', status: 'FAILED', error: error.message });
    }
  }

  async testProductRejectedNotification() {
    console.log('\n🧪 Testing product rejected notification...');
    
    try {
      const notification = await notifyProductRejected(
        this.testUsers.seller._id,
        this.testProduct._id,
        this.testProduct.title,
        'Test rejection reason'
      );
      
      if (notification) {
        console.log('✅ Product rejected notification: PASSED');
        this.testResults.push({ test: 'Product Rejected Notification', status: 'PASSED' });
      } else {
        console.log('❌ Product rejected notification: FAILED');
        this.testResults.push({ test: 'Product Rejected Notification', status: 'FAILED' });
      }
    } catch (error) {
      console.error('❌ Product rejected notification error:', error);
      this.testResults.push({ test: 'Product Rejected Notification', status: 'FAILED', error: error.message });
    }
  }

  async testProductFeaturedNotification() {
    console.log('\n🧪 Testing product featured notification...');
    
    try {
      const notification = await notifyProductFeatured(
        this.testUsers.seller._id,
        this.testProduct._id,
        this.testProduct.title
      );
      
      if (notification) {
        console.log('✅ Product featured notification: PASSED');
        this.testResults.push({ test: 'Product Featured Notification', status: 'PASSED' });
      } else {
        console.log('❌ Product featured notification: FAILED');
        this.testResults.push({ test: 'Product Featured Notification', status: 'FAILED' });
      }
    } catch (error) {
      console.error('❌ Product featured notification error:', error);
      this.testResults.push({ test: 'Product Featured Notification', status: 'FAILED', error: error.message });
    }
  }

  async testMatchingBuyersNotification() {
    console.log('\n🧪 Testing matching buyers notification...');
    
    try {
      // First approve the product so it can trigger notifications
      this.testProduct.isApproved = true;
      await this.testProduct.save();
      
      const notifiedCount = await notifyMatchingBuyers(this.testProduct);
      
      if (notifiedCount > 0) {
        console.log(`✅ Matching buyers notification: PASSED (${notifiedCount} buyers notified)`);
        this.testResults.push({ test: 'Matching Buyers Notification', status: 'PASSED', count: notifiedCount });
      } else {
        console.log('❌ Matching buyers notification: FAILED (no buyers notified)');
        this.testResults.push({ test: 'Matching Buyers Notification', status: 'FAILED' });
      }
    } catch (error) {
      console.error('❌ Matching buyers notification error:', error);
      this.testResults.push({ test: 'Matching Buyers Notification', status: 'FAILED', error: error.message });
    }
  }

  async testNotificationAPI() {
    console.log('\n🧪 Testing notification API endpoints...');
    
    try {
      // Test getting notifications
      const notifications = await Notification.find({ user: this.testUsers.buyer._id });
      console.log(`✅ Found ${notifications.length} notifications for buyer`);
      
      // Test marking notification as read
      if (notifications.length > 0) {
        const notification = notifications[0];
        notification.isRead = true;
        await notification.save();
        console.log('✅ Marked notification as read');
      }
      
      // Test unread count
      const unreadCount = await Notification.countDocuments({ 
        user: this.testUsers.buyer._id, 
        isRead: false 
      });
      console.log(`✅ Unread notifications count: ${unreadCount}`);
      
      this.testResults.push({ test: 'Notification API', status: 'PASSED' });
    } catch (error) {
      console.error('❌ Notification API test error:', error);
      this.testResults.push({ test: 'Notification API', status: 'FAILED', error: error.message });
    }
  }

  async testProductRequestAPI() {
    console.log('\n🧪 Testing product request API...');
    
    try {
      // Test getting product requests
      const requests = await ProductRequest.find({ user: this.testUsers.buyer._id });
      console.log(`✅ Found ${requests.length} product requests for buyer`);
      
      // Test creating a new product request
      const newRequest = new ProductRequest({
        user: this.testUsers.buyer._id,
        category: 'sebze',
        keywords: ['domates', 'taze'],
        city: 'Ankara'
      });
      
      await newRequest.save();
      console.log('✅ Created new product request');
      
      // Test deleting product request
      await ProductRequest.findByIdAndDelete(newRequest._id);
      console.log('✅ Deleted product request');
      
      this.testResults.push({ test: 'Product Request API', status: 'PASSED' });
    } catch (error) {
      console.error('❌ Product request API test error:', error);
      this.testResults.push({ test: 'Product Request API', status: 'FAILED', error: error.message });
    }
  }

  async testComplexMatchingScenario() {
    console.log('\n🧪 Testing complex matching scenario...');
    
    try {
      // Create multiple product requests with different criteria
      const requests = [
        {
          user: this.testUsers.buyer._id,
          category: 'meyve',
          keywords: ['elma'],
          city: 'İstanbul'
        },
        {
          user: this.testUsers.buyer._id,
          category: 'meyve',
          keywords: ['organik'],
          city: 'İstanbul'
        },
        {
          user: this.testUsers.buyer._id,
          category: 'meyve',
          keywords: ['taze'],
          city: null // No city filter
        }
      ];
      
      const createdRequests = [];
      for (const requestData of requests) {
        const request = new ProductRequest(requestData);
        await request.save();
        createdRequests.push(request);
      }
      
      console.log(`✅ Created ${createdRequests.length} test requests`);
      
      // Create a new product that should match all requests
      const matchingProduct = new Product({
        title: 'Yeni Organik Elma',
        description: 'Taze ve organik elma',
        price: 30,
        currency: 'TL',
        category: 'meyve',
        location: {
          city: 'İstanbul',
          district: 'Beşiktaş'
        },
        stock: 50,
        unit: 'kg',
        seller: this.testUsers.seller._id,
        isApproved: true,
        images: [{
          url: 'https://via.placeholder.com/400x300?text=Matching+Product',
          isPrimary: true,
          type: 'image'
        }]
      });
      
      await matchingProduct.save();
      console.log('✅ Created matching product');
      
      // Test notification for matching buyers
      const notifiedCount = await notifyMatchingBuyers(matchingProduct);
      console.log(`✅ Notified ${notifiedCount} buyers for matching product`);
      
      // Clean up test requests
      await ProductRequest.deleteMany({ _id: { $in: createdRequests.map(r => r._id) } });
      await Product.findByIdAndDelete(matchingProduct._id);
      
      this.testResults.push({ test: 'Complex Matching Scenario', status: 'PASSED', count: notifiedCount });
    } catch (error) {
      console.error('❌ Complex matching scenario error:', error);
      this.testResults.push({ test: 'Complex Matching Scenario', status: 'FAILED', error: error.message });
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Notification System Tests...\n');
    
    try {
      await this.connectDB();
      await this.cleanup();
      await this.createTestUsers();
      await this.createTestProduct();
      await this.createTestProductRequest();
      
      // Run all tests
      await this.testBasicNotificationCreation();
      await this.testProductPendingNotification();
      await this.testProductApprovedNotification();
      await this.testProductRejectedNotification();
      await this.testProductFeaturedNotification();
      await this.testMatchingBuyersNotification();
      await this.testNotificationAPI();
      await this.testProductRequestAPI();
      await this.testComplexMatchingScenario();
      
      // Print results
      this.printTestResults();
      
    } catch (error) {
      console.error('❌ Test execution error:', error);
    } finally {
      await this.cleanup();
      await mongoose.connection.close();
      console.log('\n✅ Test completed and database connection closed');
    }
  }

  printTestResults() {
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(50));
    
    const passed = this.testResults.filter(r => r.status === 'PASSED').length;
    const failed = this.testResults.filter(r => r.status === 'FAILED').length;
    const total = this.testResults.length;
    
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    console.log('\n📋 DETAILED RESULTS:');
    this.testResults.forEach((result, index) => {
      const status = result.status === 'PASSED' ? '✅' : '❌';
      const count = result.count ? ` (${result.count})` : '';
      const error = result.error ? ` - Error: ${result.error}` : '';
      console.log(`${index + 1}. ${status} ${result.test}${count}${error}`);
    });
    
    if (failed === 0) {
      console.log('\n🎉 All tests passed! Notification system is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Please check the errors above.');
    }
  }
}

// Run tests
if (require.main === module) {
  const tester = new NotificationTester();
  tester.runAllTests().catch(console.error);
}

module.exports = NotificationTester;

