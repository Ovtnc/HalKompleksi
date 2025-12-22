import { ENV } from '../config/env';

// Helper function to get auth headers
const getAuthHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const authToken = token || localStorage.getItem('authToken');
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return headers;
};

// Enhanced error handling
const handleApiError = async (response: Response, context: string) => {
  let errorMessage = 'Bir hata oluştu';
  
  try {
    const errorData = await response.json();
    errorMessage = errorData.message || errorData.error || errorMessage;
  } catch {
    errorMessage = response.statusText || errorMessage;
  }

  switch (response.status) {
    case 401:
      errorMessage = 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      break;
    case 403:
      errorMessage = 'Bu işlem için yetkiniz bulunmuyor.';
      break;
    case 404:
      errorMessage = 'Aranan kaynak bulunamadı.';
      break;
    case 500:
      errorMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
      break;
  }

  throw new Error(errorMessage);
};

// Fetch with timeout
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
    // Network error handling
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.');
    }
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await fetchWithTimeout(`${ENV.API_BASE_URL}/auth/login`, {
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
    
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }

    return data;
  },

  register: async (userData: any) => {
    const response = await fetchWithTimeout(`${ENV.API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    }, 15000);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
      throw new Error(errorData.message || 'Registration failed');
    }

    const data = await response.json();
    
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }

    return data;
  },

  logout: async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  },

  getMe: async () => {
    const headers = getAuthHeaders();
    const response = await fetch(`${ENV.API_BASE_URL}/auth/me`, { headers });
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        throw new Error('Unauthorized');
      }
      throw new Error('Failed to get user info');
    }
    
    return await response.json();
  },

  updateProfile: async (userData: any) => {
    const headers = getAuthHeaders();
    const response = await fetchWithTimeout(`${ENV.API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(userData),
    }, 15000);
    
    if (!response.ok) {
      await handleApiError(response, 'update profile');
    }
    
    return await response.json();
  },

  switchRole: async (role: 'buyer' | 'seller') => {
    const headers = getAuthHeaders();
    const response = await fetchWithTimeout(`${ENV.API_BASE_URL}/users/switch-role`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ role }),
    }, 15000);
    
    if (!response.ok) {
      await handleApiError(response, 'switch role');
    }
    
    const data = await response.json();
    
    // Storage güncellemesi AuthContext'te yapılıyor, burada yapmıyoruz
    // Sadece response'u döndürüyoruz
    
    return data;
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
    
    const url = `${ENV.API_BASE_URL}/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log('📡 Fetching products from:', url);
    
    try {
      const response = await fetchWithTimeout(url, {}, 15000);
      
      if (!response.ok) {
        await handleApiError(response, 'get products');
      }
      
      const data = await response.json();
      
        // Normalize product IDs
        if (data.products && Array.isArray(data.products)) {
          data.products = data.products.map((product: any) => {
            // MongoDB ObjectId'yi string'e çevir
            if (product._id && typeof product._id === 'object') {
              product._id = product._id.toString();
            }
            // Eğer _id yoksa id'yi _id olarak kullan
            if (!product._id && product.id) {
              product._id = String(product.id);
            }
            // Favorites'ı normalize et (array ise length'e çevir)
            if (Array.isArray(product.favorites)) {
              product.favorites = product.favorites.length;
            } else if (product.favorites === undefined || product.favorites === null) {
              product.favorites = 0;
            }
            return product;
          });
        }
      
      return data;
    } catch (error: any) {
      console.error('❌ Error fetching products:', error);
      throw error;
    }
  },

  getProduct: async (id: string) => {
    const cleanId = id.split('?')[0].trim();
    if (!cleanId) {
      throw new Error('Product ID is required');
    }
    
    // Backend route: /api/products/:id (çoğul - products)
    const url = `${ENV.API_BASE_URL}/products/${cleanId}`;
    console.log('📡 Fetching product from:', url);
    console.log('📡 Product ID:', cleanId);
    console.log('📡 API Base URL:', ENV.API_BASE_URL);
    
    try {
      const response = await fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        cache: 'no-store'
      }, 15000);
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response URL:', response.url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        await handleApiError(response, 'get product');
      }
      
      const data = await response.json();
      console.log('✅ Product data received:', data);
      
      // Backend'den gelen ürünü normalize et
      const product = data.product || data;
      
      // ID'yi normalize et
      if (product) {
        if (product._id && typeof product._id === 'object') {
          product._id = product._id.toString();
        }
        if (!product._id && product.id) {
          product._id = product.id;
        }
        
        // Favorites'ı normalize et (array ise length'e çevir)
        if (Array.isArray(product.favorites)) {
          product.favorites = product.favorites.length;
        } else if (product.favorites === undefined || product.favorites === null) {
          product.favorites = 0;
        }
      }
      
      return product;
    } catch (error: any) {
      console.error('❌ Error fetching product:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      throw error;
    }
  },

  search: async (params: any) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          queryParams.append(key, params[key]);
        }
      });
    }
    
    const url = `${ENV.API_BASE_URL}/products/search${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to search products: ${response.status}`);
    }
    
    return await response.json();
  },

  getFavorites: async () => {
    const response = await fetchWithTimeout(`${ENV.API_BASE_URL}/products/favorites`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  },

  addToFavorites: async (productId: string) => {
    const response = await fetchWithTimeout(`${ENV.API_BASE_URL}/products/${productId}/favorite`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  },
  
  removeFromFavorites: async (productId: string) => {
    const response = await fetchWithTimeout(`${ENV.API_BASE_URL}/products/${productId}/favorite`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  },

  getMyProducts: async () => {
    const headers = getAuthHeaders();
    const response = await fetchWithTimeout(`${ENV.API_BASE_URL}/products/seller/my-products`, { headers }, 15000);
    
    if (!response.ok) {
      await handleApiError(response, 'get my products');
    }
    
    return await response.json();
  },

  createProduct: async (productData: any) => {
    const headers = getAuthHeaders();
    const response = await fetchWithTimeout(`${ENV.API_BASE_URL}/products`, {
      method: 'POST',
      headers,
      body: JSON.stringify(productData),
    }, 30000);
    
    if (!response.ok) {
      await handleApiError(response, 'create product');
    }
    
    return await response.json();
  },

  updateProduct: async (id: string, productData: any) => {
    const headers = getAuthHeaders();
    const response = await fetchWithTimeout(`${ENV.API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(productData),
    }, 30000);
    
    if (!response.ok) {
      await handleApiError(response, 'update product');
    }
    
    return await response.json();
  },

  deleteProduct: async (id: string) => {
    const headers = getAuthHeaders();
    const response = await fetchWithTimeout(`${ENV.API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers,
    }, 15000);
    
    if (!response.ok) {
      await handleApiError(response, 'delete product');
    }
    
    return await response.json();
  },
};

// Categories API
export const categoriesAPI = {
  getCategories: async () => {
    // Try the main categories endpoint first (has slug field)
    const url = `${ENV.API_BASE_URL}/categories`;
    console.log('📡 Fetching categories from:', url);
    
    try {
      const response = await fetchWithTimeout(url, {}, 15000);
      
      if (!response.ok) {
        // Fallback to products/categories if main endpoint fails
        const fallbackUrl = `${ENV.API_BASE_URL}/products/categories`;
        console.log('⚠️ Main categories endpoint failed, trying fallback:', fallbackUrl);
        const fallbackResponse = await fetchWithTimeout(fallbackUrl, {}, 15000);
        
        if (!fallbackResponse.ok) {
          await handleApiError(fallbackResponse, 'get categories');
        }
        
        const fallbackData = await fallbackResponse.json();
        // Transform fallback data to include slug from id
        // Backend'de /products/categories endpoint'i id field'ı kullanıyor (meyve, sebze, vb.)
        if (fallbackData.categories) {
          fallbackData.categories = fallbackData.categories.map((cat: any) => ({
            ...cat,
            _id: cat.id || cat._id,
            // id zaten slug olarak kullanılıyor (meyve, sebze, vb.)
            slug: cat.slug || cat.id || cat.name?.toLowerCase().replace(/\s+/g, '_'),
          }));
        }
        return fallbackData;
      }
      
      return await response.json();
    } catch (error: any) {
      console.error('❌ Error fetching categories:', error);
      throw error;
    }
  },
};

// Market Reports API
export const marketReportsAPI = {
  getReports: async (params: { city?: string; limit?: number; page?: number } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.city) queryParams.append('city', params.city);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.page) queryParams.append('page', params.page.toString());

    const response = await fetch(`${ENV.API_BASE_URL}/market-reports?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch market reports');
    }
    return response.json();
  },

  getReport: async (id: string) => {
    const response = await fetch(`${ENV.API_BASE_URL}/market-reports/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch market report');
    }
    return response.json();
  },
};

// Locations API
export const locationsAPI = {
  getCities: async () => {
    try {
      const url = `${ENV.API_BASE_URL}/locations/cities`;
      console.log('🌐 Fetching cities from:', url);
      
      const response = await fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }, 30000);
      
      console.log('📡 Cities response status:', response.status);
      console.log('📡 Cities response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to fetch cities, status:', response.status);
        console.error('❌ Error response:', errorText);
        throw new Error(`Failed to fetch cities: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Cities data received:', data);
      console.log('✅ Cities count:', data.cities?.length || 0);
      
      // Backend returns { cities: [...] }
      // Each city has: { name, code, _id }
      if (data.cities && Array.isArray(data.cities)) {
        console.log(`✅ Successfully loaded ${data.cities.length} cities from API`);
        if (data.cities.length < 81) {
          console.warn(`⚠️ Warning: Expected 81 cities but got ${data.cities.length}. Please check database.`);
        }
      }
      
      return data;
    } catch (error: any) {
      console.error('❌ locationsAPI.getCities error:', error);
      if (error instanceof Error) {
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
      }
      throw error;
    }
  },

  getDistricts: async (cityName: string) => {
    try {
      const url = `${ENV.API_BASE_URL}/locations/districts?city=${encodeURIComponent(cityName)}`;
      console.log('🏙️ Fetching districts for city:', cityName);
      console.log('🏙️ URL:', url);
      
      const response = await fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }, 15000);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to fetch districts, status:', response.status);
        console.error('❌ Error response:', errorText);
        throw new Error(`Failed to fetch districts: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Districts data received:', data);
      console.log('✅ Districts count:', Array.isArray(data) ? data.length : (data.districts?.length || 0));
      
      // Backend returns array of districts: [{ name, _id, isActive }, ...]
      return Array.isArray(data) ? data : (data.districts || []);
    } catch (error: any) {
      console.error('❌ locationsAPI.getDistricts error:', error);
      throw error;
    }
  },
};

// Upload API
export const uploadAPI = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetchWithTimeout(`${ENV.API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type - let browser set it with boundary for FormData
      },
      body: formData,
    }, 60000); // 60 second timeout for image uploads

    if (!response.ok) {
      await handleApiError(response, 'upload image');
    }

    return await response.json();
  },

  uploadImages: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetchWithTimeout(`${ENV.API_BASE_URL}/upload/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type - let browser set it with boundary for FormData
      },
      body: formData,
    }, 60000); // 60 second timeout for image uploads

    if (!response.ok) {
      await handleApiError(response, 'upload images');
    }

    return await response.json();
  },
};

// Admin API
export const adminAPI = {
  getDashboard: async () => {
    const headers = getAuthHeaders();
    const response = await fetchWithTimeout(`${ENV.API_BASE_URL}/admin/dashboard`, { headers }, 15000);
    
    if (!response.ok) {
      await handleApiError(response, 'get dashboard');
    }
    
    return await response.json();
  },

  getPendingProducts: async () => {
    const headers = getAuthHeaders();
    const response = await fetchWithTimeout(`${ENV.API_BASE_URL}/admin/products/pending`, { headers }, 15000);
    
    if (!response.ok) {
      await handleApiError(response, 'get pending products');
    }
    
    return await response.json();
  },

  getRejectedProducts: async () => {
    const headers = getAuthHeaders();
    const response = await fetchWithTimeout(`${ENV.API_BASE_URL}/admin/products/rejected`, { headers }, 15000);
    
    if (!response.ok) {
      await handleApiError(response, 'get rejected products');
    }
    
    return await response.json();
  },

  getProducts: async (params?: any) => {
    const headers = getAuthHeaders();
    const queryParams = new URLSearchParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          queryParams.append(key, params[key]);
        }
      });
    }
    
    const url = `${ENV.API_BASE_URL}/admin/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetchWithTimeout(url, { headers }, 15000);
    
    if (!response.ok) {
      await handleApiError(response, 'get admin products');
    }
    
    return await response.json();
  },

  approveProduct: async (id: string) => {
    const headers = getAuthHeaders();
    const response = await fetchWithTimeout(`${ENV.API_BASE_URL}/admin/products/${id}/approve`, {
      method: 'PUT',
      headers,
    }, 15000);
    
    if (!response.ok) {
      await handleApiError(response, 'approve product');
    }
    
    return await response.json();
  },

  rejectProduct: async (id: string, reason?: string) => {
    const headers = getAuthHeaders();
    const response = await fetchWithTimeout(`${ENV.API_BASE_URL}/admin/products/${id}/reject`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ reason }),
    }, 15000);
    
    if (!response.ok) {
      await handleApiError(response, 'reject product');
    }
    
    return await response.json();
  },

  toggleProductFeatured: async (id: string) => {
    const headers = getAuthHeaders();
    const response = await fetchWithTimeout(`${ENV.API_BASE_URL}/admin/products/${id}/featured`, {
      method: 'PUT',
      headers,
    }, 15000);
    
    if (!response.ok) {
      await handleApiError(response, 'toggle featured');
    }
    
    return await response.json();
  },

  getUsers: async (params?: any) => {
    const headers = getAuthHeaders();
    const queryParams = new URLSearchParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          queryParams.append(key, params[key]);
        }
      });
    }
    
    const url = `${ENV.API_BASE_URL}/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetchWithTimeout(url, { headers }, 15000);
    
    if (!response.ok) {
      await handleApiError(response, 'get users');
    }
    
    return await response.json();
  },

  blockUser: async (id: string, isActive: boolean) => {
    const headers = getAuthHeaders();
    const requestBody = { isActive };
    
    console.log('🔒 Frontend: Blocking user:', {
      userId: id,
      isActive: isActive,
      isActiveType: typeof isActive,
      requestBody: requestBody
    });
    
    const response = await fetchWithTimeout(`${ENV.API_BASE_URL}/admin/users/${id}/block`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(requestBody),
    }, 15000);
    
    console.log('🔒 Frontend: Response status:', response.status);
    console.log('🔒 Frontend: Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔒 Frontend: Error response:', errorText);
      try {
        const errorJson = JSON.parse(errorText);
        console.error('🔒 Frontend: Error JSON:', errorJson);
      } catch (e) {
        console.error('🔒 Frontend: Error response is not JSON');
      }
      await handleApiError(response, 'block user');
    }
    
    const result = await response.json();
    console.log('🔒 Frontend: Success response:', result);
    return result;
  },

  deleteUser: async (id: string) => {
    const headers = getAuthHeaders();
    const response = await fetchWithTimeout(`${ENV.API_BASE_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers,
    }, 15000);
    
    if (!response.ok) {
      await handleApiError(response, 'delete user');
    }
    
    return await response.json();
  },

  searchUsers: async (query: string) => {
    const headers = getAuthHeaders();
    const response = await fetchWithTimeout(`${ENV.API_BASE_URL}/admin/users/search?q=${encodeURIComponent(query)}`, { headers }, 15000);
    
    if (!response.ok) {
      await handleApiError(response, 'search users');
    }
    
    return await response.json();
  },

  getUserProducts: async (userId: string) => {
    const headers = getAuthHeaders();
    const response = await fetchWithTimeout(`${ENV.API_BASE_URL}/admin/users/${userId}/products`, { headers }, 15000);
    
    if (!response.ok) {
      await handleApiError(response, 'get user products');
    }
    
    return await response.json();
  },

  getFeaturedProducts: async () => {
    const headers = getAuthHeaders();
    const response = await fetchWithTimeout(`${ENV.API_BASE_URL}/admin/products/featured`, { headers }, 15000);
    
    if (!response.ok) {
      await handleApiError(response, 'get featured products');
    }
    
    return await response.json();
  },

  deleteProduct: async (productId: string) => {
    const headers = getAuthHeaders();
    const response = await fetchWithTimeout(`${ENV.API_BASE_URL}/admin/products/${productId}`, {
      method: 'DELETE',
      headers,
    }, 15000);
    
    if (!response.ok) {
      await handleApiError(response, 'delete product');
    }
    
    return await response.json();
  },
};

export { getAuthHeaders, handleApiError };

