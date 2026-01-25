import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useDeepLink } from '../contexts/DeepLinkContext';

// Import screens
import NewAuthScreen from '../screens/auth/NewAuthScreen';
import HomeScreen from '../screens/main/HomeScreen';
import ProductsScreen from '../screens/main/ProductsScreen';
import ProductDetailScreen from '../screens/main/ProductDetailScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import PersonalInfoScreen from '../screens/profile/PersonalInfoScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import ProductRequestScreen from '../screens/profile/ProductRequestScreen';
import HelpScreen from '../screens/profile/HelpScreen';
import MarketReportsScreen from '../screens/main/MarketReportsScreen';
import MarketReportDetailScreen from '../screens/main/MarketReportDetailScreen';
import FavoritesScreen from '../screens/main/FavoritesScreen';
import MyProductsScreen from '../screens/seller/MyProductsScreen';
import SellerDashboardScreen from '../screens/seller/SellerDashboardScreen';
import AddProductScreen from '../screens/seller/AddProductScreen';
import EditProductScreen from '../screens/seller/EditProductScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminPendingProductsScreen from '../screens/admin/AdminPendingProductsScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminUserProductsScreen from '../screens/admin/AdminUserProductsScreen';
import AdminAllProductsScreen from '../screens/admin/AdminAllProductsScreen';
import AdminFeaturedProductsScreen from '../screens/admin/AdminFeaturedProductsScreen';
import MarketShareScreen from '../screens/admin/MarketShareScreen';

