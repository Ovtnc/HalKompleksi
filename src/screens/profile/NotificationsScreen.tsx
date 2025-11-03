import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { notificationsAPI } from '../../services/api';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  product?: {
    _id: string;
    title: string;
    images: any[];
  };
  data?: {
    category?: string;
    city?: string;
    keywords?: string[];
    matchedRequestId?: string;
    productTitle?: string;
    productPrice?: number;
    productUnit?: string;
  };
  isRead: boolean;
  createdAt: string;
}

const NotificationsScreen = ({ navigation, onNotificationRead }: any) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  // Sayfa odağa geldiğinde bildirimleri yenile
  useFocusEffect(
    React.useCallback(() => {
      loadNotifications();
    }, [filter])
  );

  const loadNotifications = async () => {
    try {
      setLoading(true);
      console.log('🔔 Loading notifications...');
      
      // Try API call first
      try {
        const response = await notificationsAPI.getNotifications();
        console.log('🔔 Notifications response:', response);
        setNotifications(response.notifications || []);
        setUnreadCount(response.unreadCount || 0);
        console.log('🔔 Notifications loaded:', response.notifications?.length || 0);
      } catch (apiError) {
        console.log('🔔 API failed:', (apiError as Error).message);
        // Set empty state on API failure
        setNotifications([]);
        setUnreadCount(0);
        console.log('🔔 No notifications available');
      }
    } catch (error) {
      console.error('Load notifications error:', error);
      Alert.alert('Hata', 'Bildirimler yüklenirken bir hata oluştu: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: Notification) => {
    try {
      console.log('🔔 Notification pressed:', {
        id: notification._id,
        type: notification.type,
        hasProduct: !!notification.product,
        product: notification.product,
        data: notification.data
      });

      // Mark as read
      if (!notification.isRead) {
        try {
          await notificationsAPI.markAsRead(notification._id);
          loadNotifications();
          
          // Notify parent component (ProfileScreen) that notification was read
          if (onNotificationRead) {
            onNotificationRead();
          }
        } catch (markError) {
          console.log('🔔 Mark as read failed, continuing:', (markError as Error).message);
        }
      }

      // Handle different notification types
      if (notification.type === 'product_available') {
        // Navigate to SearchScreen with pre-filled search query only
        const searchTerm = notification.data?.keywords?.join(' ') || '';
        console.log('🔔 Navigating to SearchScreen with search term:', searchTerm);
        console.log('🔔 Full notification data:', notification.data);
        console.log('🔔 Navigation object:', navigation);
        
        // Navigate to Products screen
        navigation?.navigate('Products', {
          searchQuery: searchTerm,
          category: notification.data?.category,
          city: notification.data?.city
        });
      } else if (notification.product && notification.product._id) {
        // For other notifications with products, navigate to ProductDetail
        console.log('🔔 Navigating to product:', notification.product._id);
        navigation?.navigate('ProductDetail', { 
          productId: notification.product._id,
          product: notification.product 
        });
      } else {
        console.log('🔔 No navigation available for this notification type');
        Alert.alert('Bilgi', 'Bu bildirim için özel bir sayfa bulunamadı');
      }
    } catch (error) {
      console.error('Handle notification press error:', error);
      Alert.alert('Hata', 'Bildirim işlenirken hata oluştu: ' + (error as Error).message);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      Alert.alert('Başarılı', 'Tüm bildirimler okundu olarak işaretlendi');
      loadNotifications();
    } catch (error) {
      console.error('Mark all as read error:', error);
      Alert.alert('Hata', 'Bildirimler işaretlenirken hata oluştu');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationsAPI.deleteNotification(notificationId);
      loadNotifications();
    } catch (error) {
      console.error('Delete notification error:', error);
      Alert.alert('Hata', 'Bildirim silinirken hata oluştu');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'product_approved': return { name: 'checkmark-circle', color: '#4CAF50' };
      case 'product_rejected': return { name: 'close-circle', color: '#F44336' };
      case 'product_pending': return { name: 'time', color: '#FF9800' };
      case 'product_available': return { name: 'cube', color: '#2196F3' };
      case 'product_featured': return { name: 'star', color: '#FFD700' };
      default: return { name: 'information-circle', color: '#9E9E9E' };
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Az önce';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} dakika önce`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} saat önce`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  const renderNotification = (notification: Notification) => {
    const icon = getNotificationIcon(notification.type);
    
    return (
      <TouchableOpacity
        key={notification._id}
        style={[styles.notificationCard, !notification.isRead && styles.unreadCard]}
        onPress={() => handleNotificationPress(notification)}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${icon.color}20` }]}>
          <Ionicons name={icon.name as any} size={24} color={icon.color} />
        </View>
        
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {notification.message}
          </Text>
          <Text style={styles.notificationTime}>{getTimeAgo(notification.createdAt)}</Text>
        </View>

        {!notification.isRead && <View style={styles.unreadDot} />}

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation();
            Alert.alert(
              'Bildirimi Sil',
              'Bu bildirimi silmek istediğinizden emin misiniz?',
              [
                { text: 'İptal', style: 'cancel' },
                { 
                  text: 'Sil', 
                  style: 'destructive',
                  onPress: () => handleDeleteNotification(notification._id)
                }
              ]
            );
          }}
        >
          <Ionicons name="trash-outline" size={20} color="#999" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Bildirimler yükleniyor...</Text>
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
          <Text style={styles.headerTitle}>Bildirimler</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleMarkAllAsRead}
          disabled={unreadCount === 0}
        >
          <Ionicons name="checkmark-done" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
            Tümü ({notifications.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'unread' && styles.activeFilter]}
          onPress={() => setFilter('unread')}
        >
          <Text style={[styles.filterText, filter === 'unread' && styles.activeFilterText]}>
            Okunmamış ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
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
        {notifications.length > 0 ? (
          notifications.map(renderNotification)
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={80} color="#E0E0E0" />
            <Text style={styles.emptyTitle}>Bildirim Yok</Text>
            <Text style={styles.emptyText}>
              {filter === 'unread' 
                ? 'Okunmamış bildiriminiz bulunmuyor'
                : 'Henüz bildiriminiz bulunmuyor'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Product Request Button (Only for buyers) */}
      {user?.userType === 'buyer' && (
        <TouchableOpacity
          style={styles.requestButton}
          onPress={() => navigation.navigate('ProductRequest')}
        >
          <LinearGradient
            colors={['#2E7D32', '#4CAF50']}
            style={styles.requestButtonGradient}
          >
            <Ionicons name="add-circle" size={24} color="#FFFFFF" />
            <Text style={styles.requestButtonText}>Ürün Talebi Oluştur</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
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
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButton: {
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
    flexDirection: 'row',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  unreadBadge: {
    backgroundColor: '#F44336',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: '#2E7D32',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadCard: {
    backgroundColor: '#F1F8E9',
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B1B1B',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2E7D32',
    marginHorizontal: 12,
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
    marginTop: 40,
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
  requestButton: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  requestButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  requestButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default NotificationsScreen;
