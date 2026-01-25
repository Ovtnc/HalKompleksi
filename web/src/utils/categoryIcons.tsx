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
  
  // Icon mapping - Backend kategorilerine göre güncellendi
  // Kategoriler: meyve, sebze, gıda, nakliye, kasa, zirai ilaç, ambalaj, indir-bindir, emlak, araç
  const iconMap: Record<string, React.ReactElement> = {
    // Ana kategoriler (backend'den gelen icon isimleri)
    'leaf': <IoLeafOutline size={size} />, // Meyve
    'nutrition': <IoNutritionOutline size={size} />, // Sebze
    'basket': <IoRestaurantOutline size={size} />, // Gıda - restaurant icon daha uygun
    'car': <IoCarOutline size={size} />, // Nakliye
    'cube': <IoCubeOutline size={size} />, // Kasa
    'medical': <IoMedicalOutline size={size} />, // Zirai İlaç
    'archive': <IoArchiveOutline size={size} />, // Ambalaj
    'people': <IoPeopleOutline size={size} />, // İndir-Bindir
    'home': <IoHomeOutline size={size} />, // Emlak
    'car-sport': <IoCarSportOutline size={size} />, // Araç
    'carsport': <IoCarSportOutline size={size} />,
    
    // Kategori slug'ları için direkt mapping (backend'deki id'ler)
    'meyve': <IoLeafOutline size={size} />,
    'sebze': <IoNutritionOutline size={size} />,
    'gida': <IoRestaurantOutline size={size} />,
    'nakliye': <IoCarOutline size={size} />,
    'kasa': <IoCubeOutline size={size} />,
    'zirai-ilac': <IoMedicalOutline size={size} />,
    'zirai_ilac': <IoMedicalOutline size={size} />,
    'ambalaj': <IoArchiveOutline size={size} />,
    'indir-bindir': <IoPeopleOutline size={size} />,
    'indir_bindir': <IoPeopleOutline size={size} />,
    'emlak': <IoHomeOutline size={size} />,
    'arac': <IoCarSportOutline size={size} />,
    
    // Alternatif icon isimleri (geriye dönük uyumluluk)
    'restaurant': <IoRestaurantOutline size={size} />,
    'fast-food': <IoFastFoodOutline size={size} />,
    'fastfood': <IoFastFoodOutline size={size} />,
    'cart': <IoCartOutline size={size} />,
    'medkit': <IoMedkitOutline size={size} />,
    
    // Eski kategoriler (geriye dönük uyumluluk)
    'grain': <IoNutritionOutline size={size} />,
    'seedling': <IoLeafOutline size={size} />,
    'tree': <IoNutritionOutline size={size} />,
    'droplet': <IoFlowerOutline size={size} />,
    'heart': <IoHeartOutline size={size} />,
    'flower': <IoFlowerOutline size={size} />,
    'egg': <IoEggOutline size={size} />,
    'water': <IoWaterOutline size={size} />,
    'flame': <IoFlameOutline size={size} />,
    'flask': <IoFlaskOutline size={size} />,
    'paw': <IoPawOutline size={size} />,
    'construct': <IoConstructOutline size={size} />,
    'ellipse': <IoEllipseOutline size={size} />,
    
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

