const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/models/User');

const createAdmin = async () => {
  try {
    // MongoDB bağlantısı
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hal-kompleksi', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB bağlandı');

    // Admin kullanıcısı var mı kontrol et
    const existingAdmin = await User.findOne({ email: 'admin@halkompleksi.com' });
    
    if (existingAdmin) {
      console.log('Admin kullanıcısı zaten mevcut:', existingAdmin.email);
      return;
    }

    // Admin kullanıcısı oluştur
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = new User({
      name: 'Admin',
      email: 'admin@halkompleksi.com',
      password: hashedPassword,
      phone: '05551234567',
      userType: 'admin',
      isActive: true,
      location: {
        city: 'İstanbul'
      }
    });

    await admin.save();
    console.log('✅ Admin kullanıcısı oluşturuldu:');
    console.log('📧 Email: admin@halkompleksi.com');
    console.log('🔑 Şifre: admin123');
    console.log('👤 Kullanıcı Tipi: admin');

  } catch (error) {
    console.error('❌ Admin oluşturma hatası:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  }
};

createAdmin();
