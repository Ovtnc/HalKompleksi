import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../services/AuthContext';
import { ordersAPI } from '../../services/api';

const { width } = Dimensions.get('window');

interface Order {
  _id: string;
  product: {
    _id: string;
    title: string;
    images: string[];
    price: number;
    currency: string;
  };
  seller: {
    _id: string;
    name: string;
    phone: string;
    location: string;
  };
  buyer: {
    _id: string;
    name: string;
    phone: string;
    location: string;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  deliveryAddress: {
    street: string;
    city: string;
    district: string;
    postalCode?: string;
  };
  notes?: string;
  deliveryDate?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  trackingNumber?: string;
  paymentMethod: 'cash' | 'card' | 'transfer';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

const OrdersScreen = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>('buyer');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showStatusFilter, setShowStatusFilter] = useState(false);

  const statusOptions = [
    { id: 'all', name: 'Tümü', color: '#6B7280' },
    { id: 'pending', name: 'Beklemede', color: '#F59E0B' },
    { id: 'confirmed', name: 'Onaylandı', color: '#3B82F6' },
    { id: 'shipped', name: 'Kargoya Verildi', color: '#8B5CF6' },
    { id: 'delivered', name: 'Teslim Edildi', color: '#10B981' },
    { id: 'cancelled', name: 'İptal Edildi', color: '#EF4444' },
  ];

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const status = selectedStatus !== 'all' ? selectedStatus : undefined;
      
