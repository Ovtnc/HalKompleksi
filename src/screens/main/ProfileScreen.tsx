import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { notificationsAPI } from '../../services/api';

interface ProfileScreenProps {
  navigation?: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, logout, unreadNotificationCount, updateNotificationCount, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);

  // Get current role
  const currentRole = user?.activeRole || user?.userType;
  const isAdmin = false; // Admin check disabled for now
  
  // Check if user has both roles (simplified for testing)
  const hasMultipleRoles = true; // Always show for testing
  
  // Debug: Log user data
  console.log('🔍 ProfileScreen - User data:', {
    userType: user?.userType,
    activeRole: user?.activeRole,
    userRoles: user?.userRoles,
    hasMultipleRoles
  });

  useEffect(() => {
    loadCounts();
  }, [user]);

  // Refresh notification count when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadCounts();
    }, [])
  );

  const loadCounts = async () => {
    try {
      setLoading(true);
      console.log('🔔 Loading notification count...');
      
      // TODO: Implement actual API call for notification count
      updateNotificationCount(0);
      
      console.log('🔔 Unread notifications count:', 0);
    } catch (error) {
      console.error('Load counts error:', (error as Error).message || 'Unknown error');
      // Set default values on error
      updateNotificationCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = async (value: boolean) => {
    try {
      setSwitchingRole(true);
      
      const newRole = value ? 'seller' : 'buyer';
      console.log('🔄 Switching role to:', newRole);
      console.log('🔄 Current user before switch:', user);
      
      // Update in AuthContext
      await updateUser({ activeRole: newRole });
      
      console.log('🔄 User after updateUser call');
      
      // Show success message and navigate
      Alert.alert(
        'Rol Değiştirildi',
        `Artık ${newRole === 'buyer' ? 'Alıcı' : 'Satıcı'} olarak giriş yaptınız.`,
        [{ 
          text: 'Tamam',
          onPress: () => {
            // Navigate to appropriate screen based on new role
            if (newRole === 'seller') {
              console.log('🔄 Navigating to seller dashboard...');
              navigation?.navigate('SellerDashboard');
            } else {
              console.log('🔄 Navigating to buyer screen...');
              navigation?.navigate('Home');
            }
          }
        }]
      );
      
      console.log('✅ Role switched successfully to:', newRole);
    } catch (error) {
      console.error('❌ Role switch error:', error);
      Alert.alert('Hata', 'Rol değiştirilirken bir hata oluştu: ' + (error as Error).message);
    } finally {
      setSwitchingRole(false);
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

  const menuItems = [
    { 
      id: 'personal', 
      title: 'Kişisel Bilgiler', 
      icon: 'person-outline',
      onPress: () => {
        navigation?.navigate('PersonalInfo');
      }
    },
    { 
      id: 'notifications', 
      title: 'Bildirimler', 
      icon: 'notifications-outline',
      badge: typeof unreadNotificationCount === 'number' ? unreadNotificationCount : 0,
      onPress: () => {
        navigation?.navigate('Notifications');
      }
    },
    { 
      id: 'requests', 
      title: 'Aktif Taleplerim', 
      icon: 'list-outline',
      onPress: () => {
        navigation?.navigate('ProductRequest');
      }
    },
    { 
      id: 'help', 
      title: 'Yardım & Destek', 
      icon: 'help-circle-outline',
      onPress: () => {
        console.log('🔍 ProfileScreen: Help button pressed');
        console.log('🔍 ProfileScreen: Navigation object:', navigation);
        console.log('🔍 ProfileScreen: Navigation navigate function:', navigation?.navigate);
        if (navigation && navigation.navigate) {
          console.log('🔍 ProfileScreen: Calling navigation.navigate("Help")');
          navigation.navigate('Help');
        } else {
          console.error('❌ ProfileScreen: Navigation not available');
        }
      }
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
        <View style={styles.menuIcon}>
          <Ionicons name={item.icon as any} size={20} color="#27AE60" />
        </View>
        <Text style={styles.menuItemText}>{String(item.title || '')}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {item.badge && typeof item.badge === 'number' && item.badge > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{String(item.badge)}</Text>
          </View>
        ) : null}
        <Ionicons name="chevron-forward" size={16} color="#BDC3C7" />
      </View>
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#27AE60" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#27AE60" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              {user.profileImage ? (
                <Image
                  source={{ uri: user.profileImage }}
                  style={styles.avatar}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.defaultAvatar}>
                  <Ionicons name="person" size={40} color="#27AE60" />
                </View>
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name || 'Kullanıcı'}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <View style={styles.roleContainer}>
                <Text style={styles.roleText}>
                  {currentRole === 'buyer' ? 'Alıcı' : 
                   currentRole === 'seller' ? 'Satıcı' : 
                   currentRole === 'admin' ? 'Yönetici' : 'Kullanıcı'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Role Switcher */}
        {hasMultipleRoles && (
          <View style={styles.roleSwitcher}>
            <View style={styles.roleSwitcherHeader}>
              <Ionicons name="swap-horizontal" size={20} color="#27AE60" />
              <Text style={styles.roleSwitcherTitle}>Rol Değiştir</Text>
              {switchingRole ? (
                <ActivityIndicator size="small" color="#27AE60" style={{ marginLeft: 8 }} />
              ) : null}
            </View>
            <View style={styles.roleSwitcherContent}>
              <View style={styles.roleOption}>
                <View style={styles.roleLabels}>
                  <Text style={[styles.roleLabel, currentRole === 'buyer' && styles.activeRoleLabel]}>Alıcı</Text>
                  <Text style={[styles.roleLabel, currentRole === 'seller' && styles.activeRoleLabel]}>Satıcı</Text>
                </View>
                <View style={styles.switchContainer}>
                  <Switch
                    value={currentRole === 'seller'}
                    onValueChange={handleRoleToggle}
                    trackColor={{ false: '#E9ECEF', true: '#27AE60' }}
                    thumbColor={currentRole === 'seller' ? '#FFFFFF' : '#FFFFFF'}
                    disabled={switchingRole}
                    style={styles.modernSwitch}
                  />
                  {switchingRole ? (
                    <ActivityIndicator 
                      size="small" 
                      color="#27AE60" 
                      style={styles.switchLoading} 
                    />
                  ) : null}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Hesap Ayarları</Text>
          {menuItems.map((item, index) => renderMenuItem(item))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color="#E74C3C" />
          <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
        </TouchableOpacity>
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
    backgroundColor: '#27AE60',
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  defaultAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  roleContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  roleSwitcher: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roleSwitcherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  roleSwitcherTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 8,
  },
  roleSwitcherContent: {
    gap: 12,
  },
  roleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roleLabels: {
    flexDirection: 'row',
    gap: 20,
  },
  roleLabel: {
    fontSize: 14,
    color: '#BDC3C7',
    fontWeight: '500',
  },
  activeRoleLabel: {
    color: '#27AE60',
    fontWeight: '600',
  },
  roleOptionText: {
    fontSize: 14,
    color: '#34495E',
  },
  switchContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernSwitch: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
  },
  switchLoading: {
    position: 'absolute',
    right: -25,
    top: '50%',
    marginTop: -8,
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    padding: 16,
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#2C3E50',
    flex: 1,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#E74C3C',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E74C3C',
    marginLeft: 8,
  },
});

export default ProfileScreen;