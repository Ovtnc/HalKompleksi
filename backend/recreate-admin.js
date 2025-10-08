const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/models/User');

const recreateAdmin = async () => {
  try {
    // MongoDB bağlantısı
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hal-kompleksi', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB bağlandı');

    // Eski admin'i sil
    await User.deleteOne({ email: 'admin@halkompleksi.com' });
    console.log('🗑️ Eski admin kullanıcısı silindi');

    // Yeni admin oluştur
    const admin = new User({
      name: 'Admin',
      email: 'admin@halkompleksi.com',
      password: 'admin123', // Bu pre-save hook tarafından hash'lenecek
      phone: '05551234567',
      userType: 'admin',
      isActive: true,
      location: {
        city: 'İstanbul'
      }
    });

    await admin.save();
    
    console.log('✅ Yeni admin kullanıcısı oluşturuldu:');
    console.log('📧 Email: admin@halkompleksi.com');
    console.log('🔑 Şifre: admin123');
    console.log('👤 Kullanıcı Tipi: admin');

    // Test et
    const isMatch = await admin.comparePassword('admin123');
    console.log('🔍 Password match test:', isMatch);

  } catch (error) {
    console.error('❌ Admin yeniden oluşturma hatası:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  }
};

recreateAdmin();
