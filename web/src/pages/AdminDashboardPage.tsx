import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI } from '../services/api';
import {
  IoPeopleOutline,
  IoCubeOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoBanOutline,
  IoStarOutline,
  IoDocumentTextOutline,
  IoEyeOutline,
  IoHeartOutline,
  IoChevronForwardOutline,
  IoShieldCheckmarkOutline
} from 'react-icons/io5';

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
  isApproved?: boolean;
  isFeatured?: boolean;
  seller?: {
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

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user || user.activeRole !== 'admin') {
      navigate('/profile');
      return;
    }
    loadDashboardData();
  }, [user, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('📊 Loading admin dashboard data...');
      
      const response = await adminAPI.getDashboard();
      console.log('✅ Dashboard data loaded:', response);
      
      setStats(response.stats);
      setRecentProducts(response.recentProducts || []);
      setRecentUsers(response.recentUsers || []);
    } catch (error: any) {
      console.error('❌ Error loading dashboard data:', error);
      alert(`Dashboard verileri yüklenirken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleToggleFeatured = async (productId: string) => {
    try {
      await adminAPI.toggleProductFeatured(productId);
      alert('Ürün öne çıkarılma durumu güncellendi');
      loadDashboardData();
    } catch (error: any) {
      console.error('Toggle featured error:', error);
      alert(`Öne çıkarma durumu güncellenirken hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
    }
  };

  const quickActions = [
    {
      id: '1',
      title: 'Onay Bekleyen Ürünler',
      icon: IoTimeOutline,
      color: 'from-orange-500 to-orange-600',
      count: stats?.pendingProducts || 0,
      onClick: () => navigate('/admin/products/pending'),
    },
    {
      id: '2',
      title: 'Kullanıcı Yönetimi',
      icon: IoPeopleOutline,
      color: 'from-purple-500 to-purple-600',
      count: stats?.totalUsers || 0,
      onClick: () => navigate('/admin/users'),
    },
    {
      id: '3',
      title: 'Tüm Ürünler',
      icon: IoCubeOutline,
      color: 'from-green-500 to-green-600',
      count: stats?.totalProducts || 0,
      onClick: () => navigate('/admin/products'),
    },
    {
      id: '4',
      title: 'Öne Çıkan Ürünler',
      icon: IoStarOutline,
      color: 'from-yellow-500 to-yellow-600',
      count: stats?.featuredProducts || 0,
      onClick: () => navigate('/admin/products/featured'),
    },
    {
      id: '5',
      title: 'Piyasa Raporları',
      icon: IoDocumentTextOutline,
      color: 'from-emerald-500 to-emerald-600',
      count: stats?.totalMarketReports || 0,
      onClick: () => navigate('/market-reports'),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-gray-500">Dashboard yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                <IoShieldCheckmarkOutline className="w-8 h-8" />
                Admin Paneli
              </h1>
              <p className="text-white/90 text-lg">Sistem yönetimi ve istatistikler</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors font-medium disabled:opacity-50"
            >
              {refreshing ? 'Yenileniyor...' : 'Yenile'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <IoPeopleOutline className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm text-blue-700 font-medium">Toplam Kullanıcı</div>
            </div>
            <div className="text-3xl font-bold text-blue-900">{stats?.totalUsers || 0}</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                <IoCubeOutline className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm text-green-700 font-medium">Toplam Ürün</div>
            </div>
            <div className="text-3xl font-bold text-green-900">{stats?.totalProducts || 0}</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 border border-yellow-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
                <IoTimeOutline className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm text-yellow-700 font-medium">Beklemede</div>
            </div>
            <div className="text-3xl font-bold text-yellow-900">{stats?.pendingProducts || 0}</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                <IoEyeOutline className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm text-purple-700 font-medium">Görüntülenme</div>
            </div>
            <div className="text-3xl font-bold text-purple-900">{stats?.totalViews || 0}</div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-pink-100 rounded-2xl p-6 border border-red-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                <IoHeartOutline className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm text-red-700 font-medium">Favori</div>
            </div>
            <div className="text-3xl font-bold text-red-900">{stats?.totalFavorites || 0}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.onClick}
                className={`bg-gradient-to-r ${action.color} text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-between group`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <IconComponent className="w-7 h-7" />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold">{action.title}</div>
                    <div className="text-white/80 text-sm">{action.count} kayıt</div>
                  </div>
                </div>
                <IoChevronForwardOutline className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Products */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary-dark rounded-full"></div>
                Son Ürünler
              </h2>
              <button
                onClick={() => navigate('/admin/products')}
                className="text-primary hover:text-primary-dark font-medium text-sm"
              >
                Tümünü Gör →
              </button>
            </div>

            {recentProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <IoCubeOutline className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Henüz ürün yok</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentProducts.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">{product.title}</div>
                      <div className="text-sm text-gray-600">
                        {product.seller?.name || 'Bilinmeyen satıcı'}
                      </div>
                      <div className="text-sm font-bold text-primary mt-1">
                        {product.price.toLocaleString('tr-TR')} ₺
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {product.isApproved ? (
                        <button
                          onClick={() => handleToggleFeatured(product._id)}
                          className={`p-2 rounded-lg transition-colors ${
                            product.isFeatured
                              ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                          title={product.isFeatured ? 'Öne çıkarılmış' : 'Öne çıkar'}
                        >
                          <IoStarOutline className={`w-5 h-5 ${product.isFeatured ? 'fill-current' : ''}`} />
                        </button>
                      ) : (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                          Beklemede
                        </span>
                      )}
                      <button
                        onClick={() => navigate(`/product/${product._id}`)}
                        className="p-2 text-gray-400 hover:text-primary transition-colors"
                      >
                        <IoChevronForwardOutline className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary-dark rounded-full"></div>
                Son Kullanıcılar
              </h2>
              <button
                onClick={() => navigate('/admin/users')}
                className="text-primary hover:text-primary-dark font-medium text-sm"
              >
                Tümünü Gör →
              </button>
            </div>

            {recentUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <IoPeopleOutline className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Henüz kullanıcı yok</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => navigate(`/admin/users/${user._id}`)}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                        <div className="text-xs text-gray-500 mt-1 capitalize">
                          {user.userType === 'buyer' ? 'Alıcı' : user.userType === 'seller' ? 'Satıcı' : user.userType === 'admin' ? 'Yönetici' : user.userType}
                        </div>
                      </div>
                    </div>
                    <IoChevronForwardOutline className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <IoCheckmarkCircleOutline className="w-6 h-6 text-green-500" />
              <div className="text-sm text-gray-600 font-medium">Onaylı Ürünler</div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats?.approvedProducts || 0}</div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <IoPeopleOutline className="w-6 h-6 text-blue-500" />
              <div className="text-sm text-gray-600 font-medium">Aktif Kullanıcılar</div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats?.activeUsers || 0}</div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <IoBanOutline className="w-6 h-6 text-red-500" />
              <div className="text-sm text-gray-600 font-medium">Engellenmiş Kullanıcılar</div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats?.blockedUsers || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;


