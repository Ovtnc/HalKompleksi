import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI } from '../services/api';
import { Product } from '../types';
import {
  IoArrowBack,
  IoSearchOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTrashOutline,
  IoStarOutline,
  IoStar,
  IoEyeOutline,
  IoCubeOutline,
  IoTimeOutline,
  IoCheckmarkOutline
} from 'react-icons/io5';
import ProductCard from '../components/ProductCard';

const AdminAllProductsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.activeRole !== 'admin') {
      navigate('/profile');
      return;
    }
    loadProducts(1);
  }, [user, navigate, filter]);

  const loadProducts = async (page: number = 1) => {
    try {
      setLoading(true);
      const params: any = {
        page: page,
        limit: 20,
        status: filter,
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const response = await adminAPI.getProducts(params);
      setProducts(response.products || []);
      setCurrentPage(response.currentPage || page);
      setTotalPages(response.totalPages || 1);
      setTotalProducts(response.total || 0);
    } catch (error: any) {
      console.error('Error loading products:', error);
      alert(`Ürünler yüklenirken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadProducts(1);
  };

  const handleApprove = async (productId: string) => {
    if (!window.confirm('Bu ürünü onaylamak istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setActionLoading(productId);
      await adminAPI.approveProduct(productId);
      alert('Ürün başarıyla onaylandı!');
      loadProducts(currentPage);
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
      loadProducts(currentPage);
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
      loadProducts(currentPage);
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
      loadProducts(currentPage);
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
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white">
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
                <h1 className="text-2xl md:text-3xl font-bold">Tüm Ürünler</h1>
                <p className="text-white/90 mt-1">{totalProducts} ürün</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Ürün ara..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium"
            >
              Ara
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'Tümü', icon: IoCubeOutline },
              { id: 'approved', label: 'Onaylı', icon: IoCheckmarkCircleOutline },
              { id: 'pending', label: 'Beklemede', icon: IoTimeOutline },
              { id: 'rejected', label: 'Reddedilen', icon: IoCloseCircleOutline },
            ].map((filterOption) => {
              const IconComponent = filterOption.icon;
              return (
                <button
                  key={filterOption.id}
                  onClick={() => {
                    setFilter(filterOption.id);
                    setCurrentPage(1);
                    setSearchQuery('');
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                    filter === filterOption.id
                      ? 'bg-green-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{filterOption.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <IoCubeOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Ürün bulunamadı</h3>
            <p className="text-gray-600">
              {searchQuery.trim()
                ? 'Arama kriterlerinize uygun ürün bulunamadı.'
                : 'Bu filtreye uygun ürün bulunamadı.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => {
                const productId = product._id || product.id || '';
                const isApproved = (product as any).isApproved;
                const isFeatured = (product as any).isFeatured;

                return (
                  <div key={productId} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow relative">
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
                      onClick={() => navigate(`/product/${productId}`)}
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
                            <IoCheckmarkOutline className="w-4 h-4" />
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
                          onClick={() => navigate(`/product/${productId}`)}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => {
                    const newPage = currentPage - 1;
                    if (newPage >= 1) {
                      setCurrentPage(newPage);
                      loadProducts(newPage);
                    }
                  }}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Önceki
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Sayfa {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => {
                    const newPage = currentPage + 1;
                    if (newPage <= totalPages) {
                      setCurrentPage(newPage);
                      loadProducts(newPage);
                    }
                  }}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sonraki
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAllProductsPage;


