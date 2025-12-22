import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Product } from '../types';
import { normalizeImageUrl } from '../utils/imageUtils';
import { 
  IoHeartOutline, 
  IoHeart, 
  IoArrowBack, 
  IoLocationOutline, 
  IoCallOutline, 
  IoShareSocialOutline, 
  IoEyeOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
} from 'react-icons/io5';

// Kategori-spesifik alanlar tanımları
const categoryFields: Record<string, any> = {
  meyve: {
    fields: [
      { key: 'variety', label: 'Çeşit', icon: '🍇' },
      { key: 'harvest', label: 'Hasat Tarihi', icon: '📅', isDate: true },
      { key: 'organic', label: 'Organik', icon: '🌿', isBoolean: true },
      { key: 'coldStorage', label: 'Soğuk Hava Deposu', icon: '❄️', isBoolean: true },
    ]
  },
  sebze: {
    fields: [
      { key: 'variety', label: 'Çeşit', icon: '🥬' },
      { key: 'harvest', label: 'Hasat Tarihi', icon: '📅', isDate: true },
      { key: 'organic', label: 'Organik', icon: '🌿', isBoolean: true },
      { key: 'coldStorage', label: 'Soğuk Hava Deposu', icon: '❄️', isBoolean: true },
    ]
  },
  gida: {
    fields: [
      { key: 'productType', label: 'Gıda Tipi', icon: '🍔' },
      { key: 'productionDate', label: 'Üretim Tarihi', icon: '📅', isDate: true },
      { key: 'brand', label: 'Marka', icon: '🏷️' },
      { key: 'expiryDate', label: 'Son Kullanma Tarihi', icon: '⏰', isDate: true },
    ]
  },
  nakliye: {
    fields: [
      { key: 'vehicleType', label: 'Araç Tipi', icon: '🚚' },
      { key: 'capacity', label: 'Kapasite (Ton)', icon: '📦' },
      { key: 'route', label: 'Güzergah', icon: '🗺️' },
      { key: 'availability', label: 'Müsaitlik', icon: '⏰' },
    ]
  },
  kasa: {
    fields: [
      { key: 'material', label: 'Malzeme', icon: '📦' },
      { key: 'size', label: 'Boyut', icon: '📏' },
      { key: 'condition', label: 'Durum', icon: '✅' },
    ]
  },
  zirai_ilac: {
    fields: [
      { key: 'brand', label: 'Marka', icon: '🏷️' },
      { key: 'productName', label: 'İlaç Adı', icon: '💊' },
    ]
  },
};

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageZoomed, setImageZoomed] = useState(false);

  useEffect(() => {
    // Auth yüklenene kadar bekle
    if (authLoading) {
      return;
    }

    // Giriş kontrolü - eğer kullanıcı giriş yapmamışsa login sayfasına yönlendir
    if (!user) {
      console.log('⚠️ User not logged in, redirecting to login...');
      navigate('/login', { 
        state: { 
          from: `/product/${id}`,
          message: 'Ürün detaylarını görmek için lütfen giriş yapın'
        } 
      });
      return;
    }

    if (id) {
      loadProduct();
    }
  }, [id, user, authLoading, navigate]);

  const loadProduct = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      console.log('📦 Loading product with ID:', id);
      const productData = await productsAPI.getProduct(id);
      console.log('✅ Product loaded:', productData);
      setProduct(productData);
      
      if (user) {
        try {
          const favorites = await productsAPI.getFavorites();
          const favoriteIds = favorites.products?.map((p: Product) => p._id || p.id) || [];
          setIsFavorite(favoriteIds.includes(productData._id || productData.id));
        } catch (err) {
          console.warn('⚠️ Could not load favorites:', err);
        }
      }
    } catch (err: any) {
      console.error('❌ Error loading product:', err);
      setError(err.message || 'Ürün yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!product) return;

    try {
      if (isFavorite) {
        await productsAPI.removeFromFavorites(product._id || product.id || '');
        setIsFavorite(false);
      } else {
        await productsAPI.addToFavorites(product._id || product.id || '');
        setIsFavorite(true);
      }
    } catch (err: any) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 bg-primary rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="text-gray-600 font-medium mt-4">
            {authLoading ? 'Yükleniyor...' : 'Ürün yükleniyor...'}
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="text-7xl mb-6 animate-bounce">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ürün Bulunamadı</h2>
          <p className="text-red-600 mb-6">{error || 'Aradığınız ürün bulunamadı'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  const images = product.images || [];
  const currentImage = images[currentImageIndex] || images[0];
  const rawImageUrl = typeof currentImage === 'string' ? currentImage : (currentImage as any)?.url;
  const imageUrl = normalizeImageUrl(rawImageUrl);
  
  const category = (product as any).category || '';
  const categoryData = (product as any).categoryData || {};
  const categoryFieldsConfig = categoryFields[category] || { fields: [] };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Floating Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-16 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors font-medium group"
            >
              <IoArrowBack className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Geri</span>
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2.5 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                title="Paylaş"
              >
                <IoShareSocialOutline className="w-5 h-5" />
              </button>
              <button
                onClick={handleToggleFavorite}
                className={`p-2.5 rounded-xl transition-all ${
                  isFavorite
                    ? 'text-red-500 bg-red-50 hover:bg-red-100 scale-110'
                    : 'text-gray-600 hover:text-red-500 hover:bg-red-50'
                }`}
                title={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
              >
                {isFavorite ? <IoHeart className="w-5 h-5 fill-current" /> : <IoHeartOutline className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div 
              className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl overflow-hidden shadow-2xl group cursor-zoom-in"
              onClick={() => setImageZoomed(!imageZoomed)}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.title}
                  className={`w-full h-full object-cover transition-transform duration-500 ${
                    imageZoomed ? 'scale-150' : 'group-hover:scale-105'
                  }`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-9xl bg-gradient-to-br from-gray-100 to-gray-200">
                  📦
                </div>
              )}
              
              {/* Image overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              {/* Badge overlay */}
              {product.isFeatured && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  ⭐ Öne Çıkan
                </div>
              )}
            </div>
            
            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, index) => {
                  const rawImgUrl = typeof img === 'string' ? img : (img as any)?.url;
                  const imgUrl = normalizeImageUrl(rawImgUrl);
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentImageIndex(index);
                        setImageZoomed(false);
                      }}
                      className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-3 transition-all transform ${
                        currentImageIndex === index
                          ? 'border-primary ring-4 ring-primary/20 scale-110 shadow-lg'
                          : 'border-gray-200 hover:border-primary/50 hover:scale-105'
                      }`}
                    >
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={`${product.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-2xl">
                          📦
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            {/* Title and Badges */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight flex-1">
                  {product.title}
                </h1>
              </div>
              
              {/* Price and Status */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                    {product.price.toLocaleString('tr-TR')}
                  </span>
                  <span className="text-2xl text-gray-600 font-semibold">{product.currency || 'TL'}</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {product.stock !== undefined && (
                    <span className="px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-full text-sm font-semibold shadow-sm border border-blue-200">
                      📦 {product.stock} {product.unit || 'kg'}
                    </span>
                  )}
                  {product.isAvailable ? (
                    <span className="px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-full text-sm font-semibold shadow-sm border border-green-200 flex items-center gap-1">
                      <IoCheckmarkCircle className="w-4 h-4" />
                      Mevcut
                    </span>
                  ) : (
                    <span className="px-4 py-2 bg-gradient-to-r from-red-50 to-rose-50 text-red-700 rounded-full text-sm font-semibold shadow-sm border border-red-200 flex items-center gap-1">
                      <IoCloseCircle className="w-4 h-4" />
                      Tükendi
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
                <div className="flex items-center gap-2 text-blue-700 mb-1">
                  <IoEyeOutline className="w-5 h-5" />
                  <span className="text-sm font-medium">Görüntülenme</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">{product.views || 0}</div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-pink-100 rounded-2xl p-4 border border-red-200">
                <div className="flex items-center gap-2 text-red-700 mb-1">
                  <IoHeart className="w-5 h-5 fill-current" />
                  <span className="text-sm font-medium">Favori</span>
                </div>
                <div className="text-2xl font-bold text-red-900">
                  {Array.isArray((product as any).favorites) 
                    ? (product as any).favorites.length 
                    : (typeof product.favorites === 'number' ? product.favorites : 0)
                  }
                </div>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary-dark rounded-full"></div>
                  Açıklama
                </h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Category Specific Fields */}
            {categoryFieldsConfig.fields.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary-dark rounded-full"></div>
                  Ürün Detayları
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categoryFieldsConfig.fields.map((field: any) => {
                    const value = categoryData[field.key];
                    if (value === undefined || value === null || value === '') return null;

                    let displayValue = value;
                    if (field.isDate) {
                      displayValue = formatDate(value);
                    } else if (field.isBoolean) {
                      displayValue = value ? 'Evet' : 'Hayır';
                    }

                    return (
                      <div key={field.key} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <span className="text-3xl">{field.icon}</span>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">{field.label}</div>
                          <div className="text-base font-bold text-gray-900">{displayValue}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Location */}
            {product.location && (
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <IoLocationOutline className="w-6 h-6 text-primary" />
                  Konum
                </h3>
                <p className="text-gray-700 font-medium text-lg">
                  {typeof product.location === 'string' 
                    ? product.location 
                    : (product.location as any)?.city 
                      ? `${(product.location as any).city}${(product.location as any).district ? `, ${(product.location as any).district}` : ''}${(product.location as any).address ? `, ${(product.location as any).address}` : ''}`
                      : String(product.location)
                  }
                </p>
              </div>
            )}

            {/* Seller Info */}
            {product.seller && (
              <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-white rounded-2xl p-6 border-2 border-primary/20 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary-dark rounded-full"></div>
                  Satıcı Bilgileri
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-bold text-2xl shadow-lg">
                        {product.seller.name.charAt(0).toUpperCase()}
                      </div>
                      {product.seller.profileImage && (
                        <img 
                          src={product.seller.profileImage} 
                          alt={product.seller.name}
                          className="w-16 h-16 rounded-2xl object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 text-lg mb-1">{product.seller.name}</div>
                      {product.seller.location && (
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <IoLocationOutline className="w-4 h-4" />
                          {typeof product.seller.location === 'string' 
                            ? product.seller.location 
                            : (product.seller.location as any)?.city 
                              ? `${(product.seller.location as any).city}${(product.seller.location as any).district ? `, ${(product.seller.location as any).district}` : ''}`
                              : String(product.seller.location)
                          }
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {product.seller.phone && (
                    <button
                      onClick={() => handleCall(product.seller!.phone)}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl hover:from-primary-dark hover:to-primary transition-all font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <IoCallOutline className="w-6 h-6" />
                      <span>Ara: {product.seller.phone}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