      const data = activeTab === 'buyer' 
        ? await ordersAPI.getOrders(1, 50, status)
        : await ordersAPI.getSellerOrders(1, 50, status);
      
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Hata', 'Siparişler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, selectedStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await ordersAPI.updateOrderStatus(orderId, newStatus);
      Alert.alert('Başarılı', 'Sipariş durumu güncellendi');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Hata', 'Sipariş durumu güncellenirken bir hata oluştu');
    }
  };

  const cancelOrder = async (orderId: string) => {
    Alert.alert(
      'Siparişi İptal Et',
      'Bu siparişi iptal etmek istediğinizden emin misiniz?',
      [
        { text: 'Hayır', style: 'cancel' },
        {
          text: 'Evet, İptal Et',
          style: 'destructive',
          onPress: async () => {
            try {
              await ordersAPI.cancelOrder(orderId);
              Alert.alert('Başarılı', 'Sipariş iptal edildi');
              fetchOrders();
            } catch (error) {
              console.error('Error cancelling order:', error);
              Alert.alert('Hata', 'Sipariş iptal edilirken bir hata oluştu');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(option => option.id === status);
    return statusOption?.color || '#6B7280';
  };

  const getStatusName = (status: string) => {
    const statusOption = statusOptions.find(option => option.id === status);
    return statusOption?.name || status;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number, currency: string = 'TL') => {
    return `${price.toLocaleString('tr-TR')} ${currency}`;
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const isBuyer = activeTab === 'buyer';
    const otherParty = isBuyer ? item.seller : item.buyer;

    return (
      <TouchableOpacity style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>#{item._id.slice(-8).toUpperCase()}</Text>
            <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusName(item.status)}</Text>
          </View>
        </View>

        <View style={styles.productInfo}>
          <Image
            source={{ uri: item.product.images[0] || 'https://via.placeholder.com/80' }}
            style={styles.productImage}
            resizeMode="cover"
          />
          <View style={styles.productDetails}>
            <Text style={styles.productTitle} numberOfLines={2}>
              {item.product.title}
            </Text>
            <Text style={styles.productPrice}>
              {formatPrice(item.unitPrice, item.product.currency)} x {item.quantity}
            </Text>
            <Text style={styles.totalPrice}>
              Toplam: {formatPrice(item.totalPrice, item.product.currency)}
            </Text>
          </View>
        </View>

        <View style={styles.partyInfo}>
          <View style={styles.partyItem}>
            <Ionicons name="person-outline" size={16} color="#6B7280" />
            <Text style={styles.partyText}>{otherParty.name}</Text>
          </View>
          <View style={styles.partyItem}>
            <Ionicons name="call-outline" size={16} color="#6B7280" />
            <Text style={styles.partyText}>{otherParty.phone}</Text>
          </View>
          <View style={styles.partyItem}>
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text style={styles.partyText}>{otherParty.location}</Text>
          </View>
        </View>

        {item.deliveryAddress && (
          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryLabel}>Teslimat Adresi:</Text>
            <Text style={styles.deliveryText}>
              {item.deliveryAddress.street}, {item.deliveryAddress.district}, {item.deliveryAddress.city}
            </Text>
          </View>
        )}

        {item.notes && (
          <View style={styles.notesInfo}>
            <Text style={styles.notesLabel}>Notlar:</Text>
            <Text style={styles.notesText}>{item.notes}</Text>
          </View>
        )}

        <View style={styles.orderActions}>
          {isBuyer && item.status === 'pending' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => cancelOrder(item._id)}
            >
              <Ionicons name="close-circle-outline" size={16} color="#EF4444" />
              <Text style={styles.cancelButtonText}>İptal Et</Text>
            </TouchableOpacity>
          )}

          {!isBuyer && item.status === 'pending' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.confirmButton]}
              onPress={() => updateOrderStatus(item._id, 'confirmed')}
            >
              <Ionicons name="checkmark-circle-outline" size={16} color="#10B981" />
              <Text style={styles.confirmButtonText}>Onayla</Text>
            </TouchableOpacity>
          )}

          {!isBuyer && item.status === 'confirmed' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.shipButton]}
              onPress={() => updateOrderStatus(item._id, 'shipped')}
            >
              <Ionicons name="car-outline" size={16} color="#3B82F6" />
              <Text style={styles.shipButtonText}>Kargoya Ver</Text>
            </TouchableOpacity>
          )}

          {!isBuyer && item.status === 'shipped' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deliverButton]}
              onPress={() => updateOrderStatus(item._id, 'delivered')}
            >
              <Ionicons name="checkmark-done-outline" size={16} color="#10B981" />
              <Text style={styles.deliverButtonText}>Teslim Et</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>Sipariş Bulunamadı</Text>
      <Text style={styles.emptySubtitle}>
        {selectedStatus === 'all' 
          ? 'Henüz hiç siparişiniz yok'
          : `${getStatusName(selectedStatus)} durumunda sipariş bulunamadı`
        }
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FFFE" />
      
      {/* Header */}
      <LinearGradient
        colors={['#2E8B57', '#3CB371']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Siparişlerim</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowStatusFilter(true)}
        >
          <Ionicons name="filter-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Tab Selector */}
      <View style={styles.tabSelector}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'buyer' && styles.activeTabButton]}
          onPress={() => setActiveTab('buyer')}
        >
          <Ionicons 
            name="cart-outline" 
            size={20} 
            color={activeTab === 'buyer' ? '#2E8B57' : '#6B7280'} 
          />
          <Text style={[styles.tabText, activeTab === 'buyer' && styles.activeTabText]}>
            Aldıklarım
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'seller' && styles.activeTabButton]}
          onPress={() => setActiveTab('seller')}
        >
          <Ionicons 
            name="storefront-outline" 
            size={20} 
            color={activeTab === 'seller' ? '#2E8B57' : '#6B7280'} 
          />
          <Text style={[styles.tabText, activeTab === 'seller' && styles.activeTabText]}>
            Sattıklarım
          </Text>
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Status Filter Modal */}
      <Modal
        visible={showStatusFilter}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStatusFilter(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Durum Filtresi</Text>
              <TouchableOpacity onPress={() => setShowStatusFilter(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.statusOption,
                  selectedStatus === option.id && styles.selectedStatusOption
                ]}
                onPress={() => {
                  setSelectedStatus(option.id);
                  setShowStatusFilter(false);
                }}
              >
                <View style={[styles.statusDot, { backgroundColor: option.color }]} />
                <Text style={[
                  styles.statusOptionText,
                  selectedStatus === option.id && styles.selectedStatusOptionText
                ]}>
                  {option.name}
                </Text>
                {selectedStatus === option.id && (
                  <Ionicons name="checkmark" size={20} color="#2E8B57" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FFFE',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#2E8B57',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: '#E8F5E8',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#2E8B57',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#2E8B57',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  orderDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
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
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  totalPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E8B57',
  },
  partyInfo: {
    marginBottom: 12,
  },
  partyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  partyText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
  },
  deliveryInfo: {
    marginBottom: 8,
  },
  deliveryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  deliveryText: {
    fontSize: 12,
    color: '#6B7280',
  },
  notesInfo: {
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  notesText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelButton: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 4,
  },
  confirmButton: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  confirmButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 4,
  },
  shipButton: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  shipButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
    marginLeft: 4,
  },
  deliverButton: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  deliverButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  selectedStatusOption: {
    backgroundColor: '#E8F5E8',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  selectedStatusOptionText: {
    color: '#2E8B57',
    fontWeight: '600',
  },
});

export default OrdersScreen;
