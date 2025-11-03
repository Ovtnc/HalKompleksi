import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Product } from '../../types';

const AdminAllProductsScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDetailModal, setShowProductDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState('all'); // all, approved, pending
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when filter changes
    setSearchQuery(''); // Clear search when filter changes
    loadProducts(1);
  }, [filter]);

  const loadProducts = async (page: number = 1) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const params: any = {
        page: page,
        limit: 10,
      };
      
      // Her zaman status gönder (all da dahil)
      params.status = filter;
      
      // Add search query if exists
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      
      const response = await adminAPI.getProducts(params);
      
      if (page === 1) {
        setProducts(response.products || []);
      } else {
        setProducts([...products, ...(response.products || [])]);
      }
      
      setCurrentPage(response.currentPage || page);
      setTotalPages(response.totalPages || 1);
      setTotalProducts(response.total || 0);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Hata', 'Ürünler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadNextPage = () => {
    if (currentPage < totalPages && !loadingMore) {
      loadProducts(currentPage + 1);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      setCurrentPage(1);
      await loadProducts(1);
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
    loadProducts(1);
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setSearchQuery(''); // Clear search when filter changes
  };

  const handleApprove = async (productId: string) => {
    try {
      setActionLoading(productId);
      await adminAPI.approveProduct(productId);
      await loadProducts(1);
      setShowProductDetailModal(false);
      Alert.alert('Başarılı', 'Ürün onaylandı');
    } catch (error) {
      console.error('Approve error:', error);
      Alert.alert('Hata', 'Ürün onaylanırken bir hata oluştu');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (productId: string) => {
    try {
      setActionLoading(productId);
      await adminAPI.rejectProduct(productId);
      await loadProducts(1);
      setShowProductDetailModal(false);
      Alert.alert('Başarılı', 'Ürün onayı kaldırıldı');
    } catch (error) {
      console.error('Reject error:', error);
      Alert.alert('Hata', 'Ürün reddedilirken bir hata oluştu');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (productId: string) => {
    Alert.alert(
      'Ürünü Sil',
      'Bu ürünü kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve ürün resimleri de silinecek.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(productId);
              await adminAPI.deleteProduct(productId);
              await loadProducts(1);
              setShowProductDetailModal(false);
              Alert.alert('Başarılı', 'Ürün ve resimleri kalıcı olarak silindi');
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Hata', 'Ürün silinirken bir hata oluştu');
            } finally {
              setActionLoading(null);
            }
          }
        }
      ]
    );
  };

  const handleToggleFeatured = async (productId: string) => {
    try {
      setActionLoading(productId);
      const response = await adminAPI.toggleProductFeatured(productId);
      
      // Update the product in the list
      setProducts(products.map((product: any) => 
        product._id === productId 
          ? { ...product, isFeatured: response.isFeatured }
          : product
      ));
      
      Alert.alert('Başarılı', response.message);
    } catch (error) {
      console.error('Error toggling featured:', error);
      Alert.alert('Hata', 'Öne çıkan durumu değiştirilirken bir hata oluştu');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Çıkış Yap', style: 'destructive', onPress: () => logout() }
      ]
    );
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => {
        setSelectedProduct(item);
        setShowProductDetailModal(true);
      }}
    >
      <Image
        source={{ 
          uri: (() => {
            if (!item.images || item.images.length === 0) {
              return null;
            }
            
            const imageUrl = typeof item.images[0] === 'string' 
              ? item.images[0] 
              : (item.images[0] as any)?.url;
            
            if (imageUrl && imageUrl.startsWith('file://')) {
              return null;
            }
            
            if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
              return imageUrl;
            }
            
            return null;
          })()
        }}
        style={styles.productImage}
        onError={() => {
          const firstImage = item.images[0];
          const imageUrl = typeof firstImage === 'string' ? firstImage : firstImage?.url;
          console.log('Product image error:', imageUrl);
        }}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.productPrice}>{item.price} TL</Text>
        <Text style={styles.productCategory}>{item.category}</Text>
        <Text style={styles.sellerInfo}>Satıcı: {item.seller.name}</Text>
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: item.isApproved ? '#4CAF50' : '#FF9800' }
          ]}>
            <Text style={styles.statusText}>
              {item.isApproved ? 'Onaylı' : 'Beklemede'}
            </Text>
          </View>
          
          {item.isApproved && (
            <TouchableOpacity
              style={[
                styles.featuredToggle,
                { backgroundColor: item.isFeatured ? '#FFD700' : (item.isApproved ? '#E0E0E0' : '#F5F5F5') },
                !item.isApproved && styles.disabledButton
              ]}
              onPress={(e) => {
                e.stopPropagation();
                if (!item.isApproved && !item.isFeatured) {
                  Alert.alert(
                    'Uyarı',
                    'Sadece onaylı ürünler öne çıkarılabilir. Önce ürünü onaylayın.',
                    [{ text: 'Tamam' }]
                  );
                  return;
                }
                if (item._id) {
                  handleToggleFeatured(item._id);
                }
              }}
              disabled={actionLoading === item._id || (!item.isApproved && !item.isFeatured)}
            >
              <Ionicons 
                name={item.isFeatured ? "star" : "star-outline"} 
                size={16} 
                color={item.isFeatured ? "#FFFFFF" : "#666666"} 
              />
              <Text style={[
                styles.featuredText,
                { color: item.isFeatured ? "#FFFFFF" : "#666666" }
              ]}>
                {item.isFeatured ? "Öne Çıkan" : "Öne Çıkar"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

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
      <LinearGradient
        colors={['#2E7D32', '#4CAF50']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tüm Ürünler</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.refreshButton} onPress={() => loadProducts(1)}>
              <Ionicons name="refresh" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#2cbd69" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Ürün ara..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#A0A0A0"
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#A0A0A0" />
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.searchButton} 
            onPress={handleSearch}
            disabled={isSearching}
          >
            <Ionicons 
              name={isSearching ? "hourglass" : "search"} 
              size={20} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => handleFilterChange('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
            Tümü
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'approved' && styles.activeFilter]}
          onPress={() => handleFilterChange('approved')}
        >
          <Text style={[styles.filterText, filter === 'approved' && styles.activeFilterText]}>
            Onaylı
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'pending' && styles.activeFilter]}
          onPress={() => handleFilterChange('pending')}
        >
          <Text style={[styles.filterText, filter === 'pending' && styles.activeFilterText]}>
            Beklemede
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Pagination Info */}
        <View style={styles.paginationInfo}>
          <Text style={styles.paginationText}>
            {searchQuery ? `"${searchQuery}" arama sonucu: ` : ''}Sayfa {currentPage} / {totalPages} - Toplam {totalProducts} ürün
          </Text>
        </View>

        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id || item.id || Math.random().toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.productList}
          onEndReached={loadNextPage}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons 
                name={searchQuery ? "search" : "cube-outline"} 
                size={48} 
                color="#ccc" 
              />
              <Text style={styles.emptyText}>
                {searchQuery ? `"${searchQuery}" için sonuç bulunamadı` : 'Henüz ürün eklenmemiş'}
              </Text>
              {searchQuery && (
                <TouchableOpacity 
                  style={styles.clearSearchButton}
                  onPress={clearSearch}
                >
                  <Text style={styles.clearSearchText}>Aramayı Temizle</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          ListFooterComponent={() => (
            loadingMore ? (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color="#2E7D32" />
                <Text style={styles.loadMoreText}>Daha fazla yükleniyor...</Text>
              </View>
            ) : currentPage < totalPages ? (
              <TouchableOpacity 
                style={styles.loadMoreButton}
                onPress={loadNextPage}
              >
                <Ionicons name="arrow-down-circle" size={24} color="#2E7D32" />
                <Text style={styles.loadMoreButtonText}>Daha Fazla Yükle</Text>
              </TouchableOpacity>
            ) : products.length > 0 ? (
              <View style={styles.endOfListContainer}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <Text style={styles.endOfListText}>Tüm ürünler yüklendi</Text>
              </View>
            ) : null
          )}
        />
      </View>

      {/* Product Detail Modal */}
      <Modal
        visible={showProductDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowProductDetailModal(false)}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Ürün Detayları</Text>
            <View style={styles.placeholder} />
          </View>

          {selectedProduct && (
            <ScrollView style={styles.productDetailContent} showsVerticalScrollIndicator={false}>
              {/* Product Images */}
              <View style={styles.imagesSection}>
                <Text style={styles.sectionTitle}>Ürün Resimleri ({selectedProduct.images.length})</Text>
                {selectedProduct.images.length > 0 ? (
                  <FlatList
                    data={selectedProduct.images}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={({ item: image, index }) => {
                      const imageUrl = typeof image === 'string' ? image : (typeof image === 'object' && image !== null ? image.url : null);
                      const isPrimary = typeof image === 'object' && image !== null ? image.isPrimary : false;
                      const finalUri = imageUrl && !imageUrl.startsWith('file://') && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) ? imageUrl : undefined;
                      
                      return (
                      <View style={styles.imageContainer}>
                        {finalUri && (
                          <Image
                            source={{ uri: finalUri }}
                            style={styles.detailImage}
                            resizeMode="cover"
                            onError={() => console.log('Image load error:', imageUrl)}
                          />
                        )}
                        {isPrimary && (
                          <View style={styles.primaryBadge}>
                            <Text style={styles.primaryText}>Ana</Text>
                          </View>
                        )}
                      </View>
                      );
                    }}
                  />
                ) : (
                  <View style={styles.noImagesContainer}>
                    <Ionicons name="image-outline" size={40} color="#ccc" />
                    <Text style={styles.noImagesText}>Resim bulunamadı</Text>
                  </View>
                )}
              </View>

              {/* Product Info */}
              <View style={styles.infoSection}>
                <Text style={styles.productTitle}>{selectedProduct.title}</Text>
                <Text style={styles.productDescription}>{selectedProduct.description}</Text>
                <Text style={styles.productPrice}>{selectedProduct.price} TL</Text>
                <Text style={styles.productCategory}>Kategori: {selectedProduct.category}</Text>
                <Text style={styles.sellerInfo}>Satıcı: {selectedProduct.seller.name}</Text>
                <Text style={styles.sellerInfo}>Email: {selectedProduct.seller.email}</Text>
                <Text style={styles.sellerInfo}>Telefon: {selectedProduct.seller.phone}</Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                {!selectedProduct.isApproved && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => selectedProduct._id && handleApprove(selectedProduct._id)}
                    disabled={actionLoading === selectedProduct._id || !selectedProduct._id}
                  >
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Onayla</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => selectedProduct._id && handleReject(selectedProduct._id)}
                  disabled={actionLoading === selectedProduct._id || !selectedProduct._id}
                >
                  <Ionicons name="close" size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Reddet</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => selectedProduct._id && handleDelete(selectedProduct._id)}
                  disabled={actionLoading === selectedProduct._id || !selectedProduct._id}
                >
                  <Ionicons name="trash" size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Sil</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
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
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    padding: 5,
    marginRight: 10,
  },
  logoutButton: {
    padding: 5,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: '#2E7D32',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  productList: {
    paddingBottom: 20,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
  },
  productCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  sellerInfo: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  statusContainer: {
    alignSelf: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  productDetailContent: {
    flex: 1,
    padding: 20,
  },
  imagesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  imageContainer: {
    marginRight: 10,
    width: 250,
  },
  detailImage: {
    width: '100%',
    height: 200,
    borderRadius: 15,
  },
  primaryBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#2E7D32',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  noImagesContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    marginVertical: 10,
  },
  noImagesText: {
    marginTop: 10,
    fontSize: 16,
    color: '#999',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 100,
    justifyContent: 'center',
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#FF9800',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  featuredToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  featuredText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  paginationInfo: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
  },
  paginationText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  loadMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  loadMoreText: {
    fontSize: 14,
    color: '#666',
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginVertical: 20,
    marginHorizontal: 50,
    gap: 8,
  },
  loadMoreButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  endOfListContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  endOfListText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  searchSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#2cbd69',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: '#2cbd69',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
  },
  clearSearchButton: {
    backgroundColor: '#2cbd69',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 16,
  },
  clearSearchText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AdminAllProductsScreen;
