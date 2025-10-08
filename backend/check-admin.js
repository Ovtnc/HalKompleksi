const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/models/User');

const checkAdmin = async () => {
  try {
    // MongoDB bağlantısı
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hal-kompleksi', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB bağlandı');

    // Admin kullanıcısını bul
    const admin = await User.findOne({ email: 'admin@halkompleksi.com' });
    
    if (!admin) {
      console.log('❌ Admin kullanıcısı bulunamadı');
      return;
    }

    console.log('✅ Admin kullanıcısı bulundu:');
    console.log('📧 Email:', admin.email);
    console.log('👤 Name:', admin.name);
    console.log('🔑 UserType:', admin.userType);
    console.log('✅ IsActive:', admin.isActive);
    console.log('🔐 Password hash:', admin.password.substring(0, 20) + '...');

    // Şifre kontrolü
    const isMatch = await admin.comparePassword('admin123');
    console.log('🔍 Password match:', isMatch);

  } catch (error) {
    console.error('❌ Admin kontrol hatası:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  }
};

checkAdmin();
