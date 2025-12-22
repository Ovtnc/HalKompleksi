import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI } from '../services/api';
import {
  IoArrowBack,
  IoStar,
  IoStarOutline,
  IoEyeOutline,
  IoHeartOutline,
  IoLocationOutline,
  IoPersonOutline,
  IoPricetagOutline,
  IoRefreshOutline
} from 'react-icons/io5';
import ProductCard from '../components/ProductCard';

interface FeaturedProduct {
  _id: string;
  title: string;
  description: string;
  price: number;
  stock?: number;
  unit?: string;
  category: string;
  images: string[] | Array<{ url: string; isPrimary?: boolean }>;
  location?: {
    city: string;
    district?: string;
  } | string;
  isAvailable: boolean;
  isApproved: boolean;
  isFeatured: boolean;
  views: number;
  favorites?: number | string[];
  seller: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const AdminFeaturedProductsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.activeRole !== 'admin') {
      navigate('/profile');
      return;
    }
    loadFeaturedProducts();
  }, [user, navigate]);

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getFeaturedProducts();
      setProducts(response.products || []);
    } catch (error: any) {
      console.error('Error loading featured products:', error);
      alert(`Öne çıkan ürünler yüklenirken hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadFeaturedProducts();
  };

  const handleToggleFeatured = async (productId: string) => {
    try {
      setActionLoading(productId);
      await adminAPI.toggleProductFeatured(productId);
      loadFeaturedProducts();
    } catch (error: any) {
      console.error('Toggle featured error:', error);
      alert(`Öne çıkarma durumu güncellenirken hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <IoArrowBack className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                  <IoStar className="w-8 h-8" />
                  Öne Çıkan Ürünler
                </h1>
                <p className="text-white/90 mt-1">{products.length} öne çıkan ürün</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors disabled:opacity-50"
              title="Yenile"
            >
              <IoRefreshOutline className={`w-6 h-6 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {products.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <IoStarOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Öne çıkan ürün yok</h3>
            <p className="text-gray-600">Henüz öne çıkarılmış ürün bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const productId = product._id || '';
              const favoritesCount = Array.isArray(product.favorites) ? product.favorites.length : product.favorites || 0;
              const locationText = typeof product.location === 'string'
                ? product.location
                : product.location
                  ? `${product.location.city}${product.location.district ? `, ${product.location.district}` : ''}`
                  : 'Konum belirtilmemiş';

              return (
                <div
                  key={productId}
                  className="bg-white rounded-2xl border-2 border-yellow-200 overflow-hidden shadow-lg hover:shadow-xl transition-shadow relative"
                >
                  {/* Featured Badge */}
                  <div className="absolute top-2 right-2 z-10">
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                      <IoStar className="w-3 h-3 fill-current" />
                      Öne Çıkan
                    </div>
                  </div>

                  <ProductCard
                    product={product as any}
                    onClick={() => navigate(`/product/${productId}`)}
                  />

                  {/* Additional Info */}
                  <div className="p-4 border-t border-gray-200 space-y-3">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <IoEyeOutline className="w-4 h-4 text-blue-500" />
                        <span className="font-semibold">{product.views || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <IoHeartOutline className="w-4 h-4 text-red-500" />
                        <span className="font-semibold">{favoritesCount}</span>
                      </div>
                    </div>

                    {/* Seller Info */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center">
                        {product.seller.profileImage ? (
                          <img
                            src={product.seller.profileImage}
                            alt={product.seller.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <IoPersonOutline className="w-4 h-4 text-yellow-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-gray-900 truncate">
                          {product.seller.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {product.seller.email}
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <IoLocationOutline className="w-3 h-3" />
                      <span className="truncate">{locationText}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => navigate(`/product/${productId}`)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                        title="Detayları Gör"
                      >
                        <IoEyeOutline className="w-4 h-4" />
                        Detay
                      </button>
                      <button
                        onClick={() => handleToggleFeatured(productId)}
                        disabled={actionLoading === productId}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium disabled:opacity-50"
                        title="Öne çıkarmayı kaldır"
                      >
                        {actionLoading === productId ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <IoStarOutline className="w-4 h-4" />
                            Kaldır
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFeaturedProductsPage;


