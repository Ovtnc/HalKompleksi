// ============================================
// 🌐 BASIT URL YAPISI - HER ZAMAN AYNI SERVER
// ============================================

// 🎯 CANLI SUNUCU - DOMAIN (Natro DNS)
// Hem development hem production için aynı
const API_BASE_URL = 'http://halkompleksi.com/api';
const WEB_BASE_URL = 'http://halkompleksi.com';
const DOMAIN = 'halkompleksi.com';

// IP kullanmak istersen:
// const API_BASE_URL = 'http://109.199.114.223/api';
// const WEB_BASE_URL = 'http://109.199.114.223';
// const DOMAIN = '109.199.114.223';

// ============================================

// Başlangıçta log
console.log('🌐 API Configuration:');
console.log('  API_BASE_URL:', API_BASE_URL);
console.log('  WEB_BASE_URL:', WEB_BASE_URL);
console.log('  DOMAIN:', DOMAIN);

export const ENV = {
  // 🌐 URL Configuration
  API_BASE_URL,
  WEB_BASE_URL,
  DOMAIN,
  
  // 📱 App Configuration
  APP_NAME: 'Hal Kompleksi',
  APP_VERSION: '1.0.0',
  
  // 🔧 Debug Mode
  IS_DEV: __DEV__,
  
  // 📝 Logging
  ENABLE_LOGGING: __DEV__,
  
  // 🔗 Helper methods
  getProductUrl: (productId: string) => `${WEB_BASE_URL}/product/${productId}`,
  getApiUrl: (endpoint: string) => `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`,
  getWebUrl: (path: string) => `${WEB_BASE_URL}${path.startsWith('/') ? path : '/' + path}`,
};

export default ENV;


