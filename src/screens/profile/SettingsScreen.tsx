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
  Switch,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../services/AuthContext';
import { notificationsAPI } from '../../services/api';

const SettingsScreen = ({ navigation }: any) => {
  const { user, logout, updateUser, updateProfileImage, switchRole } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeRequestsCount, setActiveRequestsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [switchingRole, setSwitchingRole] = useState(false);
  
  // Get current role
  const currentRole = user?.activeRole || user?.userType;
  
  // Check if user has both roles
  const hasMultipleRoles = user?.userRoles && user.userRoles.length > 1;

  // Debug: User bilgisini logla
  useEffect(() => {
    console.log('SettingsScreen - Current user:', {
      name: user?.name,
      email: user?.email,
      profileImage: user?.profileImage,
    });
  }, [user]);

  // Load notification and request counts
  useEffect(() => {
    loadCounts();
  }, [user]);

  const loadCounts = async () => {
    try {
      setLoading(true);
      
      // Load unread notifications for all users
      const notificationsResponse = await notificationsAPI.getNotifications();
      setUnreadCount(notificationsResponse.notifications?.length || 0);
      
      // Load active product requests for buyers only
      if (currentRole === 'buyer') {
        const requestsResponse = await notificationsAPI.getProductRequests();
        setActiveRequestsCount(requestsResponse.requests?.length || 0);
      }
    } catch (error) {
      console.error('Load counts error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Çıkış Yap', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleRoleSwitch = async (newRole: 'buyer' | 'seller') => {
    if (!hasMultipleRoles) {
      // If user doesn't have multiple roles yet, confirm they want to add the new role
      Alert.alert(
        'Rol Ekle',
        `${newRole === 'seller' ? 'Satıcı' : 'Alıcı'} hesabı eklemek istediğinizden emin misiniz?`,
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Ekle',
            onPress: async () => {
              try {
                setSwitchingRole(true);
                await switchRole(newRole);
                setSwitchingRole(false);
                
                // Show success message - AppNavigator will automatically re-render
                Alert.alert(
                  'Başarılı', 
                  `${newRole === 'seller' ? 'Satıcı' : 'Alıcı'} hesabı eklendi ve aktif edildi! Uygulama otomatik olarak güncellenecek.`
                );
              } catch (error: any) {
                Alert.alert('Hata', error.message || 'Rol değiştirilemedi');
                setSwitchingRole(false);
              }
            },
          },
        ]
      );
    } else {
      // If user already has multiple roles, just switch
      try {
        setSwitchingRole(true);
        await switchRole(newRole);
        setSwitchingRole(false);
        
        // AppNavigator will automatically re-render with new role
      } catch (error: any) {
        Alert.alert('Hata', error.message || 'Rol değiştirilemedi');
        setSwitchingRole(false);
      }
    }
  };

  const handleImagePick = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Hata', 'Galeriye erişim izni gerekli');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploading(true);
        try {
          await updateProfileImage(result.assets[0].uri);
          Alert.alert('Başarılı', 'Profil fotoğrafı güncellendi');
        } catch (error) {
          console.error('Profile image update error:', error);
          Alert.alert('Hata', 'Profil fotoğrafı güncellenirken bir hata oluştu');
        } finally {
          setUploading(false);
        }
      }
    } catch (error) {
      setUploading(false);
      console.error('Image picker error:', error);
      Alert.alert('Hata', 'Profil fotoğrafı güncellenirken bir hata oluştu');
    }
  };

  const menuItems = [
    {
      id: '1',
      title: 'Kişisel Bilgiler',
      icon: 'person-outline',
      onPress: () => navigation.navigate('PersonalInfo'),
    },
    ...(currentRole === 'buyer' ? [{
      id: '2',
      title: 'Favorilerim',
      icon: 'heart-outline',
      onPress: () => {
        // Navigate to main tabs - Favoriler
        navigation.getParent()?.navigate('Favoriler');
      },
    }] : []),
    {
      id: '3',
      title: 'Bildirimler',
      icon: 'notifications-outline',
      badge: unreadCount,
      onPress: () => navigation.navigate('Notifications'),
    },
    ...(currentRole === 'buyer' ? [{
      id: '4',
      title: 'Aktif Taleplerim',
      icon: 'list-outline',
      badge: activeRequestsCount,
      onPress: () => navigation.navigate('ProductRequest'),
    }] : []),
    ...(currentRole === 'buyer' ? [{
      id: '5',
      title: 'Sipariş Geçmişi',
      icon: 'receipt-outline',
      onPress: () => navigation.navigate('OrderHistory'),
    }] : []),
    {
      id: '6',
      title: 'Ödeme Yöntemleri',
      icon: 'card-outline',
      onPress: () => navigation.navigate('PaymentMethods'),
    },
    {
      id: '7',
      title: 'Gizlilik Ayarları',
      icon: 'shield-outline',
      onPress: () => navigation.navigate('PrivacySettings'),
    },
    {
      id: '8',
      title: 'Güvenlik Ayarları',
      icon: 'lock-closed-outline',
      onPress: () => navigation.navigate('SecuritySettings'),
    },
    {
      id: '9',
      title: 'Yardım & Destek',
      icon: 'help-circle-outline',
      onPress: () => navigation.navigate('Help'),
    },
  ];

  const renderMenuItem = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <Ionicons name={item.icon as any} size={24} color="#27AE60" />
        <Text style={styles.menuItemText}>{item.title}</Text>
        {item.badge !== undefined && item.badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#BDBDBD" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ayarlar</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              key={user?.profileImage || 'default-avatar'}
              source={{ 
                uri: user?.profileImage 
                  ? (user.profileImage.startsWith('http') 
                      ? user.profileImage 
                      : user.profileImage.startsWith('file://') 
                        ? user.profileImage 
                        : `file://${user.profileImage}`)
                  : 'https://via.placeholder.com/100x100'
              }}
              style={styles.profileImage}
              resizeMode="cover"
            />
            <TouchableOpacity 
              style={styles.editAvatarButton}
              onPress={handleImagePick}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={styles.userTypeContainer}>
            <Ionicons
              name={currentRole === 'seller' ? 'storefront' : 'cart'}
              size={16}
              color="#27AE60"
            />
            <Text style={styles.userTypeText}>
              {currentRole === 'seller' ? 'Satıcı' : 'Alıcı'}
            </Text>
          </View>
        </View>

        {/* Role Switch */}
        {(currentRole !== 'admin') && (
          <View style={styles.roleSwitchContainer}>
            <View style={styles.roleSwitchContent}>
              <View style={styles.roleSwitchLeft}>
                <Ionicons name="cart" size={24} color={currentRole === 'buyer' ? '#27AE60' : '#999'} />
                <Text style={[styles.roleSwitchLabel, currentRole === 'buyer' && styles.roleSwitchLabelActive]}>
                  Alıcı
                </Text>
              </View>
              
              {switchingRole ? (
                <ActivityIndicator size="small" color="#27AE60" />
              ) : (
                <Switch
                  trackColor={{ false: '#81b0ff', true: '#81b0ff' }}
                  thumbColor={currentRole === 'seller' ? '#27AE60' : '#27AE60'}
                  ios_backgroundColor="#E0E0E0"
                  onValueChange={(value) => handleRoleSwitch(value ? 'seller' : 'buyer')}
                  value={currentRole === 'seller'}
                />
              )}
              
              <View style={styles.roleSwitchRight}>
                <Ionicons name="storefront" size={24} color={currentRole === 'seller' ? '#27AE60' : '#999'} />
                <Text style={[styles.roleSwitchLabel, currentRole === 'seller' && styles.roleSwitchLabelActive]}>
                  Satıcı
                </Text>
              </View>
            </View>
            {!hasMultipleRoles && (
              <Text style={styles.roleSwitchHint}>
                {currentRole === 'buyer' ? 'Satıcı hesabı eklemek için kaydırın' : 'Alıcı hesabına geçmek için kaydırın'}
              </Text>
            )}
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map(renderMenuItem)}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#F44336" />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Hal Kompleksi v1.0.0</Text>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#27AE60',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#27AE60',
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  userTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  userTypeText: {
    fontSize: 14,
    color: '#27AE60',
    fontWeight: '600',
    marginLeft: 4,
  },
  roleSwitchContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 20,
    borderRadius: 12,
    marginHorizontal: 20,
  },
  roleSwitchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleSwitchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roleSwitchRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  roleSwitchLabel: {
    fontSize: 16,
    color: '#999',
    marginLeft: 8,
    fontWeight: '500',
  },
  roleSwitchLabelActive: {
    color: '#27AE60',
    fontWeight: 'bold',
  },
  roleSwitchHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  badge: {
    backgroundColor: '#F44336',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  logoutText: {
    fontSize: 16,
    color: '#F44336',
    fontWeight: '600',
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 12,
    color: '#999',
  },
});

export default SettingsScreen;