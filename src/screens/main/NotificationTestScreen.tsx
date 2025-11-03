import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { notificationsAPI } from '../../services/api';

const NotificationTestScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading notifications...');
      const response = await notificationsAPI.getNotifications();
      console.log('📱 Notifications response:', response);
      setNotifications(response.notifications || []);
      Alert.alert('Başarılı', `${response.notifications?.length || 0} bildirim yüklendi`);
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
      Alert.alert('Hata', `Bildirimler yüklenemedi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      Alert.alert('Başarılı', 'Bildirim okundu olarak işaretlendi');
    } catch (error) {
      console.error('❌ Error marking as read:', error);
      Alert.alert('Hata', `Bildirim işaretlenemedi: ${error.message}`);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      Alert.alert('Başarılı', 'Tüm bildirimler okundu olarak işaretlendi');
    } catch (error) {
      console.error('❌ Error marking all as read:', error);
      Alert.alert('Hata', `Bildirimler işaretlenemedi: ${error.message}`);
    }
  };

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bildirim Test Ekranı</Text>
        <Text style={styles.subtitle}>
          Toplam: {notifications.length} | Okunmamış: {unreadCount}
        </Text>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={loadNotifications}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Yükleniyor...' : 'Bildirimleri Yükle'}
          </Text>
        </TouchableOpacity>

        {unreadCount > 0 && (
          <TouchableOpacity 
            style={[styles.button, styles.markAllButton]} 
            onPress={markAllAsRead}
          >
            <Text style={styles.buttonText}>Tümünü Okundu İşaretle</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.notifications}>
        {notifications.map((notification, index) => (
          <View 
            key={notification._id} 
            style={[
              styles.notificationItem,
              !notification.isRead && styles.unreadItem
            ]}
          >
            <View style={styles.notificationHeader}>
              <Text style={[
                styles.notificationTitle,
                !notification.isRead && styles.unreadTitle
              ]}>
                {notification.title}
              </Text>
              <Text style={styles.notificationType}>
                {notification.type}
              </Text>
            </View>
            
            <Text style={styles.notificationMessage}>
              {notification.message}
            </Text>
            
            <View style={styles.notificationFooter}>
              <Text style={styles.notificationTime}>
                {new Date(notification.createdAt).toLocaleString('tr-TR')}
              </Text>
              <Text style={styles.notificationStatus}>
                {notification.isRead ? '✅ Okundu' : '🔴 Okunmadı'}
              </Text>
            </View>

            {!notification.isRead && (
              <TouchableOpacity 
                style={styles.markReadButton}
                onPress={() => markAsRead(notification._id)}
              >
                <Text style={styles.markReadText}>Okundu İşaretle</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {notifications.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz bildirim yüklenmedi</Text>
            <Text style={styles.emptySubtext}>
              "Bildirimleri Yükle" butonuna basın
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2E8B57',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  buttons: {
    padding: 20,
    gap: 10,
  },
  button: {
    backgroundColor: '#2E8B57',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  markAllButton: {
    backgroundColor: '#F39C12',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  notifications: {
    padding: 20,
    gap: 15,
  },
  notificationItem: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  unreadItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#2E8B57',
    backgroundColor: '#F8FFF8',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  notificationType: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  notificationStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  markReadButton: {
    backgroundColor: '#2E8B57',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  markReadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});

export default NotificationTestScreen;

