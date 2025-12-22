import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { productsAPI } from '../services/api';
import { Product } from '../types';
import {
  IoArrowBack,
  IoAddCircleOutline,
  IoTrashOutline,
  IoPencilOutline,
  IoPauseOutline,
  IoPlayOutline,
  IoEyeOutline,
  IoHeartOutline,
  IoCubeOutline
} from 'react-icons/io5';

const MyProductsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [productCount, setProductCount] = useState({
    total: 0,
    active: 0,
    pending: 0,
    approved: 0
  });

  const loadMyProducts = useCallback(async () => {
    try {
      setLoading(true);
      console.log('📦 Loading my products...');
      
      const response = await productsAPI.getMyProducts();
      console.log('📦 API response:', response);
      
      if (response.products) {
        setProducts(response.products);
        console.log('📦 My products loaded:', response.products.length);
        
        // Calculate counts
        const total = response.products.length;
        const active = response.products.filter((p: Product) => p.isAvailable && (p as any).isApproved).length;
        const pending = response.products.filter((p: Product) => !(p as any).isApproved).length;
        const approved = response.products.filter((p: Product) => (p as any).isApproved).length;
        
        setProductCount({ total, active, pending, approved });
      } else {
        console.log('📦 No products found');
        setProducts([]);
        setProductCount({ total: 0, active: 0, pending: 0, approved: 0 });
      }
    } catch (error: any) {
      console.error('❌ Load my products error:', error);
      if (error.message?.includes('403')) {
        alert('Yetki Hatası: Satıcı yetkisi gerekli. Lütfen hesap ayarlarınızı kontrol edin.');
      } else if (error.message?.includes('401')) {
        alert('Oturum Hatası: Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        navigate('/login');
      } else {
        alert('Ürünler yüklenirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
      }
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!user || (user.activeRole !== 'seller' && !user.userRoles?.includes('seller'))) {
      navigate('/profile');
      return;
    }
    loadMyProducts();
  }, [user, loadMyProducts, navigate]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadMyProducts();
  };

  const handleDeleteProduct = (product: Product) => {
    if (!window.confirm(`${product.title} ürününü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }

    const productId = product._id || product.id;
    if (!productId) return;

    (async () => {
      try {
        console.log('Delete product:', productId);
        await productsAPI.deleteProduct(productId);
        
        // Remove from local state
        setProducts(prevProducts => 
          prevProducts.filter(p => (p._id || p.id) !== productId)
        );
        
        // Update counts
        setProductCount(prev => ({
          ...prev,
          total: prev.total - 1,
          active: product.isAvailable && (product as any).isApproved ? prev.active - 1 : prev.active,
          pending: !(product as any).isApproved ? prev.pending - 1 : prev.pending,
          approved: (product as any).isApproved ? prev.approved - 1 : prev.approved,
        }));
        
        alert('Başarılı: Ürün başarıyla silindi');
      } catch (error: any) {
        console.error('Delete product error:', error);
        alert('Hata: Ürün silinirken bir hata oluştu - ' + (error.message || 'Bilinmeyen hata'));
      }
    })();
  };

  const handleToggleProduct = async (product: Product) => {
    const productId = product._id || product.id;
    if (!productId) return;

    try {
      await productsAPI.updateProduct(productId, {
        isAvailable: !product.isAvailable
      });
      
      // Update local state
      setProducts(prevProducts =>
        prevProducts.map(p =>
          (p._id || p.id) === productId
            ? { ...p, isAvailable: !p.isAvailable }
            : p
        )
      );
      
      // Update counts
      const wasActive = product.isAvailable && (product as any).isApproved;
      const willBeActive = !product.isAvailable && (product as any).isApproved;
      
      setProductCount(prev => ({
        ...prev,
        active: wasActive ? prev.active - 1 : willBeActive ? prev.active + 1 : prev.active,
      }));
    } catch (error: any) {
      console.error('Toggle product error:', error);
      alert('Hata: Ürün durumu değiştirilirken bir hata oluştu');
    }
  };

  const handleEditProduct = (product: Product) => {
    const productId = product._id || product.id;
    if (productId) {
      navigate(`/seller/products/edit/${productId}`);
    }
  };

  const primaryImage = (product: Product) => {
    if (!product.images || product.images.length === 0) return undefined;
    const firstImage = product.images[0];
    return typeof firstImage === 'string' ? firstImage : (firstImage as any)?.url;
  };

  const favoritesCount = (product: Product) => {
    if (Array.isArray(product.favorites)) {
      return product.favorites.length;
    }
    return product.favorites || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-gray-500">Ürünler yükleniyor...</div>
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
              onClick={() => navigate('/seller/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              <IoArrowBack className="w-5 h-5" />
              <span>Geri</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <IoCubeOutline className="w-6 h-6 text-primary" />
              Ürünlerim
            </h1>
            <button
              onClick={() => navigate('/seller/products/add')}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium"
            >
              <IoAddCircleOutline className="w-5 h-5" />
              <span className="hidden sm:inline">Yeni Ürün</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
            <div className="text-sm text-blue-700 font-medium mb-1">Toplam</div>
            <div className="text-2xl font-bold text-blue-900">{productCount.total}</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200">
            <div className="text-sm text-green-700 font-medium mb-1">Aktif</div>
            <div className="text-2xl font-bold text-green-900">{productCount.active}</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-4 border border-yellow-200">
            <div className="text-sm text-yellow-700 font-medium mb-1">Beklemede</div>
            <div className="text-2xl font-bold text-yellow-900">{productCount.pending}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200">
            <div className="text-sm text-purple-700 font-medium mb-1">Onaylı</div>
            <div className="text-2xl font-bold text-purple-900">{productCount.approved}</div>
          </div>
        </div>

        {/* Products List */}
        {products.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <IoCubeOutline className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Henüz ürün eklemediniz</h3>
            <p className="text-gray-500 mb-6">İlk ürününüzü ekleyerek satışa başlayın</p>
            <button
              onClick={() => navigate('/seller/products/add')}
              className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium"
            >
              İlk Ürününüzü Ekleyin
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const imageUrl = primaryImage(product);
              const isApproved = (product as any).isApproved;
              const isAvailable = product.isAvailable;
              
              return (
                <div
                  key={product._id || product.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-gray-100">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        📦
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-semibold ${
                      isApproved ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
                    }`}>
                      {isApproved ? 'Aktif' : 'Beklemede'}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{product.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-lg font-bold text-primary">
                          {product.price.toLocaleString('tr-TR')} ₺
                        </span>
                        {product.unit && (
                          <span className="text-sm text-gray-500">/{product.unit}</span>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <IoEyeOutline className="w-4 h-4" />
                        <span>{product.views || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <IoHeartOutline className="w-4 h-4" />
                        <span>{favoritesCount(product)}</span>
                      </div>
                      <div className="text-xs text-gray-500 capitalize">{product.category}</div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        title="Düzenle"
                      >
                        <IoPencilOutline className="w-4 h-4" />
                        <span className="text-sm font-medium">Düzenle</span>
                      </button>
                      <button
                        onClick={() => handleToggleProduct(product)}
                        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                          isAvailable
                            ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                        title={isAvailable ? 'Duraklat' : 'Aktif Et'}
                      >
                        {isAvailable ? (
                          <IoPauseOutline className="w-4 h-4" />
                        ) : (
                          <IoPlayOutline className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        title="Sil"
                      >
                        <IoTrashOutline className="w-4 h-4" />
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

export default MyProductsPage;


