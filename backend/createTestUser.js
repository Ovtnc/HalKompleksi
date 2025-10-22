const mongoose = require('mongoose');
const User = require('./src/models/User');

const createTestUsers = async () => {
  try {
    // MongoDB bağlantısı
    await mongoose.connect('mongodb://localhost:27017/hal-kompleksi');
    console.log('✅ MongoDB bağlantısı başarılı');

    // Mevcut kullanıcıyı kontrol et
    const existingUser = await User.findOne({ email: 'test@test.com' });
    if (existingUser) {
      console.log('ℹ️  Test kullanıcısı zaten mevcut');
      console.log('Email: test@test.com');
      console.log('Password: 123456');
      console.log('Role: buyer');
      await mongoose.connection.close();
      return;
    }

    // Test kullanıcısı oluştur - ALICI
    const buyer = new User({
      name: 'Test Alıcı',
      email: 'test@test.com',
      password: '123456',
      phone: '+905551234567',
      userType: 'buyer',
    });
    await buyer.save();
    console.log('✅ Alıcı kullanıcısı oluşturuldu:');
    console.log('   Email: test@test.com');
    console.log('   Password: 123456');
    console.log('   Role: buyer');

    // Test kullanıcısı oluştur - SATICI
    const seller = new User({
      name: 'Test Satıcı',
      email: 'seller@test.com',
      password: '123456',
      phone: '+905551234568',
      userType: 'seller',
      sellerInfo: {
        businessName: 'Test İşletmesi',
        businessType: 'Toptancı',
        companyName: 'Test Ltd. Şti.',
        description: 'Test satıcı hesabı',
      },
    });
    await seller.save();
    console.log('✅ Satıcı kullanıcısı oluşturuldu:');
    console.log('   Email: seller@test.com');
    console.log('   Password: 123456');
    console.log('   Role: seller');

    // Admin kullanıcısı
    const admin = new User({
      name: 'Admin',
      email: 'admin@test.com',
      password: '123456',
      phone: '+905551234569',
      userType: 'admin',
    });
    await admin.save();
    console.log('✅ Admin kullanıcısı oluşturuldu:');
    console.log('   Email: admin@test.com');
    console.log('   Password: 123456');
    console.log('   Role: admin');

    await mongoose.connection.close();
    console.log('\n🎉 Tüm test kullanıcıları başarıyla oluşturuldu!');
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
};

createTestUsers();

