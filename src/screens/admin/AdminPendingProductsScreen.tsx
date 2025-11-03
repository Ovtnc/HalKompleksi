import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { adminAPI } from '../../services/api';

interface PendingProduct {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: Array<{ url: string; isPrimary: boolean }>;
  location: { city: string };
  seller: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    userType: string;
  };
  createdAt: string;
}

const AdminPendingProductsScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState<PendingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<PendingProduct | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showProductDetailModal, setShowProductDetailModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadPendingProducts();
  }, []);

  const loadPendingProducts = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPendingProducts();
      setProducts(response.products);
    } catch (error) {
      console.error('Error loading pending products:', error);
      Alert.alert('Hata', 'Onay bekleyen ürünler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: () => {
            logout();
          },
        },
      ]
    );
  };

  const handleApprove = async (productId: string) => {
    try {
      setActionLoading(productId);
      await adminAPI.approveProduct(productId);
      
      Alert.alert('Başarılı', 'Ürün onaylandı!', [
        { text: 'Tamam', onPress: loadPendingProducts }
      ]);
    } catch (error) {
      console.error('Error approving product:', error);
      Alert.alert('Hata', 'Ürün onaylanırken bir hata oluştu.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!selectedProduct) return;
    
    try {
      console.log('🚫 Frontend: Starting product rejection...');
      console.log('🚫 Frontend: Product ID:', selectedProduct._id);
      console.log('🚫 Frontend: Reject reason:', rejectReason);
      
      setActionLoading(selectedProduct._id);
      await adminAPI.rejectProduct(selectedProduct._id, rejectReason);
      
      console.log('✅ Frontend: Product rejected successfully');
      Alert.alert('Başarılı', 'Ürün reddedildi!', [
        { text: 'Tamam', onPress: () => {
          setShowRejectModal(false);
          setRejectReason('');
          setSelectedProduct(null);
          loadPendingProducts();
        }}
      ]);
    } catch (error) {
      console.error('❌ Frontend: Error rejecting product:', error);
      console.error('❌ Frontend: Error message:', error.message);
      console.error('❌ Frontend: Error details:', error);
      Alert.alert('Hata', `Ürün reddedilirken bir hata oluştu: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const renderProduct = ({ item }: { item: PendingProduct }) => (
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
            // Resim yoksa fallback döndür
            if (!item.images || item.images.length === 0) {
              return null;
            }
            
            const imageUrl = typeof item.images[0] === 'string' 
              ? item.images[0] 
              : (item.images[0] as any)?.url;
            
            // file:// protokolü ile başlayan URL'ler web'de çalışmaz
            if (imageUrl && imageUrl.startsWith('file://')) {
              console.log('File URL detected in admin panel, using fallback:', imageUrl);
              return null;
            }
            
            // Geçerli HTTP/HTTPS URL ise kullan
            if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
              return imageUrl;
            }
            
            // Diğer durumlarda fallback
            console.log('Invalid image URL in admin panel, using fallback:', imageUrl);
            return null;
          })()
        }}
        style={styles.productImage}
        onError={() => console.log('Product image error:', item.images[0]?.url)}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.productPrice}>{item.price} TL</Text>
        <Text style={styles.productCategory}>{item.category}</Text>
        <Text style={styles.sellerInfo}>Satıcı: {item.seller.name}</Text>
        <Text style={styles.productDate}>
          {new Date(item.createdAt).toLocaleDateString('tr-TR')}
        </Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={(e) => {
            e.stopPropagation();
            handleApprove(item._id);
          }}
          disabled={actionLoading === item._id}
        >
          {actionLoading === item._id ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={(e) => {
            e.stopPropagation();
            setSelectedProduct(item);
            setShowRejectModal(true);
          }}
          disabled={actionLoading === item._id}
        >
          <Ionicons name="close" size={20} color="#FFFFFF" />
        </TouchableOpacity>
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
      {/* Header */}
      <LinearGradient
        colors={['#1B5E20', '#2E7D32', '#4CAF50']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Onay Bekleyen Ürünler</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={loadPendingProducts}
            >
              <Ionicons name="refresh" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
            <Text style={styles.emptyTitle}>Tüm Ürünler Onaylandı!</Text>
            <Text style={styles.emptyText}>
              Onay bekleyen ürün bulunmuyor. Yeni ürünler eklendiğinde burada görünecek.
            </Text>
          </View>
        ) : (
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.productList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Reject Modal */}
      <Modal
        visible={showRejectModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRejectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ürünü Reddet</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowRejectModal(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalText}>
                {selectedProduct?.title} ürününü reddetmek istediğinizden emin misiniz?
              </Text>
              <TextInput
                style={styles.reasonInput}
                placeholder="Reddetme sebebini yazın..."
                value={rejectReason}
                onChangeText={setRejectReason}
                multiline
                numberOfLines={3}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowRejectModal(false)}
                >
                  <Text style={styles.cancelButtonText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleReject}
                  disabled={actionLoading === selectedProduct?._id}
                >
                  {actionLoading === selectedProduct?._id ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.confirmButtonText}>Reddet</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Product Detail Modal */}
      <Modal
        visible={showProductDetailModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProductDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.productDetailModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ürün Detayları</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowProductDetailModal(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
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
                      renderItem={({ item: image, index }) => (
                        <View style={styles.imageContainer}>
                          <Image
                            source={{ 
                              uri: (() => {
                                // Resim yoksa fallback döndür
                                if (!image || !image.url) {
                                  return null;
                                }
                                
                                const imageUrl = typeof image === 'string' ? image : image.url;
                                
                                // file:// protokolü ile başlayan URL'ler web'de çalışmaz
                                if (imageUrl && imageUrl.startsWith('file://')) {
                                  console.log('File URL detected in detail modal, using fallback:', imageUrl);
                                  return null;
                                }
                                
                                // Geçerli HTTP/HTTPS URL ise kullan
                                if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
                                  return imageUrl;
                                }
                                
                                // Diğer durumlarda fallback
                                console.log('Invalid image URL in detail modal, using fallback:', imageUrl);
                                return null;
                              })()
                            }}
                            style={styles.detailImage}
                            resizeMode="cover"
                            onError={() => console.log('Image load error:', image.url)}
                          />
                          {image.isPrimary && (
                            <View style={styles.primaryBadge}>
                              <Text style={styles.primaryText}>Ana</Text>
                            </View>
                          )}
                          <View style={styles.imageIndex}>
                            <Text style={styles.imageIndexText}>{index + 1}</Text>
                          </View>
                        </View>
                      )}
                    />
                  ) : (
                    <View style={styles.noImagesContainer}>
                      <Ionicons name="image-outline" size={40} color="#ccc" />
                      <Text style={styles.noImagesText}>Resim bulunamadı</Text>
                    </View>
                  )}
                </View>

                {/* Product Info */}
                <View style={styles.productInfoSection}>
                  <Text style={styles.sectionTitle}>Ürün Bilgileri</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Başlık:</Text>
                    <Text style={styles.infoValue}>{selectedProduct.title}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Açıklama:</Text>
                    <Text style={styles.infoValue}>{selectedProduct.description}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Fiyat:</Text>
                    <Text style={styles.infoValue}>{selectedProduct.price} TL</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Kategori:</Text>
                    <Text style={styles.infoValue}>{selectedProduct.category}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Şehir:</Text>
                    <Text style={styles.infoValue}>{selectedProduct.location.city}</Text>
                  </View>
                </View>

                {/* Seller Info */}
                <View style={styles.sellerInfoSection}>
                  <Text style={styles.sectionTitle}>Satıcı Bilgileri</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Ad:</Text>
                    <Text style={styles.infoValue}>{selectedProduct.seller.name}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Email:</Text>
                    <Text style={styles.infoValue}>{selectedProduct.seller.email}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Telefon:</Text>
                    <Text style={styles.infoValue}>{selectedProduct.seller.phone}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Eklenme Tarihi:</Text>
                    <Text style={styles.infoValue}>
                      {new Date(selectedProduct.createdAt).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.detailActionButtons}>
                  <TouchableOpacity
                    style={[styles.detailActionButton, styles.approveButton]}
                    onPress={() => {
                      setShowProductDetailModal(false);
                      handleApprove(selectedProduct._id);
                    }}
                    disabled={actionLoading === selectedProduct._id}
                  >
                    {actionLoading === selectedProduct._id ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>Onayla</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.detailActionButton, styles.rejectButton]}
                    onPress={() => {
                      setShowProductDetailModal(false);
                      setShowRejectModal(true);
                    }}
                    disabled={actionLoading === selectedProduct._id}
                  >
                    <Ionicons name="close" size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Reddet</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
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
  content: {
    flex: 1,
    padding: 15,
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
    justifyContent: 'center',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  sellerInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  productDate: {
    fontSize: 12,
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  confirmButton: {
    backgroundColor: '#F44336',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // Product Detail Modal Styles
  productDetailModal: {
    backgroundColor: '#FFFFFF',
    margin: 5,
    borderRadius: 20,
    maxHeight: '95%',
    width: '95%',
    alignSelf: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  productDetailContent: {
    padding: 20,
  },
  imagesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 10,
    width: 250,
  },
  detailImage: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  primaryBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: '#2E7D32',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productInfoSection: {
    marginBottom: 20,
  },
  sellerInfoSection: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    width: 80,
    marginRight: 10,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  detailActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  detailActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  imageIndex: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIndexText: {
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
});

export default AdminPendingProductsScreen;
