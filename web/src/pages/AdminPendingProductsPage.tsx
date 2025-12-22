import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI } from '../services/api';
import {
  IoArrowBack,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoEyeOutline,
  IoTimeOutline,
  IoImageOutline,
  IoPersonOutline,
  IoLocationOutline,
  IoPricetagOutline
} from 'react-icons/io5';

interface PendingProduct {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: Array<{ url: string; isPrimary?: boolean }> | string[];
  location?: {
    city: string;
    district?: string;
  } | string;
  seller: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  createdAt: string;
  categoryData?: any;
}

const AdminPendingProductsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState<PendingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<PendingProduct | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showProductDetailModal, setShowProductDetailModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.activeRole !== 'admin') {
      navigate('/profile');
      return;
    }
    loadPendingProducts();
  }, [user, navigate]);

  const loadPendingProducts = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPendingProducts();
      setProducts(response.products || []);
    } catch (error: any) {
      console.error('Error loading pending products:', error);
      alert(`Onay bekleyen ürünler yüklenirken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
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
      loadPendingProducts();
      setShowProductDetailModal(false);
    } catch (error: any) {
      console.error('Error approving product:', error);
      alert(`Ürün onaylanırken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!selectedProduct) return;

    if (!rejectReason.trim()) {
      alert('Lütfen red nedeni girin.');
      return;
    }

    if (!window.confirm('Bu ürünü reddetmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setActionLoading(selectedProduct._id);
      await adminAPI.rejectProduct(selectedProduct._id, rejectReason);
      alert('Ürün başarıyla reddedildi!');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedProduct(null);
      loadPendingProducts();
    } catch (error: any) {
      console.error('Error rejecting product:', error);
      alert(`Ürün reddedilirken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getImageUrl = (product: PendingProduct) => {
    if (!product.images || product.images.length === 0) return null;
    const firstImage = product.images[0];
    return typeof firstImage === 'string' ? firstImage : (firstImage as any)?.url;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <IoArrowBack className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Onay Bekleyen Ürünler</h1>
              <p className="text-white/90 mt-1">{products.length} ürün bekliyor</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {products.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <IoCheckmarkCircleOutline className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Tüm ürünler onaylandı!</h3>
            <p className="text-gray-600">Onay bekleyen ürün bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {products.map((product) => {
              const imageUrl = getImageUrl(product);
              const locationText = typeof product.location === 'string'
                ? product.location
                : product.location
                  ? `${product.location.city}${product.location.district ? `, ${product.location.district}` : ''}`
                  : 'Konum belirtilmemiş';

              return (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Image */}
                      <div className="flex-shrink-0">
                        <div className="w-full lg:w-48 h-48 bg-gray-100 rounded-xl overflow-hidden">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <IoImageOutline className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{product.title}</h3>
                          <p className="text-gray-600 line-clamp-2">{product.description}</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <IoPricetagOutline className="w-5 h-5 text-primary" />
                            <div>
                              <div className="text-xs text-gray-500">Fiyat</div>
                              <div className="font-semibold text-gray-900">
                                {product.price.toLocaleString('tr-TR')} ₺
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-gray-600">
                            <IoLocationOutline className="w-5 h-5 text-blue-500" />
                            <div>
                              <div className="text-xs text-gray-500">Konum</div>
                              <div className="font-semibold text-gray-900 text-sm">{locationText}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-gray-600">
                            <IoPersonOutline className="w-5 h-5 text-purple-500" />
                            <div>
                              <div className="text-xs text-gray-500">Satıcı</div>
                              <div className="font-semibold text-gray-900 text-sm">{product.seller.name}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-gray-600">
                            <IoTimeOutline className="w-5 h-5 text-orange-500" />
                            <div>
                              <div className="text-xs text-gray-500">Tarih</div>
                              <div className="font-semibold text-gray-900 text-sm">
                                {formatDate(product.createdAt)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowProductDetailModal(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors font-medium"
                          >
                            <IoEyeOutline className="w-5 h-5" />
                            Detayları Gör
                          </button>
                          <button
                            onClick={() => handleApprove(product._id)}
                            disabled={actionLoading === product._id}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading === product._id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Onaylanıyor...</span>
                              </>
                            ) : (
                              <>
                                <IoCheckmarkCircleOutline className="w-5 h-5" />
                                <span>Onayla</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowRejectModal(true);
                            }}
                            disabled={actionLoading === product._id}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <IoCloseCircleOutline className="w-5 h-5" />
                            <span>Reddet</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Ürünü Reddet</h3>
            <p className="text-gray-600 mb-4">
              <strong>{selectedProduct.title}</strong> ürününü reddetmek için bir neden girin:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Red nedeni..."
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedProduct(null);
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                İptal
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || actionLoading === selectedProduct._id}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === selectedProduct._id ? 'Reddediliyor...' : 'Reddet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {showProductDetailModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-xl my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Ürün Detayları</h3>
              <button
                onClick={() => {
                  setShowProductDetailModal(false);
                  setSelectedProduct(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <IoCloseCircleOutline className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{selectedProduct.title}</h4>
                <p className="text-gray-600">{selectedProduct.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Fiyat</div>
                  <div className="text-lg font-bold text-gray-900">
                    {selectedProduct.price.toLocaleString('tr-TR')} ₺
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Kategori</div>
                  <div className="text-lg font-semibold text-gray-900 capitalize">{selectedProduct.category}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Satıcı</div>
                  <div className="text-lg font-semibold text-gray-900">{selectedProduct.seller.name}</div>
                  <div className="text-sm text-gray-600">{selectedProduct.seller.email}</div>
                  {selectedProduct.seller.phone && (
                    <div className="text-sm text-gray-600">{selectedProduct.seller.phone}</div>
                  )}
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Eklenme Tarihi</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatDate(selectedProduct.createdAt)}
                  </div>
                </div>
              </div>

              {selectedProduct.categoryData && Object.keys(selectedProduct.categoryData).length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">Kategori Özel Bilgiler</div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                      {JSON.stringify(selectedProduct.categoryData, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleApprove(selectedProduct._id)}
                  disabled={actionLoading === selectedProduct._id}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium disabled:opacity-50"
                >
                  <IoCheckmarkCircleOutline className="w-5 h-5" />
                  <span>Onayla</span>
                </button>
                <button
                  onClick={() => {
                    setShowProductDetailModal(false);
                    setSelectedProduct(selectedProduct);
                    setShowRejectModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium"
                >
                  <IoCloseCircleOutline className="w-5 h-5" />
                  <span>Reddet</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPendingProductsPage;


