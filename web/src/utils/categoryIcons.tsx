import React from 'react';
import { 
  IoLeafOutline, 
  IoNutritionOutline, 
  IoRestaurantOutline, 
  IoFastFoodOutline,
  IoCartOutline,
  IoCarOutline,
  IoCubeOutline,
  IoMedicalOutline,
  IoArchiveOutline,
  IoPeopleOutline,
  IoHomeOutline,
  IoCarSportOutline,
  IoGridOutline,
  IoFlowerOutline,
  IoEggOutline,
  IoWaterOutline,
  IoFlameOutline,
  IoFlaskOutline,
  IoPawOutline,
  IoConstructOutline,
  IoMedkitOutline,
  IoEllipseOutline,
  IoHeartOutline
} from 'react-icons/io5';

// Icon mapping function
export const getCategoryIcon = (iconName?: string, size: number = 24) => {
  if (!iconName) {
    console.warn('⚠️ Category icon is missing, using default');
    return <IoGridOutline size={size} />;
  }

  // Normalize icon name: lowercase, trim, replace spaces and underscores with hyphens
  const icon = iconName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/_/g, '-');
  
  // Icon mapping - mobil uygulamadaki icon mapping ile aynı
  // Mobil uygulamada Ionicons kullanılıyor, web'de react-icons/io5 kullanıyoruz
  // Her ikisi de aynı icon setini kullanıyor (Ionicons)
  const iconMap: Record<string, React.ReactElement> = {
    // Temel kategoriler (mobil uygulamadan)
    'leaf': <IoLeafOutline size={size} />,
    'nutrition': <IoNutritionOutline size={size} />,
    'restaurant': <IoRestaurantOutline size={size} />,
    'fast-food': <IoFastFoodOutline size={size} />,
    'fastfood': <IoFastFoodOutline size={size} />,
    'basket': <IoCartOutline size={size} />,
    'cart': <IoCartOutline size={size} />,
    'car': <IoCarOutline size={size} />,
    'cube': <IoCubeOutline size={size} />,
    'medical': <IoMedicalOutline size={size} />,
    'medkit': <IoMedkitOutline size={size} />,
    'archive': <IoArchiveOutline size={size} />,
    'people': <IoPeopleOutline size={size} />,
    'home': <IoHomeOutline size={size} />,
    'car-sport': <IoCarSportOutline size={size} />,
    'carsport': <IoCarSportOutline size={size} />,
    
    // Backend'den gelen yeni kategoriler - isimlere uygun iconlar
    'grain': <IoNutritionOutline size={size} />, // Tahıl - beslenme/nutrition iconu uygun
    'seedling': <IoLeafOutline size={size} />, // Bakliyat - yaprak iconu uygun (tohum/filiz)
    'tree': <IoNutritionOutline size={size} />, // Kuruyemiş - beslenme iconu daha uygun (besin değeri yüksek)
    'droplet': <IoFlowerOutline size={size} />, // Zeytin - çiçek iconu uygun (zeytin ağacı çiçeği)
    'heart': <IoHeartOutline size={size} />, // Organik - kalp iconu uygun (sağlıklı/organik)
    
    // Ek kategoriler (görüntüdeki kategorilere göre)
    'flower': <IoFlowerOutline size={size} />, // Bal için
    'egg': <IoEggOutline size={size} />, // Et & Süt için alternatif
    'water': <IoWaterOutline size={size} />,
    'flame': <IoFlameOutline size={size} />, // Baharat için
    'flask': <IoFlaskOutline size={size} />,
    'paw': <IoPawOutline size={size} />, // Hayvancılık için
    'construct': <IoConstructOutline size={size} />, // Hizmet, İndir-Bindir için
    'ellipse': <IoEllipseOutline size={size} />, // Diğer için
    
    // Default
    'default': <IoGridOutline size={size} />,
    'grid': <IoGridOutline size={size} />
  };

  const iconElement = iconMap[icon];
  
  if (!iconElement) {
    console.warn(`⚠️ Icon "${iconName}" (normalized: "${icon}") not found in iconMap, using default`);
    return iconMap['default'];
  }

  return iconElement;
};

// Icon component for direct use
export const CategoryIcon: React.FC<{ iconName?: string; size?: number; className?: string }> = ({ 
  iconName, 
  size = 24,
  className = ''
}) => {
  try {
    const icon = getCategoryIcon(iconName, size);
    return (
      <span className={`inline-flex items-center justify-center text-primary ${className}`}>
        {icon}
      </span>
    );
  } catch (error) {
    console.error('Error rendering category icon:', error, { iconName });
    return (
      <span className={`inline-flex items-center justify-center text-primary ${className}`}>
        <IoGridOutline size={size} />
      </span>
    );
  }
};

