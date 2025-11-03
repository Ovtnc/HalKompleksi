import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../config/env';

// VPS API URL - Use VPS server for production
const API_BASE_URL = ENV.API_BASE_URL;

// Fetch with timeout - 30 saniye (video upload için)
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 30000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('İstek zaman aşımına uğradı. Lütfen internet bağlantınızı kontrol edin.');
    }
    throw error;
  }
};

// Helper function to get auth headers
const getAuthHeaders = async (token?: string) => {
  let authToken = token;
  if (!authToken) {
    authToken = await AsyncStorage.getItem('authToken') || undefined;
  }

  return {
    'Content-Type': 'application/json',
    ...(authToken && { Authorization: `Bearer ${authToken}` })
  };
};

// Enhanced error handling
const handleApiError = async (response: Response, context: string) => {
  let errorMessage = 'Bir hata oluştu';
  
  try {
    const errorData = await response.json();
    errorMessage = errorData.message || errorData.error || errorMessage;
  } catch {
    // If response is not JSON, use status text
    errorMessage = response.statusText || errorMessage;
  }

  // Handle specific HTTP status codes
  switch (response.status) {
    case 401:
      errorMessage = 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
      // Clear auth token on unauthorized
      await AsyncStorage.removeItem('authToken');
      break;
    case 403:
      errorMessage = 'Bu işlem için yetkiniz bulunmuyor.';
      break;
    case 404:
      errorMessage = 'Aranan kaynak bulunamadı.';
      break;
    case 409:
      errorMessage = 'Bu işlem zaten mevcut.';
      break;
    case 422:
      errorMessage = 'Girilen bilgiler geçersiz.';
      break;
    case 500:
      errorMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
      break;
    default:
      if (response.status >= 500) {
        errorMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
      }
  }

  if (__DEV__) {
    console.error(`API Error in ${context}:`, {
      status: response.status,
      statusText: response.statusText,
      message: errorMessage
    });
  }

  throw new Error(errorMessage);
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    }, 15000);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    
    // Store token in AsyncStorage (consistent with AuthContext)
    if (data.token) {
      await AsyncStorage.setItem('authToken', data.token);
    }

    return data;
  },

  register: async (userData: any) => {
    console.log('DEBUG - API register called with:', userData);
    console.log('DEBUG - API URL:', `${API_BASE_URL}/auth/register`);
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    }, 15000);

    console.log('DEBUG - API register response status:', response.status);
    console.log('DEBUG - API register response ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
      console.log('DEBUG - API register error data:', errorData);
      throw new Error(errorData.message || 'Registration failed');
    }

    const data = await response.json();
    console.log('DEBUG - API register success data:', data);
    
    // Store token in AsyncStorage (consistent with AuthContext)
    if (data.token) {
      await AsyncStorage.setItem('authToken', data.token);
    }

    return data;
  },

  logout: async () => {
    await AsyncStorage.removeItem('authToken');
  },

  getMe: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/auth/me`, { headers });
    
    if (!response.ok) {
      if (response.status === 401) {
        await AsyncStorage.removeItem('authToken');
        throw new Error('Unauthorized');
      }
      throw new Error('Failed to get user info');
    }
    
    return await response.json();
  },

};

// Categories API
export const categoriesAPI = {
  getCategories: async () => {
    const url = `${API_BASE_URL}/products/categories`;
    console.log('📡 Fetching categories from:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('❌ Categories fetch failed:', response.status);
      throw new Error('Failed to fetch categories');
    }
    
    return await response.json();
  },
};

// Products API
export const productsAPI = {
  getProducts: async (params?: any) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          queryParams.append(key, params[key]);
        }
      });
    }
    
    const url = `${API_BASE_URL}/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log('📡 Fetching products from:', url);
    console.log('📡 API_BASE_URL:', API_BASE_URL);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    
    return await response.json();
  },

  getProduct: async (id: string) => {
    // Remove cache buster if it exists for the actual API call
    const cleanId = id.split('?')[0];
    // Add timestamp to URL to bypass all caches
    const timestamp = Date.now();
    const url = `${API_BASE_URL}/products/${cleanId}?_t=${timestamp}`;
    console.log(`🔍 API: Fetching product with ID: ${cleanId} (cache bust: ${timestamp})`);
    console.log(`🔍 API: URL: ${url}`);
    
    // Add cache-busting headers to ensure fresh seller information
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      cache: 'no-store' // React Native fetch cache bypass
    });
    
    console.log(`📡 API: Response status: ${response.status}`);
    console.log(`📡 API: Response ok: ${response.ok}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API: Error response:`, errorText);
      throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ API: Product data received:`, data);
    console.log(`✅ API: Seller info:`, {
      name: data.product?.seller?.name || data.seller?.name,
      phone: data.product?.seller?.phone || data.seller?.phone,
      location: data.product?.seller?.location || data.seller?.location
    });
    
    // Backend returns { product: {...} }, so we need to extract the product
    const product = data.product || data;
    
    // Verify seller data is populated
    if (!product.seller || typeof product.seller === 'string') {
      console.warn('⚠️ API: Seller not properly populated, may be ObjectId only');
    }
    
    return product;
  },

  search: async (params: any) => {
    console.log('🔍 API: Search called with params:', params);
    
    const queryParams = new URLSearchParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          queryParams.append(key, params[key]);
        }
      });
    }
    
    const url = `${API_BASE_URL}/products/search${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log('🔍 API: Search URL:', url);
    
    const response = await fetch(url);
    console.log('🔍 API: Search response status:', response.status);
    console.log('🔍 API: Search response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API: Search error response:', errorText);
      throw new Error(`Failed to search products: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ API: Search result:', result);
    console.log('✅ API: Search result type:', typeof result);
    console.log('✅ API: Search result keys:', Object.keys(result || {}));
    
    return result;
  },

  getMyProducts: async (token?: string) => {
    try {
      const headers = await getAuthHeaders(token);
      const response = await fetch(`${API_BASE_URL}/products/seller/my-products`, { headers });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || 'Failed to fetch my products');
      }
      return await response.json();
    } catch (error) {
      console.error('API: getMyProducts error:', error);
      throw error;
    }
  },

  createProduct: async (productData: any) => {
    try {
      console.log('🚀 API: Creating product with data:', productData);
      const headers = await getAuthHeaders();
      console.log('🔑 API: Headers:', headers);
      
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers,
        body: JSON.stringify(productData),
      });
      
      console.log('📡 API: Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create product' }));
        console.error('❌ API: Error response:', errorData);
        throw new Error(errorData.message || `Failed to create product (${response.status})`);
      }
      
      const result = await response.json();
      console.log('✅ API: Product created successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ API: Create product error:', error);
      throw error;
    }
  },

  updateProduct: async (id: string, productData: any) => {
    const headers = await getAuthHeaders();
    console.log('🔄 API updateProduct called with:', { id, productData });
    console.log('🔄 Headers:', headers);
    
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    
    console.log('🔄 API response status:', response.status);
    console.log('🔄 API response ok:', response.ok);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to update product' }));
      console.log('❌ API error data:', errorData);
      throw new Error(errorData.message || 'Failed to update product');
    }
    
    const result = await response.json();
    console.log('✅ API update result:', result);
    return result;
  },

  deleteProduct: async (id: string) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to delete product' }));
      throw new Error(errorData.message || 'Failed to delete product');
    }
    
    return await response.json();
  },

  getSellerProductCount: async () => {
    try {
      console.log('📊 API: Getting seller product count...');
      const headers = await getAuthHeaders();
      console.log('📊 API: Headers:', headers);
      console.log('📊 API: URL:', `${API_BASE_URL}/products/seller/count`);
      
      // Check if we have auth token
      if (!headers.Authorization) {
        console.error('📊 API: No authorization token found');
        throw new Error('No authorization token found');
      }
      
      const response = await fetch(`${API_BASE_URL}/products/seller/count`, {
        method: 'GET',
        headers,
      });
      
      console.log('📊 API: Response status:', response.status);
      console.log('📊 API: Response ok:', response.ok);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to get product count' }));
        console.log('📊 API: Error data:', errorData);
        throw new Error(errorData.message || 'Failed to get product count');
      }
      
      const result = await response.json();
      console.log('📊 API: Success result:', result);
      return result;
    } catch (error) {
      console.error('📊 API: Error in getSellerProductCount:', error);
      throw error;
    }
  },

  toggleProductAvailability: async (id: string, isAvailable: boolean) => {
    const headers = await getAuthHeaders();
    console.log('API: Toggling product availability:', { id, isAvailable });
    console.log('API: Headers:', headers);
    
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ isAvailable }),
    });
    
    console.log('API: Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.log('API: Error response:', errorData);
      throw new Error(errorData.message || 'Failed to toggle product availability');
    }
    
    const data = await response.json();
    console.log('API: Toggle response:', data);
    return data;
  },

  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/products/categories`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    try {
      const data = await response.json();
      return data.categories || [];
    } catch (parseError) {
      throw new Error('Invalid response format from server');
    }
  },


  incrementViews: async (productId: string) => {
    const response = await fetch(`${API_BASE_URL}/products/${productId}/views`, {
      method: 'PUT',
    });
    
    if (!response.ok) {
      console.error('Failed to increment views');
    }
    
    return await response.json();
  },

  // Favori işlemleri
  addToFavorites: async (productId: string) => {
    console.log('🔄 API: Adding to favorites');
    console.log('📦 API: Product ID:', productId);
    console.log('📦 API: URL:', `${API_BASE_URL}/products/${productId}/favorite`);
    
    try {
      const headers = await getAuthHeaders();
      console.log('📦 API: Headers:', headers);
      
      const response = await fetchWithTimeout(`${API_BASE_URL}/products/${productId}/favorite`, {
        method: 'POST',
        headers,
      });
      
      console.log('📡 API: Response status:', response.status);
      console.log('📡 API: Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API: Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ API: Add to favorites success:', result);
      return result;
    } catch (error) {
      console.error('❌ API: Error adding to favorites:', error);
      throw error;
    }
  },
  
  removeFromFavorites: async (productId: string) => {
    console.log('🔄 API: Removing from favorites');
    console.log('📦 API: Product ID:', productId);
    console.log('📦 API: URL:', `${API_BASE_URL}/products/${productId}/favorite`);
    
    try {
      const headers = await getAuthHeaders();
      console.log('📦 API: Headers:', headers);
      
      const response = await fetchWithTimeout(`${API_BASE_URL}/products/${productId}/favorite`, {
        method: 'DELETE',
        headers,
      });
      
      console.log('📡 API: Response status:', response.status);
      console.log('📡 API: Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API: Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ API: Remove from favorites success:', result);
      return result;
    } catch (error) {
      console.error('❌ API: Error removing from favorites:', error);
      throw error;
    }
  },
  
  getFavorites: async () => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/products/favorites`, {
        method: 'GET',
        headers: await getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting favorites:', error);
      throw error;
    }
  }
};

// Admin API
export const adminAPI = {
  getDashboard: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/admin/dashboard`, { headers });
    
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data');
    }
    
    return await response.json();
  },

  getPendingProducts: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/admin/products/pending`, { headers });
    
    if (!response.ok) {
      throw new Error('Failed to fetch pending products');
    }
    
    return await response.json();
  },

  getRejectedProducts: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/admin/products/rejected`, { headers });
    
    if (!response.ok) {
      throw new Error('Failed to fetch rejected products');
    }
    
    return await response.json();
  },

  getProducts: async (params?: any) => {
    const headers = await getAuthHeaders();
    const queryParams = new URLSearchParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          queryParams.append(key, params[key]);
        }
      });
    }
    
    const url = `${API_BASE_URL}/admin/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error('Failed to fetch admin products');
    }
    
    return await response.json();
  },

  approveProduct: async (id: string) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/admin/products/${id}/approve`, {
      method: 'PUT',
      headers,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to approve product' }));
      throw new Error(errorData.message || 'Failed to approve product');
    }
    
    return await response.json();
  },

  rejectProduct: async (id: string, reason?: string) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/admin/products/${id}/reject`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ reason }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to reject product' }));
      throw new Error(errorData.message || 'Failed to reject product');
    }
    
    return await response.json();
  },

  toggleProductFeatured: async (id: string) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/admin/products/${id}/featured`, {
      method: 'PUT',
      headers,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to toggle featured status' }));
      throw new Error(errorData.message || 'Failed to toggle featured status');
    }
    
    return await response.json();
  },

  getUsers: async (params?: any) => {
    const headers = await getAuthHeaders();
    const queryParams = new URLSearchParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          queryParams.append(key, params[key]);
        }
      });
    }
    
    const url = `${API_BASE_URL}/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    return await response.json();
  },

  blockUser: async (id: string, isActive: boolean) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}/block`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ isActive }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to block/unblock user' }));
      throw new Error(errorData.message || 'Failed to block/unblock user');
    }
    
    return await response.json();
  },

  deleteUser: async (id: string) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to delete user' }));
      throw new Error(errorData.message || 'Failed to delete user');
    }
    
    return await response.json();
  },

  searchUsers: async (query: string) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/admin/users/search?q=${encodeURIComponent(query)}`, { headers });
    
    if (!response.ok) {
      throw new Error('Failed to search users');
    }
    
    return await response.json();
  },

  getUserProducts: async (userId: string) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/products`, { headers });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user products');
    }
    
    return await response.json();
  },


  getFeaturedProducts: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/admin/products/featured`, { headers });
    
    if (!response.ok) {
      throw new Error('Failed to fetch featured products');
    }
    
    return await response.json();
  },

  deleteProduct: async (productId: string) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
      method: 'DELETE',
      headers,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to delete product' }));
      throw new Error(errorData.message || 'Failed to delete product');
    }
    
    return await response.json();
  },
};

// Notifications API
export const notificationsAPI = {
  getNotifications: async (page = 1, limit = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/notifications?${params}`, {
      method: 'GET',
      headers: await getAuthHeaders(),
    });
    
    if (!response.ok) {
      await handleApiError(response, 'get notifications');
    }
    return response.json();
  },

  markAsRead: async (notificationId: string) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
    });
    
    if (!response.ok) {
      await handleApiError(response, 'mark notification as read');
    }
    return response.json();
  },

  markAllAsRead: async () => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
    });
    
    if (!response.ok) {
      await handleApiError(response, 'mark all notifications as read');
    }
    return response.json();
  },

  deleteNotification: async (notificationId: string) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    
    if (!response.ok) {
      await handleApiError(response, 'delete notification');
    }
    return response.json();
  },

  createProductRequest: async (category: string, keywords: string[], description?: string, city?: string) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/notifications/product-request`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ category, keywords, description, city }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create product request');
    }
    
    return await response.json();
  },

  getProductRequests: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/notifications/product-requests`, { headers });
    
    if (!response.ok) {
      throw new Error('Failed to fetch product requests');
    }
    
    return await response.json();
  },

  deleteProductRequest: async (requestId: string) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/notifications/product-requests/${requestId}`, {
      method: 'DELETE',
      headers,
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete product request');
    }
    
    return await response.json();
  },

  getRequestProducts: async (requestId: string, page: number = 1, limit: number = 20) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/notifications/request-products/${requestId}?page=${page}&limit=${limit}`, {
      headers,
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch request products');
    }
    
    return await response.json();
  },

  getGroupedProducts: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/notifications/grouped-products`, {
      headers,
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch grouped products');
    }
    
    return await response.json();
  },
};

// Upload API
export const uploadAPI = {
  uploadImage: async (imageUri: string) => {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'image.jpg',
    } as any);

    const headers = await getAuthHeaders();
    // Remove Content-Type header to let FormData set it
    const { 'Content-Type': _, ...headersWithoutContentType } = headers;

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: headersWithoutContentType,
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload image');
    }
    
    try {
      return await response.json();
    } catch (parseError) {
      throw new Error('Invalid response format from server');
    }
  },

  uploadProfileImage: async (imageUri: string) => {
    const formData = new FormData();
    formData.append('profileImage', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile-image.jpg',
    } as any);

    const headers = await getAuthHeaders();
    const { 'Content-Type': _, ...headersWithoutContentType } = headers;

    const response = await fetch(`${API_BASE_URL}/upload/profile-image`, {
      method: 'POST',
      headers: headersWithoutContentType,
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(errorData.message || 'Failed to upload profile image');
    }
    
    return await response.json();
  },
};

export const userAPI = {
  updateProfileImage: async (imageUrl: string) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/users/profile-image`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ profileImage: imageUrl }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || 'Failed to update profile image');
    }
    
    return await response.json();
  },
  updateProfile: async (userData: any) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || 'Failed to update profile');
    }
    
    return await response.json();
  },
  switchRole: async (role: 'buyer' | 'seller') => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/users/switch-role`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ role }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || 'Failed to switch role');
    }
    
    return await response.json();
  },
};


// Market Reports API
export const marketReportsAPI = {
  // Get all active market reports (public)
  getReports: async (params: { city?: string; limit?: number; page?: number } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.city) queryParams.append('city', params.city);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.page) queryParams.append('page', params.page.toString());

    const response = await fetch(`${API_BASE_URL}/market-reports?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch market reports');
    }
    return response.json();
  },

  // Get single market report (public)
  getReport: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/market-reports/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch market report');
    }
    return response.json();
  },

  // Get all reports for admin (including inactive)
  getAll: async (params: { city?: string; isActive?: boolean; limit?: number; page?: number } = {}) => {
    console.log('🔄 MarketReportsAPI.getAll called with params:', params);
    const headers = await getAuthHeaders();
    console.log('🔑 Auth headers:', headers);
    const queryParams = new URLSearchParams();
    if (params.city) queryParams.append('city', params.city);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.page) queryParams.append('page', params.page.toString());

    const url = `${API_BASE_URL}/market-reports/admin/all?${queryParams}`;
    console.log('🌐 Fetching URL:', url);
    
    const response = await fetch(url, {
      headers
    });
    console.log('📡 Response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      throw new Error('Failed to fetch admin market reports');
    }
    const data = await response.json();
    console.log('✅ Market reports data:', data);
    return data;
  },

  // Create new market report (admin only)
  create: async (reportData: any, imageUri?: string) => {
    const formData = new FormData();
    
    // Add text fields
    Object.keys(reportData).forEach(key => {
      if (key === 'items') {
        formData.append(key, JSON.stringify(reportData[key]));
      } else {
        formData.append(key, reportData[key]);
      }
    });

    // Add image if provided
    if (imageUri) {
      const filename = imageUri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('image', {
        uri: imageUri,
        type,
        name: filename,
      } as any);
    }

    const headers = await getAuthHeaders();
    const { 'Content-Type': _, ...headersWithoutContentType } = headers;

    const response = await fetch(`${API_BASE_URL}/market-reports`, {
      method: 'POST',
      headers: headersWithoutContentType,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || 'Failed to create market report');
    }

    return response.json();
  },

  // Update market report (admin only)
  update: async (id: string, reportData: any, imageUri?: string) => {
    const formData = new FormData();
    
    // Add text fields
    Object.keys(reportData).forEach(key => {
      if (key === 'items') {
        formData.append(key, JSON.stringify(reportData[key]));
      } else {
        formData.append(key, reportData[key]);
      }
    });

    // Add image if provided
    if (imageUri && !imageUri.startsWith('http')) {
      const filename = imageUri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('image', {
        uri: imageUri,
        type,
        name: filename,
      } as any);
    }

    const headers = await getAuthHeaders();
    const { 'Content-Type': _, ...headersWithoutContentType } = headers;

    const response = await fetch(`${API_BASE_URL}/market-reports/${id}`, {
      method: 'PUT',
      headers: headersWithoutContentType,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || 'Failed to update market report');
    }

    return response.json();
  },

  // Delete market report (admin only)
  delete: async (id: string) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/market-reports/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || 'Failed to delete market report');
    }

    return response.json();
  },

  // Get cities with market reports
  getCities: async () => {
    const response = await fetch(`${API_BASE_URL}/market-reports/cities/list`);
    if (!response.ok) {
      throw new Error('Failed to fetch cities with market reports');
    }
    return response.json();
  }
};


