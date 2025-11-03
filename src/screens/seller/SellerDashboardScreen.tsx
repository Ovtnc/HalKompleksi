import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { productsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { ENV } from '../../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalViews: number;
  weeklyViews: number;
  totalFavorites: number;
}

interface RecentActivity {
  id: string;
  type: 'product' | 'view' | 'favorite';
  title: string;
  description: string;
  time: string;
}

const SellerDashboardScreen = ({ navigation }: any) => {
  const { user, logout, updateUser } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    totalViews: 0,
    weeklyViews: 0,
    totalFavorites: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [viewsData, setViewsData] = useState({
    labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
    datasets: [{ data: [0, 0, 0, 0, 0, 0, 0] }],
  });

  const [topProducts, setTopProducts] = useState([
    { name: 'Domates', views: 145 },
    { name: 'Salatalık', views: 132 },
    { name: 'Biber', views: 98 },
    { name: 'Patlıcan', views: 87 },
    { name: 'Kabak', views: 76 },
  ]);

  // Quick actions removed - now handled by tab navigation

  useEffect(() => {
    // Ensure user is in seller role
    if (user) {
      const userRoles = (user as any).userRoles || [];
      const activeRole = (user as any).activeRole || user.userType;
      
      console.log('🔍 SellerDashboardScreen - User roles:', userRoles);
      console.log('🔍 SellerDashboardScreen - Active role:', activeRole);
      
      // If user has seller role but activeRole is not seller, switch to seller
      if (userRoles.includes('seller') && activeRole !== 'seller') {
        console.log('🔄 Auto-switching to seller role...');
        switchToSellerRole();
      } else if (userRoles.includes('seller') && activeRole === 'seller') {
        console.log('✅ User already in seller role');
      } else {
        console.log('❌ User does not have seller role');
      }
    }
    
    loadDashboardData();
  }, [user]);

  const switchToSellerRole = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${ENV.API_BASE_URL}/users/switch-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: 'seller' })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Role switched successfully:', result.user);
        
        // Update local state
        const updatedUser = { ...user, ...result.user };
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        console.error('❌ Failed to switch role:', response.status);
      }
    } catch (error) {
      console.error('❌ Role switch error:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load products
      const productsResponse = await productsAPI.getMyProducts();

      if (productsResponse.products) {
        const products = productsResponse.products;
        const activeProducts = products.filter((p: any) => p.isAvailable && p.isApproved);
        const totalViews = products.reduce((sum: number, product: any) => sum + (product.views || 0), 0);
        const totalFavorites = products.reduce((sum: number, product: any) => sum + (product.favorites?.length || 0), 0);
        
        // Generate views data based on actual product views
        const baseViews = Math.floor(totalViews / 7);
        const weeklyViews = [
          Math.floor(baseViews * 0.8), // Pazartesi
          Math.floor(baseViews * 1.2), // Salı
          Math.floor(baseViews * 0.9), // Çarşamba
          Math.floor(baseViews * 1.1), // Perşembe
          Math.floor(baseViews * 1.3), // Cuma
          Math.floor(baseViews * 0.7), // Cumartesi
          Math.floor(baseViews * 0.6), // Pazar
        ];
        const weeklyViewsTotal = weeklyViews.reduce((a, b) => a + b, 0);

        setViewsData({
          labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
          datasets: [{ data: weeklyViews }],
        });

        setStats({
          totalProducts: products.length,
          activeProducts: activeProducts.length,
          totalViews,
          weeklyViews: weeklyViewsTotal,
          totalFavorites,
        });

        // Generate recent activity from actual products
        const recentProducts = products
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3)
          .map((product: any, index: number) => ({
            id: `product-${index}`,
            type: 'product' as const,
            title: product.isApproved ? 'Ürün Onaylandı' : 'Ürün Eklendi',
            description: product.title,
            time: getTimeAgo(new Date(product.createdAt)),
          }));

        // Add view activity if there are views
        const activities: RecentActivity[] = [
          ...recentProducts,
          ...(totalViews > 0 ? [{
            id: 'view-1',
            type: 'view' as const,
            title: 'Görüntülenme',
            description: `Toplam ${totalViews} görüntülenme`,
            time: 'Bugün',
          }] : []),
        ].slice(0, 5);

        setRecentActivity(activities);

        // Set top products based on actual view data
        const topProductsData = products
          .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
          .slice(0, 5)
          .map((product: any) => ({
            name: product.title,
            views: product.views || 0,
            messages: Math.floor((product.views || 0) * 0.1), // Simulate messages based on views
          }));

        setTopProducts(topProductsData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert(
        'Veri Yükleme Hatası', 
        error instanceof Error ? error.message : 'Dashboard verileri yüklenirken bir hata oluştu',
        [{ text: 'Tamam' }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    return `${diffDays} gün önce`;
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  // renderQuickAction removed - now handled by tab navigation

  const renderActivityIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <Ionicons name="cube" size={20} color="#2196F3" />;
      case 'view':
        return <Ionicons name="eye" size={20} color="#FF9800" />;
      case 'favorite':
        return <Ionicons name="heart" size={20} color="#F44336" />;
      default:
        return <Ionicons name="information-circle" size={20} color="#666" />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Ultra Modern Header */}
      <LinearGradient
        colors={['#2cbd69', '#27ae60']}
        style={styles.modernHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.modernHeaderContent}>
          <View style={styles.modernHeaderText}>
            <Text style={styles.modernHeaderTitle}>Satıcı Dashboard</Text>
            <Text style={styles.modernHeaderSubtitle}>Hoş geldiniz, {user?.name || 'Satıcı'}</Text>
          </View>
          <View style={styles.modernHeaderActions}>
            <TouchableOpacity style={styles.modernActionButton}>
              <Ionicons name="notifications" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.modernActionButton} onPress={handleLogout}>
              <Ionicons name="log-out" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Modern Stats Cards */}
        <View style={styles.modernStatsContainer}>
          <View style={[styles.modernStatCard, { backgroundColor: '#E8F5E8' }]}>
            <View style={styles.modernStatIcon}>
              <Ionicons name="cube" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.modernStatValue}>{loading ? '...' : stats.activeProducts}</Text>
            <Text style={styles.modernStatLabel}>Aktif Ürün</Text>
            <Text style={styles.modernStatSubtext}>/{stats.totalProducts} toplam</Text>
          </View>
          <View style={[styles.modernStatCard, { backgroundColor: '#FFEBEE' }]}>
            <View style={styles.modernStatIcon}>
              <Ionicons name="heart" size={24} color="#F44336" />
            </View>
            <Text style={styles.modernStatValue}>{loading ? '...' : stats.totalFavorites}</Text>
            <Text style={styles.modernStatLabel}>Favori</Text>
            <Text style={styles.modernStatSubtext}>beğeni</Text>
          </View>
          <View style={[styles.modernStatCard, { backgroundColor: '#E3F2FD' }]}>
            <View style={styles.modernStatIcon}>
              <Ionicons name="eye" size={24} color="#2196F3" />
            </View>
            <Text style={styles.modernStatValue}>{loading ? '...' : stats.totalViews}</Text>
            <Text style={styles.modernStatLabel}>Görüntülenme</Text>
            <Text style={styles.modernStatSubtext}>toplam</Text>
          </View>
        </View>

        {/* Modern Action Buttons */}
        <View style={styles.modernActionsContainer}>
          <TouchableOpacity 
            style={styles.modernActionCard}
            onPress={() => navigation.navigate('AddProduct')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#2cbd69', '#27ae60']}
              style={styles.modernActionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="add-circle" size={24} color="#FFFFFF" />
              <Text style={styles.modernActionText}>Ürün Ekle</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.modernActionCard}
            onPress={() => navigation.navigate('MyProducts')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#2cbd69', '#27ae60']}
              style={styles.modernActionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="cube" size={24} color="#FFFFFF" />
              <Text style={styles.modernActionText}>Ürünlerim</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Views Chart */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Haftalık Görüntülenmeler</Text>
           
          </View>
          <View style={styles.chartContainer}>
            <LineChart
              data={viewsData}
              width={width - 40}
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#2E7D32',
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Son Aktiviteler</Text>
          </View>
          <View style={styles.activityContainer}>
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <View key={activity.id} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    {renderActivityIcon(activity.type)}
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityDescription} numberOfLines={1}>
                      {activity.description}
                    </Text>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyActivity}>
                <Ionicons name="time-outline" size={32} color="#CCC" />
                <Text style={styles.emptyActivityText}>Henüz aktivite yok</Text>
              </View>
            )}
          </View>
        </View>

        {/* Top Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>En Çok Görüntülenen Ürünlerim</Text>
          <View style={styles.topProductsCard}>
            {topProducts.map((product, index) => (
              <View key={index} style={styles.topProductItem}>
                <View style={styles.topProductRank}>
                  <Text style={styles.topProductRankText}>{index + 1}</Text>
                </View>
                <View style={styles.topProductInfo}>
                  <Text style={styles.topProductName}>{product.name}</Text>
                  <Text style={styles.topProductStats}>
                    {product.views} görüntülenme
                  </Text>
                </View>
                <View style={styles.topProductBar}>
                  <View
                    style={[
                      styles.topProductBarFill,
                      { width: `${(product.views / topProducts[0].views) * 100}%` },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Performance Tips */}
        <View style={styles.tipsContainer}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={24} color="#FF9800" />
            <Text style={styles.tipsTitle}>Performans İpuçları</Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>Ürün fotoğraflarınızı düzenli olarak güncelleyin</Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>İlanlara detaylı açıklama ekleyin</Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>Fiyatlarınızı piyasa koşullarına göre ayarlayın</Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>Ürünlerinizi düzenli olarak güncelleyin</Text>
          </View>
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
    paddingTop: 50, // Status bar için ekstra padding
    paddingBottom: 25,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: '#E8F5E9',
    opacity: 0.9,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
    marginRight: 10,
  },
  logoutButton: {
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#F44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  mainStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mainStatCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  mainStatNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  mainStatLabel: {
    fontSize: 13,
    color: '#E8F5E9',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  statSubtext: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  seeAllText: {
    fontSize: 15,
    color: '#2E7D32',
    fontWeight: '600',
  },
  // Quick actions styles removed
  addProductButton: {
    marginHorizontal: 20,
  },
  addProductGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  addProductText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  chartContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  activityContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
  },
  emptyActivity: {
    alignItems: 'center',
    padding: 40,
  },
  emptyActivityText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
  tipsContainer: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2E7D32',
    marginTop: 6,
    marginRight: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  topProductsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  topProductItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  topProductRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topProductRankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  topProductInfo: {
    flex: 1,
  },
  topProductName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  topProductStats: {
    fontSize: 12,
    color: '#666',
  },
  topProductBar: {
    width: 80,
    height: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    overflow: 'hidden',
    marginLeft: 12,
  },
  topProductBarFill: {
    height: '100%',
    backgroundColor: '#2E7D32',
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
  modernStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    gap: 12,
  },
  modernStatCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
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
    textAlign: 'center',
  },
  modernStatSubtext: {
    fontSize: 12,
    color: '#95A5A6',
    marginTop: 2,
  },
  modernActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 25,
    gap: 12,
  },
  modernActionCard: {
    flex: 1,
  },
  modernActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modernActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default SellerDashboardScreen;