// Production-safe logging utility
const log = {
  debug: (...args: any[]) => {
    if (__DEV__) {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    console.error(...args);
  },
  warn: (...args: any[]) => {
    if (__DEV__) {
      console.warn(...args);
    }
  },
};

// Custom Tab Menu - Modern Design
const CustomTabMenu = () => {
  const { user } = useAuth();
  const { pendingNavigation, clearPendingNavigation } = useDeepLink();
  const [activeTab, setActiveTab] = useState('Anasayfa');
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [navigationParams, setNavigationParams] = useState<any>(null);
  const [forceRefresh, setForceRefresh] = useState(0);
  
  // Get user role - prioritize activeRole over userType
  const userRole = user?.activeRole || user?.userType;
  const isSeller = userRole === 'seller';
  const isAdmin = userRole === 'admin';
  const isGuest = !user; // Guest mode: user not logged in
  
  // Handle deep link navigation
  useEffect(() => {
    if (pendingNavigation) {
      console.log('🔗 Handling pending navigation:', pendingNavigation);
<<<<<<< HEAD
      
      // Reset password deep link
      if (pendingNavigation.screen === 'ResetPassword' && pendingNavigation.params?.code) {
        // Navigate to login screen and trigger forgot password flow with code
        setCurrentScreen('Login');
        setNavigationParams({ 
          resetCode: pendingNavigation.params.code,
          showForgotPassword: true 
        });
      } else {
        setCurrentScreen(pendingNavigation.screen);
        setNavigationParams(pendingNavigation.params);
      }
      
=======
      setCurrentScreen(pendingNavigation.screen);
      setNavigationParams(pendingNavigation.params);
>>>>>>> 9e02814e53691981bfcd19308c1f91b4a1a8de05
      clearPendingNavigation();
    }
  }, [pendingNavigation, clearPendingNavigation]);
  
  // Force refresh when user changes (only when role actually changes)
  useEffect(() => {
    if (user?.activeRole) {
      setForceRefresh(prev => prev + 1);
    }
  }, [user?.activeRole]);

  const renderScreen = () => {
    
    // Admin kontrolü - admin ise AdminDashboard veya admin sayfalarını göster
    if (user?.activeRole === 'admin') {
      // Admin için navigation objesi oluştur
      const adminNavigation = {
        navigate: (screen: string, params?: any) => {
          setNavigationParams(params || null);
          
          if (screen === 'AdminPendingProducts') {
            setCurrentScreen('AdminPendingProducts');
          } else if (screen === 'AdminUsers') {
            setCurrentScreen('AdminUsers');
          } else if (screen === 'AdminUserProducts') {
            setCurrentScreen('AdminUserProducts');
          } else if (screen === 'AdminAllProducts') {
            setCurrentScreen('AdminAllProducts');
          } else if (screen === 'AdminFeaturedProducts') {
            setCurrentScreen('AdminFeaturedProducts');
          } else if (screen === 'MarketShare') {
            setCurrentScreen('MarketShare');
          } else if (screen === 'AdminDashboard') {
            setCurrentScreen('AdminDashboard');
          }
        },
        goBack: () => {
          setCurrentScreen('AdminDashboard');
          setNavigationParams(null);
        }
      };
      
      // Admin kullanıcı için currentScreen'i AdminDashboard olarak ayarla
      if (currentScreen !== 'AdminDashboard' && 
          currentScreen !== 'AdminPendingProducts' && 
          currentScreen !== 'AdminUsers' && 
          currentScreen !== 'AdminUserProducts' && 
          currentScreen !== 'AdminAllProducts' && 
          currentScreen !== 'AdminFeaturedProducts' && 
          currentScreen !== 'MarketShare') {
        setCurrentScreen('AdminDashboard');
        return <AdminDashboardScreen navigation={adminNavigation} />;
      }
    }
    
    const navigation = {
      navigate: (screen: string, params?: any) => {
        setNavigationParams(params || null);
        
        if (screen === 'Products') {
          setActiveTab('Arama');
          setCurrentScreen('Products');
        } else if (screen === 'ProductDetail') {
          setCurrentScreen('ProductDetail');
        } else if (screen === 'Home') {
          setCurrentScreen('Home');
          setActiveTab('Anasayfa');
        } else if (screen === 'Favorites') {
          setActiveTab('Favoriler');
          setCurrentScreen('Favorites');
        } else if (screen === 'MyProducts') {
          setActiveTab('Ürünlerim');
          setCurrentScreen('MyProducts');
        } else if (screen === 'SellerDashboard') {
          setActiveTab('Anasayfa');
          setCurrentScreen('SellerDashboard');
        } else if (screen === 'AddProduct') {
          setCurrentScreen('AddProduct');
        } else if (screen === 'EditProduct') {
          setCurrentScreen('EditProduct');
        } else if (screen === 'MarketReports') {
          setActiveTab('Piyasa');
          setCurrentScreen('MarketReports');
        } else if (screen === 'MarketReportDetail') {
          setCurrentScreen('MarketReportDetail');
        } else if (screen === 'Profile') {
          setActiveTab('Profil');
          setCurrentScreen('Profile');
        } else if (screen === 'PersonalInfo') {
          setCurrentScreen('PersonalInfo');
        } else if (screen === 'Notifications') {
          setCurrentScreen('Notifications');
        } else if (screen === 'ProductRequest') {
          setCurrentScreen('ProductRequest');
        } else if (screen === 'Help') {
          setCurrentScreen('Help');
        } else if (screen === 'AdminPendingProducts') {
          setCurrentScreen('AdminPendingProducts');
        } else if (screen === 'AdminUsers') {
          setCurrentScreen('AdminUsers');
        } else if (screen === 'AdminAllProducts') {
          setCurrentScreen('AdminAllProducts');
        } else if (screen === 'AdminFeaturedProducts') {
          setCurrentScreen('AdminFeaturedProducts');
        } else if (screen === 'MarketShare') {
          setCurrentScreen('MarketShare');
        }
      },
      goBack: () => {
        if (currentScreen === 'AddProduct' || currentScreen === 'EditProduct') {
          setCurrentScreen('SellerDashboard');
          setActiveTab('Anasayfa');
        } else if (currentScreen === 'MarketReportDetail') {
          setCurrentScreen('MarketReports');
          setActiveTab('Piyasa');
        } else if (currentScreen === 'AdminPendingProducts' || 
                   currentScreen === 'AdminUsers' || 
                   currentScreen === 'AdminAllProducts' || 
                   currentScreen === 'AdminFeaturedProducts' || 
                   currentScreen === 'MarketShare') {
          setCurrentScreen('AdminDashboard');
        } else {
          setCurrentScreen('Home');
          setActiveTab('Anasayfa');
        }
        setNavigationParams(null);
      },
      canGoBack: () => {
        return currentScreen !== 'Home' && currentScreen !== 'SellerDashboard' && currentScreen !== 'AdminDashboard';
      }
    };

    // Handle screen navigation
    if (currentScreen === 'ProductDetail') {
      const routeParams = navigationParams || {};
      return <ProductDetailScreen navigation={navigation} route={{ params: routeParams }} productId={routeParams?.productId} />;
    }
    
    if (currentScreen === 'AddProduct') {
      return <AddProductScreen navigation={navigation as any} />;
    }
    
    if (currentScreen === 'EditProduct') {
      return <EditProductScreen navigation={navigation as any} route={{ params: navigationParams }} />;
    }
    
    if (currentScreen === 'SellerDashboard') {
      return <SellerDashboardScreen navigation={navigation} />;
    }
    
    if (currentScreen === 'PersonalInfo') {
      return <PersonalInfoScreen navigation={navigation} />;
    }
    
    if (currentScreen === 'Help') {
      return <HelpScreen navigation={navigation} />;
    }
    
    if (currentScreen === 'Notifications') {
      return <NotificationsScreen 
        navigation={navigation} 
        onNotificationRead={() => {
          // Refresh notification count in ProfileScreen
        }}
      />;
    }
    
    if (currentScreen === 'ProductRequest') {
      return <ProductRequestScreen navigation={navigation} route={{ params: navigationParams }} />;
    }
    
    if (currentScreen === 'MarketReports') {
      return <MarketReportsScreen navigation={navigation} />;
    }
    
    if (currentScreen === 'MarketReportDetail') {
      const routeParams = navigationParams || {};
      return <MarketReportDetailScreen navigation={navigation} route={{ params: routeParams }} />;
    }
    
    if (currentScreen === 'AdminPendingProducts') {
      const adminNavigation = {
        navigate: (screen: string, params?: any) => {
          setNavigationParams(params || null);
          setCurrentScreen(screen);
        },
        goBack: () => {
          setCurrentScreen('AdminDashboard');
          setNavigationParams(null);
        }
      };
      return <AdminPendingProductsScreen navigation={adminNavigation} />;
    }
    
    if (currentScreen === 'AdminDashboard') {
      const adminNavigation = {
        navigate: (screen: string, params?: any) => {
          setNavigationParams(params || null);
          setCurrentScreen(screen);
        },
        goBack: () => {
          setCurrentScreen('AdminDashboard');
          setNavigationParams(null);
        }
      };
      return <AdminDashboardScreen navigation={adminNavigation} />;
    }
    
    if (currentScreen === 'AdminUsers') {
      const adminNavigation = {
        navigate: (screen: string, params?: any) => {
          setNavigationParams(params || null);
          setCurrentScreen(screen);
        },
        goBack: () => {
          setCurrentScreen('AdminDashboard');
          setNavigationParams(null);
        }
      };
      return <AdminUsersScreen navigation={adminNavigation} />;
    }
    
    if (currentScreen === 'AdminUserProducts') {
      const adminNavigation = {
        navigate: (screen: string, params?: any) => {
          setNavigationParams(params || null);
          setCurrentScreen(screen);
        },
        goBack: () => {
          setCurrentScreen('AdminUsers');
          setNavigationParams(null);
        }
      };
      return <AdminUserProductsScreen navigation={adminNavigation} route={{ params: navigationParams }} />;
    }
    
    if (currentScreen === 'AdminAllProducts') {
      const adminNavigation = {
        navigate: (screen: string, params?: any) => {
          setNavigationParams(params || null);
          setCurrentScreen(screen);
        },
        goBack: () => {
          setCurrentScreen('AdminDashboard');
          setNavigationParams(null);
        }
      };
      return <AdminAllProductsScreen navigation={adminNavigation} />;
    }
    
    if (currentScreen === 'AdminFeaturedProducts') {
      const adminNavigation = {
        navigate: (screen: string, params?: any) => {
          setNavigationParams(params || null);
          setCurrentScreen(screen);
        },
        goBack: () => {
          setCurrentScreen('AdminDashboard');
          setNavigationParams(null);
        }
      };
      return <AdminFeaturedProductsScreen navigation={adminNavigation} />;
    }
    
    if (currentScreen === 'MarketShare') {
      const adminNavigation = {
        navigate: (screen: string, params?: any) => {
          setNavigationParams(params || null);
          setCurrentScreen(screen);
        },
        goBack: () => {
          setCurrentScreen('AdminDashboard');
          setNavigationParams(null);
        }
      };
      return <MarketShareScreen navigation={adminNavigation} />;
    }

<<<<<<< HEAD
    // Reset Password deep link handler
    if (pendingNavigation && pendingNavigation.screen === 'ResetPassword' && pendingNavigation.params?.code) {
      // NewAuthScreen'e navigate et ve code'u pass et
      return <NewAuthScreen navigationParams={pendingNavigation.params} />;
    }

=======
>>>>>>> 9e02814e53691981bfcd19308c1f91b4a1a8de05
    // Guest Mode: Show login screen for account-based features
    if (isGuest && (currentScreen === 'Profile' || currentScreen === 'Favorites' || 
        currentScreen === 'MyProducts' || currentScreen === 'SellerDashboard' ||
        currentScreen === 'AddProduct' || currentScreen === 'EditProduct' ||
        currentScreen === 'PersonalInfo' || currentScreen === 'Notifications' ||
        currentScreen === 'ProductRequest')) {
      return <NewAuthScreen />;
    }

    // Handle tab navigation
    switch (activeTab) {
      case 'Anasayfa':
        if (isSeller) {
          return <SellerDashboardScreen navigation={navigation} />;
        } else {
          return <HomeScreen navigation={navigation} />;
        }
      case 'Arama':
        if (isSeller) {
          return isSeller ? <SellerDashboardScreen navigation={navigation} /> : <HomeScreen navigation={navigation} />;
        }
        return <ProductsScreen navigation={navigation} route={{ params: navigationParams }} />;
      case 'Piyasa':
        if (isSeller) {
          return isSeller ? <SellerDashboardScreen navigation={navigation} /> : <HomeScreen navigation={navigation} />;
        }
        return <MarketReportsScreen navigation={navigation} />;
      case 'Favoriler':
        // Guest users: show login screen
        if (isGuest) {
          return <NewAuthScreen />;
        }
        return <FavoritesScreen navigation={navigation} />;
      case 'Ürünlerim':
        return <MyProductsScreen navigation={navigation} />;
      case 'Bildirimler':
        return <ProfileScreen navigation={navigation} />;
      case 'Profil':
        // Guest users: show login screen
        if (isGuest) {
          return <NewAuthScreen />;
        }
        return <ProfileScreen navigation={navigation} />;
      case 'Giriş':
        // Show login screen for guests
        return <NewAuthScreen />;
      default:
        return <HomeScreen navigation={navigation} />;
    }
  };

  const renderTabButton = (tabName: string, iconName: keyof typeof Ionicons.glyphMap, label: string, badgeCount?: number) => {
    const isActive = activeTab === tabName;
    
    const handleTabPress = () => {
      setActiveTab(tabName);
      setCurrentScreen('Home'); // Reset to default screen when switching tabs
      setNavigationParams(null); // Clear navigation params
    };
    
    return (
      <TouchableOpacity
        key={tabName}
        style={[styles.tabButton, isActive && styles.activeTabButton]}
        onPress={handleTabPress}
        activeOpacity={0.7}
      >
        <View style={styles.tabIconContainer}>
          <Ionicons 
            name={iconName} 
            size={24} 
            color={isActive ? '#2cbd69' : '#8E8E93'} 
          />
          {badgeCount && badgeCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badgeCount}</Text>
            </View>
          )}
        </View>
        <Text 
          style={[
            styles.tabLabel, 
            isActive && styles.activeTabLabel,
            { color: isActive ? '#2cbd69' : '#8E8E93' }
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E8B57" />
      
      {/* Main Content */}
      <View style={styles.content}>
        {renderScreen()}
      </View>
      
      {/* Modern Tab Bar - Admin için gizle */}
      {!isAdmin && (
        <View style={styles.tabBar}>
          <View style={styles.tabBarContent}>
            {renderTabButton('Anasayfa', 'home-outline', 'Anasayfa')}
            {!isSeller && renderTabButton('Arama', 'search-outline', 'Arama')}
            {!isSeller && renderTabButton('Piyasa', 'bar-chart-outline', 'Piyasa')}
            {!isSeller && renderTabButton('Favoriler', 'heart-outline', 'Favoriler')}
            {isSeller && renderTabButton('Ürünlerim', 'cube-outline', 'Ürünlerim')}
            {/* Guest mode: show "Giriş" instead of "Profil" */}
            {isGuest ? 
              renderTabButton('Giriş', 'log-in-outline', 'Giriş') :
              renderTabButton('Profil', 'person-outline', 'Profil')
            }
          </View>
        </View>
      )}
    </View>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  // Apple App Store Requirement: Allow browsing without registration
  // Users can browse products without login, but need to register for account-based features
  return <CustomTabMenu />;
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
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    paddingBottom: 12,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tabBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginHorizontal: 2,
    minHeight: 60,
    justifyContent: 'center',
  },
  activeTabButton: {
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: '#2cbd69',
  },
  tabIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 14,
  },
  activeTabLabel: {
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF5722',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default AppNavigator;