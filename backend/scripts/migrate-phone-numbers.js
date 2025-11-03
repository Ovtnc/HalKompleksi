/**
 * Migration Script: Telefon numaralarını +90 formatına çevir
 * 
 * Tüm kullanıcıların telefon numaralarını +905XXXXXXXXX formatına çevirir
 * 
 * Kullanım:
 * cd backend
 * node scripts/migrate-phone-numbers.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hal-kompleksi';

async function migratePhoneNumbers() {
  try {
    console.log('🔄 Telefon numarası migration başlatılıyor...');
    console.log(`📦 MongoDB'ye bağlanılıyor: ${MONGODB_URI}`);
    
    // MongoDB'ye bağlan
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB'ye bağlandı');
    
    // Tüm kullanıcıları al
    const users = await User.find({});
    console.log(`\n📊 Toplam ${users.length} kullanıcı bulundu`);
    
    let updatedCount = 0;
    let alreadyCorrect = 0;
    let errors = 0;
    
    for (const user of users) {
      try {
        const originalPhone = user.phone;
        
        // Zaten +90 ile başlıyorsa atla
        if (originalPhone && originalPhone.startsWith('+90')) {
          console.log(`✅ ${user.email}: Zaten doğru format (${originalPhone})`);
          alreadyCorrect++;
          continue;
        }
        
        // Telefon numarasını normalize et
        if (originalPhone) {
          // Sadece rakamları al
          let cleanPhone = originalPhone.replace(/[^0-9]/g, '');
          
          // 0 ile başlıyorsa 90 ekle
          if (cleanPhone.startsWith('0')) {
            cleanPhone = '90' + cleanPhone.substring(1);
          }
          
          // + ekle
          const newPhone = '+' + cleanPhone;
          
          // Güncelle (validation ve pre-save hook'ları atla)
          await User.updateOne(
            { _id: user._id },
            { $set: { phone: newPhone } }
          );
          
          console.log(`🔄 ${user.email}: ${originalPhone} → ${newPhone}`);
          updatedCount++;
        } else {
          console.log(`⚠️  ${user.email}: Telefon numarası yok`);
        }
      } catch (err) {
        console.error(`❌ ${user.email}: Hata - ${err.message}`);
        errors++;
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 Migration Özeti:');
    console.log('='.repeat(50));
    console.log(`✅ Güncellendi: ${updatedCount}`);
    console.log(`✓  Zaten doğru: ${alreadyCorrect}`);
    console.log(`❌ Hata: ${errors}`);
    console.log(`📊 Toplam: ${users.length}`);
    console.log('='.repeat(50));
    
    if (updatedCount > 0) {
      console.log('\n✨ Migration başarıyla tamamlandı!');
    } else if (alreadyCorrect === users.length) {
      console.log('\n✨ Tüm telefon numaraları zaten doğru formatta!');
    }
    
  } catch (error) {
    console.error('❌ Migration hatası:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 MongoDB bağlantısı kapatıldı');
    process.exit(0);
  }
}

// Script'i çalıştır
console.log('');
console.log('╔════════════════════════════════════════════════╗');
console.log('║  📱 Telefon Numarası Migration Script         ║');
console.log('║  Tüm numaraları +90 formatına çevirir         ║');
console.log('╚════════════════════════════════════════════════╝');
console.log('');

migratePhoneNumbers();

