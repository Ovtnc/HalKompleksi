// API Configuration
// Her zaman production sunucusuna istek at
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://halkompleksi.com/api';
const WEB_BASE_URL = import.meta.env.VITE_WEB_BASE_URL || 'https://halkompleksi.com';

// Log API configuration for debugging
console.log('🌐 API Configuration:', {
  API_BASE_URL,
  WEB_BASE_URL,
  hostname: window.location.hostname,
  env: import.meta.env.MODE,
});

export const ENV = {
  API_BASE_URL,
  WEB_BASE_URL,
  isDevelopment: import.meta.env.DEV,
  getProductUrl: (productId: string) => `${WEB_BASE_URL}/product/${productId}`,
  getApiUrl: (endpoint: string) => `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`,
};

export default ENV;