// Locations API
export const locationsAPI = {
  // Get all cities
  getCities: async () => {
    const response = await fetch(`${API_BASE_URL}/locations/cities`);
    if (!response.ok) {
      throw new Error('Failed to fetch cities');
    }
    return response.json();
  },

  // Get districts for a city
  getDistricts: async (cityId: string) => {
    console.log('🏙️ API: Fetching districts for city ID:', cityId);
    const response = await fetch(`${API_BASE_URL}/locations/cities/${cityId}/districts`);
    if (!response.ok) {
      console.error('❌ API: Failed to fetch districts, status:', response.status);
      throw new Error('Failed to fetch districts');
    }
    const result = await response.json();
    console.log('✅ API: Districts fetched successfully:', result);
    return result;
  }
};

// Orders API
export const ordersAPI = {
  // Get user's orders (as buyer)
  getOrders: async (page = 1, limit = 10, status?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status })
    });
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/orders?${params}`, {
      method: 'GET',
      headers: await getAuthHeaders(),
    });
    
    if (!response.ok) {
      await handleApiError(response, 'get orders');
    }
    return response.json();
  },

  // Get seller's orders
  getSellerOrders: async (page = 1, limit = 10, status?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status })
    });
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/orders/seller?${params}`, {
      method: 'GET',
      headers: await getAuthHeaders(),
    });
    
    if (!response.ok) {
      await handleApiError(response, 'get seller orders');
    }
    return response.json();
  },

  // Get order by ID
  getOrderById: async (orderId: string) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'GET',
      headers: await getAuthHeaders(),
    });
    
    if (!response.ok) {
      await handleApiError(response, 'get order by id');
    }
    return response.json();
  },

  // Create new order
  createOrder: async (orderData: {
    productId: string;
    quantity: number;
    deliveryAddress: {
      street: string;
      city: string;
      district: string;
      postalCode?: string;
      coordinates?: { lat: number; lng: number };
    };
    notes?: string;
  }) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(orderData),
    });
    
    if (!response.ok) {
      await handleApiError(response, 'create order');
    }
    return response.json();
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: string) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      await handleApiError(response, 'update order status');
    }
    return response.json();
  },

  // Cancel order
  cancelOrder: async (orderId: string) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    
    if (!response.ok) {
      await handleApiError(response, 'cancel order');
    }
    return response.json();
  }
};

// Export getAuthHeaders function
export { getAuthHeaders };