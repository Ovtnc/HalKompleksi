const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/models/User');

const resetAdmin = async () => {
  try {
    // MongoDB bağlantısı
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hal-kompleksi', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB bağlandı');

    // Admin kullanıcısını bul ve şifresini güncelle
    const admin = await User.findOne({ email: 'admin@halkompleksi.com' });
    
    if (!admin) {
      console.log('❌ Admin kullanıcısı bulunamadı');
      return;
    }

    // Yeni şifre oluştur
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    // Şifreyi güncelle
    admin.password = hashedPassword;
    admin.userType = 'admin';
    admin.isActive = true;
    
    await admin.save();
    
    console.log('✅ Admin şifresi sıfırlandı:');
    console.log('📧 Email: admin@halkompleksi.com');
    console.log('🔑 Şifre: admin123');
    console.log('👤 Kullanıcı Tipi: admin');

  } catch (error) {
    console.error('❌ Admin sıfırlama hatası:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  }
};

resetAdmin();
