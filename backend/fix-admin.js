const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/models/User');

const fixAdmin = async () => {
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

    // Şifreyi manuel olarak hash'le
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // Şifreyi güncelle
    admin.password = hashedPassword;
    admin.userType = 'admin';
    admin.isActive = true;
    
    await admin.save();
    
    console.log('✅ Admin şifresi düzeltildi:');
    console.log('📧 Email: admin@halkompleksi.com');
    console.log('🔑 Şifre: admin123');
    console.log('👤 Kullanıcı Tipi: admin');

    // Test et
    const isMatch = await admin.comparePassword('admin123');
    console.log('🔍 Password match test:', isMatch);

  } catch (error) {
    console.error('❌ Admin düzeltme hatası:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  }
};

fixAdmin();
