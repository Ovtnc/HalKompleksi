import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
  FlatList,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { productsAPI, getAuthHeaders } from '../../services/api';
import * as ImagePicker from 'expo-image-picker';
import { ENV } from '../../config/env';
import { categoriesAPI } from '../../services/api';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

// Kategori renkleri ve ikonları (fallback)
const CATEGORY_UI: Record<string, { color: string; icon: any; name?: string }> = {
  meyve: { color: '#2ECC71', icon: 'leaf', name: 'Meyve' },
  sebze: { color: '#27AE60', icon: 'nutrition', name: 'Sebze' },
  gida: { color: '#E67E22', icon: 'basket', name: 'Gıda' },
  hayvancilik: { color: '#8E44AD', icon: 'paw', name: 'Hayvancılık' },
  tarim: { color: '#16A085', icon: 'leaf', name: 'Tarım' },
  hizmet: { color: '#3498DB', icon: 'construct', name: 'Hizmet' },
  emlak: { color: '#E74C3C', icon: 'home', name: 'Emlak' },
  arac: { color: '#95A5A6', icon: 'car', name: 'Araç' },
  nakliye: { color: '#3B82F6', icon: 'car', name: 'Nakliye' },
  kasa: { color: '#A855F7', icon: 'cube', name: 'Kasa' },
  zirai_ilac: { color: '#06B6D4', icon: 'medkit', name: 'Zirai İlaç' },
  ambalaj: { color: '#F59E0B', icon: 'cube', name: 'Ambalaj' },
  indir_bindir: { color: '#10B981', icon: 'construct', name: 'İndir-Bindir' },
  baharat: { color: '#D946EF', icon: 'flame', name: 'Baharat' },
  diger: { color: '#64748B', icon: 'ellipse', name: 'Diğer' },
};

