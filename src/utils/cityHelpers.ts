// City data normalization helper
// Bu dosya tüm ekranlarda şehir verisini aynı formatta kullanmak için

export interface NormalizedCity {
  id: string;
  _id: string;  // Backend compatibility
  name: string;
  code?: string;
  icon?: string;
}

/**
 * API'den gelen şehir verisini normalize et
 * Tüm ekranlarda kullanılabilir standart format
 */
export const normalizeCities = (data: any): NormalizedCity[] => {
  try {
    // API response'u normalize et
    const arr = Array.isArray(data) ? data : (data?.cities || []);
    
    return arr.map((city: any, index: number) => {
      // String ise
      if (typeof city === 'string') {
        const cityId = city.toLowerCase().replace(/[^a-z0-9]/g, '_');
        return {
          id: cityId,
          _id: cityId,
          name: city,
          icon: 'location-outline'
        };
      }
      
      // Object ise
      const cityId = city._id || city.id || city.code || city.name || `city_${index}`;
      return {
        id: cityId,
        _id: cityId,
        name: city.name || String(city),
        code: city.code,
        icon: city.icon || 'location-outline'
      };
    });
  } catch (error) {
    console.error('Error normalizing cities:', error);
    return [];
  }
};

/**
 * "Tüm Şehirler" seçeneği ekle
 */
export const addAllCitiesOption = (cities: NormalizedCity[]): NormalizedCity[] => {
  const allOption: NormalizedCity = {
    id: 'all',
    _id: 'all',
    name: 'Tüm Şehirler',
    icon: 'globe-outline'
  };
  
  return [allOption, ...cities];
};

/**
 * Fallback şehir listesi (API çalışmazsa)
 */
export const CITY_FALLBACK = [
  'İstanbul',
  'Ankara',
  'İzmir',
  'Bursa',
  'Antalya',
  'Adana',
  'Konya',
  'Gaziantep',
  'Şanlıurfa',
  'Mersin',
  'Kayseri',
  'Eskişehir',
  'Diyarbakır',
  'Samsun',
  'Denizli',
  'Trabzon',
  'Malatya',
  'Kahramanmaraş',
  'Erzurum',
  'Van'
];

/**
 * Fallback şehir listesini normalize et
 */
export const getFallbackCities = (): NormalizedCity[] => {
  return normalizeCities(CITY_FALLBACK);
};

