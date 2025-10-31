const mongoose = require('mongoose');
const Product = require('../src/models/Product');
require('dotenv').config();

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/hal-kompleksi'
    );
    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

async function checkProducts() {
  try {
    await connectDB();

    // Check all products
    const allProducts = await Product.find({});
    console.log(`\n📊 Toplam ürün sayısı: ${allProducts.length}`);
    
    // Check approved products
    const approvedProducts = await Product.find({ isApproved: true });
    console.log(`✅ Onaylı ürün sayısı: ${approvedProducts.length}`);
    
    // Check available products
    const availableProducts = await Product.find({ isAvailable: true });
    console.log(`🛒 Satışta olan ürün sayısı: ${availableProducts.length}`);
    
    if (allProducts.length > 0) {
      console.log('\n📦 Tüm ürünler:');
      allProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.title}`);
        console.log(`   - Kategori: ${product.category}`);
        console.log(`   - Fiyat: ${product.price} ${product.currency}`);
        console.log(`   - Onaylı: ${product.isApproved ? 'Evet ✅' : 'Hayır ❌'}`);
        console.log(`   - Satışta: ${product.isAvailable ? 'Evet ✅' : 'Hayır ❌'}`);
        console.log(`   - Seller ID: ${product.seller}`);
        console.log(`   - ID: ${product._id}`);
        console.log('');
      });
    } else {
      console.log('\n⚠️  Veritabanında ürün bulunamadı!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkProducts();

