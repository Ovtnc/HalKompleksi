#!/usr/bin/env node

/**
 * Migration Script: Fix HTTP URLs to HTTPS
 * 
 * Bu script veritabanındaki tüm HTTP resim URL'lerini HTTPS'e çevirir
 * ve eski IP adreslerini domain ile değiştirir.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../src/models/Product');
const User = require('../src/models/User');
const MarketReport = require('../src/models/MarketReport');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hal-kompleksi';

// Eski ve yeni URL pattern'leri
const OLD_PATTERNS = [
  'http://halkompleksi.com',
  'http://109.199.114.223',
  'http://109.199.114.223:5001',
  'http://localhost:5001'
];

const NEW_BASE_URL = 'https://halkompleksi.com';

// URL'i düzelt
function fixUrl(url) {
  if (!url || typeof url !== 'string') return url;
  
  // Zaten HTTPS ve doğru domain ise değiştirme
  if (url.startsWith('https://halkompleksi.com')) {
    return url;
  }
  
  // Eski pattern'leri değiştir
  for (const oldPattern of OLD_PATTERNS) {
    if (url.startsWith(oldPattern)) {
      // Sadece base URL'i değiştir, path'i koru
      const path = url.substring(oldPattern.length);
      return `${NEW_BASE_URL}${path}`;
    }
  }
  
  // File path ise tam URL yap
  if (url.startsWith('/uploads/')) {
    return `${NEW_BASE_URL}${url}`;
  }
  
  return url;
}

async function fixProducts() {
  console.log('\n📦 Ürünleri güncelleniyor...');
  
  const products = await Product.find({});
  let updatedCount = 0;
  
  for (const product of products) {
    let needsUpdate = false;
    
    // Resim URL'lerini düzelt
    if (product.images && product.images.length > 0) {
      product.images = product.images.map(image => {
        const oldUrl = image.url;
        const newUrl = fixUrl(oldUrl);
        if (oldUrl !== newUrl) {
          needsUpdate = true;
          console.log(`  ✓ ${oldUrl} → ${newUrl}`);
        }
        return { ...image.toObject(), url: newUrl };
      });
    }
    
    if (needsUpdate) {
      await product.save();
      updatedCount++;
    }
  }
  
  console.log(`✅ ${updatedCount} ürün güncellendi (toplam ${products.length})`);
}

async function fixUsers() {
  console.log('\n👤 Kullanıcılar güncelleniyor...');
  
  const users = await User.find({ profileImage: { $exists: true } });
  let updatedCount = 0;
  
  for (const user of users) {
    const oldUrl = user.profileImage;
    const newUrl = fixUrl(oldUrl);
    
    if (oldUrl !== newUrl) {
      user.profileImage = newUrl;
      await user.save();
      updatedCount++;
      console.log(`  ✓ ${oldUrl} → ${newUrl}`);
    }
  }
  
  console.log(`✅ ${updatedCount} kullanıcı güncellendi (toplam ${users.length})`);
}

async function fixMarketReports() {
  console.log('\n📊 Piyasa raporları güncelleniyor...');
  
  const reports = await MarketReport.find({});
  let updatedCount = 0;
  
  for (const report of reports) {
    let needsUpdate = false;
    
    // Resim URL'lerini düzelt
    if (report.images && report.images.length > 0) {
      report.images = report.images.map(image => {
        const oldUrl = image.url;
        const newUrl = fixUrl(oldUrl);
        if (oldUrl !== newUrl) {
          needsUpdate = true;
          console.log(`  ✓ ${oldUrl} → ${newUrl}`);
        }
        return { ...image.toObject(), url: newUrl };
      });
    }
    
    if (needsUpdate) {
      await report.save();
      updatedCount++;
    }
  }
  
  console.log(`✅ ${updatedCount} rapor güncellendi (toplam ${reports.length})`);
}

async function main() {
  try {
    console.log('🚀 HTTPS URL Migration Script');
    console.log('===============================');
    console.log(`📍 MongoDB: ${MONGODB_URI}`);
    console.log(`🔗 Yeni Base URL: ${NEW_BASE_URL}`);
    console.log('');
    
    // MongoDB'ye bağlan
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı\n');
    
    // Tüm koleksiyonları güncelle
    await fixProducts();
    await fixUsers();
    await fixMarketReports();
    
    console.log('\n===============================');
    console.log('✅ Migration tamamlandı!');
    console.log('===============================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration hatası:', error);
    process.exit(1);
  }
}

// Script'i çalıştır
main();

