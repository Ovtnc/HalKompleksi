import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
  TextInput,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { adminAPI } from '../../services/api';

const { width } = Dimensions.get('window');

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  pendingProducts: number;
  approvedProducts: number;
  activeUsers: number;
  blockedUsers: number;
  featuredProducts: number;
  totalMarketReports: number;
  totalViews: number;
  totalFavorites: number;
}

interface RecentProduct {
  _id: string;
  title: string;
  price: number;
  createdAt: string;
  seller: {
    name: string;
    email: string;
  };
}

interface RecentUser {
  _id: string;
  name: string;
  email: string;
  userType: string;
  createdAt: string;
}

const AdminDashboardScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch real data from backend
      const response = await adminAPI.getDashboard();
      
      setStats(response.stats);
      setRecentProducts(response.recentProducts);
      setRecentUsers(response.recentUsers);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Hata', 'Dashboard verileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleToggleFeatured = async (productId: string) => {
    try {
      await adminAPI.toggleProductFeatured(productId);
      Alert.alert('Başarılı', 'Ürün öne çıkarılma durumu güncellendi');
      loadDashboardData();
    } catch (error) {
      console.error('Toggle featured error:', error);
      Alert.alert('Hata', 'Öne çıkarma durumu güncellenirken hata oluştu');
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

  const quickActions = [
    {
      id: '1',
      title: 'Onay Bekleyen Ürünler',
      icon: 'time-outline',
      color: '#FF9800',
      count: stats?.pendingProducts || 0,
      onPress: () => navigation.navigate('AdminPendingProducts'),
    },
    {
      id: '2',
      title: 'Kullanıcı Yönetimi',
      icon: 'people-outline',
      color: '#9C27B0',
      count: stats?.totalUsers || 0,
      onPress: () => navigation.navigate('AdminUsers'),
    },
    {
      id: '3',
      title: 'Tüm Ürünler',
      icon: 'cube-outline',
      color: '#4CAF50',
      count: stats?.totalProducts || 0,
      onPress: () => navigation.navigate('AdminAllProducts'),
    },
    {
      id: '4',
      title: 'Öne Çıkan Ürünler',
      icon: 'star-outline',
      color: '#FFD700',
      count: stats?.featuredProducts || 0,
      onPress: () => navigation.navigate('AdminFeaturedProducts'),
    },
    {
      id: '5',
      title: 'Piyasa Paylaş',
      icon: 'document-text-outline',
      color: '#27AE60',
      count: stats?.totalMarketReports || 0,
      onPress: () => navigation.navigate('MarketShare'),
    },
    
   
  ];


  const renderRecentProduct = (product: any) => (
    <View key={product._id} style={styles.recentItem}>
      <TouchableOpacity style={styles.recentItemContent}>
        <Text style={styles.recentItemTitle} numberOfLines={1}>{product.title}</Text>
        <Text style={styles.recentItemSubtitle}>{product.seller.name}</Text>
        <Text style={styles.recentItemPrice}>{product.price} TL</Text>
      </TouchableOpacity>
      <View style={styles.recentItemActions}>
        <Text style={styles.recentItemDate}>
          {new Date(product.createdAt).toLocaleDateString('tr-TR')}
        </Text>
        {product.isApproved && (
          <TouchableOpacity
            style={[styles.featuredButton, product.isFeatured && styles.featuredButtonActive]}
            onPress={() => handleToggleFeatured(product._id)}
          >
            <Ionicons 
              name={product.isFeatured ? "star" : "star-outline"} 
              size={16} 
              color={product.isFeatured ? "#FFD700" : "#666"} 
            />
          </TouchableOpacity>
        )}
        {!product.isApproved && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>Beklemede</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderRecentUser = (user: RecentUser) => (
    <TouchableOpacity key={user._id} style={styles.recentItem}>
      <View style={styles.recentItemContent}>
        <Text style={styles.recentItemTitle}>{user.name}</Text>
        <Text style={styles.recentItemSubtitle}>{user.email}</Text>
        <Text style={[styles.recentItemType, { 
          color: user.userType === 'admin' ? '#9C27B0' : 
                 user.userType === 'seller' ? '#4CAF50' : '#2196F3' 
        }]}>
          {user.userType === 'admin' ? 'Admin' : 
           user.userType === 'seller' ? 'Satıcı' : 'Alıcı'}
        </Text>
      </View>
      <Text style={styles.recentItemDate}>
        {new Date(user.createdAt).toLocaleDateString('tr-TR')}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Dashboard yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Ultra Modern Header */}
            <LinearGradient
              colors={['#2cbd69', '#27ae60']}
              style={styles.modernHeader}
            >
        <View style={styles.modernHeaderContent}>
          <View style={styles.modernHeaderText}>
            <Text style={styles.modernHeaderTitle}>Admin Dashboard</Text>
            <Text style={styles.modernHeaderSubtitle}>Hoş geldiniz, {user?.name}</Text>
          </View>
          <View style={styles.modernHeaderActions}>
            <TouchableOpacity 
              style={styles.modernActionButton}
              onPress={loadDashboardData}
            >
              <Ionicons name="refresh" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modernActionButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.modernContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#667eea']}
            tintColor="#667eea"
          />
        }
      >
        {/* Modern Stats Cards */}
        {stats && (
          <View style={styles.modernStatsSection}>
            <Text style={styles.modernSectionTitle}>Sistem İstatistikleri</Text>
            <View style={styles.modernStatsGrid}>
              <View style={[styles.modernStatCard, { backgroundColor: '#E3F2FD' }]}>
                <View style={styles.modernStatIcon}>
                  <Ionicons name="people" size={24} color="#2196F3" />
                </View>
                <Text style={styles.modernStatValue}>{stats.totalUsers}</Text>
                <Text style={styles.modernStatLabel}>Toplam Kullanıcı</Text>
              </View>
              <View style={[styles.modernStatCard, { backgroundColor: '#E8F5E8' }]}>
                <View style={styles.modernStatIcon}>
                  <Ionicons name="cube" size={24} color="#4CAF50" />
                </View>
                <Text style={styles.modernStatValue}>{stats.totalProducts}</Text>
                <Text style={styles.modernStatLabel}>Toplam Ürün</Text>
              </View>
              <View style={[styles.modernStatCard, { backgroundColor: '#FFF3E0' }]}>
                <View style={styles.modernStatIcon}>
                  <Ionicons name="time" size={24} color="#FF9800" />
                </View>
                <Text style={styles.modernStatValue}>{stats.pendingProducts}</Text>
                <Text style={styles.modernStatLabel}>Onay Bekleyen</Text>
              </View>
              <View style={[styles.modernStatCard, { backgroundColor: '#F3E5F5' }]}>
                <View style={styles.modernStatIcon}>
                  <Ionicons name="star" size={24} color="#9C27B0" />
                </View>
                <Text style={styles.modernStatValue}>{stats.featuredProducts}</Text>
                <Text style={styles.modernStatLabel}>Öne Çıkan</Text>
              </View>
            </View>
          </View>
        )}

        {/* Modern Quick Actions */}
        <View style={styles.modernSection}>
          <Text style={styles.modernSectionTitle}>Hızlı İşlemler</Text>
          <View style={styles.modernQuickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.modernQuickActionCard, { borderLeftColor: action.color }]}
                onPress={action.onPress}
              >
                <View style={styles.modernQuickActionContent}>
                  <View style={[styles.modernQuickActionIcon, { backgroundColor: action.color }]}>
                    <Ionicons name={action.icon as any} size={20} color="#FFFFFF" />
                  </View>
                  <View style={styles.modernQuickActionText}>
                    <Text style={styles.modernQuickActionTitle}>{action.title}</Text>
                    <Text style={styles.modernQuickActionCount}>{action.count} adet</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#666" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Modern Recent Products */}
        <View style={styles.modernSection}>
          <View style={styles.modernSectionHeader}>
            <Text style={styles.modernSectionTitle}>Son Eklenen Ürünler</Text>
            <TouchableOpacity 
              style={styles.modernSeeAllButton}
              onPress={() => navigation.navigate('AdminAllProducts')}
            >
              <Text style={styles.modernSeeAllText}>Tümünü Gör</Text>
              <Ionicons name="arrow-forward" size={14} color="#2cbd69" />
            </TouchableOpacity>
          </View>
          <View style={styles.modernRecentContainer}>
            {recentProducts.length > 0 ? (
              recentProducts.map(renderRecentProduct)
            ) : (
              <View style={styles.modernEmptyState}>
                <Ionicons name="cube-outline" size={48} color="#ccc" />
                <Text style={styles.modernEmptyText}>Henüz ürün eklenmemiş</Text>
              </View>
            )}
          </View>
        </View>

        {/* Modern Recent Users */}
        <View style={styles.modernSection}>
          <View style={styles.modernSectionHeader}>
            <Text style={styles.modernSectionTitle}>Son Kayıt Olan Kullanıcılar</Text>
            <TouchableOpacity 
              style={styles.modernSeeAllButton}
              onPress={() => navigation.navigate('AdminUsers')}
            >
              <Text style={styles.modernSeeAllText}>Tümünü Gör</Text>
              <Ionicons name="arrow-forward" size={14} color="#2cbd69" />
            </TouchableOpacity>
          </View>
          <View style={styles.modernRecentContainer}>
            {recentUsers.length > 0 ? (
              recentUsers.map(renderRecentUser)
            ) : (
              <View style={styles.modernEmptyState}>
                <Ionicons name="people-outline" size={48} color="#ccc" />
                <Text style={styles.modernEmptyText}>Henüz kullanıcı kaydolmamış</Text>
              </View>
            )}
          </View>
        </View>
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
  recentItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  recentItemContent: {
    flex: 1,
  },
  recentItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  recentItemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  recentItemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  recentItemType: {
    fontSize: 12,
    fontWeight: '600',
  },
  recentItemDate: {
    fontSize: 12,
    color: '#999',
  },
  recentItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featuredButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginLeft: 8,
  },
  featuredButtonActive: {
    backgroundColor: '#FFF3CD',
  },
  pendingBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  pendingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Modern Styles
  modernHeader: {
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  modernHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modernHeaderText: {
    flex: 1,
  },
  modernHeaderTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modernHeaderSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  modernHeaderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modernActionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  modernContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modernStatsSection: {
    marginBottom: 25,
  },
  modernStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  modernStatCard: {
    width: (width - 52) / 2,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modernStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modernStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  modernStatLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  modernSection: {
    marginBottom: 25,
  },
  modernSectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  modernSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modernSeeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  modernSeeAllText: {
    color: '#2cbd69',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  modernQuickActionsGrid: {
    gap: 12,
  },
  modernQuickActionCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modernQuickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modernQuickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modernQuickActionText: {
    flex: 1,
  },
  modernQuickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  modernQuickActionCount: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  modernRecentContainer: {
    gap: 12,
  },
  modernEmptyState: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  modernEmptyText: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 12,
    fontWeight: '500',
  },
});

export default AdminDashboardScreen;
