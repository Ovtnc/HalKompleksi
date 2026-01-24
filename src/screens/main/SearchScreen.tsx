import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StyleSheet,
  StatusBar,
  Modal,
  Alert,
  RefreshControl,
  Dimensions,
  Animated,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../services/AuthContext';
import { productsAPI, locationsAPI } from '../../services/api';
import { Product } from '../../types';
import { useProductRefresh } from '../../hooks/useProductRefresh';
import { normalizeCities, addAllCitiesOption, getFallbackCities, type NormalizedCity } from '../../utils/cityHelpers';

const { width, height } = Dimensions.get('window');

interface SearchFilters {
  query: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  location: string;
  sortBy: 'price' | 'date' | 'name' | 'views';
  sortOrder: 'asc' | 'desc';
  stockAvailable: boolean;
  organic: boolean;
  coldStorage: boolean;
  featured: boolean;
  inStock: boolean;
}

interface RouteParams {
  search?: string;
  category?: string;
  city?: string;
  title?: string;
}

const SearchScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);
  const [cities, setCities] = useState<NormalizedCity[]>([]);
  const [customTitle, setCustomTitle] = useState<string | null>(null);

  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    location: '',
    sortBy: 'date',
    sortOrder: 'desc',
    stockAvailable: false,
    organic: false,
    coldStorage: false,
    featured: false,
    inStock: false,
  });


  const sortOptions = [
    { id: 'date', name: 'En Yeni', icon: 'time-outline' },
    { id: 'price', name: 'Fiyat', icon: 'cash-outline' },
    { id: 'name', name: 'İsim', icon: 'text-outline' },
    { id: 'views', name: 'Görüntülenme', icon: 'eye-outline' },
  ];

  const quickFilters = [
    { id: 'featured', name: 'Öne Çıkan', icon: 'star', color: '#FFD700', description: 'Özel ürünler' },
    { id: 'low_price', name: 'Uygun Fiyat', icon: 'pricetag', color: '#E74C3C', description: '1-10₺ arası' },
    { id: 'new', name: 'Yeni Ürünler', icon: 'sparkles', color: '#9B59B6', description: 'Son eklenen' },
    { id: 'popular', name: 'Popüler', icon: 'trending-up', color: '#3498DB', description: 'Çok görüntülenen' },
  ];

  useEffect(() => {
    loadCategories();
    loadCities();
    loadProducts();
    loadSearchHistory();
  }, []);

  // Auto-refresh products when user profile is updated
  useProductRefresh(loadProducts);

  useEffect(() => {
    
    if (route?.params) {
      const params = route.params as RouteParams;
      const searchParam = params.search;
      const titleParam = params.title;
      
      console.log('🔍 Extracted params:', { 
        search: searchParam, 
        title: titleParam,
        hasSearch: !!searchParam,
        hasTitle: !!titleParam
      });
      
      // Update states
      if (searchParam && searchParam.trim()) {
        setSearchQuery(searchParam);
        
        if (titleParam) {
          setCustomTitle(titleParam);
        }
        
        // Update filters
        setFilters(prev => ({
          ...prev,
          query: searchParam
        }));
        
        // Trigger search immediately
        
        // Use a longer delay to ensure all states are updated
        const searchTimer = setTimeout(() => {
          handleSearch(searchParam);
        }, 500);
        
        return () => clearTimeout(searchTimer);
      }
    }
  }, [route?.params?.search, route?.params?.title]);

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (searchQuery && searchQuery.trim()) count++;
    if (filters.category) count++;
    if (filters.location && filters.location !== 'all') count++;
    if (filters.minPrice || filters.maxPrice) count++;
    setActiveFilters(count);
  }, [filters, searchQuery]);

  // Debounced search - search automatically after user stops typing
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery && searchQuery.trim()) {
        setFilters(prev => ({ ...prev, query: searchQuery }));
        await handleSearch(searchQuery);
        // Force loading to false after search
        setLoading(false);
      } else if (searchQuery === '') {
        // Clear search when input is empty
        setFilters(prev => ({ ...prev, query: '' }));
        await handleSearch('');
        // Force loading to false after search
        setLoading(false);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);


  const loadProducts = async () => {
    try {
      setLoading(true);
      
      const searchParams = {
        query: filters.query, // Backend uses 'query' for search
        category: filters.category,
        location: filters.location, // Backend uses 'location' not 'city'
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        stockAvailable: filters.stockAvailable,
        organic: filters.organic,
        coldStorage: filters.coldStorage,
        featured: filters.featured,
        inStock: filters.inStock,
      };

      const response = await productsAPI.getProducts(searchParams);
      
      if (Array.isArray(response)) {
        setProducts(response);
      } else if (response && response.products && Array.isArray(response.products)) {
        setProducts(response.products);
      } else {
        console.error('Invalid products response:', response);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Hata', 'Ürünler yüklenirken bir hata oluştu');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await productsAPI.getCategories();
      if (response && response.categories) {
        setCategories(response.categories);
      } else if (Array.isArray(response)) {
        setCategories(response);
      } else {
        console.error('Invalid categories response:', response);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  const loadCities = async () => {
    try {
      const response = await locationsAPI.getCities();
      
      if (response && response.cities && Array.isArray(response.cities)) {
        // Normalize cities with helper
        const normalized = normalizeCities(response.cities);
        // Add "All Cities" option
        const withAllOption = addAllCitiesOption(normalized);
        setCities(withAllOption);
      } else {
        console.error('Invalid cities response:', response);
        // Use fallback cities
        const fallback = getFallbackCities();
        const withAllOption = addAllCitiesOption(fallback);
        setCities(withAllOption);
      }
    } catch (error) {
      console.error('Error loading cities:', error);
      // Fallback: Eğer API çalışmazsa varsayılan şehirleri kullan
      const fallback = getFallbackCities();
      const withAllOption = addAllCitiesOption(fallback);
      setCities(withAllOption);
    }
  };

  const loadSearchHistory = () => {
    // In a real app, this would load from AsyncStorage
    setSearchHistory(['muz', 'elma', 'domates', 'organik ürünler']);
  };

  const handleSearch = async (query?: string) => {
    const searchTerm = query !== undefined ? query : (filters.query || searchQuery);
    
    try {
      setLoading(true);
      
      const searchParams = {
        query: searchTerm,
        category: filters.category,
        location: filters.location,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        stockAvailable: filters.stockAvailable,
        organic: filters.organic,
        coldStorage: filters.coldStorage,
        featured: filters.featured,
        inStock: filters.inStock,
      };

      let response;
      if (searchTerm && searchTerm.trim()) {
        response = await productsAPI.search(searchParams);
        // Add to search history
        if (!searchHistory.includes(searchTerm.trim())) {
          setSearchHistory(prev => [searchTerm.trim(), ...prev.slice(0, 9)]);
        }
      } else {
        response = await productsAPI.getProducts(searchParams);
      }

      if (Array.isArray(response)) {
        setProducts(response);
      } else if (response && response.products && Array.isArray(response.products)) {
        setProducts(response.products);
      } else {
        console.error('Invalid response:', response);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error searching products:', error);
      Alert.alert('Hata', 'Arama yapılırken bir hata oluştu');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const applyQuickFilter = (filterId: string) => {
    let newFilters = { ...filters };
    
    switch (filterId) {
      case 'featured':
        // Öne çıkan ürünler - featured ürünleri göster
        newFilters = { ...newFilters, category: '', minPrice: '', maxPrice: '' };
        break;
      case 'low_price':
        // Uygun fiyatlı ürünler - 1-10₺ arası
        newFilters = { ...newFilters, minPrice: '1', maxPrice: '10', category: '' };
        break;
      case 'new':
        // Yeni ürünler - son eklenenler
        newFilters = { ...newFilters, sortBy: 'date', sortOrder: 'desc', category: '', minPrice: '', maxPrice: '' };
        break;
      case 'popular':
        // Popüler ürünler - çok görüntülenen
        newFilters = { ...newFilters, sortBy: 'views', sortOrder: 'desc', category: '', minPrice: '', maxPrice: '' };
        break;
      default:
        return;
    }
    
    setFilters(newFilters);
    // Filtreleri uygula
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  const applyFilters = () => {
    setShowFilters(false);
    handleSearch();
  };

  const resetFilters = () => {
    setFilters({
      query: searchQuery,
      category: '',
      minPrice: '',
      maxPrice: '',
      location: '',
      sortBy: 'date',
      sortOrder: 'desc',
      stockAvailable: false,
      organic: false,
      coldStorage: false,
      featured: false,
      inStock: false,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const filteredProducts = useMemo(() => {
    // Backend zaten filtreleme yapıyor, burada sadece sıralama yapıyoruz
    let filtered = [...(products || [])];

    // Sort products - backend zaten filtrelenmiş veriyi gönderiyor
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price':
          return filters.sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
        case 'date':
          return filters.sortOrder === 'asc' 
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'name':
          return filters.sortOrder === 'asc' 
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        case 'views':
          return filters.sortOrder === 'asc' ? a.views - b.views : b.views - a.views;
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, filters]);

  // Debug: Log products and loading state
  useEffect(() => {
    console.log('🔍 SearchScreen state:', {
      loading,
      productsCount: products.length,
      searchQuery,
      filteredProductsCount: filteredProducts.length,
      filteredProducts: filteredProducts.slice(0, 2) // First 2 products for debugging
    });
  }, [loading, products, searchQuery, filteredProducts]);

  const getProductImageUrl = (item: Product) => {
    if (!item.images || item.images.length === 0) {
      return null;
    }
    
    // İlk resmi al (primary olan varsa onu, yoksa ilkini)
    const primaryImage = item.images.find(img => typeof img === 'object' && img.isPrimary);
    const firstImage = primaryImage || item.images[0];
    
    if (typeof firstImage === 'string') {
      return firstImage;
    }
    
    return firstImage?.url || null;
  };

  const renderProductCard = ({ item }: { item: Product }) => {
    const imageUrl = getProductImageUrl(item);
    
    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetail', { productId: (item as any)._id })}
      >
        <View style={styles.productImageContainer}>
          {imageUrl ? (
            <Image 
              source={{ 
                uri: imageUrl,
                cache: 'force-cache'
              }} 
              style={styles.productImage}
              resizeMode="cover"
              quality={1.0}
              fadeDuration={0}
            />
          ) : (
            <Text style={styles.productImagePlaceholder}>📦</Text>
          )}
          <View style={styles.productBadge}>
            <Text style={styles.productBadgeText}>YENİ</Text>
          </View>
        </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productCategory}>
          {categories.find(cat => cat.id === item.category)?.name || item.category}
        </Text>
        <Text style={styles.productTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.productFooter}>
          <View style={styles.productPriceContainer}>
            <Text style={styles.productPrice}>{item.price} {item.currency}</Text>
            <Text style={styles.productUnit}>/{item.unit}</Text>
          </View>
          
          <View style={styles.productStats}>
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={12} color="#7F8C8D" />
              <Text style={styles.statsText}>{item.views}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="heart-outline" size={12} color="#E74C3C" />
              <Text style={styles.statsText}>{item.favorites?.length || 0}</Text>
            </View>
          </View>
        </View>
      </View>
      </TouchableOpacity>
    );
  };

  const renderSearchSuggestions = () => (
    <View style={styles.suggestionsContainer}>
      {searchHistory.length > 0 && (
        <View style={styles.suggestionsSection}>
          <Text style={styles.suggestionsTitle}>Son Aramalar</Text>
          {searchHistory.slice(0, 5).map((term, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => {
                setSearchQuery(term);
                setShowSuggestions(false);
                handleSearch(term);
              }}
            >
              <Ionicons name="time-outline" size={16} color="#7F8C8D" />
              <Text style={styles.suggestionText}>{term}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      <View style={styles.suggestionsSection}>
        <Text style={styles.suggestionsTitle}>Popüler Aramalar</Text>
        {['organik meyve', 'taze sebze', 'et ürünleri', 'süt ürünleri', 'baharat'].map((term, index) => (
          <TouchableOpacity
            key={index}
            style={styles.suggestionItem}
            onPress={() => {
              setSearchQuery(term);
              setShowSuggestions(false);
              handleSearch(term);
            }}
          >
            <Ionicons name="trending-up-outline" size={16} color="#7F8C8D" />
            <Text style={styles.suggestionText}>{term}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderQuickFilters = () => (
    <View style={styles.quickFiltersContainer}>
      <Text style={styles.quickFiltersTitle}>Hızlı Filtreler</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickFiltersContent}
      >
        {quickFilters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[styles.quickFilterChip, { borderColor: filter.color }]}
            onPress={() => applyQuickFilter(filter.id)}
          >
            <View style={styles.quickFilterContent}>
              <View style={styles.quickFilterHeader}>
                <Ionicons name={filter.icon as any} size={16} color={filter.color} />
                <Text style={[styles.quickFilterText, { color: filter.color }]}>
                  {filter.name}
                </Text>
              </View>
              <Text style={[styles.quickFilterDescription, { color: filter.color }]}>
                {filter.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <View style={styles.modalHeaderContent}>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filtreler</Text>
            <TouchableOpacity onPress={resetFilters}>
              <Text style={styles.resetText}>Sıfırla</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* Kategoriler */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>📂 Kategoriler</Text>
            <View style={styles.categoriesGrid}>
              {Array.isArray(categories) && categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    filters.category === category.id && styles.categoryChipActive
                  ]}
                  onPress={() => setFilters(prev => ({ ...prev, category: category.id }))}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={20}
                    color={filters.category === category.id ? '#FFFFFF' : '#27AE60'}
                  />
                  <Text style={[
                    styles.categoryChipText,
                    filters.category === category.id && styles.categoryChipTextActive
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Şehir */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>📍 Şehir</Text>
            <View style={styles.dropdownContainer}>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowCityDropdown(!showCityDropdown)}
              >
                <Ionicons
                  name={cities.find(c => c.id === filters.location)?.icon as any || 'location-outline'}
                  size={18}
                  color="#27AE60"
                />
                <Text style={styles.dropdownButtonText}>
                  {cities.find(c => c.id === filters.location)?.name || 'Şehir Seçin'}
                </Text>
                <Ionicons
                  name={showCityDropdown ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#7F8C8D"
                />
              </TouchableOpacity>

              {showCityDropdown && (
                <>
                  <TouchableOpacity 
                    style={styles.dropdownOverlay}
                    activeOpacity={1}
                    onPress={() => setShowCityDropdown(false)}
                  />
                  <View style={styles.dropdown}>
                    <ScrollView 
                      style={styles.dropdownScrollView}
                      showsVerticalScrollIndicator={false}
                      nestedScrollEnabled={true}
                    >
                      {cities.map((city) => (
                        <TouchableOpacity
                          key={city.id}
                          style={[
                            styles.dropdownItem,
                            filters.location === city.id && styles.dropdownItemActive
                          ]}
                          onPress={() => {
                            setFilters(prev => ({ ...prev, location: city.id }));
                            setShowCityDropdown(false);
                          }}
                        >
                          <Ionicons
                            name={city.icon as any}
                            size={16}
                            color={filters.location === city.id ? '#FFFFFF' : '#27AE60'}
                          />
                          <Text style={[
                            styles.dropdownItemText,
                            filters.location === city.id && styles.dropdownItemTextActive
                          ]}>
                            {city.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Fiyat Aralığı */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>💰 Fiyat Aralığı</Text>
            <View style={styles.priceRangeContainer}>
              <View style={styles.priceInputRow}>
                <TextInput
                  style={styles.priceInput}
                  value={filters.minPrice}
                  onChangeText={(text) => setFilters(prev => ({ ...prev, minPrice: text }))}
                  keyboardType="numeric"
                  placeholder="Min"
                  placeholderTextColor="#95A5A6"
                />
                <Text style={styles.priceRangeSeparator}>-</Text>
                <TextInput
                  style={styles.priceInput}
                  value={filters.maxPrice}
                  onChangeText={(text) => setFilters(prev => ({ ...prev, maxPrice: text }))}
                  keyboardType="numeric"
                  placeholder="Max"
                  placeholderTextColor="#95A5A6"
                />
              </View>
            </View>
          </View>

          {/* Sıralama */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>🔄 Sıralama</Text>
            <View style={styles.sortOptionsContainer}>
              <View style={styles.sortByContainer}>
                <Text style={styles.sortSubtitle}>Sıralama Türü</Text>
                <View style={styles.sortOptionsGrid}>
                  {sortOptions.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.sortOption,
                        filters.sortBy === option.id && styles.sortOptionActive
                      ]}
                      onPress={() => setFilters(prev => ({ ...prev, sortBy: option.id as any }))}
                    >
                      <Ionicons
                        name={option.icon as any}
                        size={16}
                        color={filters.sortBy === option.id ? '#FFFFFF' : '#2C3E50'}
                      />
                      <Text style={[
                        styles.sortOptionText,
                        filters.sortBy === option.id && styles.sortOptionTextActive
                      ]}>
                        {option.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.sortOrderContainer}>
                <Text style={styles.sortSubtitle}>Sıralama Yönü</Text>
                <View style={styles.sortOrderButtons}>
                  <TouchableOpacity
                    style={[
                      styles.sortOrderButton,
                      filters.sortOrder === 'asc' && styles.sortOrderButtonActive
                    ]}
                    onPress={() => setFilters(prev => ({ ...prev, sortOrder: 'asc' }))}
                  >
                    <Ionicons
                      name="arrow-up"
                      size={16}
                      color={filters.sortOrder === 'asc' ? '#FFFFFF' : '#7F8C8D'}
                    />
                    <Text style={[
                      styles.sortOrderText,
                      filters.sortOrder === 'asc' && styles.sortOrderTextActive
                    ]}>
                      Artan
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.sortOrderButton,
                      filters.sortOrder === 'desc' && styles.sortOrderButtonActive
                    ]}
                    onPress={() => setFilters(prev => ({ ...prev, sortOrder: 'desc' }))}
                  >
                    <Ionicons
                      name="arrow-down"
                      size={16}
                      color={filters.sortOrder === 'desc' ? '#FFFFFF' : '#7F8C8D'}
                    />
                    <Text style={[
                      styles.sortOrderText,
                      filters.sortOrder === 'desc' && styles.sortOrderTextActive
                    ]}>
                      Azalan
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
            <Text style={styles.resetButtonText}>Sıfırla</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
            <Text style={styles.applyButtonText}>
              Filtreleri Uygula ({activeFilters})
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingState}>
      <Ionicons name="search" size={48} color="#BDC3C7" />
      <Text style={styles.loadingText}>Aranıyor...</Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="search-outline" size={64} color="#BDC3C7" />
      <Text style={styles.emptyTitle}>Ürün bulunamadı</Text>
      <Text style={styles.emptySubtitle}>
        Arama kriterlerinizi değiştirerek tekrar deneyin
      </Text>
      
      <View style={styles.emptyActions}>
        <TouchableOpacity style={styles.emptyButton} onPress={resetFilters}>
          <Ionicons name="refresh" size={18} color="#27AE60" />
          <Text style={styles.emptyButtonText}>Filtreleri Sıfırla</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.notifyButton} 
          onPress={() => {
            navigation.navigate('ProductRequest', {
              initialCategory: filters.category,
              initialKeywords: searchQuery,
              initialCity: filters.location
            });
          }}
        >
          <Ionicons name="notifications" size={18} color="#FFFFFF" />
          <Text style={styles.notifyButtonText}>Bildirim Oluştur</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.hintBox}>
        <Ionicons name="bulb-outline" size={20} color="#FFA726" />
        <Text style={styles.hintText}>
          Aradığınız ürün bulunamadı mı? Bildirim oluşturun, bu ürün eklendiğinde size haber verelim!
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        {customTitle && (
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{customTitle}</Text>
          </View>
        )}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color="#7F8C8D" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Ürün, kategori veya satıcı ara..."
                placeholderTextColor="#95A5A6"
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  setShowSuggestions(text.length > 0);
                  // Debounced search will handle the actual search
                }}
                onFocus={() => setShowSuggestions(searchQuery.length > 0)}
                onSubmitEditing={() => {
                  setShowSuggestions(false);
                  handleSearch();
                }}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery('');
                    setShowSuggestions(false);
                  }}
                  style={styles.clearButton}
                >
                  <Ionicons name="close-circle" size={20} color="#7F8C8D" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.filterButton, activeFilters > 0 && styles.filterButtonActive]}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="options-outline" size={20} color={activeFilters > 0 ? '#FFFFFF' : '#27AE60'} />
            {activeFilters > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilters}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => {
              setFilters(prev => ({
                ...prev,
                sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
              }));
            }}
          >
            <Ionicons
              name={filters.sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
              size={20}
              color="#27AE60"
            />
          </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Search Suggestions */}
      {showSuggestions && renderSearchSuggestions()}

      {/* Quick Filters */}
      {!showSuggestions && renderQuickFilters()}

      {/* Results Header */}
      {!showSuggestions && (
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {filteredProducts.length} ürün bulundu
          </Text>
          {searchQuery && (
            <Text style={styles.searchQueryText}>
              "{searchQuery}" için sonuçlar
            </Text>
          )}
        </View>
      )}

      {/* Products List */}
      {showSuggestions ? null : (
        <>
          {filteredProducts.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={filteredProducts}
              renderItem={renderProductCard}
              keyExtractor={(item) => (item as any)._id}
              numColumns={2}
              contentContainerStyle={styles.productsList}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#27AE60']}
                  tintColor="#27AE60"
                />
              }
            />
          )}
        </>
      )}

      {renderFilterModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitleContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
    paddingVertical: 4,
  },
  clearButton: {
    padding: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27AE60',
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  filterButtonActive: {
    backgroundColor: '#27AE60',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#E74C3C',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27AE60',
    backgroundColor: '#FFFFFF',
  },
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    maxHeight: height * 0.4,
  },
  suggestionsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
    marginBottom: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 4,
  },
  suggestionText: {
    fontSize: 16,
    color: '#2C3E50',
    marginLeft: 8,
  },
  quickFiltersContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    paddingVertical: 12,
  },
  quickFiltersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  quickFiltersContent: {
    paddingHorizontal: 16,
  },
  quickFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
    minWidth: 100,
  },
  quickFilterContent: {
    alignItems: 'center',
  },
  quickFilterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  quickFilterText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  quickFilterDescription: {
    fontSize: 10,
    fontWeight: '400',
    opacity: 0.8,
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  searchQueryText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 2,
  },
  productsList: {
    padding: 16,
  },
  productCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 4,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  productImageContainer: {
    height: 120,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productImagePlaceholder: {
    fontSize: 32,
    color: '#BDC3C7',
  },
  productBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#27AE60',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  productBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 12,
  },
  productCategory: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  productPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  productUnit: {
    fontSize: 12,
    color: '#7F8C8D',
    marginLeft: 2,
  },
  productStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  statsText: {
    fontSize: 12,
    color: '#7F8C8D',
    marginLeft: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 24,
  },
  emptyActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#27AE60',
    gap: 8,
  },
  emptyButtonText: {
    color: '#27AE60',
    fontSize: 14,
    fontWeight: '600',
  },
  notifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27AE60',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  notifyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  hintBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    gap: 12,
    maxWidth: 320,
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    color: '#F57C00',
    lineHeight: 18,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 12,
  },
  
  // Filter Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    zIndex: 1000,
    elevation: 0,
  },
  modalHeader: {
    paddingTop: 10,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#27AE60',
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  resetText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    marginBottom: 8,
  },
  categoryChipActive: {
    backgroundColor: '#27AE60',
    borderColor: '#27AE60',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#2C3E50',
    marginLeft: 6,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 1000,
    marginBottom: 15,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    justifyContent: 'space-between',
  },
  dropdownButtonText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#2C3E50',
  },
  dropdown: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    zIndex: 1002,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 15,
    marginTop: 5,
    maxHeight: 200,
    overflow: 'hidden',
  },
  dropdownScrollView: {
    maxHeight: 200,
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1001,
    backgroundColor: 'transparent',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  dropdownItemActive: {
    backgroundColor: '#27AE60',
  },
  dropdownItemText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#2C3E50',
  },
  dropdownItemTextActive: {
    color: '#FFFFFF',
  },
  priceRangeContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#2C3E50',
    backgroundColor: '#F8F9FA',
  },
  priceRangeSeparator: {
    marginHorizontal: 12,
    fontSize: 16,
    color: '#7F8C8D',
  },
  sortOptionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  sortByContainer: {
    marginBottom: 16,
  },
  sortSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
    marginBottom: 8,
  },
  sortOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    backgroundColor: '#F8F9FA',
    marginRight: 8,
    marginBottom: 8,
  },
  sortOptionActive: {
    backgroundColor: '#27AE60',
    borderColor: '#27AE60',
  },
  sortOptionText: {
    fontSize: 14,
    color: '#2C3E50',
    marginLeft: 6,
    fontWeight: '500',
  },
  sortOptionTextActive: {
    color: '#FFFFFF',
  },
  sortOrderContainer: {
    marginTop: 8,
  },
  sortOrderButtons: {
    flexDirection: 'row',
  },
  sortOrderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    backgroundColor: '#F8F9FA',
  },
  sortOrderButtonActive: {
    backgroundColor: '#27AE60',
    borderColor: '#27AE60',
  },
  sortOrderText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginLeft: 4,
    fontWeight: '500',
  },
  sortOrderTextActive: {
    color: '#FFFFFF',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  resetButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#27AE60',
  },
  applyButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default SearchScreen;