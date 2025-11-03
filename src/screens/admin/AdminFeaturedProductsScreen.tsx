import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { adminAPI } from '../../services/api';

interface FeaturedProduct {
  _id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  unit: string;
  category: string;
  city: string;
  district: string;
  images: string[];
  isAvailable: boolean;
  isApproved: boolean;
  isFeatured: boolean;
  views: number;
  favoritesCount: number;
  createdAt: string;
  updatedAt: string;
  seller: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
}

const AdminFeaturedProductsScreen = ({ navigation }: any) => {
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getFeaturedProducts();
      setProducts(response.products || []);
    } catch (error) {
      console.error('Error loading featured products:', error);
      Alert.alert('Hata', 'Öne çıkan ürünler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeaturedProducts();
    setRefreshing(false);
  };

  const handleToggleFeatured = async (productId: string) => {
    try {
      await adminAPI.toggleProductFeatured(productId);
      Alert.alert('Başarılı', 'Ürün öne çıkarılma durumu güncellendi');
      loadFeaturedProducts();
    } catch (error) {
      console.error('Toggle featured error:', error);
      Alert.alert('Hata', 'Öne çıkarma durumu güncellenirken hata oluştu');
    }
  };

  const renderProduct = (product: FeaturedProduct) => (
    <View key={product._id} style={styles.productCard}>
      <View style={styles.productHeader}>
        <View style={styles.productInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.productTitle} numberOfLines={2}>{product.title}</Text>
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.featuredText}>Öne Çıkan</Text>
            </View>
          </View>
          <Text style={styles.productCategory}>{product.category}</Text>
          <Text style={styles.productLocation}>{product.city} - {product.district}</Text>
        </View>
        <View style={styles.productImageContainer}>
          {product.images && product.images.length > 0 ? (
            <Image 
              source={{ uri: product.images[0] }} 
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.productImage, styles.noImagePlaceholder]}>
              <Ionicons name="image-outline" size={24} color="#999" />
            </View>
          )}
        </View>
      </View>

      <View style={styles.sellerInfo}>
        <View style={styles.sellerAvatar}>
          {product.seller.profileImage ? (
            <Image 
              source={{ uri: product.seller.profileImage }} 
              style={styles.sellerImage}
            />
          ) : (
            <Ionicons name="person" size={20} color="#666" />
          )}
        </View>
        <View style={styles.sellerDetails}>
          <Text style={styles.sellerName}>{product.seller.name}</Text>
          <Text style={styles.sellerEmail}>{product.seller.email}</Text>
        </View>
      </View>

      <View style={styles.productDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Fiyat:</Text>
          <Text style={styles.detailValue}>{product.price} TL</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Stok:</Text>
          <Text style={styles.detailValue}>{product.stock} {product.unit}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Görüntülenme:</Text>
          <Text style={styles.detailValue}>{product.views}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Favori:</Text>
          <Text style={styles.detailValue}>{product.favoritesCount}</Text>
        </View>
      </View>

      <View style={styles.statusContainer}>
        <View style={styles.statusBadges}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: product.isApproved ? '#4CAF50' : '#FF9800' }
          ]}>
            <Text style={styles.statusBadgeText}>
              {product.isApproved ? 'Onaylı' : 'Beklemede'}
            </Text>
          </View>
          <View style={[
            styles.statusBadge,
            { backgroundColor: product.isAvailable ? '#2196F3' : '#F44336' }
          ]}>
            <Text style={styles.statusBadgeText}>
              {product.isAvailable ? 'Aktif' : 'Pasif'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.removeFeaturedButton}
          onPress={() => handleToggleFeatured(product._id)}
        >
          <Ionicons name="star-off" size={16} color="#F44336" />
          <Text style={styles.removeFeaturedText}>Öne Çıkarmayı Kaldır</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Öne çıkan ürünler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1B5E20', '#2E7D32', '#4CAF50']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Öne Çıkan Ürünler</Text>
          <Text style={styles.headerSubtitle}>{products.length} ürün</Text>
        </View>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      {/* Products List */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2E7D32']}
            tintColor="#2E7D32"
          />
        }
      >
        {products.length > 0 ? (
          products.map(renderProduct)
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="star-outline" size={64} color="#999" />
            <Text style={styles.emptyText}>Henüz öne çıkan ürün yok</Text>
            <Text style={styles.emptySubtext}>
              Ürünleri öne çıkarmak için ürün listesinden yıldız butonuna tıklayın
            </Text>
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
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E8F5E8',
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  productHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredText: {
    fontSize: 12,
    color: '#FFC107',
    fontWeight: '600',
    marginLeft: 4,
  },
  productCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  productLocation: {
    fontSize: 12,
    color: '#999',
  },
  productImageContainer: {
    width: 80,
    height: 80,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  noImagePlaceholder: {
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  sellerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sellerImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  sellerEmail: {
    fontSize: 12,
    color: '#666',
  },
  productDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statusContainer: {
    marginBottom: 12,
  },
  statusBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  removeFeaturedButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  removeFeaturedText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    color: '#F44336',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default AdminFeaturedProductsScreen;
