import React, { useState, useEffect } from 'react';
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
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../services/AuthContext';

interface Order {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
  };
  seller: {
    _id: string;
    name: string;
    profileImage?: string;
    phone?: string;
  };
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

const OrderHistoryScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'Tümü', count: 0 },
    { id: 'pending', label: 'Bekleyen', count: 0 },
    { id: 'confirmed', label: 'Onaylandı', count: 0 },
    { id: 'shipped', label: 'Kargoda', count: 0 },
    { id: 'delivered', label: 'Teslim Edildi', count: 0 },
    { id: 'cancelled', label: 'İptal Edildi', count: 0 },
  ];

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      // TODO: Implement actual API call for orders
      setOrders([]);
      updateFilterCounts([]);
    } catch (error) {
      console.error('Load orders error:', error);
      Alert.alert('Hata', 'Siparişler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const updateFilterCounts = (ordersList: Order[]) => {
    const updatedFilters = filters.map(filter => ({
      ...filter,
      count: filter.id === 'all' 
        ? ordersList.length 
        : ordersList.filter(order => order.status === filter.id).length
    }));
    // Update filters state if needed
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Bekleyen', color: '#FF9800', icon: 'time-outline' };
      case 'confirmed':
        return { label: 'Onaylandı', color: '#2196F3', icon: 'checkmark-circle-outline' };
      case 'shipped':
        return { label: 'Kargoda', color: '#9C27B0', icon: 'car-outline' };
      case 'delivered':
        return { label: 'Teslim Edildi', color: '#4CAF50', icon: 'checkmark-done-outline' };
      case 'cancelled':
        return { label: 'İptal Edildi', color: '#F44336', icon: 'close-circle-outline' };
      default:
        return { label: 'Bilinmiyor', color: '#999', icon: 'help-outline' };
    }
  };

  const filteredOrders = selectedFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedFilter);

  const renderOrderCard = (order: Order) => {
    const statusInfo = getStatusInfo(order.status);
    
    return (
      <TouchableOpacity
        key={order._id}
        style={styles.orderCard}
        onPress={() => {
          // Navigate to order detail
          Alert.alert('Sipariş Detayı', `Sipariş #${order._id} detayları`);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>Sipariş #{order._id.slice(-6)}</Text>
            <Text style={styles.orderDate}>
              {new Date(order.createdAt).toLocaleDateString('tr-TR')}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
            <Ionicons name={statusInfo.icon as any} size={16} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        <View style={styles.productInfo}>
          <Image
            source={{ uri: order.product.images[0] || '' }}
            style={styles.productImage}
            resizeMode="cover"
          />
          <View style={styles.productDetails}>
            <Text style={styles.productName} numberOfLines={2}>
              {order.product.name}
            </Text>
            <Text style={styles.productPrice}>
              ₺{order.product.price} x {order.quantity}
            </Text>
            <Text style={styles.totalPrice}>
              Toplam: ₺{order.totalPrice}
            </Text>
          </View>
        </View>

        <View style={styles.sellerInfo}>
          <View style={styles.sellerLeft}>
            <Image
              source={{ 
                uri: order.seller.profileImage || '' 
              }}
              style={styles.sellerAvatar}
            />
            <Text style={styles.sellerName}>{order.seller.name}</Text>
          </View>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={async () => {
              if (order.seller?.phone) {
                try {
                  // Normalize phone: remove all non-digits
                  let phone = String(order.seller.phone).replace(/[^0-9]/g, '');
                  
                  // If starts with 0, replace with 90 for WhatsApp (format: 90XXXXXXXXXX without +)
                  if (phone.startsWith('0')) {
                    phone = '90' + phone.substring(1);
                  } else if (!phone.startsWith('90')) {
                    // If doesn't start with 0 or 90, assume it's missing 0 and add 90
                    phone = '90' + phone;
                  }
                  
                  // WhatsApp URL format: https://wa.me/90XXXXXXXXXX (no + sign, only digits)
                  const whatsappUrl = `https://wa.me/${phone}`;
                  
                  console.log('📱 Opening WhatsApp with URL:', whatsappUrl);
                  
                  // Try to open directly
                  try {
                    await Linking.openURL(whatsappUrl);
                  } catch (openError) {
                    // Fallback: Try with whatsapp:// scheme
                    const whatsappScheme = `whatsapp://send?phone=${phone}`;
                    try {
                      await Linking.openURL(whatsappScheme);
                    } catch (schemeError) {
                      // Last resort: Open in browser
                      await Linking.openURL(whatsappUrl);
                    }
                  }
                } catch (err: any) {
                  console.error('📱 WhatsApp error:', err);
                  Alert.alert(
                    'Hata', 
                    `WhatsApp açılamadı. Lütfen WhatsApp'ın kurulu olduğundan emin olun.`
                  );
                }
              } else {
                Alert.alert('Bilgi', 'Satıcının telefon numarası bulunamadı');
              }
            }}
          >
            <Ionicons name="chatbubble-outline" size={16} color="#27AE60" />
            <Text style={styles.contactText}>İletişim</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterChip = (filter: any) => (
    <TouchableOpacity
      key={filter.id}
      style={[
        styles.filterChip,
        selectedFilter === filter.id && styles.filterChipActive
      ]}
      onPress={() => setSelectedFilter(filter.id)}
    >
      <Text style={[
        styles.filterText,
        selectedFilter === filter.id && styles.filterTextActive
      ]}>
        {filter.label}
      </Text>
      {filter.count > 0 && (
        <View style={styles.filterBadge}>
          <Text style={styles.filterBadgeText}>{filter.count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#27AE60', '#2ECC71']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sipariş Geçmişi</Text>
          <View style={{ width: 34 }} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Filter Chips */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filters.map(renderFilterChip)}
          </ScrollView>
        </View>

        {/* Orders List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#27AE60" />
            <Text style={styles.loadingText}>Siparişler yükleniyor...</Text>
          </View>
        ) : filteredOrders.length > 0 ? (
          <View style={styles.ordersContainer}>
            {filteredOrders.map(renderOrderCard)}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#CCC" />
            <Text style={styles.emptyTitle}>Sipariş Bulunamadı</Text>
            <Text style={styles.emptyText}>
              {selectedFilter === 'all' 
                ? 'Henüz hiç sipariş vermediniz'
                : 'Bu durumda sipariş bulunmuyor'
              }
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
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  filtersContainer: {
    paddingVertical: 15,
    paddingLeft: 20,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipActive: {
    backgroundColor: '#27AE60',
    borderColor: '#27AE60',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  filterBadge: {
    backgroundColor: '#F44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    paddingHorizontal: 6,
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  ordersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  productInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  sellerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  sellerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sellerAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  sellerName: {
    fontSize: 14,
    color: '#666',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  contactText: {
    fontSize: 12,
    color: '#27AE60',
    marginLeft: 4,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default OrderHistoryScreen;
