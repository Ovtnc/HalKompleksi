import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../contexts/AuthContext';

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page] = useState(1);

  useEffect(() => {
    loadProducts();
  }, [searchParams]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const search = searchParams.get('search');
      const categoryParam = searchParams.get('category');
      const locationParam = searchParams.get('location');
      const minPriceParam = searchParams.get('minPrice');
      const maxPriceParam = searchParams.get('maxPrice');
      const featured = searchParams.get('featured');
      const sort = searchParams.get('sort');

      const params: any = {
        limit: 20,
        page: page,
      };

      if (search) {
        params.search = search;
      }
      if (categoryParam) {
        // Backend'de kategori slug'ları küçük harf (sebze, meyve, vb.)
        // URL'den gelen kategori parametresini lowercase'e çevir ve slug formatına çevir
        let categorySlug = categoryParam.toLowerCase().trim();
        
        // Türkçe karakterleri düzelt ve boşlukları alt çizgiye çevir
        categorySlug = categorySlug
          .replace(/ş/g, 's')
          .replace(/ğ/g, 'g')
          .replace(/ü/g, 'u')
          .replace(/ö/g, 'o')
          .replace(/ç/g, 'c')
          .replace(/ı/g, 'i')
          .replace(/İ/g, 'i')
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '');
        
        console.log('📂 Category param:', categoryParam, '-> slug:', categorySlug);
        params.category = categorySlug;
      }
      if (locationParam) {
        params.location = locationParam;
        console.log('📍 Location filter:', locationParam);
      }
      if (minPriceParam) {
        params.minPrice = minPriceParam;
      }
      if (maxPriceParam) {
        params.maxPrice = maxPriceParam;
      }
      if (featured === 'true') {
        params.featured = true;
      }
      if (sort) {
        params.sort = sort;
      }

      console.log('🔍 ProductsPage - API params:', params);
      // getProducts metodu tüm parametreleri destekliyor (featured, search, category, sort, location, minPrice, maxPrice)
      const response = await productsAPI.getProducts(params);
      
      if (response?.products) {
        setProducts(response.products);
      } else if (Array.isArray(response)) {
        setProducts(response);
      }
    } catch (err: any) {
      setError(err.message || 'Ürünler yüklenirken bir hata oluştu');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product: Product) => {
    // Giriş kontrolü - eğer kullanıcı giriş yapmamışsa login sayfasına yönlendir
    if (!user) {
      console.log('⚠️ User not logged in, redirecting to login...');
      navigate('/login', { 
        state: { 
          from: `/product/${product._id || product.id}`,
          message: 'Ürün detaylarını görmek için lütfen giriş yapın'
        } 
      });
      return;
    }

    // MongoDB ObjectId'yi string'e çevir
    let productId = product._id || product.id;
    
    // Eğer ObjectId objesi ise, toString() kullan
    if (productId && typeof productId === 'object' && 'toString' in productId) {
      productId = (productId as any).toString();
    }
    
    // String'e çevir
    productId = String(productId);
    
    console.log('🔍 Product clicked:', {
      product,
      _id: product._id,
      id: product.id,
      productId,
      title: product.title
    });
    
    if (productId && productId !== 'undefined' && productId !== 'null') {
      navigate(`/product/${productId}`);
    } else {
      console.error('❌ Invalid product ID:', product);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Ürünler</h1>
          
          {/* Active Filters */}
          {(searchParams.get('search') || searchParams.get('category') || searchParams.get('location') || searchParams.get('minPrice') || searchParams.get('maxPrice')) && (
            <div className="flex flex-wrap gap-2">
              {searchParams.get('search') && (
                <span className="px-3 py-1 bg-primary text-white rounded-full text-sm font-medium">
                  Arama: {searchParams.get('search')}
                </span>
              )}
              {searchParams.get('category') && (
                <span className="px-3 py-1 bg-primary text-white rounded-full text-sm font-medium">
                  Kategori: {searchParams.get('category')}
                </span>
              )}
              {searchParams.get('location') && (
                <span className="px-3 py-1 bg-primary text-white rounded-full text-sm font-medium">
                  Şehir: {searchParams.get('location')}
                </span>
              )}
              {(searchParams.get('minPrice') || searchParams.get('maxPrice')) && (
                <span className="px-3 py-1 bg-primary text-white rounded-full text-sm font-medium">
                  Fiyat: {searchParams.get('minPrice') || '0'} - {searchParams.get('maxPrice') || '∞'} TL
                </span>
              )}
            </div>
          )}
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
            <p className="text-gray-500 text-lg">Ürün bulunamadı</p>
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

export default ProductsPage;
