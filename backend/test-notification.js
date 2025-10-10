// Test script to create sample notifications and products for testing
const mongoose = require('mongoose');
const Notification = require('./src/models/Notification');
const Product = require('./src/models/Product');
const User = require('./src/models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/hal-kompleksi', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createTestData() {
  try {
    console.log('🧪 Creating test data...');

    // Find a buyer user
    const buyer = await User.findOne({ userType: 'buyer' });
    if (!buyer) {
      console.log('❌ No buyer user found. Please create a buyer user first.');
      return;
    }

    // Create test products
    const testProducts = [
      {
        title: 'Marul',
        description: 'Lorolosso Marul deneme',
        price: 88,
        currency: 'TL',
        category: 'sebze',
        unit: 'kg',
        stock: 55,
        location: { city: 'İstanbul' },
        seller: buyer._id, // Using buyer as seller for test
        isApproved: true,
        categoryData: { organic: true, coldStorage: true }
      },
      {
        title: 'Marul',
        description: 'Marul bildirim deneme',
        price: 11,
        currency: 'TL',
        category: 'sebze',
        unit: 'kg',
        stock: 1,
        location: { city: 'İstanbul' },
        seller: buyer._id,
        isApproved: true,
        categoryData: { coldStorage: true }
      }
    ];

    // Create products
    const createdProducts = await Product.insertMany(testProducts);
    console.log('✅ Created test products:', createdProducts.length);

    // Create test notifications
    const testNotifications = [
      {
        user: buyer._id,
        type: 'product_available',
        title: '"Marul" Ürünü Eklendi! 🎯',
        message: '"Marul" - sebze kategorisinde aradığınız ürün eklendi. Talebiniz tamamlandı ve silindi.',
        product: createdProducts[0]._id,
        data: {
          category: 'sebze',
          city: 'İstanbul',
          keywords: ['marul'],
          matchedRequestId: new mongoose.Types.ObjectId(),
          productTitle: 'Marul',
          productPrice: 88,
          productUnit: 'kg',
          searchQuery: 'marul'
        },
        isRead: false,
        createdAt: new Date()
      },
      {
        user: buyer._id,
        type: 'product_available',
        title: '"Marul" Ürünü Eklendi! 🎯',
        message: '"Marul" - sebze kategorisinde aradığınız ürün eklendi. Talebiniz tamamlandı ve silindi.',
        product: createdProducts[1]._id,
        data: {
          category: 'sebze',
          city: 'İstanbul',
          keywords: ['marul'],
          matchedRequestId: new mongoose.Types.ObjectId(),
          productTitle: 'Marul',
          productPrice: 11,
          productUnit: 'kg',
          searchQuery: 'marul'
        },
        isRead: false,
        createdAt: new Date(Date.now() - 26 * 60 * 1000) // 26 minutes ago
      }
    ];

    // Create notifications
    const createdNotifications = await Notification.insertMany(testNotifications);
    console.log('✅ Created test notifications:', createdNotifications.length);

    console.log('🎉 Test data created successfully!');
    console.log('📱 You can now test the notification system in the app.');
    console.log(`👤 Test user: ${buyer.name} (${buyer.email})`);
    console.log(`🔔 Notifications created for user: ${buyer._id}`);

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
createTestData();
