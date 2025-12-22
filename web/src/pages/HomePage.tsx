import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI, categoriesAPI, locationsAPI } from '../services/api';
import { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import { CategoryIcon } from '../utils/categoryIcons';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [cities, setCities] = useState<Array<{ name: string; code: string }>>([]);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const featuredResponse = await productsAPI.getProducts({ featured: true, limit: 5 });
      if (featuredResponse?.products) {
        console.log('📦 Featured products:', featuredResponse.products.map((p: Product) => ({
          _id: p._id,
          id: p.id,
          title: p.title
        })));
        // Maksimum 5 ürün göster
        setFeaturedProducts(featuredResponse.products.slice(0, 5));
      }
      
      const recentResponse = await productsAPI.getProducts({ limit: 10, sort: 'newest' });
      if (recentResponse?.products) {
        console.log('📦 Recent products:', recentResponse.products.map((p: Product) => ({
          _id: p._id,
          id: p.id,
          title: p.title
        })));
        setRecentProducts(recentResponse.products);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const response = await categoriesAPI.getCategories();
      if (response?.categories) {
        console.log('📦 Loaded categories:', response.categories);
        // Debug: Check icon values
        response.categories.forEach((cat: Category) => {
          console.log(`📌 Category: ${cat.name}, Icon: "${cat.icon}" (type: ${typeof cat.icon})`);
        });
        setCategories(response.categories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, []);

  const loadCities = useCallback(async () => {
    try {
      console.log('🌐 Loading cities...');
      const response = await locationsAPI.getCities();
      console.log('🌐 Cities response:', response);
      
      if (response?.cities && Array.isArray(response.cities)) {
        console.log(`✅ Loaded ${response.cities.length} cities`);
        setCities(response.cities);
      } else if (Array.isArray(response)) {
        // Eğer response direkt array ise
        console.log(`✅ Loaded ${response.length} cities (direct array)`);
        setCities(response);
      } else {
        console.warn('⚠️ Cities data format unexpected:', response);
      }
    } catch (error) {
      console.error('❌ Error loading cities:', error);
      // Hata durumunda boş array set et
      setCities([]);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadCities();
  }, [loadProducts, loadCategories, loadCities]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) {
      params.append('search', searchQuery.trim());
    }
    if (selectedCategory) {
      params.append('category', selectedCategory);
    }
    if (selectedCity) {
      params.append('location', selectedCity);
      console.log('📍 Selected city for filter:', selectedCity);
    }
    if (minPrice) {
      params.append('minPrice', minPrice);
    }
    if (maxPrice) {
      params.append('maxPrice', maxPrice);
    }
    
    const queryString = params.toString();
    console.log('🔍 Search params:', queryString);
    console.log('🔍 Full URL:', `/products${queryString ? `?${queryString}` : ''}`);
    navigate(`/products${queryString ? `?${queryString}` : ''}`);
  };

  const handleFilterClick = () => {
    setShowFilters(!showFilters);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedCity('');
    setMinPrice('');
    setMaxPrice('');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedCategory || selectedCity || minPrice || maxPrice || searchQuery.trim();

  const handleCategoryClick = (category: Category) => {
    // Backend'de ürünlerin category field'ı slug olarak saklanıyor (meyve, sebze, vb.)
    // Önce slug'ı kontrol et, yoksa name'den slug oluştur
    console.log('🔍 Category clicked:', category);
    
    let slug = category.slug;
    
    // Eğer slug yoksa ve id varsa, id'yi slug olarak kullan (fallback endpoint'ten gelen id zaten slug)
    if (!slug && (category as any).id) {
      slug = (category as any).id;
    }
    
    if (!slug) {
      // Name'den slug oluştur (Türkçe karakterleri düzelt)
      const nameToSlug = (name: string) => {
        return name
          .toLowerCase()
          .replace(/ş/g, 's')
          .replace(/ğ/g, 'g')
          .replace(/ü/g, 'u')
          .replace(/ö/g, 'o')
          .replace(/ç/g, 'c')
          .replace(/ı/g, 'i')
          .replace(/İ/g, 'i')
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '');
      };
      
      slug = category.name ? nameToSlug(category.name) : '';
    }
    
    console.log('📍 Navigating to category:', slug);
    
    if (slug) {
      navigate(`/products?category=${slug}`);
    } else {
      console.error('Category slug is missing:', category);
    }
  };

  const handleProductClick = (product: Product) => {
    // Giriş kontrolü - eğer kullanıcı giriş yapmamışsa login sayfasına yönlendir
    if (!user) {
      console.log('⚠️ User not logged in, redirecting to login...');
      navigate('/login', { 
        state: { 
          from: `/product/${product._id || product.id}`,
          message: 'Ürün detaylarını görmek için lütfen giriş yapın'
        } 
      });
      return;
    }

    // MongoDB ObjectId'yi string'e çevir
    let productId = product._id || product.id;
    
    // Eğer ObjectId objesi ise, toString() kullan
    if (productId && typeof productId === 'object' && 'toString' in productId) {
      productId = (productId as any).toString();
    }
    
    // String'e çevir ve temizle
    productId = String(productId).trim();
    
    console.log('🔍 Product clicked:', {
      product,
      _id: product._id,
      id: product.id,
      productId,
      title: product.title,
      productIdType: typeof productId,
      productIdLength: productId.length
    });
    
    if (productId && productId !== 'undefined' && productId !== 'null' && productId.length > 0) {
      console.log('✅ Navigating to:', `/product/${productId}`);
      navigate(`/product/${productId}`);
    } else {
      console.error('❌ Invalid product ID:', {
        productId,
        product,
        _id: product._id,
        id: product.id
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Hal Kompleksi
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Modern Alışveriş Platformu
            </p>
            
            {/* Modern Search & Filter Bar */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6">
                {/* Search Input */}
                <div className="flex gap-3 mb-4">
                  <div className="flex-1 relative">
                    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Ürün, kategori veya satıcı ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <button
                    onClick={handleFilterClick}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                      showFilters || hasActiveFilters
                        ? 'bg-primary text-white hover:bg-primary-dark'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span className="hidden sm:inline">Filtrele</span>
                    {hasActiveFilters && (
                      <span className="bg-white text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        {[selectedCategory, selectedCity, minPrice, maxPrice, searchQuery.trim()].filter(Boolean).length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={handleSearch}
                    className="px-6 md:px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors flex items-center gap-2"
                  >
                    <span>Ara</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                  <div className="border-t border-gray-200 pt-4 mt-4 transition-all duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Category Filter */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori</label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="">Tüm Kategoriler</option>
                          {categories.map((cat) => {
                            // Slug'ı belirle: önce slug, sonra id, sonra name'den slug oluştur
                            let slug = cat.slug;
                            if (!slug && (cat as any).id) {
                              slug = (cat as any).id;
                            }
                            if (!slug && cat.name) {
                              slug = cat.name
                                .toLowerCase()
                                .replace(/ş/g, 's')
                                .replace(/ğ/g, 'g')
                                .replace(/ü/g, 'u')
                                .replace(/ö/g, 'o')
                                .replace(/ç/g, 'c')
                                .replace(/ı/g, 'i')
                                .replace(/İ/g, 'i')
                                .replace(/\s+/g, '_')
                                .replace(/[^a-z0-9_]/g, '');
                            }
                            return (
                              <option key={cat._id} value={slug || ''}>
                                {cat.name}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      {/* City Filter */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Şehir</label>
                        <select
                          value={selectedCity}
                          onChange={(e) => setSelectedCity(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="">Tüm Şehirler</option>
                          {cities.map((city) => (
                            <option key={city.code} value={city.name}>
                              {city.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Min Price */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Min Fiyat (TL)</label>
                        <input
                          type="number"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          placeholder="0"
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>

                      {/* Max Price */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Max Fiyat (TL)</label>
                        <input
                          type="number"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          placeholder="∞"
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Filter Actions */}
                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={clearFilters}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                      >
                        Temizle
                      </button>
                      <button
                        onClick={() => {
                          handleSearch();
                          setShowFilters(false);
                        }}
                        className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                      >
                        Filtrele
                      </button>
                    </div>
                  </div>
                )}

                {/* Active Filters Tags */}
                {hasActiveFilters && !showFilters && (
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
                    {selectedCategory && (
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium flex items-center gap-2">
                        Kategori: {categories.find(c => {
                          const slug = c.slug || (c as any).id || (c.name ? c.name.toLowerCase().replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/ı/g, 'i').replace(/İ/g, 'i').replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') : '');
                          return slug === selectedCategory;
                        })?.name || selectedCategory}
                        <button onClick={() => setSelectedCategory('')} className="hover:text-primary-dark">×</button>
                      </span>
                    )}
                    {selectedCity && (
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium flex items-center gap-2">
                        Şehir: {selectedCity}
                        <button onClick={() => setSelectedCity('')} className="hover:text-primary-dark">×</button>
                      </span>
                    )}
                    {minPrice && (
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium flex items-center gap-2">
                        Min: {minPrice} TL
                        <button onClick={() => setMinPrice('')} className="hover:text-primary-dark">×</button>
                      </span>
                    )}
                    {maxPrice && (
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium flex items-center gap-2">
                        Max: {maxPrice} TL
                        <button onClick={() => setMaxPrice('')} className="hover:text-primary-dark">×</button>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories */}
        {categories.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Kategoriler</h2>
              {categories.length > 8 && (
                <button
                  onClick={() => navigate('/products')}
                  className="text-primary hover:text-primary-dark font-medium text-sm md:text-base transition-colors"
                >
                  Tümünü Gör →
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-3 md:gap-4">
              {categories.slice(0, 8).map((category) => (
                <button
                  key={category._id}
                  onClick={() => handleCategoryClick(category)}
                  className="group relative flex flex-col items-center justify-center p-5 md:p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 hover:border-primary hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary-dark/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Icon */}
                  <div className="relative z-10 mb-3">
                    <div className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary-dark/10 rounded-xl group-hover:from-primary/20 group-hover:to-primary-dark/20 transition-all duration-300">
                      <div className="group-hover:scale-110 transition-transform duration-300">
                        <CategoryIcon 
                          iconName={category.icon} 
                          size={28}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Category Name */}
                  <span className="relative z-10 text-xs md:text-sm font-semibold text-gray-800 text-center group-hover:text-primary transition-colors duration-300 line-clamp-2">
                    {category.name}
                  </span>
                  
                  {/* Hover effect indicator */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary-dark transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Öne Çıkan Ürünler</h2>
              <button
                onClick={() => navigate('/products?featured=true')}
                className="text-primary hover:text-primary-dark font-medium"
              >
                Tümünü Gör →
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                  onClick={() => handleProductClick(product)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Recent Products */}
        {recentProducts.length > 0 && (
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Yeni Ürünler</h2>
              <button
                onClick={() => navigate('/products?sort=newest')}
                className="text-primary hover:text-primary-dark font-medium"
              >
                Tümünü Gör →
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {recentProducts.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                  onClick={() => handleProductClick(product)}
                />
              ))}
            </div>
          </section>
        )}

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-500">Yükleniyor...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
