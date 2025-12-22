import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI } from '../services/api';
import { Product } from '../types';
import {
  IoArrowBack,
  IoCubeOutline,
  IoPersonOutline,
  IoMailOutline,
  IoCallOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTrashOutline,
  IoStarOutline,
  IoStar,
  IoEyeOutline
} from 'react-icons/io5';
import ProductCard from '../components/ProductCard';

const AdminUserProductsPage = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.activeRole !== 'admin') {
      navigate('/profile');
      return;
    }
    if (userId) {
      loadUserProducts();
    }
  }, [user, navigate, userId]);

  const loadUserProducts = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await adminAPI.getUserProducts(userId);
      setProducts(response.products || []);
      setUserInfo(response.user || null);
    } catch (error: any) {
      console.error('Error loading user products:', error);
      alert(`Kullanıcı ürünleri yüklenirken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (productId: string) => {
    if (!window.confirm('Bu ürünü onaylamak istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setActionLoading(productId);
      await adminAPI.approveProduct(productId);
      alert('Ürün başarıyla onaylandı!');
      loadUserProducts();
    } catch (error: any) {
      console.error('Approve error:', error);
      alert(`Ürün onaylanırken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (productId: string) => {
    if (!window.confirm('Bu ürünü reddetmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setActionLoading(productId);
      await adminAPI.rejectProduct(productId);
      alert('Ürün başarıyla reddedildi!');
      loadUserProducts();
    } catch (error: any) {
      console.error('Reject error:', error);
      alert(`Ürün reddedilirken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFeatured = async (productId: string) => {
    try {
      setActionLoading(productId);
      await adminAPI.toggleProductFeatured(productId);
      loadUserProducts();
    } catch (error: any) {
      console.error('Toggle featured error:', error);
      alert(`Öne çıkarma durumu güncellenirken hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Bu ürünü kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
      return;
    }

    try {
      setActionLoading(productId);
      await adminAPI.deleteProduct(productId);
      alert('Ürün başarıyla silindi!');
      loadUserProducts();
    } catch (error: any) {
      console.error('Delete error:', error);
      alert(`Ürün silinirken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
    } finally {
      setActionLoading(null);
    }
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
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/users')}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <IoArrowBack className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Kullanıcı Ürünleri</h1>
              <p className="text-white/90 mt-1">
                {userInfo?.name || 'Kullanıcı'} - {products.length} ürün
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info */}
        {userInfo && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                {userInfo.profileImage ? (
                  <img
                    src={userInfo.profileImage}
                    alt={userInfo.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <IoPersonOutline className="w-8 h-8 text-blue-600" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-1">{userInfo.name}</h2>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-600">
                    <IoMailOutline className="w-4 h-4" />
                    <span className="text-sm">{userInfo.email}</span>
                  </div>
                  {userInfo.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <IoCallOutline className="w-4 h-4" />
                      <span className="text-sm">{userInfo.phone}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  userInfo.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {userInfo.isActive ? 'Aktif' : 'Engelli'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Products */}
        {products.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <IoCubeOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Ürün bulunamadı</h3>
            <p className="text-gray-600">Bu kullanıcının henüz ürünü bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const productId = product._id || product.id || '';
              const isApproved = (product as any).isApproved;
              const isFeatured = (product as any).isFeatured;

              return (
                <div
                  key={productId}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow relative"
                >
                  {/* Status Badges */}
                  <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
                    {!isApproved && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                        Beklemede
                      </span>
                    )}
                    {isFeatured && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold flex items-center gap-1">
                        <IoStar className="w-3 h-3 fill-current" />
                        Öne Çıkan
                      </span>
                    )}
                  </div>

                  <ProductCard
                    product={product}
                    onClick={() => navigate(`/app/product/${productId}`)}
                  />

                  {/* Admin Actions */}
                  <div className="p-4 border-t border-gray-200 space-y-2">
                    <div className="flex gap-2">
                      {!isApproved && (
                        <button
                          onClick={() => handleApprove(productId)}
                          disabled={actionLoading === productId}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium disabled:opacity-50"
                          title="Onayla"
                        >
                          <IoCheckmarkCircleOutline className="w-4 h-4" />
                          Onayla
                        </button>
                      )}
                      {isApproved && (
                        <button
                          onClick={() => handleToggleFeatured(productId)}
                          disabled={actionLoading === productId}
                          className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 ${
                            isFeatured
                              ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          title={isFeatured ? 'Öne çıkarmayı kaldır' : 'Öne çıkar'}
                        >
                          {isFeatured ? (
                            <IoStar className="w-4 h-4 fill-current" />
                          ) : (
                            <IoStarOutline className="w-4 h-4" />
                          )}
                          {isFeatured ? 'Öne Çıkan' : 'Öne Çıkar'}
                        </button>
                      )}
                      {!isApproved && (
                        <button
                          onClick={() => handleReject(productId)}
                          disabled={actionLoading === productId}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium disabled:opacity-50"
                          title="Reddet"
                        >
                          <IoCloseCircleOutline className="w-4 h-4" />
                          Reddet
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/app/product/${productId}`)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                        title="Detayları Gör"
                      >
                        <IoEyeOutline className="w-4 h-4" />
                        Detay
                      </button>
                      <button
                        onClick={() => handleDelete(productId)}
                        disabled={actionLoading === productId}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50"
                        title="Sil"
                      >
                        <IoTrashOutline className="w-4 h-4" />
                        Sil
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

export default AdminUserProductsPage;