// Kategoriye özel alanlar - AddProductScreen ile uyumlu
const categoryFields = {
  meyve: {
    unit: ['kg', 'ton', 'kasa', 'paket'],
    hasStock: true,
    hasUnit: true,
    priceType: 'per_unit',
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
    priceType: 'per_unit',
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
    priceType: 'per_unit',
    fields: [
      { key: 'productType', label: 'Gıda Tipi', type: 'select', options: ['Bakliyat','Kuruyemiş', 'Zeytin', 'Zeytinyağı', 'Paketli Gıda', 'Diğer'] },
      { key: 'productionDate', label: 'Üretim Tarihi', type: 'date', optional: true },
      { key: 'brand', label: 'Marka (Sadece Paketli Gıda için zorunlu)', type: 'text', placeholder: 'Marka adı', conditional: true },
      { key: 'expiryDate', label: 'Son Kullanma Tarihi (Sadece Paketli Gıda için zorunlu)', type: 'date', conditional: true },
    ]
  },
  nakliye: {
    unit: ['km', 'adet', 'gün'],
    hasStock: false,
    hasUnit: true,
    priceType: 'per_service',
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
    priceType: 'per_unit',
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
    priceType: 'per_unit',
    fields: [
      { key: 'brand', label: 'Marka', type: 'text', placeholder: 'İlaç Markası' },
      { key: 'productName', label: 'İlaç Adı', type: 'text', placeholder: 'Örn: Herbisit, Fungisit' },
    ]
  },
  ambalaj: {
    unit: ['adet', 'rol', 'kutu', 'metre'],
    hasStock: true,
    hasUnit: true,
    priceType: 'per_unit',
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
    priceType: 'per_service',
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
    priceType: 'per_property',
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
    priceType: 'per_vehicle',
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

const EditProductScreen = ({ navigation, route }: any) => {
  const { user } = useAuth();
  const { productId } = route.params;

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    unit: 'kg',
    category: '',
    city: '',
    district: '',
    media: [] as any[],
    categoryData: {} as any,
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentDateField, setCurrentDateField] = useState<string>('');

  // API state
  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const CITY_FALLBACK = [
    'Adana','Adıyaman','Afyonkarahisar','Ağrı','Aksaray','Amasya','Ankara','Antalya','Ardahan','Artvin','Aydın','Balıkesir','Bartın','Batman','Bayburt','Bilecik','Bingöl','Bitlis','Bolu','Burdur','Bursa','Çanakkale','Çankırı','Çorum','Denizli','Diyarbakır','Düzce','Edirne','Elazığ','Erzincan','Erzurum','Eskişehir','Gaziantep','Giresun','Gümüşhane','Hakkari','Hatay','Iğdır','Isparta','İstanbul','İzmir','Kahramanmaraş','Karabük','Karaman','Kars','Kastamonu','Kayseri','Kırıkkale','Kırklareli','Kırşehir','Kilis','Kocaeli','Konya','Kütahya','Malatya','Manisa','Mardin','Mersin','Muğla','Muş','Nevşehir','Niğde','Ordu','Osmaniye','Rize','Sakarya','Samsun','Siirt','Sinop','Sivas','Şanlıurfa','Şırnak','Tekirdağ','Tokat','Trabzon','Tunceli','Uşak','Van','Yalova','Yozgat','Zonguldak'
  ];

  // Load product data
  useEffect(() => {
    loadProductData();
  }, [productId]);

  // Load cities
  useEffect(() => {
    loadCities();
    loadCategories();
  }, []);

  // Load districts when city changes
  useEffect(() => {
    if (selectedCityId) {
      loadDistricts(undefined, selectedCityId);
    } else if (formData.city) {
      loadDistricts(formData.city);
    }
  }, [formData.city, selectedCityId]);

  const loadProductData = async () => {
    try {
      setInitialLoading(true);
      const product = await productsAPI.getProduct(productId);
      
      if (product) {
        let mediaArray = [];
        if (product.images && Array.isArray(product.images)) {
          mediaArray = product.images.map((img: any, index: number) => {
            let imageUrl = '';
            let imageType = 'image';
            let isPrimary = index === 0;
            
            if (typeof img === 'string') {
              imageUrl = img;
            } else if (img && typeof img === 'object') {
              imageUrl = img.url || img;
              imageType = img.type || 'image';
              isPrimary = img.isPrimary || index === 0;
            }
            
            if (imageUrl) {
              if (imageUrl.includes('localhost:5000')) {
                imageUrl = imageUrl.replace('localhost:5000', ENV.API_BASE_URL.replace('/api', ''));
              }
              if (imageUrl.startsWith('file://')) {
                imageUrl = '';
              }
            }
            
            return {
              url: imageUrl,
              type: imageType,
              isPrimary: isPrimary
            };
          }).filter(Boolean);
        }
        
        setFormData({
          title: product.title || '',
          description: product.description || '',
          price: product.price?.toString() || '',
          stock: product.stock?.toString() || '',
          unit: product.unit || 'kg',
          category: product.category || '',
          city: product.location?.city || '',
          district: product.location?.district || '',
          media: mediaArray,
          categoryData: product.categoryData || {},
        });
      }
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Hata', 'Ürün bilgileri yüklenemedi');
    } finally {
      setInitialLoading(false);
    }
  };

  const loadCities = async () => {
    try {
      setLoadingCities(true);
      const response = await fetch(`${ENV.API_BASE_URL}/locations/cities`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      // Normalize possible shapes
      const arr = Array.isArray(data) ? data : (data?.cities || []);
      const normalized = arr.map((c: any) => ({
        _id: c._id || c.id || c.code || c.name,
        name: c.name || String(c),
        code: c.code,
      }));
      if (normalized.length === 0) {
        setCities(CITY_FALLBACK.map((n, i) => ({ _id: String(i), name: n })));
      } else {
        setCities(normalized);
      }
    } catch (error) {
      console.error('Error loading cities:', error);
      // Fall back to static list to keep UI usable
      setCities(CITY_FALLBACK.map((n, i) => ({ _id: String(i), name: n })));
    } finally {
      setLoadingCities(false);
    }
  };

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const result = await categoriesAPI.getCategories();
      // result could be array of strings or objects
      const normalized = (Array.isArray(result) ? result : result?.categories || [])
        .map((item: any) => {
          const id = typeof item === 'string' ? item : (item.id || item._id || item.key || item.slug || item.name);
          const name = typeof item === 'string' ? (CATEGORY_UI[item]?.name || item) : (item.name || CATEGORY_UI[id]?.name || id);
          const ui = CATEGORY_UI[id] || { color: '#4CAF50', icon: 'pricetag' };
          return { id, name, color: ui.color, icon: ui.icon };
        })
        // backend enum ile uyumlu olanları tut
        .filter((c: any) => !!c.id);
      setCategories(normalized);
    } catch (e) {
      console.error('Error loading categories:', e);
      // Fallback: yerel kategori listesi
      const fallback = Object.keys(CATEGORY_UI).map(k => ({ id: k, name: CATEGORY_UI[k].name || k, color: CATEGORY_UI[k].color, icon: CATEGORY_UI[k].icon }));
      setCategories(fallback);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadDistricts = async (cityName?: string, cityId?: string) => {
    try {
      setLoadingDistricts(true);
      let response: Response | null = null;
      if (cityId) {
        console.log('🏙️ Loading districts by city ID:', cityId);
        response = await fetch(`${ENV.API_BASE_URL}/locations/cities/${cityId}/districts`);
      } else if (cityName) {
        console.log('🏙️ Loading districts by city name:', cityName);
        response = await fetch(`${ENV.API_BASE_URL}/locations/districts?city=${encodeURIComponent(cityName)}`);
      }
      if (!response) throw new Error('City info missing');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const arr = Array.isArray(data) ? data : (data?.districts || []);
      setDistricts(arr || []);
    } catch (error) {
      console.error('Error loading districts:', error);
      setDistricts([]);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const handleCategorySelect = (category: any) => {
    setFormData({ ...formData, category: category.id });
    setShowCategoryModal(false);
  };

  const handleCitySelect = (city: any) => {
    setFormData({ ...formData, city: city.name, district: '' });
    setSelectedCityId(city._id || city.id || null);
    setDistricts([]);
    setShowCityModal(false);
  };

  const handleDistrictSelect = (district: any) => {
    setFormData({ ...formData, district: district.name });
    setShowDistrictModal(false);
  };

  const updateCategoryData = (key: string, value: any) => {
    setFormData({
      ...formData,
      categoryData: {
        ...formData.categoryData,
        [key]: value
      }
    });
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setLoading(true);
        try {
          // Upload image to server
          const uploadFormData = new FormData();
          uploadFormData.append('image', {
            uri: result.assets[0].uri,
            type: 'image/jpeg',
            name: 'image.jpg',
          } as any);

          // Get auth headers without Content-Type (FormData will set it automatically with boundary)
          const authHeaders = await getAuthHeaders();
          // Remove Content-Type from auth headers - FormData needs to set it automatically
          const { 'Content-Type': _, ...headersWithoutContentType } = authHeaders;
          
          // Check if token exists
          if (!headersWithoutContentType.Authorization) {
            Alert.alert('Oturum Hatası', 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
            return;
          }
          
          console.log('📤 Uploading image for edit...');
          
          const response = await fetch(`${ENV.API_BASE_URL}/upload/image`, {
            method: 'POST',
            headers: {
              ...headersWithoutContentType,
              // Don't set Content-Type - let fetch set it automatically with boundary for FormData
            },
            body: uploadFormData,
          });

          if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            try {
              errorData = JSON.parse(errorText);
            } catch {
              errorData = { message: errorText || 'Image upload failed' };
            }
            console.error('❌ Upload failed:', response.status, errorData);
            throw new Error(errorData.message || 'Image upload failed');
          }

          const uploadResult = await response.json();
          
          const newMedia = {
            url: uploadResult.url || uploadResult.path || result.assets[0].uri,
            type: 'image',
            isPrimary: formData.media.length === 0
          };
          
          setFormData({
            ...formData,
            media: [...formData.media, newMedia]
          });
          
          console.log('✅ Image uploaded successfully:', uploadResult.url);
        } catch (uploadError: any) {
          console.error('Error uploading image:', uploadError);
          Alert.alert('Hata', `Resim yüklenirken bir hata oluştu: ${uploadError.message || 'Bilinmeyen hata'}`);
        } finally {
          setLoading(false);
        }
      }
    } catch (error: any) {
      console.error('Error picking image:', error);
      Alert.alert('Hata', 'Resim seçilirken bir hata oluştu');
      setLoading(false);
    }
  };

  const removeMedia = (index: number) => {
    const newMedia = formData.media.filter((_, i) => i !== index);
    setFormData({ ...formData, media: newMedia });
  };

  const setPrimaryMedia = (index: number) => {
    const newMedia = formData.media.map((item, i) => ({
      ...item,
      isPrimary: i === index
    }));
    setFormData({ ...formData, media: newMedia });
  };

  const openDatePicker = (fieldKey: string) => {
    setCurrentDateField(fieldKey);
    setShowDatePicker(true);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Hata', 'Ürün başlığı gerekli');
      return false;
    }
    if (formData.title.trim().length < 3) {
      Alert.alert('Hata', 'Başlık en az 3 karakter olmalı');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Hata', 'Ürün açıklaması gerekli');
      return false;
    }
    if (formData.description.trim().length < 10) {
      Alert.alert('Hata', 'Açıklama en az 10 karakter olmalı');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert('Hata', 'Geçerli bir fiyat girin');
      return false;
    }
    if (!formData.category) {
      Alert.alert('Hata', 'Kategori seçin');
      return false;
    }
    if (!formData.city) {
      Alert.alert('Hata', 'Şehir seçin');
      return false;
    }
    if (!formData.district) {
      Alert.alert('Hata', 'İlçe seçin');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        unit: formData.unit,
        category: formData.category,
        location: {
          city: formData.city,
          district: formData.district
        },
        categoryData: formData.categoryData,
        images: formData.media
          .filter(item => !!item.url)
          .map(item => ({
            url: item.url,
            type: item.type || 'image',
            isPrimary: !!item.isPrimary,
          })),
      };

      await productsAPI.updateProduct(productId, updateData);
      
      Alert.alert(
        'Başarılı!',
        'Ürününüz başarıyla güncellendi.',
        [
          {
            text: 'Tamam',
            onPress: () => {
              if (navigation?.canGoBack?.()) {
                navigation.goBack();
              } else {
                navigation.navigate('MyProducts');
              }
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Error updating product:', error);
      Alert.alert('Hata', `Ürün güncellenirken bir hata oluştu: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedCategoryName = () => {
    const category = categories.find(cat => cat.id === formData.category);
    return category ? category.name : '';
  };

  const getSelectedCategoryColor = () => {
    const category = categories.find(cat => cat.id === formData.category);
    return category ? category.color : '#4CAF50';
  };

  const renderForm = () => (
    <View style={styles.formContent}>
      {/* Konum Bilgisi */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="location" size={24} color="#4CAF50" />
          <Text style={styles.cardTitle}>Konum</Text>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Şehir *</Text>
          <TouchableOpacity
            style={[styles.selectField, styles.selectFieldActive]}
            onPress={() => setShowCityModal(true)}
          >
            <Text style={[styles.selectText, !formData.city && styles.placeholderText]}>
              {formData.city || 'Şehir Seçin'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>İlçe *</Text>
          <TouchableOpacity
            style={[styles.selectField, !formData.city && styles.selectFieldDisabled]}
            onPress={() => formData.city && setShowDistrictModal(true)}
            disabled={!formData.city}
          >
            <Text style={[styles.selectText, !formData.city && styles.placeholderText, !formData.district && styles.placeholderText]}>
              {formData.district || 'İlçe Seçin'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={formData.city ? "#4CAF50" : "#CBD5E1"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Kategori */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="grid" size={24} color="#4CAF50" />
          <Text style={styles.cardTitle}>Kategori</Text>
        </View>
        <TouchableOpacity
          style={[styles.selectField, { borderColor: getSelectedCategoryColor() }]}
          onPress={() => setShowCategoryModal(true)}
        >
          <Text style={[styles.selectText, formData.category && { color: getSelectedCategoryColor() }]}>
            {getSelectedCategoryName() || 'Kategori Seçin'}
          </Text>
          <Ionicons name="chevron-down" size={20} color={getSelectedCategoryColor()} />
        </TouchableOpacity>
      </View>

      {/* Kategoriye Özel Bilgiler */}
      {formData.category && categoryFields[formData.category as keyof typeof categoryFields]?.fields && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={24} color="#4CAF50" />
            <Text style={styles.cardTitle}>Kategori Detayları</Text>
          </View>
          {categoryFields[formData.category as keyof typeof categoryFields].fields.map((field) => {
            if ((field as any).conditional && formData.category === 'gida') {
              const productType = formData.categoryData['productType'];
              if (productType !== 'Paketli Gıda') {
                return null;
              }
            }
            
            return (
              <View key={field.key} style={styles.inputGroup}>
                <Text style={styles.label}>
                  {field.label} {(field as any).conditional ? '' : '*'}
                </Text>
                
                {field.type === 'text' && (
                  <TextInput
                    style={styles.input}
                    placeholder={field.placeholder}
                    placeholderTextColor="#94A3B8"
                    value={formData.categoryData[field.key] || ''}
                    onChangeText={(text) => updateCategoryData(field.key, text)}
                  />
                )}
                
                {field.type === 'number' && (
                  <TextInput
                    style={styles.input}
                    placeholder={field.placeholder || '0'}
                    placeholderTextColor="#94A3B8"
                    value={formData.categoryData[field.key]?.toString() || ''}
                    onChangeText={(text) => updateCategoryData(field.key, text)}
                    keyboardType="numeric"
                  />
                )}
                
                {field.type === 'select' && (
                  <TouchableOpacity
                    style={styles.selectField}
                    onPress={() => {
                      Alert.alert(
                        field.label,
                        'Seçenek seçin:',
                        (field as any).options?.map((option: string) => ({
                          text: option,
                          onPress: () => updateCategoryData(field.key, option)
                        }))
                      );
                    }}
                  >
                    <Text style={[styles.selectText, !formData.categoryData[field.key] && styles.placeholderText]}>
                      {formData.categoryData[field.key] || 'Seçin...'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#4CAF50" />
                  </TouchableOpacity>
                )}
                
                {field.type === 'boolean' && (
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      formData.categoryData[field.key] && styles.toggleButtonActive
                    ]}
                    onPress={() => updateCategoryData(field.key, !formData.categoryData[field.key])}
                  >
                    <View style={styles.toggleContent}>
                      <Ionicons 
                        name={formData.categoryData[field.key] ? "checkmark-circle" : "ellipse-outline"} 
                        size={22} 
                        color={formData.categoryData[field.key] ? "#4CAF50" : "#94A3B8"} 
                      />
                      <Text style={[
                        styles.toggleText,
                        formData.categoryData[field.key] && styles.toggleTextActive
                      ]}>
                        {formData.categoryData[field.key] ? 'Evet' : 'Hayır'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                
                {field.type === 'date' && (
                  <TouchableOpacity
                    style={styles.selectField}
                    onPress={() => openDatePicker(field.key)}
                  >
                    <Text style={[styles.selectText, !formData.categoryData[field.key] && styles.placeholderText]}>
                      {formData.categoryData[field.key] || 'Tarih seçin...'}
                    </Text>
                    <Ionicons name="calendar" size={20} color="#4CAF50" />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      )}
      {/* Fiyat ve Stok - Üstte */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="cash" size={24} color="#4CAF50" />
          <Text style={styles.cardTitle}>Fiyat ve Stok</Text>
        </View>
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Fiyat (TL) *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#94A3B8"
              value={formData.price}
              onChangeText={(text) => setFormData({ ...formData, price: text })}
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Stok *</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor="#94A3B8"
              value={formData.stock}
              onChangeText={(text) => setFormData({ ...formData, stock: text })}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Birim</Text>
          <View style={styles.unitGrid}>
            {['kg', 'adet', 'paket', 'litre', 'gram', 'ton'].map((unit) => (
              <TouchableOpacity
                key={unit}
                style={[
                  styles.unitChip,
                  formData.unit === unit && styles.unitChipActive
                ]}
                onPress={() => setFormData({ ...formData, unit })}
              >
                <Text style={[
                  styles.unitChipText,
                  formData.unit === unit && styles.unitChipTextActive
                ]}>
                  {unit}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Ürün Bilgileri */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="cube" size={24} color="#4CAF50" />
          <Text style={styles.cardTitle}>Ürün Bilgileri</Text>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ürün Başlığı *</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: Taze Organik Domates - 1 Kg"
            placeholderTextColor="#94A3B8"
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            maxLength={100}
          />
          <Text style={styles.charCount}>{formData.title.length}/100</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ürün Açıklaması *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="• Ürünün kalitesi ve özellikleri&#10;• Hangi koşullarda saklanmalı&#10;• Teslimat detayları&#10;• İletişim bilgileri&#10;• Özel notlar..."
            placeholderTextColor="#94A3B8"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={6}
            maxLength={1000}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{formData.description.length}/1000</Text>
        </View>
      </View>

      {/* Medya */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="images" size={24} color="#4CAF50" />
          <Text style={styles.cardTitle}>Fotoğraf & Video</Text>
        </View>
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.mediaScroll}
        >
          {formData.media.map((item, index) => (
            <View key={index} style={styles.mediaItem}>
              {item.type === 'image' ? (
                <Image source={{ uri: item.url }} style={styles.mediaImage} />
              ) : (
                <View style={[styles.mediaImage, styles.videoPlaceholder]}>
                  <Ionicons name="videocam" size={32} color="#FFFFFF" />
                </View>
              )}
              
              {item.isPrimary && (
                <View style={styles.primaryBadge}>
                  <Ionicons name="star" size={12} color="#FFFFFF" />
                  <Text style={styles.primaryBadgeText}>Ana</Text>
                </View>
              )}
              
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeMedia(index)}
              >
                <Ionicons name="close-circle" size={24} color="#EF4444" />
              </TouchableOpacity>

              {!item.isPrimary && (
                <TouchableOpacity
                  style={styles.setPrimaryButton}
                  onPress={() => setPrimaryMedia(index)}
                >
                  <Ionicons name="star-outline" size={16} color="#4CAF50" />
                </TouchableOpacity>
              )}
            </View>
          ))}
          
          {formData.media.length < 5 && (
            <TouchableOpacity style={styles.addMediaButton} onPress={pickImage}>
              <Ionicons name="camera" size={28} color="#4CAF50" />
              <Text style={styles.addMediaText}>Fotoğraf{'\n'}Ekle</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </View>
  );

  if (initialLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Ürün bilgileri yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
      
      {/* Modern Header */}
      <LinearGradient
        colors={['#4CAF50', '#45A049']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (navigation?.canGoBack?.()) {
              navigation.goBack();
            } else {
              navigation.navigate('MyProducts');
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ürün Düzenle</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderForm()}
      </ScrollView>

      {/* Fixed Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <LinearGradient
            colors={loading ? ['#94A3B8', '#94A3B8'] : ['#4CAF50', '#45A049']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitGradient}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.submitText}>Değişiklikleri Kaydet</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kategori Seçin</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowCategoryModal(false)}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    formData.category === item.id && styles.modalItemSelected
                  ]}
                  onPress={() => handleCategorySelect(item)}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: `${item.color || '#4CAF50'}15` }]}>
                    <Ionicons name={(item.icon as any) || 'pricetag'} size={20} color={item.color || '#4CAF50'} />
                  </View>
                  <Text style={[styles.modalItemText, { color: item.color || '#1E293B' }]}>
                    {item.name}
                  </Text>
                  {formData.category === item.id && (
                    <Ionicons name="checkmark-circle" size={24} color={item.color || '#4CAF50'} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCityModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Şehir Seçin</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowCityModal(false)}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            {loadingCities ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.modalLoadingText}>Şehirler yükleniyor...</Text>
              </View>
            ) : cities.length === 0 ? (
              <View style={styles.modalLoading}>
                <Text style={styles.modalLoadingText}>Şehir bulunamadı</Text>
              </View>
            ) : (
              <FlatList
                data={cities}
                keyExtractor={(item) => item._id || item.code || item.name}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      formData.city === item.name && styles.modalItemSelected
                    ]}
                    onPress={() => handleCitySelect(item)}
                  >
                    <Ionicons name="location" size={20} color="#4CAF50" />
                    <Text style={styles.modalItemText}>{item.name}</Text>
                    {formData.city === item.name && (
                      <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showDistrictModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDistrictModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>İlçe Seçin</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowDistrictModal(false)}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            {loadingDistricts ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.modalLoadingText}>İlçeler yükleniyor...</Text>
              </View>
            ) : (
              <FlatList
                data={districts}
                keyExtractor={(item) => item._id || item.name}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      formData.district === item.name && styles.modalItemSelected
                    ]}
                    onPress={() => handleDistrictSelect(item)}
                  >
                    <Ionicons name="location-outline" size={20} color="#64748B" />
                    <Text style={styles.modalItemText}>{item.name}</Text>
                    {formData.district === item.name && (
                      <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate && currentDateField) {
              const formattedDate = selectedDate.toLocaleDateString('tr-TR');
              updateCategoryData(currentDateField, formattedDate);
            }
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  formContent: {
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  selectField: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectFieldActive: {
    borderColor: '#4CAF50',
  },
  selectFieldDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  selectText: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
    flex: 1,
  },
  placeholderText: {
    color: '#94A3B8',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    flex: 1,
  },
  unitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  unitChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    marginRight: 10,
    marginBottom: 10,
  },
  unitChipActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  unitChipText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  unitChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  toggleButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
  },
  toggleButtonActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#4CAF50',
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  charCount: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'right',
    marginTop: 8,
    fontWeight: '500',
  },
  mediaScroll: {
    paddingRight: 4,
  },
  mediaItem: {
    position: 'relative',
    marginRight: 12,
  },
  mediaImage: {
    width: 120,
    height: 120,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  videoPlaceholder: {
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    
  },
  primaryBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  setPrimaryButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 6,
  },
  addMediaButton: {
    width: 120,
    height: 120,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 8,
  },
  addMediaText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    
  },
  modalItemSelected: {
    backgroundColor: '#F0FDF4',
  },
  modalItemText: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalLoading: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalLoadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
});

export default EditProductScreen;
