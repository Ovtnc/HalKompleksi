// ============================================
// 🌐 BASIT URL YAPISI - HER ZAMAN AYNI SERVER
// ============================================

<<<<<<< HEAD
// 🎯 CANLI SUNUCU - DOMAIN (Natro DNS)
// ⚠️ PRODUCTION: HTTPS ZORUNLU!
const API_BASE_URL = 'https://halkompleksi.com/api';
const WEB_BASE_URL = 'https://halkompleksi.com';
const DOMAIN = 'halkompleksi.com';

// ⚠️ HTTP sadece development için (App Store reddeder!)
// Development için:
// const API_BASE_URL = 'http://halkompleksi.com/api';
// const WEB_BASE_URL = 'http://halkompleksi.com';
=======
// TypeScript global declaration for React Native's __DEV__
declare const __DEV__: boolean;

// 🎯 LOCAL DEVELOPMENT - Test için localhost kullan
const API_BASE_URL = __DEV__ ? 'http://localhost:5001/api' : 'https://halkompleksi.com/api';
const WEB_BASE_URL = __DEV__ ? 'http://localhost:3000' : 'https://halkompleksi.com';
const DOMAIN = __DEV__ ? 'localhost' : 'halkompleksi.com';

// 🎯 CANLI SUNUCU - DOMAIN (Natro DNS)
// ⚠️ PRODUCTION: HTTPS ZORUNLU (TestFlight/App Store için)
// const API_BASE_URL = 'https://halkompleksi.com/api';
// const WEB_BASE_URL = 'https://halkompleksi.com';
// const DOMAIN = 'halkompleksi.com';

// ⚠️ HTTP sadece development için kullanın (App Store reddeder!)
// Development için:
// const API_BASE_URL = 'http://halkompleksi.com/api';
// const WEB_BASE_URL = 'http://halkompleksi.com';

// IP kullanmak istersen (sadece development):
// const API_BASE_URL = 'http://109.199.114.223/api';
// const WEB_BASE_URL = 'http://109.199.114.223';
// const DOMAIN = '109.199.114.223';
>>>>>>> 9e02814e53691981bfcd19308c1f91b4a1a8de05

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
  getProductDeepLink: (productId: string) => `halkompleksi://product/${productId}`,
  getApiUrl: (endpoint: string) => `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`,
  getWebUrl: (path: string) => `${WEB_BASE_URL}${path.startsWith('/') ? path : '/' + path}`,
};

export default ENV;


