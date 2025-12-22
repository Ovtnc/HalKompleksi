import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { productsAPI } from '../services/api';
import { Product } from '../types';
import { 
  IoStorefrontOutline,
  IoCubeOutline,
  IoEyeOutline,
  IoHeartOutline,
  IoAddCircleOutline,
  IoArrowBack,
  IoStatsChartOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline
} from 'react-icons/io5';

const SellerDashboardPage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    pendingProducts: 0,
    totalViews: 0,
    totalFavorites: 0,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Ensure user is in seller role
    if (user.activeRole !== 'seller' && user.userRoles?.includes('seller')) {
      updateUser({ activeRole: 'seller' });
    }

    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load seller products
      const response = await productsAPI.getMyProducts();
      
      if (response.products) {
        const productsList = response.products;
        const activeProducts = productsList.filter((p: Product) => p.isAvailable && (p as any).isApproved);
        const pendingProducts = productsList.filter((p: Product) => !(p as any).isApproved);
        const totalViews = productsList.reduce((sum: number, p: Product) => sum + (p.views || 0), 0);
        const totalFavorites = productsList.reduce((sum: number, p: Product) => {
          const favCount = Array.isArray(p.favorites) ? p.favorites.length : (p.favorites || 0);
          return sum + favCount;
        }, 0);
        
        setStats({
          totalProducts: productsList.length,
          activeProducts: activeProducts.length,
          pendingProducts: pendingProducts.length,
          totalViews,
          totalFavorites,
        });
        
        // Set recent products (last 6)
        setProducts(productsList.slice(0, 6));
      } else {
        setStats({
          totalProducts: 0,
          activeProducts: 0,
          pendingProducts: 0,
          totalViews: 0,
          totalFavorites: 0,
        });
        setProducts([]);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setStats({
        totalProducts: 0,
        activeProducts: 0,
        pendingProducts: 0,
        totalViews: 0,
        totalFavorites: 0,
      });
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (!user || (user.activeRole !== 'seller' && !user.userRoles?.includes('seller'))) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erişim Reddedildi</h2>
          <p className="text-gray-600 mb-6">Bu sayfaya erişmek için satıcı olmanız gerekiyor.</p>
          <button
            onClick={() => navigate('/profile')}
            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium"
          >
            Profil Sayfasına Dön
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-gray-500">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              <IoArrowBack className="w-5 h-5" />
              <span>Geri</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <IoStorefrontOutline className="w-6 h-6 text-primary" />
              Satıcı Paneli
            </h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <IoCubeOutline className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm text-blue-700 font-medium">Toplam Ürün</div>
            </div>
            <div className="text-3xl font-bold text-blue-900">{stats.totalProducts}</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                <IoCheckmarkCircleOutline className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm text-green-700 font-medium">Aktif</div>
            </div>
            <div className="text-3xl font-bold text-green-900">{stats.activeProducts}</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 border border-yellow-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
                <IoTimeOutline className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm text-yellow-700 font-medium">Beklemede</div>
            </div>
            <div className="text-3xl font-bold text-yellow-900">{stats.pendingProducts}</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                <IoEyeOutline className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm text-purple-700 font-medium">Görüntülenme</div>
            </div>
            <div className="text-3xl font-bold text-purple-900">{stats.totalViews}</div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-pink-100 rounded-2xl p-6 border border-red-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                <IoHeartOutline className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm text-red-700 font-medium">Favori</div>
            </div>
            <div className="text-3xl font-bold text-red-900">{stats.totalFavorites}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => navigate('/seller/products/add')}
            className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <IoAddCircleOutline className="w-7 h-7" />
              </div>
              <div className="text-left">
                <div className="text-xl font-bold">Yeni Ürün Ekle</div>
                <div className="text-white/80 text-sm">Ürününüzü ekleyin</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/seller/products')}
            className="bg-white border-2 border-gray-200 text-gray-900 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-primary transition-all transform hover:-translate-y-0.5 flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                <IoCubeOutline className="w-7 h-7 text-primary" />
              </div>
              <div className="text-left">
                <div className="text-xl font-bold">Ürünlerim</div>
                <div className="text-gray-500 text-sm">Tüm ürünlerinizi görün</div>
              </div>
            </div>
          </button>
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary-dark rounded-full"></div>
              Son Ürünlerim
            </h2>
            <button
              onClick={() => navigate('/seller/products')}
              className="text-primary hover:text-primary-dark font-medium text-sm"
            >
              Tümünü Gör →
            </button>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <IoCubeOutline className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Henüz ürün eklemediniz</p>
              <button
                onClick={() => navigate('/seller/products/add')}
                className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium"
              >
                İlk Ürününüzü Ekleyin
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => {
                const imageUrl = product.images?.[0] 
                  ? (typeof product.images[0] === 'string' ? product.images[0] : (product.images[0] as any).url)
                  : undefined;
                
                return (
                  <div
                    key={product._id || product.id}
                    onClick={() => navigate(`/product/${product._id || product.id}`)}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-all"
                  >
                    <div className="relative aspect-square bg-gray-100">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          📦
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.title}</h3>
                      <p className="text-lg font-bold text-primary">
                        {product.price.toLocaleString('tr-TR')} ₺
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboardPage;

