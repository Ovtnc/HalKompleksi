// ============================================
// 🌐 URL CONFIGURATION (KOLAY DEĞİŞTİRİLEBİLİR)
// ============================================

// 🔧 DEVELOPMENT (Geliştirme) - Localhost
const DEV_CONFIG = {
  API_URL: 'http://localhost:5001/api',
  WEB_URL: 'http://localhost:5001',
  FRONTEND_URL: 'http://localhost:8081', // Expo dev server
  DOMAIN: 'localhost',
  PORT: 5001,
};

// 🚀 PRODUCTION (Canlı Sunucu) - HTTPS Domain
const PROD_CONFIG = {
  API_URL: 'https://halkompleksi.com/api',
  WEB_URL: 'https://halkompleksi.com',
  FRONTEND_URL: 'https://halkompleksi.com',
  DOMAIN: 'halkompleksi.com',
  PORT: 5001,
};

// 🎯 Aktif konfigürasyon seçimi
// Environment variable ile kontrol edilir: NODE_ENV=production
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const ACTIVE_CONFIG = IS_PRODUCTION ? PROD_CONFIG : DEV_CONFIG;

// ============================================

module.exports = {
  // 🌐 URL Configuration
  API_URL: process.env.API_URL || ACTIVE_CONFIG.API_URL,
  WEB_URL: process.env.WEB_URL || ACTIVE_CONFIG.WEB_URL,
  FRONTEND_URL: process.env.FRONTEND_URL || ACTIVE_CONFIG.FRONTEND_URL,
  DOMAIN: process.env.DOMAIN || ACTIVE_CONFIG.DOMAIN,
  PORT: process.env.PORT || ACTIVE_CONFIG.PORT,
  
  // 🔧 Environment
  IS_PRODUCTION,
  IS_DEVELOPMENT: !IS_PRODUCTION,
  
  // 🔗 Helper methods
  getProductUrl: (productId) => `${ACTIVE_CONFIG.WEB_URL}/product/${productId}`,
  getApiUrl: (endpoint) => `${ACTIVE_CONFIG.API_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`,
  getWebUrl: (path) => `${ACTIVE_CONFIG.WEB_URL}${path.startsWith('/') ? path : '/' + path}`,
  getUploadUrl: (filename) => `${ACTIVE_CONFIG.WEB_URL}/uploads/${filename}`,
  
  // 📧 Email templates için base URL
  getEmailBaseUrl: () => ACTIVE_CONFIG.WEB_URL,
  
  // 🖼️ Image URL helper
  getImageUrl: (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    if (imagePath.startsWith('/')) {
      return `${ACTIVE_CONFIG.WEB_URL}${imagePath}`;
    }
    return `${ACTIVE_CONFIG.WEB_URL}/${imagePath}`;
  },
};

// ============================================
// 📝 KULLANIM ÖRNEKLERİ:
// ============================================
// const { getProductUrl, getImageUrl, WEB_URL } = require('./config/urls');
// 
// const productLink = getProductUrl('12345');
// const imageUrl = getImageUrl('/uploads/products/image.jpg');
// const baseUrl = WEB_URL;
// ============================================

