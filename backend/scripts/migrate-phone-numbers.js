/**
 * Migration Script: Telefon numaralarini +90 formatina cevir
 * 
 * Tum kullanicilarin telefon numaralarini +905XXXXXXXXX formatina cevirir
 * 
 * Kullanim:
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
    console.log('📦 MongoDB baglaniyor:', MONGODB_URI);
    
    // MongoDB'ye bağlan
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB baglandi');
    
    // Tum kullanicilari al
    const users = await User.find({});
    console.log('\n📊 Toplam', users.length, 'kullanici bulundu');
    
    let updatedCount = 0;
    let alreadyCorrect = 0;
    let errors = 0;
    
    for (const user of users) {
      try {
        const originalPhone = user.phone;
        
        // Zaten +90 ile basliyorsa atla
        if (originalPhone && originalPhone.startsWith('+90')) {
          console.log('✅', user.email + ': Zaten dogru format (' + originalPhone + ')');
          alreadyCorrect++;
          continue;
        }
        
        // Telefon numarasini normalize et
        if (originalPhone) {
          // Sadece rakamlari al
          let cleanPhone = originalPhone.replace(/[^0-9]/g, '');
          
          // 0 ile basliyorsa 90 ekle
          if (cleanPhone.startsWith('0')) {
            cleanPhone = '90' + cleanPhone.substring(1);
          }
          
          // + ekle
          const newPhone = '+' + cleanPhone;
          
          // Guncelle (validation ve pre-save hook'lari atla)
          await User.updateOne(
            { _id: user._id },
            { $set: { phone: newPhone } }
          );
          
          console.log('🔄', user.email + ':', originalPhone, '->', newPhone);
          updatedCount++;
        } else {
          console.log('⚠️ ', user.email + ': Telefon numarasi yok');
        }
      } catch (err) {
        console.error('❌', user.email + ': Hata -', err.message);
        errors++;
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 Migration Ozeti:');
    console.log('='.repeat(50));
    console.log('✅ Guncellendi:', updatedCount);
    console.log('✓  Zaten dogru:', alreadyCorrect);
    console.log('❌ Hata:', errors);
    console.log('📊 Toplam:', users.length);
    console.log('='.repeat(50));
    
    if (updatedCount > 0) {
      console.log('\n✨ Migration basariyla tamamlandi!');
    } else if (alreadyCorrect === users.length) {
      console.log('\n✨ Tum telefon numaralari zaten dogru formatta!');
    }
    
  } catch (error) {
    console.error('❌ Migration hatasi:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 MongoDB baglantisi kapatildi');
    process.exit(0);
  }
}

// Script'i calistir
console.log('');
console.log('====================================================');
console.log('  📱 Telefon Numarasi Migration Script');
console.log('  Tum numaralari +90 formatina cevirir');
console.log('====================================================');
console.log('');

migratePhoneNumbers();

