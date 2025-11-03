import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { ENV } from '../../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { productsAPI } from '../../services/api';
import { useProductRefresh } from '../../hooks/useProductRefresh';

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  images: Array<{ url: string; isPrimary?: boolean; type?: string }>;
  isApproved: boolean;
  isAvailable: boolean;
  views?: number;
  favorites?: string[];
  favoritesCount?: number;
  createdAt: string;
  seller?: {
    name: string;
    phone: string;
    location?: {
      city: string;
      district: string;
    };
  };
}

interface MyProductsScreenProps {
  navigation: any;
}

const MyProductsScreen: React.FC<MyProductsScreenProps> = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [productCount, setProductCount] = useState({
    total: 0,
    active: 0,
    pending: 0,
    approved: 0
  });

  // Define loadMyProducts with useCallback first so it can be used in useProductRefresh
  const loadMyProducts = useCallback(async () => {
    try {
      setLoading(true);
      console.log('📦 Loading my products from database...');
      console.log('📦 Current user:', user);
      
      // Fetch real data from API
      const response = await productsAPI.getMyProducts();
      console.log('📦 API response:', response);
      
      if (response.products) {
        setProducts(response.products);
        console.log('📦 My products loaded:', response.products.length);
      } else {
        console.log('📦 No products found');
        setProducts([]);
      }
    } catch (error) {
      console.error('❌ Load my products error:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Check if it's an authorization error
      if (error instanceof Error && error.message.includes('403')) {
        Alert.alert('Yetki Hatası', 'Satıcı yetkisi gerekli. Lütfen hesap ayarlarınızı kontrol edin.');
      } else if (error instanceof Error && error.message.includes('401')) {
        Alert.alert('Oturum Hatası', 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
      } else {
        Alert.alert('Hata', 'Ürünler yüklenirken bir hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
      }
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Auto-refresh products when user profile is updated
  useProductRefresh(loadMyProducts);

  const loadProductCount = useCallback(async () => {
    try {
      console.log('📊 MyProductsScreen: Loading product count from database...');
      console.log('📊 MyProductsScreen: User context:', { 
        user: user?.id, 
        userType: user?.userType, 
        activeRole: (user as any)?.activeRole,
        isSeller: user?.userType === 'seller' || (user as any)?.activeRole === 'seller'
      });
      
      // Check if user is seller
      if (!user || (user.userType !== 'seller' && (user as any).activeRole !== 'seller')) {
        console.log('📊 MyProductsScreen: User is not a seller, skipping count load');
        return;
      }
      
      const countData = await productsAPI.getSellerProductCount();
      console.log('📊 MyProductsScreen: Product count response:', countData);
      
      setProductCount(countData);
    } catch (error) {
      console.error('❌ MyProductsScreen: Error loading product count:', error);
      console.error('❌ MyProductsScreen: Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      // Don't show alert for count error, just use default values
    }
  }, [user]);

  const switchToSellerRole = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${ENV.API_BASE_URL}/users/switch-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: 'seller' })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Role switched successfully in MyProductsScreen:', result.user);
        
        // Update user via AuthContext
        await updateUser(result.user);
      } else {
        console.error('❌ Failed to switch role in MyProductsScreen:', response.status);
      }
    } catch (error) {
      console.error('❌ Role switch error in MyProductsScreen:', error);
    }
  }, [updateUser]);

  useEffect(() => {
    // Ensure user is in seller role
    if (user) {
      const userRoles = (user as any).userRoles || [];
      const activeRole = (user as any).activeRole || user.userType;
      
      console.log('🔍 MyProductsScreen - User roles:', userRoles);
      console.log('🔍 MyProductsScreen - Active role:', activeRole);
      
      // If user has seller role but activeRole is not seller, switch to seller
      if (userRoles.includes('seller') && activeRole !== 'seller') {
        console.log('🔄 Auto-switching to seller role in MyProductsScreen...');
        switchToSellerRole();
      } else if (userRoles.includes('seller') && activeRole === 'seller') {
        console.log('✅ User already in seller role');
      } else {
        console.log('❌ User does not have seller role');
      }
    }
    
    loadMyProducts();
    loadProductCount();
  }, [user, loadMyProducts, loadProductCount, switchToSellerRole]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMyProducts();
    await loadProductCount();
    setRefreshing(false);
  };

  const handleAddProduct = () => {
    navigation.navigate('AddProduct');
  };

  const handleEditProduct = (product: Product) => {
    Alert.alert(
      'Ürün Düzenle',
      `${product.title} ürününü düzenlemek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Düzenle', 
          onPress: () => {
            console.log('Edit product:', product._id);
            navigation.navigate('EditProduct', { productId: product._id });
          }
        }
      ]
    );
  };

  const handleToggleProduct = async (product: Product) => {
    const action = product.isAvailable ? 'durdurmak' : 'yayınlamak';
    Alert.alert(
      `Ürün ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      `${product.title} ürününü ${action} istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: action.charAt(0).toUpperCase() + action.slice(1), 
          onPress: async () => {
            try {
              console.log('Toggle product:', product._id, 'to', !product.isAvailable);
              await productsAPI.toggleProductAvailability(product._id, !product.isAvailable);
              
              // Reload products from server to get updated data
              console.log('🔄 Reloading products after toggle...');
              await loadMyProducts();
              await loadProductCount();
              
              Alert.alert('Başarılı', `Ürün ${action} işlemi tamamlandı`);
            } catch (error) {
              console.error('Toggle product error:', error);
              Alert.alert('Hata', 'Ürün durumu değiştirilirken bir hata oluştu');
            }
          }
        }
      ]
    );
  };

  const handleDeleteProduct = (product: Product) => {
    Alert.alert(
      'Ürünü Sil',
      `${product.title} ürününü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Delete product:', product._id);
              await productsAPI.deleteProduct(product._id);
              
              // Remove from local state
              setProducts(prevProducts => 
                prevProducts.filter(p => p._id !== product._id)
              );
              
              Alert.alert('Başarılı', 'Ürün başarıyla silindi');
            } catch (error) {
              console.error('Delete product error:', error);
              Alert.alert('Hata', 'Ürün silinirken bir hata oluştu');
            }
          }
        }
      ]
    );
  };



  const renderProduct = (product: Product) => {
    // Get the primary image or first image
    const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
    const imageUrl = primaryImage?.url || '';
    
    return (
      <View key={product._id} style={styles.modernProductCard}>
        <View style={styles.modernProductImageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.modernProductImage}
            resizeMode="cover"
          />
          <View style={[
            styles.modernStatusBadge,
            { backgroundColor: product.isApproved ? '#2cbd69' : '#F39C12' }
          ]}>
            <Text style={styles.modernStatusText}>
              {product.isApproved ? 'Aktif' : 'Beklemede'}
            </Text>
          </View>
        </View>
        
        <View style={styles.modernProductInfo}>
          <Text style={styles.modernProductTitle}>{product.title}</Text>
          <Text style={styles.modernProductDescription} numberOfLines={2}>
            {product.description}
          </Text>
          <View style={styles.modernProductPriceContainer}>
            <Text style={styles.modernProductPrice}>{product.price} ₺</Text>
            <Text style={styles.modernProductUnit}>/{product.unit}</Text>
          </View>
          <View style={styles.modernProductMeta}>
            <View style={styles.modernProductStats}>
              <Ionicons name="eye" size={14} color="#666" />
              <Text style={styles.modernProductStatText}>{product.views || 0}</Text>
              <Ionicons name="heart" size={14} color="#666" style={{ marginLeft: 12 }} />
              <Text style={styles.modernProductStatText}>{product.favoritesCount || 0}</Text>
            </View>
            <View style={styles.modernProductCategory}>
              <Text style={styles.modernProductCategoryText}>{product.category}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.modernProductActions}>
          <TouchableOpacity
            style={[styles.modernActionButton, { backgroundColor: '#3498DB' }]}
            onPress={() => handleEditProduct(product)}
          >
            <Ionicons name="pencil" size={16} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modernActionButton, { backgroundColor: product.isAvailable ? '#E74C3C' : '#2cbd69' }]}
            onPress={() => handleToggleProduct(product)}
          >
            <Ionicons name={product.isAvailable ? "pause" : "play"} size={16} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modernActionButton, { backgroundColor: '#95A5A6' }]}
            onPress={() => handleDeleteProduct(product)}
          >
            <Ionicons name="trash" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#27AE60" />
        <Text style={styles.loadingText}>Ürünler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Modern Header */}
      <View style={styles.modernHeader}>
        <View style={styles.modernHeaderTop}>
          <TouchableOpacity
            style={styles.modernBackButton}
            onPress={() => {
              if (navigation && navigation.canGoBack && navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('SellerDashboard');
              }
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
            <View style={styles.modernHeaderCenter}>
              <Text style={styles.modernHeaderTitle}>Ürünlerim</Text>
             
            </View>
          <TouchableOpacity
            style={styles.modernAddButton}
            onPress={handleAddProduct}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#27AE60']}
            tintColor="#27AE60"
          />
        }
      >
        {products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color="#BDC3C7" />
            <Text style={styles.emptyTitle}>Henüz ürününüz yok</Text>
            <Text style={styles.emptySubtitle}>
              İlk ürününüzü ekleyerek satışa başlayın
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={handleAddProduct}
            >
              <Text style={styles.emptyButtonText}>Ürün Ekle</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.productsList}>
            {products.map(renderProduct)}
          </View>
        )}
      </ScrollView>
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
    color: '#6C757D',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
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
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#27AE60',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  productsList: {
    padding: 16,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  productImageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 150,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  productInfo: {
    padding: 16,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 8,
  },
  productPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  productUnit: {
    fontSize: 14,
    color: '#6C757D',
    marginLeft: 4,
  },
  productCategory: {
    fontSize: 12,
    color: '#95A5A6',
    textTransform: 'uppercase',
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    paddingTop: 0,
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Modern Styles
  modernHeader: {
    backgroundColor: '#2cbd69',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modernHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  modernBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modernHeaderCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  modernHeaderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  modernHeaderSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  modernAddButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Modern Product Card Styles
  modernProductCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  modernProductImageContainer: {
    position: 'relative',
    height: 200,
  },
  modernProductImage: {
    width: '100%',
    height: '100%',
  },
  modernStatusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  modernStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modernProductInfo: {
    padding: 16,
  },
  modernProductTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  modernProductDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
    marginBottom: 12,
  },
  modernProductPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  modernProductPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2cbd69',
  },
  modernProductUnit: {
    fontSize: 14,
    color: '#7F8C8D',
    marginLeft: 4,
  },
  modernProductMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modernProductStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernProductStatText: {
    fontSize: 12,
    color: '#7F8C8D',
    marginLeft: 4,
  },
  modernProductCategory: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modernProductCategoryText: {
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '500',
  },
  modernProductActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    paddingTop: 0,
    gap: 8,
  },
  modernActionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MyProductsScreen;