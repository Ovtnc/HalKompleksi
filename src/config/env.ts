import { Platform } from 'react-native';

// Environment configuration
const getEnvValue = (key: string, defaultValue: string): string => {
  // In production builds, we can read from environment variables
  // For now, we'll use hardcoded values with clear indication
  return defaultValue;
};

// ============================================
// 🌐 URL CONFIGURATION (KOLAY DEĞİŞTİRİLEBİLİR)
// ============================================

// Android emulator için localhost yerine 10.0.2.2 kullan
const LOCALHOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

// 🔧 DEVELOPMENT (Geliştirme) - Localhost
const DEV_CONFIG = {
  API_URL: `http://${LOCALHOST}:5001/api`,
  WEB_URL: `http://${LOCALHOST}:5001`,
  DOMAIN: `${LOCALHOST}:5001`,
};

// 🚀 PRODUCTION (Canlı Sunucu) - IP veya Domain
const PROD_CONFIG = {
  // ⚠️ ŞU ANDA SADECE IP İLE ÇALIŞIYOR (Cloudflare henüz hazır değil)
  API_URL: 'http://109.199.114.223:5001/api',
  WEB_URL: 'http://109.199.114.223:5001',
  DOMAIN: '109.199.114.223:5001',
  
  // 🔒 Cloudflare + SSL hazır olunca aşağıdakini aktif et:
  // API_URL: 'https://halkompleksi.com/api',
  // WEB_URL: 'https://halkompleksi.com',
  // DOMAIN: 'halkompleksi.com',
};

// 🎯 Aktif konfigürasyon seçimi
// DEV_CONFIG veya PROD_CONFIG'i değiştirerek hızlıca geçiş yapabilirsiniz
const ACTIVE_CONFIG = __DEV__ ? DEV_CONFIG : PROD_CONFIG;

// ============================================

// Log configuration on startup
console.log('🌐 ENV Configuration:');
console.log('  Mode:', __DEV__ ? 'DEVELOPMENT' : 'PRODUCTION');
console.log('  Platform:', Platform.OS);
console.log('  API_URL:', ACTIVE_CONFIG.API_URL);
console.log('  WEB_URL:', ACTIVE_CONFIG.WEB_URL);
console.log('  DOMAIN:', ACTIVE_CONFIG.DOMAIN);

export const ENV = {
  // 🌐 URL Configuration
  API_BASE_URL: getEnvValue('API_BASE_URL', ACTIVE_CONFIG.API_URL),
  WEB_BASE_URL: getEnvValue('WEB_BASE_URL', ACTIVE_CONFIG.WEB_URL),
  DOMAIN: getEnvValue('DOMAIN', ACTIVE_CONFIG.DOMAIN),
  
  // 📱 App Configuration
  APP_NAME: 'Hal Kompleksi',
  APP_VERSION: '1.0.0',
  
  // 🔧 Debug Mode
  IS_DEV: __DEV__,
  
  // 📝 Logging
  ENABLE_LOGGING: __DEV__,
  
  // 🔗 Helper methods
  getProductUrl: (productId: string) => `${ACTIVE_CONFIG.WEB_URL}/product/${productId}`,
  getApiUrl: (endpoint: string) => `${ACTIVE_CONFIG.API_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`,
  getWebUrl: (path: string) => `${ACTIVE_CONFIG.WEB_URL}${path.startsWith('/') ? path : '/' + path}`,
};

export default ENV;


