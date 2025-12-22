import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { productsAPI, categoriesAPI, locationsAPI, uploadAPI } from '../services/api';
import { Category } from '../types';
import {
  IoArrowBack,
  IoImageOutline,
  IoCloseOutline,
  IoCheckmarkCircleOutline
} from 'react-icons/io5';

// Kategoriler
const categories = [
  { id: 'meyve', name: 'Meyve', icon: '🍇' },
  { id: 'sebze', name: 'Sebze', icon: '🥬' },
  { id: 'gida', name: 'Gıda', icon: '🍔' },
  { id: 'nakliye', name: 'Nakliye', icon: '🚚' },
  { id: 'kasa', name: 'Kasa', icon: '📦' },
  { id: 'zirai_ilac', name: 'Zirai İlaç', icon: '💊' },
  { id: 'ambalaj', name: 'Ambalaj', icon: '📋' },
  { id: 'indir_bindir', name: 'İndir-Bindir', icon: '👷' },
  { id: 'emlak', name: 'Emlak', icon: '🏠' },
  { id: 'arac', name: 'Araç', icon: '🚗' },
];

// Kategori-spesifik alanlar
const categoryFields: Record<string, any> = {
  meyve: {
    unit: ['kg', 'ton', 'kasa', 'paket'],
    hasStock: true,
    hasUnit: true,
    fields: [
      { key: 'variety', label: 'Çeşit', type: 'text', placeholder: 'Örn: Amasya Elması' },
      { key: 'harvest', label: 'Hasat Tarihi', type: 'date' },
      { key: 'organic', label: 'Organik', type: 'boolean' },
      { key: 'coldStorage', label: 'Soğuk Hava Deposunda mı?', type: 'boolean' },
    ]
  },
  sebze: {
    unit: ['kg', 'ton', 'kasa', 'paket'],
    hasStock: true,
    hasUnit: true,
    fields: [
      { key: 'variety', label: 'Çeşit', type: 'text', placeholder: 'Örn: Domates Çeşidi' },
      { key: 'harvest', label: 'Hasat Tarihi', type: 'date' },
      { key: 'organic', label: 'Organik', type: 'boolean' },
      { key: 'coldStorage', label: 'Soğuk Hava Deposunda mı?', type: 'boolean' },
    ]
  },
  gida: {
    unit: ['kg', 'ton', 'litre', 'kasa', 'paket', 'adet', 'şişe', 'teneke'],
    hasStock: true,
    hasUnit: true,
    fields: [
      { key: 'productType', label: 'Gıda Tipi', type: 'select', options: ['Bakliyat', 'Kuruyemiş', 'Zeytin', 'Zeytinyağı', 'Paketli Gıda', 'Diğer'] },
      { key: 'productionDate', label: 'Üretim Tarihi', type: 'date', optional: true },
      { key: 'brand', label: 'Marka (Sadece Paketli Gıda için zorunlu)', type: 'text', placeholder: 'Marka adı', conditional: true },
      { key: 'expiryDate', label: 'Son Kullanma Tarihi (Sadece Paketli Gıda için zorunlu)', type: 'date', conditional: true },
    ]
  },
  nakliye: {
    unit: ['km', 'adet', 'gün'],
    hasStock: false,
    hasUnit: true,
    fields: [
      { key: 'vehicleType', label: 'Araç Tipi', type: 'select', options: ['Kamyon', 'Tır', 'Minibüs', 'Otobüs', 'Diğer'] },
      { key: 'capacity', label: 'Kapasite (Ton)', type: 'number' },
      { key: 'route', label: 'Güzergah', type: 'text', placeholder: 'Nereden - Nereye' },
      { key: 'availability', label: 'Müsaitlik Durumu', type: 'select', options: ['Hemen', '1 Hafta İçinde', '1 Ay İçinde', 'Belirli Tarihler'] },
    ]
  },
  kasa: {
    unit: ['adet', 'kasa', 'takım'],
    hasStock: true,
    hasUnit: true,
    fields: [
      { key: 'material', label: 'Malzeme', type: 'select', options: ['Ahşap', 'Plastik', 'Karton', 'Metal', 'Diğer'] },
      { key: 'size', label: 'Boyut', type: 'text', placeholder: 'Örn: 50x30x20 cm' },
      { key: 'condition', label: 'Durum', type: 'select', options: ['Sıfır', 'İkinci El', 'Tamir Gerekiyor'] },
    ]
  },
  zirai_ilac: {
    unit: ['litre', 'kg', 'adet', 'kutu'],
    hasStock: true,
    hasUnit: true,
    fields: [
      { key: 'brand', label: 'Marka', type: 'text', placeholder: 'İlaç Markası' },
      { key: 'productName', label: 'İlaç Adı', type: 'text', placeholder: 'Örn: Herbisit, Fungisit' },
    ]
  },
  ambalaj: {
    unit: ['adet', 'rol', 'kutu', 'metre'],
    hasStock: true,
    hasUnit: true,
    fields: [
      { key: 'material', label: 'Malzeme', type: 'select', options: ['Plastik', 'Kağıt', 'Karton', 'Cam', 'Metal'] },
      { key: 'size', label: 'Boyut', type: 'text', placeholder: 'Örn: 25x15x10 cm' },
      { key: 'color', label: 'Renk', type: 'text', placeholder: 'Örn: Şeffaf, Mavi' },
      { key: 'quality', label: 'Kalite', type: 'select', options: ['A', 'B', 'C', 'Premium'] },
    ]
  },
  indir_bindir: {
    unit: ['kişi', 'saat', 'gün'],
    hasStock: false,
    hasUnit: true,
    fields: [
      { key: 'workerCount', label: 'İşçi Sayısı', type: 'number' },
      { key: 'experience', label: 'Deneyim', type: 'select', options: ['Yeni Başlayan', 'Deneyimli', 'Uzman'] },
      { key: 'equipment', label: 'Ekipman', type: 'text', placeholder: 'Örn: Forklift, Vinç' },
      { key: 'availability', label: 'Müsaitlik', type: 'select', options: ['Hemen', '1 Hafta İçinde', 'Belirli Tarihler'] },
    ]
  },
  emlak: {
    unit: [],
    hasStock: false,
    hasUnit: false,
    fields: [
      { key: 'propertyType', label: 'Emlak Tipi', type: 'select', options: ['Arsa', 'Dükkan', 'Ofis', 'Depo', 'Fabrika', 'Ev'] },
      { key: 'area', label: 'Alan (m²)', type: 'number' },
      { key: 'floor', label: 'Kat', type: 'number' },
      { key: 'rooms', label: 'Oda Sayısı', type: 'number' },
      { key: 'age', label: 'Yaş', type: 'number', placeholder: 'Bina yaşı (yıl)' },
      { key: 'heating', label: 'Isıtma', type: 'select', options: ['Doğalgaz', 'Kömür', 'Elektrik', 'Güneş Enerjisi', 'Yok'] },
      { key: 'rentalType', label: 'Kiralama Tipi', type: 'select', options: ['Satılık', 'Kiralık', 'Satılık/Kiralık'] },
    ]
  },
  arac: {
    unit: [],
    hasStock: false,
    hasUnit: false,
    fields: [
      { key: 'brand', label: 'Marka', type: 'text', placeholder: 'Örn: Ford, Mercedes' },
      { key: 'model', label: 'Model', type: 'text', placeholder: 'Örn: Transit, Sprinter' },
      { key: 'year', label: 'Model Yılı', type: 'number' },
      { key: 'km', label: 'Kilometre', type: 'number' },
      { key: 'fuelType', label: 'Yakıt Tipi', type: 'select', options: ['Benzin', 'Dizel', 'Elektrik', 'Hibrit', 'LPG'] },
      { key: 'transmission', label: 'Vites', type: 'select', options: ['Manuel', 'Otomatik', 'Yarı Otomatik'] },
      { key: 'condition', label: 'Durum', type: 'select', options: ['Sıfır', 'İkinci El', 'Hasar Kayıtlı'] },
      { key: 'rentalType', label: 'Kiralama Tipi', type: 'select', options: ['Satılık', 'Kiralık', 'Günlük Kiralık'] },
    ]
  },
};

const AddProductPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    unit: 'kg',
    category: '',
    city: '',
    district: '',
    images: [] as Array<{ url: string; isPrimary: boolean }>,
    categoryData: {} as any,
  });

  useEffect(() => {
    if (!user || (user.activeRole !== 'seller' && !user.userRoles?.includes('seller'))) {
      navigate('/profile');
      return;
    }
    
    loadCategories();
    loadCities();
  }, [user, navigate]);

  const loadCategories = async () => {
    try {
      await categoriesAPI.getCategories();
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadCities = async () => {
    try {
      console.log('🏙️ Loading cities from API...');
      const response = await locationsAPI.getCities();
      console.log('🏙️ Cities API response:', response);
      
      if (response.cities && Array.isArray(response.cities)) {
        if (response.cities.length === 0) {
          console.warn('⚠️ API returned empty cities array. Please ensure cities are loaded in the database.');
          alert('Şehirler yüklenemedi. Lütfen yöneticiye başvurun.');
          return;
        }
        setCities(response.cities);
        console.log(`✅ Cities loaded from API: ${response.cities.length} cities`);
        
        if (response.cities.length < 81) {
          console.warn(`⚠️ Expected 81 cities but got ${response.cities.length}. Some cities may be missing.`);
        }
      } else if (Array.isArray(response)) {
        if (response.length === 0) {
          console.warn('⚠️ API returned empty array. Please ensure cities are loaded in the database.');
          alert('Şehirler yüklenemedi. Lütfen yöneticiye başvurun.');
          return;
        }
        setCities(response);
        console.log(`✅ Cities loaded from API (array): ${response.length} cities`);
      } else {
        console.error('❌ Unexpected cities response format:', response);
        alert('Şehirler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
      }
    } catch (error: any) {
      console.error('❌ Error loading cities from API:', error);
      alert(`Şehirler yüklenemedi: ${error.message || 'Bilinmeyen hata'}. Lütfen yöneticiye başvurun.`);
    }
  };

  const loadDistricts = async (cityName: string) => {
    try {
      console.log('🏙️ Loading districts for city:', cityName);
      const response = await locationsAPI.getDistricts(cityName);
      console.log('🏙️ Districts response:', response);
      
      if (Array.isArray(response)) {
        setDistricts(response);
        console.log('✅ Districts loaded:', response.length);
      } else if (response.districts && Array.isArray(response.districts)) {
        setDistricts(response.districts);
        console.log('✅ Districts loaded (nested):', response.districts.length);
      } else {
        setDistricts([]);
        console.log('⚠️ No districts found for city:', cityName);
      }
    } catch (error: any) {
      console.error('❌ Error loading districts:', error);
      setDistricts([]);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    const categoryConfig = categoryFields[categoryId];
    setFormData(prev => ({
      ...prev,
      category: categoryId,
      unit: categoryConfig?.unit?.[0] || 'kg',
      categoryData: {} // Reset category data when category changes
    }));
  };

  const updateCategoryData = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      categoryData: {
        ...prev.categoryData,
        [key]: value
      }
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    try {
      const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
      
      if (imageFiles.length === 0) {
        alert('Lütfen geçerli bir resim dosyası seçin');
        return;
      }

      // Upload images one by one
      const uploadedImages: Array<{ url: string; isPrimary: boolean }> = [];
      for (const file of imageFiles) {
        try {
          console.log('📤 Uploading image:', file.name);
          const result = await uploadAPI.uploadImage(file);
          console.log('✅ Image uploaded:', result.url);
          
          uploadedImages.push({
            url: result.url || result.imageUrl,
            isPrimary: uploadedImages.length === 0 // First image is primary
          });
        } catch (error: any) {
          console.error('❌ Error uploading image:', error);
          alert(`Resim yüklenirken hata oluştu: ${file.name} - ${error.message || 'Bilinmeyen hata'}`);
        }
      }

      if (uploadedImages.length > 0) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...uploadedImages]
        }));
        console.log('✅ All images uploaded successfully');
      }
    } catch (error: any) {
      console.error('❌ Error in handleImageUpload:', error);
      alert(`Resim yüklenirken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
    } finally {
      setLoading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    // Basic validations
    if (!formData.title.trim()) {
      alert('Ürün başlığı gerekli');
      return false;
    }
    if (formData.title.trim().length < 3) {
      alert('Başlık en az 3 karakter olmalı');
      return false;
    }
    if (!formData.description.trim()) {
      alert('Ürün açıklaması gerekli');
      return false;
    }
    if (formData.description.trim().length < 10) {
      alert('Açıklama en az 10 karakter olmalı');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert('Geçerli bir fiyat girin');
      return false;
    }
    if (!formData.category) {
      alert('Kategori seçin');
      return false;
    }
    if (!formData.city) {
      alert('Şehir seçin');
      return false;
    }

    // Category-specific validations
    const categoryConfig = categoryFields[formData.category];
    if (categoryConfig?.fields) {
      for (const field of categoryConfig.fields) {
        // Skip optional fields
        if (field.optional) continue;
        
        // Skip boolean fields (they have default values)
        if (field.type === 'boolean') continue;
        
        // Handle conditional fields (e.g., brand/expiryDate for Paketli Gıda)
        if (field.conditional) {
          if (formData.category === 'gida') {
            const productType = formData.categoryData['productType'];
            if (productType !== 'Paketli Gıda') {
              continue; // Skip if not Paketli Gıda
            }
          } else {
            continue;
          }
        }
        
        const value = formData.categoryData[field.key];
        
        if (field.type === 'number') {
          if (!value || value === '' || isNaN(Number(value))) {
            alert(`${field.label} gerekli`);
            return false;
          }
        } else if (field.type === 'text') {
          if (!value || !String(value).trim()) {
            alert(`${field.label} gerekli`);
            return false;
          }
        } else if (field.type === 'select') {
          if (!value || value === '') {
            alert(`${field.label} seçimi gerekli`);
            return false;
          }
        } else if (field.type === 'date') {
          if (!value || value === '') {
            alert(`${field.label} gerekli`);
            return false;
          }
        }
      }
    }

    // Stock validation for categories that require it
    if (categoryConfig?.hasStock) {
      if (!formData.stock || parseInt(formData.stock) < 0 || isNaN(parseInt(formData.stock))) {
        alert('Geçerli bir stok miktarı girin');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Clean categoryData - remove empty values
      const cleanedCategoryData: any = {};
      Object.keys(formData.categoryData).forEach(key => {
        const value = formData.categoryData[key];
        if (value !== null && value !== undefined && value !== '') {
          cleanedCategoryData[key] = value;
        }
      });
      
      // Prepare product data
      const productData: any = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        isAvailable: true,
        location: {
          city: formData.city,
          district: formData.district || undefined,
        },
        categoryData: cleanedCategoryData,
      };

      if (categoryFields[formData.category]?.hasStock) {
        productData.stock = parseFloat(formData.stock) || 0;
      }

      if (categoryFields[formData.category]?.hasUnit) {
        productData.unit = formData.unit;
      }

      if (formData.images.length > 0) {
        // Images are already uploaded, use the URLs from server
        productData.images = formData.images;
      }

      console.log('Creating product:', productData);
      
      const response = await productsAPI.createProduct(productData);
      
      if (response.product || response) {
        alert('Ürün başarıyla eklendi!');
        navigate('/seller/products');
      }
    } catch (error: any) {
      console.error('Error creating product:', error);
      const errorMessage = error.message || 'Bilinmeyen hata';
      alert(`Ürün eklenirken bir hata oluştu: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const selectedCategoryConfig = formData.category ? categoryFields[formData.category] : null;
  const showStock = selectedCategoryConfig?.hasStock !== false;
  const showUnit = selectedCategoryConfig?.hasUnit !== false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/seller/products')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              <IoArrowBack className="w-5 h-5" />
              <span>Geri</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Yeni Ürün Ekle</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Kategori Seçimi <span className="text-red-500">*</span></h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.category === cat.id
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{cat.icon}</div>
                  <div className="font-medium text-gray-900">{cat.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Category-Specific Fields */}
          {formData.category && selectedCategoryConfig?.fields && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                {categories.find(c => c.id === formData.category)?.name} Detayları
              </h2>
              
              <div className="space-y-4">
                {selectedCategoryConfig.fields.map((field: any) => {
                  // Conditional field check (e.g., brand/expiryDate for Paketli Gıda)
                  if (field.conditional) {
                    if (formData.category === 'gida') {
                      const productType = formData.categoryData['productType'];
                      if (productType !== 'Paketli Gıda') {
                        return null; // Don't show if not Paketli Gıda
                      }
                    } else {
                      return null;
                    }
                  }

                  return (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label} {!field.optional && <span className="text-red-500">*</span>}
                      </label>
                      
                      {field.type === 'text' && (
                        <input
                          type="text"
                          value={formData.categoryData[field.key] || ''}
                          onChange={(e) => updateCategoryData(field.key, e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder={field.placeholder || ''}
                          required={!field.optional}
                        />
                      )}
                      
                      {field.type === 'number' && (
                        <input
                          type="number"
                          value={formData.categoryData[field.key] || ''}
                          onChange={(e) => updateCategoryData(field.key, e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder={field.placeholder || ''}
                          required={!field.optional}
                        />
                      )}
                      
                      {field.type === 'select' && (
                        <select
                          value={formData.categoryData[field.key] || ''}
                          onChange={(e) => updateCategoryData(field.key, e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                          required={!field.optional}
                        >
                          <option value="">Seçin...</option>
                          {field.options.map((option: string) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      )}
                      
                      {field.type === 'boolean' && (
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => updateCategoryData(field.key, !formData.categoryData[field.key])}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
                              formData.categoryData[field.key]
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-gray-300 bg-white text-gray-700'
                            }`}
                          >
                            <IoCheckmarkCircleOutline className={`w-5 h-5 ${formData.categoryData[field.key] ? 'text-primary' : 'text-gray-400'}`} />
                            <span>{formData.categoryData[field.key] ? 'Evet' : 'Hayır'}</span>
                          </button>
                        </div>
                      )}
                      
                      {field.type === 'date' && (
                        <input
                          type="date"
                          value={formData.categoryData[field.key] || ''}
                          onChange={(e) => updateCategoryData(field.key, e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                          required={!field.optional}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Basic Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Temel Bilgiler</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ürün Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Örn: Domates"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={4}
                  placeholder="Ürün açıklaması..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fiyat (₺) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>

                {showUnit && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Birim
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      {selectedCategoryConfig?.unit?.map((unit: string) => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {showStock && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stok <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Stok miktarı"
                    required={showStock}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Konum</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şehir <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, city: e.target.value, district: '' }));
                    if (e.target.value) {
                      loadDistricts(e.target.value);
                    } else {
                      setDistricts([]);
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={cities.length === 0}
                  required
                >
                  <option value="">
                    {cities.length === 0 ? 'Şehirler yükleniyor...' : 'Şehir seçin'}
                  </option>
                  {cities.map((city) => {
                    const cityName = typeof city === 'string' ? city : (city.name || '');
                    const cityId = typeof city === 'string' ? city : (city._id || city.id || cityName);
                    return (
                      <option key={cityId} value={cityName}>
                        {cityName}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İlçe
                </label>
                {formData.city ? (
                  districts.length > 0 ? (
                    <select
                      value={formData.district}
                      onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">İlçe seçin (opsiyonel)</option>
                      {districts.map((district) => {
                        const districtName = district.name || '';
                        const districtId = district._id || district.id || districtName;
                        return (
                          <option key={districtId} value={districtName}>
                            {districtName}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <div className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500 text-sm">
                      İlçeler yükleniyor...
                    </div>
                  )
                ) : (
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="İlçe (opsiyonel - önce şehir seçin)"
                    disabled={!formData.city}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Görseller</h2>
            
            <div className="space-y-4">
              <div className="flex gap-4 flex-wrap">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={typeof img === 'string' ? img : img.url}
                      alt={`Upload ${index + 1}`}
                      className="w-32 h-32 object-cover rounded-xl border border-gray-200"
                      onError={(e) => {
                        console.error('Image load error:', img);
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128x128?text=Image+Error';
                      }}
                    />
                    {img.isPrimary && (
                      <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full font-semibold">
                        Ana
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      <IoCloseOutline className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <IoImageOutline className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Görsel ekle</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/seller/products')}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Ekleniyor...</span>
                </>
              ) : (
                <>
                  <IoCheckmarkCircleOutline className="w-5 h-5" />
                  <span>Ürünü Ekle</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductPage;
