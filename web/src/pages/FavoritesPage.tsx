import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';

const FavoritesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productsAPI.getFavorites();
      if (response?.products) {
        setProducts(response.products);
      } else if (Array.isArray(response)) {
        setProducts(response);
      }
    } catch (err: any) {
      setError(err.message || 'Favoriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product: Product) => {
    // MongoDB ObjectId'yi string'e çevir
    let productId = product._id || product.id;
    
    // Eğer ObjectId objesi ise, toString() kullan
    if (productId && typeof productId === 'object' && 'toString' in productId) {
      productId = (productId as any).toString();
    }
    
    // String'e çevir
    productId = String(productId);
    
    if (productId && productId !== 'undefined' && productId !== 'null') {
      navigate(`/product/${productId}`);
    } else {
      console.error('❌ Invalid product ID:', product);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Favorilerim</h1>
          <p className="text-gray-600">Beğendiğiniz ürünler</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-gray-500">Yükleniyor...</div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <span className="text-6xl mb-4 block">❤️</span>
            <p className="text-gray-500 text-lg mb-6">Henüz favori ürününüz yok</p>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium"
            >
              Ürünlere Göz At
            </button>
          </div>
        )}

        {/* Products Count */}
        {!loading && !error && products.length > 0 && (
          <div className="mb-6 text-sm text-gray-600">
            {products.length} ürün bulundu
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product._id || product.id}
                product={product}
                onClick={() => handleProductClick(product)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
