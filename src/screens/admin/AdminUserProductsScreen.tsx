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
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { adminAPI } from '../../services/api';

const { width } = Dimensions.get('window');

interface UserProduct {
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
  media?: Array<{ url: string; type: string }>;
  isAvailable: boolean;
  isApproved: boolean;
  isFeatured: boolean;
  views: number;
  favoritesCount: number;
  createdAt: string;
  updatedAt: string;
}

interface UserInfo {
  _id: string;
  name: string;
  email: string;
  phone: string;
  userType: string;
  profileImage?: string;
  createdAt: string;
}

const AdminUserProductsScreen = ({ route, navigation }: any) => {
  const { userId } = route.params;
  console.log('🔄 AdminUserProductsScreen - userId from params:', userId);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [products, setProducts] = useState<UserProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserProducts();
  }, [userId]);

  const loadUserProducts = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading user products for userId:', userId);
      const response = await adminAPI.getUserProducts(userId);
      console.log('📱 User products response:', response);
      
      // Extract user info from first product or response
      if (response.products && response.products.length > 0) {
        const firstProduct = response.products[0];
        console.log('👤 First product seller info:', firstProduct.seller);
        if (firstProduct.seller) {
          setUser({
            _id: firstProduct.seller._id,
            name: firstProduct.seller.name,
            email: firstProduct.seller.email || '',
            phone: firstProduct.seller.phone || '',
            userType: firstProduct.seller.userType || 'seller',
            profileImage: firstProduct.seller.profileImage,
            createdAt: firstProduct.seller.createdAt || '',
          });
        }
      } else {
        // If no products, we still need to get user info
        console.log('⚠️ No products found, trying to get user info from admin API');
        // We could add a separate API call here to get user info
        Alert.alert('Bilgi', 'Bu kullanıcının henüz ürünü bulunmamaktadır');
      }
      
      setProducts(response.products || []);
    } catch (error) {
      console.error('Error loading user products:', error);
      Alert.alert('Hata', 'Kullanıcı ürünleri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserProducts();
    setRefreshing(false);
  };

  const handleToggleFeatured = async (productId: string) => {
    try {
      await adminAPI.toggleProductFeatured(productId);
      Alert.alert('Başarılı', 'Ürün öne çıkarılma durumu güncellendi');
      loadUserProducts();
    } catch (error) {
      console.error('Toggle featured error:', error);
      Alert.alert('Hata', 'Öne çıkarma durumu güncellenirken hata oluştu');
    }
  };

  const handleToggleApproval = async (productId: string, isApproved: boolean) => {
    try {
      if (isApproved) {
        // Onaylı ürünün onayını kaldır
        Alert.alert(
          'Onay Kaldırma',
          'Bu ürünün onayını kaldırmak istediğinizden emin misiniz? Ürün "Beklemede" durumuna geçecek ve öne çıkarılmışsa öne çıkarılma durumu da kaldırılacak.',
          [
            { text: 'İptal', style: 'cancel' },
            { 
              text: 'Onayı Kaldır',
              style: 'destructive',
              onPress: async () => {
                await adminAPI.rejectProduct(productId, 'Admin tarafından onay kaldırıldı');
                Alert.alert('Başarılı', 'Ürün onayı kaldırıldı');
                loadUserProducts();
              }
            }
          ]
        );
      } else {
        // Onaysız ürünü onayla
        await adminAPI.approveProduct(productId);
        Alert.alert('Başarılı', 'Ürün onaylandı');
        loadUserProducts();
      }
    } catch (error) {
      console.error('Toggle approval error:', error);
      Alert.alert('Hata', 'Ürün durumu güncellenirken hata oluştu');
    }
  };

  const handleDeleteProduct = async (productId: string, productTitle: string) => {
    Alert.alert(
      'Ürünü Sil',
      `"${productTitle}" ürününü kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve ürün resimleri de silinecek.`,
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminAPI.deleteProduct(productId);
              Alert.alert('Başarılı', 'Ürün ve resimleri kalıcı olarak silindi');
              loadUserProducts();
            } catch (error) {
              console.error('Delete product error:', error);
              Alert.alert('Hata', 'Ürün silinirken hata oluştu');
            }
          }
        }
      ]
    );
  };

  const getImageUrl = (product: UserProduct) => {
    if (product.media && product.media.length > 0) {
      return product.media[0].url;
    }
    if (product.images && product.images.length > 0) {
      return typeof product.images[0] === 'string' ? product.images[0] : (product.images[0] as any).url;
    }
    return null;
  };

  const renderProduct = (product: UserProduct) => {
    const imageUrl = getImageUrl(product);
    
    return (
      <View key={product._id} style={styles.productCard}>
        {/* Large Product Image */}
        <View style={styles.imageSection}>
          {imageUrl ? (
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.productMainImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.noImageContainer}>
              <Ionicons name="image-outline" size={64} color="#E0E0E0" />
              <Text style={styles.noImageText}>Resim Yok</Text>
            </View>
          )}
          
          {/* Status Badges Overlay */}
          <View style={styles.overlayBadges}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: product.isApproved ? 'rgba(76, 175, 80, 0.95)' : 'rgba(255, 152, 0, 0.95)' }
            ]}>
              <Ionicons 
                name={product.isApproved ? "checkmark-circle" : "time"} 
                size={14} 
                color="#FFFFFF" 
              />
              <Text style={styles.statusBadgeText}>
                {product.isApproved ? 'Onaylı' : 'Beklemede'}
              </Text>
            </View>
            
            {product.isFeatured && (
              <View style={styles.featuredBadge}>
                <Ionicons name="star" size={14} color="#FFFFFF" />
                <Text style={styles.statusBadgeText}>Öne Çıkan</Text>
              </View>
            )}
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>{product.title}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.categoryTag}>
              <Ionicons name="pricetag" size={12} color="#2E7D32" />
              <Text style={styles.categoryText}>{product.category}</Text>
            </View>
            <View style={styles.locationTag}>
              <Ionicons name="location" size={12} color="#666" />
              <Text style={styles.locationText}>{product.city}</Text>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="cash-outline" size={16} color="#2E7D32" />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statLabel}>Fiyat</Text>
                <Text style={styles.statValue}>{product.price} ₺</Text>
              </View>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="cube-outline" size={16} color="#2196F3" />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statLabel}>Stok</Text>
                <Text style={styles.statValue}>{product.stock} {product.unit}</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: '#F3E5F5' }]}>
                <Ionicons name="eye-outline" size={16} color="#9C27B0" />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statLabel}>Görüntülenme</Text>
                <Text style={styles.statValue}>{product.views}</Text>
              </View>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: '#FCE4EC' }]}>
                <Ionicons name="heart-outline" size={16} color="#E91E63" />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statLabel}>Favori</Text>
                <Text style={styles.statValue}>{product.favoritesCount}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <View style={styles.primaryActions}>
            {/* Approve/Reject Button */}
            <TouchableOpacity
              style={[styles.modernActionButton, { flex: 1 }]}
              onPress={() => handleToggleApproval(product._id, product.isApproved)}
            >
              <LinearGradient
                colors={product.isApproved ? ['#F44336', '#E53935'] : ['#4CAF50', '#43A047']}
                style={styles.buttonGradient}
              >
                <Ionicons 
                  name={product.isApproved ? "close-circle" : "checkmark-circle"} 
                  size={20} 
                  color="#FFFFFF" 
                />
                <Text style={styles.modernButtonText}>
                  {product.isApproved ? 'Onayı Kaldır' : 'Onayla'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Featured Button */}
            <TouchableOpacity
              style={[
                styles.modernActionButton,
                { flex: 1 },
                !product.isApproved && !product.isFeatured && styles.disabledModernButton
              ]}
              onPress={() => {
                if (!product.isApproved && !product.isFeatured) {
                  Alert.alert(
                    'Uyarı',
                    'Sadece onaylı ürünler öne çıkarılabilir. Önce ürünü onaylayın.',
                    [{ text: 'Tamam' }]
                  );
                  return;
                }
                handleToggleFeatured(product._id);
              }}
              disabled={!product.isApproved && !product.isFeatured}
            >
              <LinearGradient
                colors={product.isFeatured ? ['#FFC107', '#FFB300'] : ['#9E9E9E', '#757575']}
                style={styles.buttonGradient}
              >
                <Ionicons 
                  name={product.isFeatured ? "star" : "star-outline"} 
                  size={20} 
                  color="#FFFFFF" 
                />
                <Text style={styles.modernButtonText}>
                  {product.isFeatured ? 'Öne Çıkan' : 'Öne Çıkar'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Delete Button */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteProduct(product._id, product.title)}
          >
            <Ionicons name="trash-outline" size={20} color="#D32F2F" />
            <Text style={styles.deleteButtonText}>Ürünü Sil</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Ürünler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Modern Header */}
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
          <Text style={styles.headerTitle}>Kullanıcı Ürünleri</Text>
          {user && (
            <Text style={styles.headerSubtitle}>{user.name}</Text>
          )}
        </View>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={loadUserProducts}
        >
          <Ionicons name="refresh" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      {/* User Info Card */}
      {user && (
        <View style={styles.userInfoCard}>
          <LinearGradient
            colors={['#FFFFFF', '#F8F9FA']}
            style={styles.userInfoGradient}
          >
            <View style={styles.userInfoContent}>
              {user.profileImage ? (
                <Image source={{ uri: user.profileImage }} style={styles.userAvatar} />
              ) : (
                <View style={styles.userAvatarPlaceholder}>
                  <Ionicons name="person" size={28} color="#FFFFFF" />
                </View>
              )}
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user.name}</Text>
                <View style={styles.userMetaRow}>
                  <Ionicons name="mail" size={12} color="#666" />
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
                {user.phone && (
                  <View style={styles.userMetaRow}>
                    <Ionicons name="call" size={12} color="#666" />
                    <Text style={styles.userPhone}>{user.phone}</Text>
                  </View>
                )}
                <View style={styles.userTypeBadge}>
                  <Text style={styles.userTypeText}>
                    {user.userType === 'seller' ? 'Satıcı' : user.userType === 'buyer' ? 'Alıcı' : 'Admin'}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.userStats}>
              <View style={styles.userStatItem}>
                <Text style={styles.userStatValue}>{products.length}</Text>
                <Text style={styles.userStatLabel}>Ürün</Text>
              </View>
              <View style={styles.userStatDivider} />
              <View style={styles.userStatItem}>
                <Text style={styles.userStatValue}>
                  {products.filter(p => p.isApproved).length}
                </Text>
                <Text style={styles.userStatLabel}>Onaylı</Text>
              </View>
              <View style={styles.userStatDivider} />
              <View style={styles.userStatItem}>
                <Text style={styles.userStatValue}>
                  {products.filter(p => p.isFeatured).length}
                </Text>
                <Text style={styles.userStatLabel}>Öne Çıkan</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Products List */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
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
          <>
            <View style={styles.productsHeader}>
              <Text style={styles.productsTitle}>Ürünler</Text>
              <View style={styles.productCount}>
                <Text style={styles.productCountText}>{products.length}</Text>
              </View>
            </View>
            {products.map(renderProduct)}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={80} color="#E0E0E0" />
            <Text style={styles.emptyTitle}>Henüz Ürün Yok</Text>
            <Text style={styles.emptyText}>Bu kullanıcının henüz ürünü bulunmamaktadır</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  userInfoCard: {
    marginHorizontal: 16,
    marginTop: -30,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  userInfoGradient: {
    padding: 20,
  },
  userInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  userAvatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 8,
  },
  userMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  userPhone: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  userTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#2E7D32',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  userTypeText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  userStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(46, 125, 50, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  userStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  userStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  userStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  userStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  productsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  productsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  productCount: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  productCountText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  imageSection: {
    position: 'relative',
    width: '100%',
    height: 200,
    backgroundColor: '#F0F0F0',
  },
  productMainImage: {
    width: '100%',
    height: '100%',
  },
  noImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  noImageText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  overlayBadges: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'column',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  featuredBadge: {
    backgroundColor: 'rgba(255, 193, 7, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  productInfo: {
    padding: 16,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B1B1B',
    marginBottom: 12,
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTextContainer: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  actionButtonsContainer: {
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  primaryActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  modernActionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  modernButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  disabledModernButton: {
    opacity: 0.5,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D32F2F',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default AdminUserProductsScreen;
