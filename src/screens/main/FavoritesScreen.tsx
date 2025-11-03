import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { productsAPI } from '../../services/api';

interface Product {
  _id: string;
  title: string;
  price: number;
  currency: string;
  images: Array<{ url: string; isPrimary?: boolean }>;
  location: { city: string; district?: string } | string;
  category: string;
  stock: number;
  unit: string;
  views: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FavoritesScreenProps {
  navigation?: any;
}

const FavoritesScreen: React.FC<FavoritesScreenProps> = ({ navigation }) => {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      console.log('🔄 FAVORITES: Loading favorites...');
      
      const response = await productsAPI.getFavorites();
      console.log('✅ FAVORITES: Favorites loaded:', response);
      
      setFavorites(response.products || response || []);
    } catch (error) {
      console.error('❌ FAVORITES: Error loading favorites:', error);
      Alert.alert('Hata', 'Favoriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  const handleProductPress = (product: Product) => {
    console.log('🔄 FAVORITES: Product pressed:', product._id);
    if (navigation) {
      navigation.navigate('ProductDetail', { productId: product._id });
    }
  };

  const handleRemoveFavorite = async (productId: string) => {
    try {
      console.log('🗑️ FAVORITES: Removing from favorites:', productId);
      await productsAPI.removeFromFavorites(productId);
      
      // Remove from local state
      setFavorites(prev => prev.filter(item => item._id !== productId));
      Alert.alert('✅ Başarılı', 'Ürün favorilerden çıkarıldı');
    } catch (error) {
      console.error('❌ FAVORITES: Error removing favorite:', error);
      Alert.alert('Hata', 'Favori çıkarılırken bir hata oluştu');
    }
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const primaryImage = item.images?.find(img => img.isPrimary)?.url || item.images?.[0]?.url;
    const locationText = typeof item.location === 'string' ? item.location : item.location?.city || 'İstanbul';

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleProductPress(item)}
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
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => handleRemoveFavorite(item._id)}
          >
            <Ionicons name="heart" size={20} color="#FF5722" />
          </TouchableOpacity>
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

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={64} color="#E0E0E0" />
      <Text style={styles.emptyTitle}>Henüz Favori Ürün Yok</Text>
      <Text style={styles.emptyMessage}>
        Beğendiğiniz ürünleri favorilere ekleyerek burada görebilirsiniz.
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation?.navigate('Home')}
      >
        <Text style={styles.exploreButtonText}>Ürünleri Keşfet</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Favoriler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation?.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Favorilerin</Text>
            <Text style={styles.headerSubtitle}>
              {favorites.length} ürün favorilerinizde
            </Text>
          </View>
          <View style={styles.headerRight}>
          </View>
        </View>
      </View>

      <FlatList
        data={favorites}
        renderItem={renderProduct}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.productsList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
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
    backgroundColor: '#2cbd69',
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  backButton: {
    padding: 12,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 50,
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerRight: {
    minWidth: 50,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E8F5E8',
    fontWeight: '500',
    opacity: 0.9,
    textAlign: 'center',
  },
  productsList: {
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
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#4CAF50',
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
    color: '#4CAF50',
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
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default FavoritesScreen;