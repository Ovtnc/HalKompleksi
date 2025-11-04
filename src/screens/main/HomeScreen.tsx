import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  StatusBar,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../types';
import { productsAPI, categoriesAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useProductRefresh } from '../../hooks/useProductRefresh';

interface HomeScreenProps {
  navigation?: any;
}

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Memoize loadProducts to prevent infinite loops
  const loadProducts = useCallback(async () => {
    try {
      setProductsLoading(true);
      console.log('🔄 Loading products from backend...');
      
      const response = await productsAPI.getProducts({ featured: true, limit: 10 });
      console.log('📦 Products response:', response);
      
      if (response && response.products) {
        console.log('📦 Featured products data:', response.products);
        console.log('🔍 First product ID:', response.products[0]?._id || response.products[0]?.id);
        setFeaturedProducts(response.products);
        console.log('✅ Featured products loaded:', response.products.length);
      }
      
      const recentResponse = await productsAPI.getProducts({ limit: 10, sort: 'newest' });
      if (recentResponse && recentResponse.products) {
        console.log('📦 Recent products data:', recentResponse.products);
        console.log('🔍 First recent product ID:', recentResponse.products[0]?._id || recentResponse.products[0]?.id);
        setRecentProducts(recentResponse.products);
        console.log('✅ Recent products loaded:', recentResponse.products.length);
      }
    } catch (error) {
      console.error('❌ Error loading products:', error);
    } finally {
      setProductsLoading(false);
    }
  }, []); // Empty dependency array - function won't change

  const loadData = useCallback(async () => {
    await Promise.all([
      loadProducts(),
      loadCategories()
    ]);
  }, [loadProducts, loadCategories]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Memoize loadCategories to prevent infinite loops
  const loadCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      console.log('🔄 Loading categories from backend...');
      
      const response = await categoriesAPI.getCategories();
      console.log('📦 Categories response:', response);
      
      if (response && response.categories) {
        setCategories(response.categories);
        console.log('✅ Categories loaded:', response.categories.length);
      }
    } catch (error) {
      console.error('❌ Error loading categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // Auto-refresh products when user profile is updated
  useProductRefresh(loadProducts);

  const handleSearch = () => {
    console.log('🔍 HOMESCREEN: Handle search called');
    console.log('🔍 HOMESCREEN: Search query:', searchQuery);
    console.log('🔍 HOMESCREEN: Search query trimmed:', searchQuery.trim());
    console.log('🔍 HOMESCREEN: Navigation available:', !!navigation);
    
    if (searchQuery.trim()) {
      console.log('🔍 HOMESCREEN: Navigating to Products with searchQuery:', searchQuery.trim());
      // Navigate to products with search query
      if (navigation) {
        navigation.navigate('Products', { searchQuery: searchQuery.trim() });
        console.log('✅ HOMESCREEN: Navigation called successfully');
      } else {
        console.error('❌ HOMESCREEN: Navigation not available');
      }
    } else {
      console.log('❌ HOMESCREEN: Search query is empty');
    }
  };

  const handleProductPress = (product: Product) => {
    console.log(`🔄 HOMESCREEN: Product pressed`);
    console.log(`📦 HOMESCREEN: Product object:`, product);
    console.log(`📦 HOMESCREEN: Product ID:`, product._id || product.id);
    console.log(`📦 HOMESCREEN: Product title:`, product.title);
    console.log(`📦 HOMESCREEN: Navigation available:`, !!navigation);
    
    if (navigation) {
      console.log(`📱 HOMESCREEN: Calling navigation.navigate...`);
      const productId = product._id || product.id;
      const params = { productId };
      console.log(`📦 HOMESCREEN: Params to send:`, params);
      
      // Modern ProductDetailScreen'e git
      navigation.navigate('ProductDetail', params);
      console.log(`✅ HOMESCREEN: Navigation call completed`);
    } else {
      console.log(`❌ HOMESCREEN: Navigation not available`);
    }
  };

  const handleCategoryPress = (categorySlug: string) => {
    if (navigation) {
      navigation.navigate('Products', { category: categorySlug });
    }
  };


  const handleSeeAllPress = (type: string) => {
    if (navigation) {
      navigation.navigate('Products', { filter: type });
    }
  };

  // Featured Products Render Function
  const renderFeaturedProduct = ({ item }: { item: Product }) => {
    const primaryImage = item.images?.[0] 
      ? (typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url)
      : undefined;
    
    return (
      <TouchableOpacity
        style={styles.featuredCard}
        onPress={() => handleProductPress(item)}
      >
        <View style={styles.featuredContainer}>
          <View style={styles.featuredImageContainer}>
            <Image 
              source={{ 
                uri: primaryImage,
                cache: 'force-cache'
              }} 
              style={styles.featuredImage}
              resizeMode="cover"
            />
            <View style={styles.featuredStatsContainer}>
              <View style={styles.featuredViewsContainer}>
                <Ionicons name="eye" size={12} color="#FFFFFF" />
                <Text style={styles.featuredViewsText}>{item.views || 0}</Text>
              </View>
              <View style={styles.featuredFavoritesContainer}>
                <Ionicons name="heart" size={12} color="#E74C3C" />
                <Text style={styles.featuredFavoritesText}>{item.favorites?.length || 0}</Text>
              </View>
            </View>
          </View>
          <View style={styles.featuredContent}>
            <View style={styles.featuredOverlay}>
              <Text style={styles.featuredTitle}>
                {item.title || (item as any).name}
              </Text>
              <Text style={styles.featuredPrice}>
                {item.price} {item.currency || 'TL'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Recent Products Render Function
  const renderRecentProduct = ({ item }: { item: Product }) => {
    const primaryImage = item.images?.[0] 
      ? (typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url)
      : undefined;
    
    return (
      <TouchableOpacity
        style={styles.recentCard}
        onPress={() => handleProductPress(item)}
      >
        <View style={styles.recentContainer}>
          <View style={styles.recentImageContainer}>
            <Image 
              source={{ 
                uri: primaryImage,
                cache: 'force-cache'
              }} 
              style={styles.recentImage}
              resizeMode="cover"
            />
            <View style={styles.recentStatsContainer}>
              <View style={styles.recentViewsContainer}>
                <Ionicons name="eye" size={12} color="#FFFFFF" />
                <Text style={styles.recentViewsText}>{item.views || 0}</Text>
              </View>
              <View style={styles.recentFavoritesContainer}>
                <Ionicons name="heart" size={12} color="#E74C3C" />
                <Text style={styles.recentFavoritesText}>{item.favorites?.length || 0}</Text>
              </View>
            </View>
          </View>
          <View style={styles.recentContent}>
            <Text style={styles.recentTitle}>
              {item.title || (item as any).name}
            </Text>
            <View style={styles.recentPriceLocationRow}>
              <Text style={styles.recentPrice}>
                {item.price} {item.currency || 'TL'}
              </Text>
              <View style={styles.recentLocationContainer}>
                <Ionicons name="location" size={12} color="#2cbd69" />
                <Text style={styles.recentLocationText}>
                  {typeof item.location === 'string' ? item.location : item.location?.city || 'İstanbul'}
                </Text>
              </View>
            </View>
            <View style={styles.recentCategoryStockRow}>
              <View style={styles.recentCategoryContainer}>
                <Text style={styles.recentCategoryText}>
                  {item.category}
                </Text>
              </View>
              <Text style={styles.recentStockText}>
                {item.stock} {item.unit || 'kg'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategory = ({ item }: { item: any }) => {
    // Icon isimlerini Ionicons formatına çevir
    const getIconName = (iconName: string) => {
      switch (iconName) {
        case 'leaf': return 'leaf-outline';
        case 'nutrition': return 'nutrition-outline';
        case 'restaurant': return 'restaurant-outline';
        case 'fast-food': return 'fast-food-outline';
        case 'basket': return 'cart-outline';
        case 'car': return 'car-outline';
        case 'cube': return 'cube-outline';
        case 'medical': return 'medical-outline';
        case 'archive': return 'archive-outline';
        case 'people': return 'people-outline';
        case 'home': return 'home-outline';
        case 'car-sport': return 'car-sport-outline';
        default: return 'grid-outline';
      }
    };

    return (
      <TouchableOpacity
        style={styles.categoryItem}
        onPress={() => handleCategoryPress(item.id)}
      >
        <View style={[styles.categoryIcon, { backgroundColor: item.color || '#2cbd69' }]}>
          <Ionicons 
            name={getIconName(item.icon)} 
            size={28} 
            color="#FFFFFF" 
          />
        </View>
        <Text style={styles.categoryName}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2cbd69" />
      
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['#2cbd69', '#66BB6A']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.welcomeSection}>
             
              <View style={styles.sloganContainer}>
                <Text style={styles.sloganMainText}>
                  Halden Anlayan
                </Text>
                <Text style={styles.sloganSubText}>
                  Kompleks
                </Text>
                <View style={styles.sloganUnderline} />
              </View>
            </View>
            
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                  placeholder="Ürün, kategori veya satıcı ara..."
                  onChangeText={setSearchQuery}
                  value={searchQuery}
                  onSubmitEditing={handleSearch}
                  style={styles.searchInput}
                  placeholderTextColor="#999"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity 
                    style={styles.clearButton}
                    onPress={() => setSearchQuery('')}
                  >
                    <Ionicons name="close-circle" size={20} color="#999" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={styles.searchButton}
                  onPress={handleSearch}
                >
                  <Ionicons name="arrow-forward" size={20} color="#2cbd69" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kategoriler</Text>
          {categoriesLoading ? (
            <ActivityIndicator size="small" color="#2cbd69" />
          ) : (
            <FlatList
              data={categories}
              renderItem={renderCategory}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
            />
          )}
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Öne Çıkan Ürünler</Text>
            <TouchableOpacity 
              onPress={() => handleSeeAllPress('featured')}
              style={styles.seeAllButton}
            >
              <Text style={styles.seeAllButtonText}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          {productsLoading ? (
            <ActivityIndicator size="small" color="#2cbd69" />
          ) : (
            <FlatList
              data={featuredProducts}
              renderItem={renderFeaturedProduct}
              keyExtractor={(item) => item._id || item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsList}
            />
          )}
        </View>

        {/* Recent Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Son Eklenen Ürünler</Text>
            <TouchableOpacity 
              onPress={() => handleSeeAllPress('recent')}
              style={styles.seeAllButton}
            >
              <Text style={styles.seeAllButtonText}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          {productsLoading ? (
            <ActivityIndicator size="small" color="#2cbd69" />
          ) : (
            <FlatList
              data={recentProducts}
              renderItem={renderRecentProduct}
              keyExtractor={(item) => item._id || item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsList}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#2cbd69',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    gap: 16,
  },
  welcomeSection: {
    gap: 4,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sloganContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  sloganMainText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    textAlign: 'center',
  },
  sloganSubText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#E8F5E8',
    letterSpacing: 2.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    textAlign: 'center',
    marginTop: -2,
  },
  sloganUnderline: {
    width: 60,
    height: 3,
    backgroundColor: '#4CAF50',
    borderRadius: 2,
    marginTop: 8,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    marginTop: 16,
  },
  searchBar: {
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
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  searchButton: {
    marginLeft: 8,
    padding: 4,
    backgroundColor: '#E8F5E8',
    borderRadius: 6,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    paddingBottom: 10,
  },
  seeAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  seeAllButtonText: {
    fontSize: 14,
    color: '#2cbd69',
    fontWeight: '600',
  },
  categoriesList: {
    paddingRight: 10,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 5,
    width: 80,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryName: {
    fontSize: 13,
    textAlign: 'center',
    color: '#333',
    fontWeight: '600',
    marginTop: 4,
  },
  productsList: {
    paddingRight: 20,
  },
  // Featured Product Cards
  featuredCard: {
    width: 250,
    marginRight: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featuredContainer: {
    overflow: 'hidden',
  },
  featuredImageContainer: {
    position: 'relative',
    height: 160,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredViewsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 6,
    paddingHorizontal: 3,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredViewsText: {
    fontSize: 10,
    color: '#FFFFFF',
    marginLeft: 2,
  },
    featuredStatsContainer: {
      position: 'absolute',
      top: 8,
      right: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
  featuredFavoritesContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 6,
    paddingHorizontal: 3,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredFavoritesText: {
    fontSize: 10,
    color: '#E74C3C',
    marginLeft: 2,
  },
  featuredContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 12,
  },
  featuredOverlay: {
    // Overlay content styling
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featuredPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  
  // Recent Product Cards
  recentCard: {
    width: 180,
    marginRight: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  recentContainer: {
    overflow: 'hidden',
  },
  recentImageContainer: {
    position: 'relative',
    height: 120,
  },
  recentImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  recentViewsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 6,
    paddingHorizontal: 3,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentViewsText: {
    fontSize: 9,
    color: '#FFFFFF',
    marginLeft: 2,
  },
    recentStatsContainer: {
      position: 'absolute',
      top: 8,
      right: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
  recentFavoritesContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 6,
    paddingHorizontal: 3,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentFavoritesText: {
    fontSize: 9,
    color: '#E74C3C',
    marginLeft: 2,
  },
  recentContent: {
    padding: 12,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 18,
  },
  recentPriceLocationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2cbd69',
  },
  recentLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentLocationText: {
    fontSize: 11,
    color: '#2cbd69',
    marginLeft: 3,
  },
  recentCategoryStockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentCategoryContainer: {
    backgroundColor: '#E8F5E8',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  recentCategoryText: {
    fontSize: 10,
    color: '#2cbd69',
    fontWeight: '500',
  },
  recentStockText: {
    fontSize: 10,
    color: '#666',
  },
});

export default HomeScreen;