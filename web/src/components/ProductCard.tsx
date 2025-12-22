import { Product } from '../types';
import { getPrimaryImage } from '../utils/imageUtils';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

const ProductCard = ({ product, onClick }: ProductCardProps) => {
  const primaryImage = getPrimaryImage(product.images);
  
  // Debug: Log image data
  if (product.images && product.images.length > 0) {
    console.log('🖼️ ProductCard - Product:', product.title);
    console.log('🖼️ ProductCard - Raw images:', product.images);
    console.log('🖼️ ProductCard - Primary image URL:', primaryImage);
  }

  const price = product.price || 0;
  const views = product.views || 0;
  const favorites = Array.isArray((product as any).favorites) 
    ? (product as any).favorites.length 
    : (typeof product.favorites === 'number' ? product.favorites : 0);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg hover:border-primary transition-all group"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            📦
          </div>
        )}
        
        {/* Stats overlay */}
        <div className="absolute top-2 right-2 flex gap-2">
          <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            👁️ {views}
          </span>
          <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            ❤️ {favorites}
          </span>
        </div>

        {/* Availability badge */}
        {!product.isAvailable && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            Tükendi
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">
          {product.title}
        </h3>
        
        {product.location && (
          <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
            <span>📍</span>
            {typeof product.location === 'string' 
              ? product.location 
              : (product.location as any)?.city 
                ? `${(product.location as any).city}${(product.location as any).district ? ` ${(product.location as any).district}` : ''}`
                : String(product.location)
            }
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            {price.toLocaleString('tr-TR')} TL
          </span>
          {product.isAvailable && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
              Mevcut
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
