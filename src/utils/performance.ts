import { InteractionManager } from 'react-native';

/**
 * Performance optimization utilities for Hal Kompleksi
 */

// Debounce function for search and API calls
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for scroll events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Run after interactions are complete
export const runAfterInteractions = (callback: () => void) => {
  InteractionManager.runAfterInteractions(callback);
};

// Image optimization
export const getOptimizedImageUrl = (url: string, width?: number, height?: number) => {
  if (!url) return '';
  
  // If it's a local file or already optimized, return as is
  if (url.startsWith('file://') || url.includes('localhost')) {
    return url;
  }
  
  // Add optimization parameters for external images
  const params = new URLSearchParams();
  if (width) params.append('w', width.toString());
  if (height) params.append('h', height.toString());
  params.append('q', '80'); // Quality
  params.append('f', 'auto'); // Format
  
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${params.toString()}`;
};

// Memory management
export const clearMemoryCache = () => {
  if (global.gc) {
    global.gc();
  }
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`Performance [${name}]: ${end - start}ms`);
};

// Lazy loading helper
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) => {
  return React.lazy(importFunc);
};

// Batch state updates
export const batchStateUpdates = (updates: (() => void)[]) => {
  React.unstable_batchedUpdates(() => {
    updates.forEach(update => update());
  });
};

// Image preloading
export const preloadImages = (urls: string[]) => {
  urls.forEach(url => {
    if (url) {
      const img = new Image();
      img.src = url;
    }
  });
};

// Network optimization
export const getNetworkOptimizedConfig = () => {
  return {
    timeout: 10000,
    retries: 3,
    retryDelay: 1000,
    cache: true,
    cacheTimeout: 300000, // 5 minutes
  };
};

// Bundle size optimization
export const isDevelopment = __DEV__;
export const isProduction = !__DEV__;

// Conditional imports for production
export const getProductionImports = () => {
  if (isProduction) {
    return {
      // Only import production dependencies
      analytics: null,
      crashlytics: null,
    };
  }
  return {
    // Import development dependencies
    analytics: require('@react-native-firebase/analytics'),
    crashlytics: require('@react-native-firebase/crashlytics'),
  };
};
