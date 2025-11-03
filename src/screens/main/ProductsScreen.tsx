import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../types';
import { productsAPI, categoriesAPI, locationsAPI } from '../../services/api';
import { ENV } from '../../config/env';
import { useProductRefresh } from '../../hooks/useProductRefresh';

const { width } = Dimensions.get('window');

interface ProductsScreenProps {
  navigation?: any;
  route?: any;
}

const ProductsScreen = ({ navigation, route }: ProductsScreenProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [showOnlyOrganic, setShowOnlyOrganic] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  // Auto-refresh products when user profile is updated
  useProductRefresh(loadProducts);

  useEffect(() => {
    console.log('🔍 PRODUCTS: useEffect triggered');
    console.log('🔍 PRODUCTS: Route:', route);
    console.log('🔍 PRODUCTS: Route params:', route?.params);
    console.log('🔍 PRODUCTS: Search query from route:', route?.params?.searchQuery);
    console.log('🔍 PRODUCTS: Category from route:', route?.params?.category);
    console.log('🔍 PRODUCTS: Filter from route:', route?.params?.filter);
    
    // Check if there's a search query from navigation
    if (route?.params?.searchQuery) {
      console.log('✅ PRODUCTS: Found search query in route params:', route.params.searchQuery);
      setSearchQuery(route.params.searchQuery);
      handleSearch(route.params.searchQuery);
    } 
    // Check if there's a category filter from navigation
    else if (route?.params?.category) {
      console.log('✅ PRODUCTS: Found category in route params:', route.params.category);
      setSelectedCategory(route.params.category);
      handleCategoryFilter(route.params.category);
    }
    // Check if there's a filter from navigation (featured, recent, etc.)
    else if (route?.params?.filter) {
      console.log('✅ PRODUCTS: Found filter in route params:', route.params.filter);
      handleFilterPress(route.params.filter);
    } else {
      console.log('❌ PRODUCTS: No search query, category, or filter found, loading all products');
      loadProducts();
    }
  }, [route?.params?.searchQuery, route?.params?.category, route?.params?.filter]);

  const loadInitialData = async () => {
    try {
      // Load categories and cities
      const [categoriesResponse, citiesResponse] = await Promise.all([
        categoriesAPI.getCategories(),
        locationsAPI.getCities()
      ]);
      
      setCategories(categoriesResponse.categories || []);
      setCities(citiesResponse.cities || []);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log('🔄 PRODUCTS: Loading all products');
      
      const response = await productsAPI.getProducts();
      console.log('✅ PRODUCTS: Products loaded:', response);
      
      const products = response.data || response.products || [];
      setProducts(products);
      setFilteredProducts(products);
    } catch (error) {
      console.error('❌ PRODUCTS: Error loading products:', error);
      Alert.alert('Hata', 'Ürünler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    try {
      setLoading(true);
      console.log('🔍 PRODUCTS: Searching for:', query);
      console.log('🔍 PRODUCTS: Search params:', { query: query });
      console.log('🔍 PRODUCTS: API URL:', `${ENV.API_BASE_URL}/products/search?query=${encodeURIComponent(query)}`);
      
      const response = await productsAPI.search({ query: query });
      console.log('✅ PRODUCTS: Search response:', response);
      console.log('✅ PRODUCTS: Response type:', typeof response);
      console.log('✅ PRODUCTS: Response keys:', Object.keys(response || {}));
      
      // Backend returns { products: [...], total: 2 }
      let products = [];
      if (response.products && Array.isArray(response.products)) {
        products = response.products;
        console.log('✅ PRODUCTS: Found products in response.products:', products.length);
      } else if (response.data && Array.isArray(response.data)) {
        products = response.data;
        console.log('✅ PRODUCTS: Found products in response.data:', products.length);
      } else if (Array.isArray(response)) {
        products = response;
        console.log('✅ PRODUCTS: Response is array:', products.length);
      } else {
        console.log('❌ PRODUCTS: No products found in response');
        console.log('❌ PRODUCTS: Response structure:', response);
        products = [];
      }
      
      console.log('✅ PRODUCTS: Final products:', products);
      console.log('✅ PRODUCTS: Products length:', products.length);
      
      setProducts(products);
      setFilteredProducts(products);
    } catch (error) {
      console.error('❌ PRODUCTS: Search error:', error);
      console.error('❌ PRODUCTS: Error message:', (error as Error).message);
      console.error('❌ PRODUCTS: Error stack:', (error as Error).stack);
      Alert.alert('Hata', 'Arama sırasında bir hata oluştu');
      // Fallback to regular products if search fails
      loadProducts();
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = async (categorySlug: string) => {
    try {
      setLoading(true);
      console.log('🏷️ PRODUCTS: Filtering by category:', categorySlug);
      
      // Set the selected category
      setSelectedCategory(categorySlug);
      
      // Prepare search parameters with category filter
      const searchParams = {
        category: categorySlug,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };
      
      console.log('🏷️ PRODUCTS: Category search params:', searchParams);
      
      // Call backend search with category filter
      const response = await productsAPI.search(searchParams);
      console.log('✅ PRODUCTS: Category filter response:', response);
      
      let products = [];
      if (response.products && Array.isArray(response.products)) {
        products = response.products;
        console.log('✅ PRODUCTS: Found products in category filter:', products.length);
      } else if (response.data && Array.isArray(response.data)) {
        products = response.data;
        console.log('✅ PRODUCTS: Found products in response.data:', products.length);
      } else if (Array.isArray(response)) {
        products = response;
        console.log('✅ PRODUCTS: Response is array:', products.length);
      } else {
        console.log('❌ PRODUCTS: No products found in category filter');
        products = [];
      }
      
      setProducts(products);
      setFilteredProducts(products);
    } catch (error) {
      console.error('❌ PRODUCTS: Category filter error:', error);
      Alert.alert('Hata', 'Kategori filtresi uygulanırken bir hata oluştu');
      // Fallback to regular products if filter fails
      loadProducts();
    } finally {
      setLoading(false);
    }
  };

  const handleFilterPress = async (filterType: string) => {
    try {
      setLoading(true);
      console.log('🏷️ PRODUCTS: Filtering by type:', filterType);
      
      let searchParams: any = {
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };
      
      // Set specific filters based on type
      if (filterType === 'featured') {
        searchParams.featured = true;
        console.log('⭐ PRODUCTS: Filtering for featured products');
      } else if (filterType === 'recent') {
        searchParams.sortBy = 'createdAt';
        searchParams.sortOrder = 'desc';
        console.log('🆕 PRODUCTS: Filtering for recent products');
      }
      
      console.log('🏷️ PRODUCTS: Filter search params:', searchParams);
      
      // Call backend search with filter
      const response = await productsAPI.search(searchParams);
      console.log('✅ PRODUCTS: Filter response:', response);
      
      let products = [];
      if (response.products && Array.isArray(response.products)) {
        products = response.products;
        console.log('✅ PRODUCTS: Found products in filter:', products.length);
      } else if (response.data && Array.isArray(response.data)) {
        products = response.data;
        console.log('✅ PRODUCTS: Found products in response.data:', products.length);
      } else if (Array.isArray(response)) {
        products = response;
        console.log('✅ PRODUCTS: Response is array:', products.length);
      } else {
        console.log('❌ PRODUCTS: No products found in filter');
        products = [];
      }
      
      setProducts(products);
      setFilteredProducts(products);
    } catch (error) {
      console.error('❌ PRODUCTS: Filter error:', error);
      Alert.alert('Hata', 'Filtre uygulanırken bir hata oluştu');
      // Fallback to regular products if filter fails
      loadProducts();
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      console.log('🔍 FILTERS: Applying filters');
      console.log('🔍 FILTERS: Selected category:', selectedCategory);
      console.log('🔍 FILTERS: Selected location:', selectedLocation);
      console.log('🔍 FILTERS: Price range:', priceRange);
      console.log('🔍 FILTERS: Sort by:', sortBy, sortOrder);
      console.log('🔍 FILTERS: Show only available:', showOnlyAvailable);
      console.log('🔍 FILTERS: Show only organic:', showOnlyOrganic);

      // Prepare search parameters
      const searchParams: any = {};
      
      if (searchQuery) {
        searchParams.query = searchQuery;
      }
      
      if (selectedCategory) {
        searchParams.category = selectedCategory;
      }
      
      if (selectedLocation) {
        searchParams.location = selectedLocation;
      }
      
      if (priceRange.min) {
        searchParams.minPrice = priceRange.min;
      }
      
      if (priceRange.max) {
        searchParams.maxPrice = priceRange.max;
      }
      
      searchParams.sortBy = sortBy;
      searchParams.sortOrder = sortOrder;

      console.log('🔍 FILTERS: Search params:', searchParams);

      // Call backend search with filters
      const response = await productsAPI.search(searchParams);
      console.log('✅ FILTERS: Filtered response:', response);
      
      let filteredProducts = response.data || response.products || response || [];

      // Apply client-side filters that backend doesn't handle
      if (showOnlyAvailable) {
        filteredProducts = filteredProducts.filter((product: any) => product.isAvailable && product.stock > 0);
      }

      if (showOnlyOrganic) {
        filteredProducts = filteredProducts.filter((product: any) => 
          product.categoryData?.organic === true || 
          product.title.toLowerCase().includes('organik')
        );
      }

      console.log('✅ FILTERS: Final filtered products:', filteredProducts.length);
      setFilteredProducts(filteredProducts);
      setShowFilters(false);
    } catch (error) {
      console.error('❌ FILTERS: Error applying filters:', error);
      Alert.alert('Hata', 'Filtreler uygulanırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = async () => {
    setSelectedCategory('');
    setSelectedLocation('');
    setPriceRange({ min: '', max: '' });
    setSortBy('createdAt');
    setSortOrder('desc');
    setShowOnlyAvailable(false);
    setShowOnlyOrganic(false);
    
    // Reload products without filters
    if (searchQuery) {
      await handleSearch(searchQuery);
    } else {
      await loadProducts();
    }
  };

  const renderProductCard = ({ item }: { item: Product }) => {
    const primaryImage = item.images?.[0] 
      ? (typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url)
      : undefined;
    
    const locationText = typeof item.location === 'string' 
      ? item.location 
      : item.location?.city || 'Bilinmiyor';

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigation?.navigate('ProductDetail', { productId: item._id })}
        activeOpacity={0.7}
      >
        <View style={styles.productImageContainer}>
          <Image 
            source={{ 
              uri: primaryImage,
              cache: 'force-cache'
            }} 
            style={styles.productImage}
            resizeMode="cover"
            quality={1.0}
            fadeDuration={0}
          />
          {item.isFeatured && (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredText}>Öne Çıkan</Text>
            </View>
          )}
        </View>
        
        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {item.title}
          </Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>
              {item.price} {item.currency || 'TL'}
            </Text>
            <Text style={styles.productStock}>
              {item.stock} {item.unit}
            </Text>
          </View>
          
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.locationText}>{locationText}</Text>
          </View>
          
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryText}>{item.category}</Text>
            <View style={styles.statsContainer}>
              <View style={styles.viewsContainer}>
                <Ionicons name="eye-outline" size={14} color="#666" />
                <Text style={styles.viewsText}>{item.views}</Text>
              </View>
              <View style={styles.favoritesContainer}>
                <Ionicons name="heart-outline" size={14} color="#E74C3C" />
                <Text style={styles.favoritesText}>{item.favorites?.length || 0}</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterModal = () => {
    if (!showFilters) return null;

    return (
      <View style={styles.filterModal}>
        <View style={styles.filterContent}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filtreler</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterBody}>
            {/* Category Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Kategori</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  style={[styles.filterChip, selectedCategory === '' && styles.filterChipActive]}
                  onPress={() => setSelectedCategory('')}
                >
                  <Text style={[styles.filterChipText, selectedCategory === '' && styles.filterChipTextActive]}>
                    Tümü
                  </Text>
                </TouchableOpacity>
                {categories.map((category, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.filterChip, selectedCategory === category.slug && styles.filterChipActive]}
                    onPress={() => setSelectedCategory(category.slug)}
                  >
                    <Text style={[styles.filterChipText, selectedCategory === category.slug && styles.filterChipTextActive]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Location Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Konum</Text>
              <TouchableOpacity 
                style={styles.locationButton}
                onPress={() => setShowLocationModal(true)}
              >
                <Text style={[styles.locationButtonText, selectedLocation && styles.locationButtonTextSelected]}>
                  {selectedLocation || 'Şehir seçin...'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Price Range Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Fiyat Aralığı</Text>
              <View style={styles.priceRangeContainer}>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Min"
                  value={priceRange.min}
                  onChangeText={(text) => setPriceRange(prev => ({ ...prev, min: text }))}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
                <Text style={styles.priceRangeText}>-</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Max"
                  value={priceRange.max}
                  onChangeText={(text) => setPriceRange(prev => ({ ...prev, max: text }))}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Sort Options */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Sıralama</Text>
              <View style={styles.sortContainer}>
                <TouchableOpacity
                  style={[styles.sortOption, sortBy === 'createdAt' && styles.sortOptionActive]}
                  onPress={() => setSortBy('createdAt')}
                >
                  <Text style={[styles.sortOptionText, sortBy === 'createdAt' && styles.sortOptionTextActive]}>
                    Tarih
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sortOption, sortBy === 'price' && styles.sortOptionActive]}
                  onPress={() => setSortBy('price')}
                >
                  <Text style={[styles.sortOptionText, sortBy === 'price' && styles.sortOptionTextActive]}>
                    Fiyat
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sortOption, sortBy === 'title' && styles.sortOptionActive]}
                  onPress={() => setSortBy('title')}
                >
                  <Text style={[styles.sortOptionText, sortBy === 'title' && styles.sortOptionTextActive]}>
                    İsim
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.sortOrderContainer}>
                <TouchableOpacity
                  style={[styles.sortOrderOption, sortOrder === 'desc' && styles.sortOrderOptionActive]}
                  onPress={() => setSortOrder('desc')}
                >
                  <Text style={[styles.sortOrderText, sortOrder === 'desc' && styles.sortOrderTextActive]}>
                    Azalan
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sortOrderOption, sortOrder === 'asc' && styles.sortOrderOptionActive]}
                  onPress={() => setSortOrder('asc')}
                >
                  <Text style={[styles.sortOrderText, sortOrder === 'asc' && styles.sortOrderTextActive]}>
                    Artan
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Additional Filters */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Ek Filtreler</Text>
              
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setShowOnlyAvailable(!showOnlyAvailable)}
              >
                <View style={[styles.checkbox, showOnlyAvailable && styles.checkboxActive]}>
                  {showOnlyAvailable && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                </View>
                <Text style={styles.checkboxText}>Sadece Stokta Olanlar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setShowOnlyOrganic(!showOnlyOrganic)}
              >
                <View style={[styles.checkbox, showOnlyOrganic && styles.checkboxActive]}>
                  {showOnlyOrganic && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                </View>
                <Text style={styles.checkboxText}>Sadece Organik Ürünler</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.filterFooter}>
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Temizle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.applyButtonText}>Uygula</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={64} color="#E0E0E0" />
      <Text style={styles.emptyTitle}>Ürün Bulunamadı</Text>
      <Text style={styles.emptyMessage}>
        Aradığınız kriterlere uygun ürün bulunamadı. Filtreleri değiştirmeyi deneyin.
      </Text>
    </View>
  );

  const renderLocationModal = () => {
    if (!showLocationModal) return null;

    const filteredCities = cities.filter(city => 
      city.name.toLowerCase().includes(locationSearchQuery.toLowerCase())
    );

    return (
      <View style={styles.locationModal}>
        <View style={styles.locationModalContent}>
          <View style={styles.locationModalHeader}>
            <Text style={styles.locationModalTitle}>Şehir Seçin</Text>
            <TouchableOpacity onPress={() => setShowLocationModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.locationSearchContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.locationSearchIcon} />
            <TextInput
              style={styles.locationSearchInput}
              placeholder="Şehir ara..."
              value={locationSearchQuery}
              onChangeText={setLocationSearchQuery}
              placeholderTextColor="#999"
            />
          </View>

          <FlatList
            data={filteredCities}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.cityItem}
                onPress={() => {
                  setSelectedLocation(item.name);
                  setShowLocationModal(false);
                  setLocationSearchQuery('');
                }}
              >
                <Text style={styles.cityName}>{item.name}</Text>
                <Text style={styles.cityCode}>{item.code}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item._id || item.id || item.code}
            style={styles.citiesList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2cbd69" />
        <Text style={styles.loadingText}>Ürünler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2cbd69" />
      
      {/* Header */}
      <LinearGradient
        colors={['#2cbd69', '#66BB6A']}
        style={styles.header}
      >
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Ürün, kategori veya satıcı ara..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => handleSearch(searchQuery)}
            />
            <TouchableOpacity onPress={() => handleSearch(searchQuery)}>
              <Ionicons name="arrow-forward" size={20} color="#2cbd69" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="options-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Results Info */}
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {filteredProducts.length} ürün bulundu
        </Text>
        {searchQuery && (
          <Text style={styles.searchQueryText}>
            "{searchQuery}" için arama sonuçları
          </Text>
        )}
      </View>

      {/* Products Grid */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProductCard}
        keyExtractor={(item) => item._id || item.id}
        numColumns={2}
        contentContainerStyle={styles.productsGrid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />

      {/* Filter Modal */}
      {renderFilterModal()}
      
      {/* Location Modal */}
      {renderLocationModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  filterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsInfo: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  resultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  searchQueryText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  productsGrid: {
    padding: 16,
    paddingBottom: 100,
  },
  productCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  productImageContainer: {
    position: 'relative',
    height: 120,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF5722',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  featuredText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 18,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2cbd69',
  },
  productStock: {
    fontSize: 12,
    color: '#666',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 11,
    color: '#2cbd69',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'capitalize',
  },
  viewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewsText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  favoritesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoritesText: {
    fontSize: 11,
    color: '#E74C3C',
    marginLeft: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Filter Modal Styles
  filterModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  filterContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  filterBody: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  filterChip: {
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#2cbd69',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  filterInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  priceRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceInput: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  priceRangeText: {
    fontSize: 16,
    color: '#666',
  },
  sortContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  sortOption: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sortOptionActive: {
    backgroundColor: '#2cbd69',
  },
  sortOptionText: {
    fontSize: 14,
    color: '#666',
  },
  sortOptionTextActive: {
    color: '#FFFFFF',
  },
  sortOrderContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  sortOrderOption: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sortOrderOptionActive: {
    backgroundColor: '#2cbd69',
  },
  sortOrderText: {
    fontSize: 14,
    color: '#666',
  },
  sortOrderTextActive: {
    color: '#FFFFFF',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#2cbd69',
    borderColor: '#2cbd69',
  },
  checkboxText: {
    fontSize: 14,
    color: '#333',
  },
  filterFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#2cbd69',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Location Modal Styles
  locationModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1001,
  },
  locationModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  locationModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  locationModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  locationSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  locationSearchIcon: {
    marginRight: 12,
  },
  locationSearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  citiesList: {
    maxHeight: 400,
  },
  cityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cityName: {
    fontSize: 16,
    color: '#333',
  },
  cityCode: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  // Location Button Styles
  locationButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  locationButtonText: {
    fontSize: 16,
    color: '#999',
  },
  locationButtonTextSelected: {
    color: '#333',
  },
});

export default ProductsScreen;