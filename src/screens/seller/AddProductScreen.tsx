import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
// import { useNavigation } from '@react-navigation/native'; // Removed - using navigation prop instead

import { productsAPI, getAuthHeaders } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { ENV } from '../../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { locationsAPI } from '../../services/api';

// API Base URL - Use from env config
const API_BASE_URL = ENV.API_BASE_URL;

const { width } = Dimensions.get('window');

// Kategoriler
const categories = [
  { id: 'meyve', name: 'Meyve', icon: 'nutrition', color: '#2ECC71' },
  { id: 'sebze', name: 'Sebze', icon: 'leaf', color: '#27AE60' },
  { id: 'gida', name: 'Gıda', icon: 'basket', color: '#27AE60' },
  { id: 'nakliye', name: 'Nakliye', icon: 'car', color: '#58D68D' },
  { id: 'kasa', name: 'Kasa', icon: 'cube', color: '#7DCEA0' },
  { id: 'zirai_ilac', name: 'Zirai İlaç', icon: 'medical', color: '#52C41A' },
  { id: 'ambalaj', name: 'Ambalaj', icon: 'archive', color: '#73C6B6' },
  { id: 'indir_bindir', name: 'İndir-Bindir', icon: 'people', color: '#85C1E9' },
  { id: 'emlak', name: 'Emlak', icon: 'home', color: '#F8C471' },
  { id: 'arac', name: 'Araç', icon: 'car-sport', color: '#BB8FCE' },
];

// Kategori-spesifik alanlar
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
    unit: ['kg', 'ton', 'litre', 'kasa', 'paket', 'adet', 'şişe', 'teneke'], // All units supported
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
    unit: ['adet', 'kasa', 'takım'], // All units supported in backend now
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

const AddProductScreen = ({ navigation }: any) => {
  const { user, updateUser } = useAuth();

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

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
    media: [] as any[], // Images and videos
    // Kategori-spesifik alanlar
    categoryData: {} as any,
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentDateField, setCurrentDateField] = useState<string>('');

  // API state
  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [citySearchText, setCitySearchText] = useState('');
  const [districtSearchText, setDistrictSearchText] = useState('');

  // Load cities on mount
  useEffect(() => {
    const initializeScreen = async () => {
      try {
        console.log('🚀 AddProductScreen initializing...');
        
        // Always try to switch to seller role when entering this screen
        if (user) {
          const userRoles = (user as any).userRoles || [];
          const activeRole = (user as any).activeRole || user.userType;
          
          console.log('🔍 AddProductScreen - User roles:', userRoles);
          console.log('🔍 AddProductScreen - Active role:', activeRole);
          
          // Force switch to seller role if user has seller role
          if (userRoles.includes('seller')) {
            if (activeRole !== 'seller') {
              console.log('🔄 Auto-switching to seller role in AddProductScreen...');
              await switchToSellerRole();
            } else {
              console.log('✅ User already in seller role');
            }
          } else {
            console.log('❌ User does not have seller role - adding seller role');
            // Add seller role to user
            await addSellerRole();
          }
        }
        
        // Load cities
        await loadCities();
        console.log('✅ AddProductScreen initialized successfully');
      } catch (error) {
        console.error('❌ AddProductScreen initialization error:', error);
        // Don't crash - just log the error
      }
    };
    
    initializeScreen();
  }, [user]);

  const addSellerRole = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${ENV.API_BASE_URL}/users/switch-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: 'seller' })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Seller role added successfully:', result.user);
        
        // Sync auth context with new role
        await AsyncStorage.setItem('userData', JSON.stringify({ ...user, ...result.user }));
        try { await updateUser({ activeRole: result.user?.activeRole, userRoles: result.user?.userRoles }); } catch {}
      } else {
        console.error('❌ Failed to add seller role:', response.status);
      }
    } catch (error) {
      console.error('❌ Add seller role error:', error);
    }
  };

  const switchToSellerRole = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${ENV.API_BASE_URL}/users/switch-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: 'seller' })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Role switched successfully in AddProductScreen:', result.user);
        
        // Sync auth context with new role
        await AsyncStorage.setItem('userData', JSON.stringify({ ...user, ...result.user }));
        try { await updateUser({ activeRole: result.user?.activeRole, userRoles: result.user?.userRoles }); } catch {}
      } else {
        console.error('❌ Failed to switch role in AddProductScreen:', response.status);
      }
    } catch (error) {
      console.error('❌ Role switch error in AddProductScreen:', error);
    }
  };

  const loadCities = async () => {
    setLoadingCities(true);
    try {
      const response = await locationsAPI.getCities();
      setCities(response.cities || []);
    } catch (error) {
      console.error('Error loading cities:', error);
      setCities([]); // Hata durumunda boş array
      Alert.alert('Hata', 'İller yüklenirken hata oluştu');
    } finally {
      setLoadingCities(false);
    }
  };

  const loadDistricts = async (city: any) => {
    setLoadingDistricts(true);
    setDistricts([]); // Reset districts
    try {
      const cityId = city._id || city;
      const response = await locationsAPI.getDistricts(cityId);
      setDistricts(response.districts || []);
    } catch (error) {
      console.error('Error loading districts:', error);
      setDistricts([]); // Hata durumunda boş array
      Alert.alert('Hata', 'İlçeler yüklenirken bir hata oluştu');
    } finally {
      setLoadingDistricts(false);
    }
  };

  const handleCitySelect = (city: any) => {
    const cityName = city.name || city;
    setFormData({ ...formData, city: cityName, district: '' });
    loadDistricts(city); // Pass the full city object with _id
    setShowCityModal(false);
  };

  const handleDistrictSelect = (district: any) => {
    const districtName = district.name || district;
    setFormData({ ...formData, district: districtName });
    setShowDistrictModal(false);
    setDistrictSearchText('');
  };

  // Filter cities based on search text
  const filteredCities = (cities || []).filter(city => 
    city?.name?.toLowerCase().includes(citySearchText.toLowerCase())
  );

  // Filter districts based on search text
  const filteredDistricts = (districts || []).filter(district => 
    district?.name?.toLowerCase().includes(districtSearchText.toLowerCase())
  );

  const handleCategorySelect = (category: any) => {
    const categoryConfig = categoryFields[category.id as keyof typeof categoryFields];
    setFormData({ 
      ...formData, 
      category: category.id,
      unit: categoryConfig?.unit[0] || 'kg',
      categoryData: {}
    });
    setShowCategoryModal(false);
  };

  const pickImage = async () => {
    try {
      // İzin kontrolü
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'İzin Gerekli',
          'Galeri erişimi için izin vermeniz gerekiyor.',
          [{ text: 'Tamam' }]
        );
        return;
      }

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
        const formData = new FormData();
        formData.append('image', {
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
          Alert.alert('Oturum Hatası', 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.', [
            { text: 'Tamam', onPress: () => navigation?.navigate('Login') }
          ]);
          return;
        }
        
        console.log('📤 Uploading image with headers:', Object.keys(headersWithoutContentType));
        console.log('🔑 Has Authorization:', !!headersWithoutContentType.Authorization);
        
        const response = await fetch(`${API_BASE_URL}/upload/image`, {
          method: 'POST',
          headers: {
            ...headersWithoutContentType,
            // Don't set Content-Type - let fetch set it automatically with boundary for FormData
          },
          body: formData,
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
        
        setFormData(prev => ({
          ...prev,
          media: [...prev.media, {
            uri: result.assets[0].uri,
            url: uploadResult.url,
            type: 'image',
            isPrimary: prev.media.length === 0
          }]
        }));
      } catch (error) {
        console.error('Image upload error:', error);
        Alert.alert('Hata', 'Resim yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    }
    } catch (error: any) {
      console.error('Image picker error:', error);
      Alert.alert('Hata', error?.message || 'Resim seçilirken bir hata oluştu.');
    }
  };

  const pickVideo = async () => {
    try {
      // İzin kontrolü
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'İzin Gerekli',
          'Galeri erişimi için izin vermeniz gerekiyor.',
          [{ text: 'Tamam' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
      setLoading(true);
      try {
        // Upload video to server
        const formData = new FormData();
        formData.append('image', {
          uri: result.assets[0].uri,
          type: 'video/mp4',
          name: 'video.mp4',
        } as any);

        // Get auth headers without Content-Type (FormData will set it automatically with boundary)
        const authHeaders = await getAuthHeaders();
        // Remove Content-Type from auth headers - FormData needs to set it automatically
        const { 'Content-Type': _, ...headersWithoutContentType } = authHeaders;
        
        // Check if token exists
        if (!headersWithoutContentType.Authorization) {
          Alert.alert('Oturum Hatası', 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.', [
            { text: 'Tamam', onPress: () => navigation?.navigate('Login') }
          ]);
          return;
        }
        
        console.log('📤 Uploading video with headers:', Object.keys(headersWithoutContentType));
        console.log('🔑 Has Authorization:', !!headersWithoutContentType.Authorization);
        
        const response = await fetch(`${API_BASE_URL}/upload/image`, {
          method: 'POST',
          headers: {
            ...headersWithoutContentType,
            // Don't set Content-Type - let fetch set it automatically with boundary for FormData
          },
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { message: errorText || 'Video upload failed' };
          }
          console.error('❌ Upload failed:', response.status, errorData);
          throw new Error(errorData.message || 'Video upload failed');
        }

        const uploadResult = await response.json();
        
        setFormData(prev => ({
          ...prev,
          media: [...prev.media, {
            uri: result.assets[0].uri,
            url: uploadResult.url,
            type: 'video',
            isPrimary: prev.media.length === 0
          }]
        }));
      } catch (error) {
        console.error('Video upload error:', error);
        Alert.alert('Hata', `Video yüklenirken bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
      } finally {
        setLoading(false);
      }
    }
    } catch (error: any) {
      console.error('Video picker error:', error);
      Alert.alert('Hata', error?.message || 'Video seçilirken bir hata oluştu.');
    }
  };

  const removeMedia = (index: number) => {
    const newMedia = formData.media.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      media: newMedia.map((item, i) => ({ ...item, isPrimary: i === 0 }))
    });
  };

  const setPrimaryMedia = (index: number) => {
    const newMedia = formData.media.map((item, i) => ({
      ...item,
      isPrimary: i === index
    }));
    setFormData({ ...formData, media: newMedia });
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

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate && currentDateField) {
      const formattedDate = selectedDate.toLocaleDateString('tr-TR');
      updateCategoryData(currentDateField, formattedDate);
    }
  };

  const openDatePicker = (fieldKey: string) => {
    setCurrentDateField(fieldKey);
    setShowDatePicker(true);
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1: // Konum Bilgisi
        if (!formData.city) {
          Alert.alert('Hata', 'Şehir seçin');
          return false;
        }
        if (!formData.district) {
          Alert.alert('Hata', 'İlçe seçin');
          return false;
        }
        break;
      case 2: // Kategori Seçimi
        if (!formData.category) {
          Alert.alert('Hata', 'Kategori seçin');
          return false;
        }
        break;
      case 3: // Kategoriye Özel Bilgiler
        // Kategori-spesifik alanlar için validasyon
        const categoryConfig = categoryFields[formData.category as keyof typeof categoryFields];
        if (categoryConfig?.fields) {
          for (const field of categoryConfig.fields) {
            // Optional alanları atla
            if ((field as any).optional) {
              console.log(`⏭️ Skipping optional field: ${field.key}`);
              continue;
            }
            
            // Boolean alanlar zorunlu değil, atla
            if (field.type === 'boolean') {
              console.log(`⏭️ Skipping boolean field: ${field.key}`);
              continue;
            }
            
            // Conditional alanları kontrol et - sadece Paketli Gıda için marka ve SKT zorunlu
            if ((field as any).conditional) {
              if (formData.category === 'gida') {
                const productType = formData.categoryData['productType'];
                console.log(`🔍 Conditional field: ${field.key}, ProductType: ${productType}`);
                if (productType !== 'Paketli Gıda') {
                  console.log(`⏭️ Skipping conditional field (not Paketli Gıda): ${field.key}`);
                  continue; // Bu alan bu ürün tipi için zorunlu değil, atla
                }
                // Paketli Gıda ise validasyon devam eder
              } else {
                console.log(`⏭️ Skipping conditional field: ${field.key}`);
                continue; // Other conditional fields - skip
              }
            }
            
            // Alan validasyonu
            const value = formData.categoryData[field.key];
            
            if (field.type === 'number') {
              if (!value || value === '' || value === null || value === undefined || isNaN(Number(value))) {
                Alert.alert('Hata', `${field.label} gerekli`);
                return false;
              }
            } else if (field.type === 'text') {
              if (!value || !String(value).trim()) {
                Alert.alert('Hata', `${field.label} gerekli`);
                return false;
              }
            } else if (field.type === 'select') {
              if (!value || value === '' || value === null || value === undefined) {
                Alert.alert('Hata', `${field.label} seçimi gerekli`);
                return false;
              }
            } else if (field.type === 'date') {
              if (!value || value === '' || value === null || value === undefined) {
                Alert.alert('Hata', `${field.label} gerekli`);
                return false;
              }
            }
          }
        }
        break;
      case 4: // Ürün Başlığı ve Açıklaması
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
        break;
      case 5: // Fiyat ve Stok
        if (!formData.price || parseFloat(formData.price) <= 0) {
          Alert.alert('Hata', 'Geçerli bir fiyat girin');
          return false;
        }
        // Stok kontrolü sadece stok gerektiren kategoriler için
        const step5CategoryConfig = categoryFields[formData.category as keyof typeof categoryFields];
        if (step5CategoryConfig?.hasStock) {
          // Stok required ise kontrol et
          if (!formData.stock || parseInt(formData.stock) < 0 || isNaN(parseInt(formData.stock))) {
            Alert.alert('Hata', 'Geçerli bir stok miktarı girin');
            return false;
          }
        } else {
          // Stok required değilse, default olarak 0 veya 1 koy
          if (!formData.stock || formData.stock === '') {
            setFormData({ ...formData, stock: '1' });
          }
        }
        break;
      case 6: // Medya Ekleme
        // Medya zorunlu değil, placeholder resim kullanacağız
        break;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(6)) return;

    setLoading(true);
    try {
      console.log('🚀 Creating product with data:', formData);
      
      // Ensure media array is properly formatted
      const safeMedia = Array.isArray(formData.media) ? formData.media.filter(item => item && item.url) : [];
      
      // Parse stock - handle cases where stock might be empty or undefined
      const stockValue = formData.stock ? parseInt(formData.stock) : 1;
      
      const productData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock: isNaN(stockValue) ? 1 : stockValue,
        unit: formData.unit || 'kg',
        category: formData.category,
        location: {
          city: formData.city,
          district: formData.district
        },
        images: safeMedia.length > 0 ? safeMedia.map(item => ({
          url: item.url || '',
          isPrimary: item.isPrimary || false,
          type: item.type || 'image'
        })) : [],
        categoryData: formData.categoryData || {}
      };

      console.log('📦 Final product data:', JSON.stringify(productData, null, 2));

      const response = await productsAPI.createProduct(productData);
      console.log('✅ Product created successfully:', response);
      
      Alert.alert(
        '🎉 Ürün Başarıyla Eklendi!', 
        'Ürününüz başarıyla sisteme eklendi ve admin onayı için beklemeye alındı.\n\nOnaylandıktan sonra müşteriler ürününüzü görebilecek ve size ulaşabilecek.',
        [{ 
          text: 'Anladım', 
          onPress: () => {
            try {
              console.log('🚀 AddProductScreen: Navigation attempt starting...');
              console.log('🚀 AddProductScreen: Navigation object:', navigation);
              console.log('🚀 AddProductScreen: Navigation type:', typeof navigation);
              console.log('🚀 AddProductScreen: Navigation.navigate type:', typeof navigation?.navigate);
              
              if (navigation && typeof navigation.navigate === 'function') {
                console.log('🚀 AddProductScreen: Attempting to navigate to SellerDashboard...');
                // SellerDashboardScreen'e navigate et
                (navigation as any).navigate('SellerDashboard');
                console.log('🚀 AddProductScreen: Navigation call completed');
              } else if (navigation && navigation.goBack) {
                console.log('🚀 AddProductScreen: Using goBack instead...');
                navigation.goBack();
              } else {
                console.log('🚀 AddProductScreen: Navigation not available, staying on current screen');
              }
            } catch (error) {
              console.error('🚀 AddProductScreen: Navigation error:', error);
            }
          }
        }]
      );
    } catch (error) {
      console.error('❌ Product creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ürün eklenirken bir hata oluştu. Lütfen tekrar deneyin.';
      Alert.alert('Hata', errorMessage);
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
    return category ? category.color : '#2ECC71';
  };

  const getStepTitle = (step: number) => {
    const titles = [
      '', // 0 index
      '📍 Konum',
      '🏷️ Kategori',
      '⚙️ Detaylar',
      '📝 Açıklama',
      '💰 Fiyat',
      '📸 Medya'
    ];
    return titles[step];
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={styles.stepProgressContainer}>
        <View style={styles.stepProgressBar}>
          <View 
            style={[
              styles.stepProgressFill, 
              { width: `${(currentStep / totalSteps) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.stepProgressText}>
          {currentStep} / {totalSteps}
        </Text>
      </View>
      
      <View style={styles.stepDotsContainer}>
        {Array.from({ length: totalSteps }, (_, index) => (
          <View key={index} style={styles.stepContainer}>
            <View style={[
              styles.stepDot,
              currentStep > index + 1 && styles.stepDotCompleted,
              currentStep === index + 1 && styles.stepDotActive
            ]}>
              {currentStep > index + 1 ? (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              ) : (
                <Text style={[
                  styles.stepNumber,
                  currentStep === index + 1 && styles.stepNumberActive
                ]}>
                  {index + 1}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
      
      <Text style={[
        styles.currentStepTitle,
        { color: getSelectedCategoryColor() }
      ]}>
        {getStepTitle(currentStep)}
      </Text>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <Ionicons name="location" size={28} color="#FFFFFF" />
        </View>
        <Text style={styles.stepTitle}>Konum Bilgisi</Text>
        <Text style={styles.stepDescription}>
          Ürününüzün bulunduğu şehir ve ilçeyi seçin
        </Text>
        <View style={styles.stepTipBox}>
          <Ionicons name="information-circle" size={16} color="#2ECC71" />
          <Text style={styles.stepTipText}>Müşteriler size bu bilgilerle ulaşacak</Text>
        </View>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Şehir *</Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setShowCityModal(true)}
        >
          <Text style={styles.selectButtonText}>
            {formData.city || 'Şehir Seçin'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#2ECC71" />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>İlçe *</Text>
        <TouchableOpacity
          style={[styles.selectButton, !formData.city && styles.disabledButton]}
          onPress={() => formData.city && setShowDistrictModal(true)}
          disabled={!formData.city}
        >
          <Text style={[
            styles.selectButtonText,
            !formData.city && styles.disabledText
          ]}>
            {formData.district || 'İlçe Seçin'}
          </Text>
          <Ionicons 
            name="chevron-down" 
            size={20} 
            color={formData.city ? "#2ECC71" : "#ccc"} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <Ionicons name="grid" size={28} color="#FFFFFF" />
        </View>
        <Text style={styles.stepTitle}>Kategori Seçimi</Text>
        <Text style={styles.stepDescription}>
          Ürününüzün hangi kategoriye ait olduğunu seçin
        </Text>
        <View style={styles.stepTipBox}>
          <Ionicons name="trending-up" size={16} color="#2ECC71" />
          <Text style={styles.stepTipText}>Doğru kategori = Daha çok görünürlük</Text>
        </View>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Kategori *</Text>
        <TouchableOpacity
          style={[styles.selectButton, { borderColor: getSelectedCategoryColor() }]}
          onPress={() => setShowCategoryModal(true)}
        >
          <Text style={[styles.selectButtonText, { color: formData.category ? getSelectedCategoryColor() : '#666' }]}>
            {getSelectedCategoryName() || 'Kategori Seçin'}
          </Text>
          <Ionicons name="chevron-down" size={20} color={getSelectedCategoryColor()} />
        </TouchableOpacity>
      </View>

      <View style={styles.categoryGrid}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryCard,
              { borderColor: category.color },
              formData.category === category.id && { backgroundColor: category.color + '20' }
            ]}
            onPress={() => handleCategorySelect(category)}
          >
            <Ionicons name={category.icon as any} size={24} color={category.color} />
            <Text style={[styles.categoryCardText, { color: category.color }]}>
              {category.name}
            </Text>
            {formData.category === category.id && (
              <View style={[styles.categorySelectedBadge, { backgroundColor: category.color }]}>
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <Ionicons name="settings" size={28} color="#FFFFFF" />
        </View>
        <Text style={styles.stepTitle}>Kategoriye Özel Bilgiler</Text>
        <Text style={styles.stepDescription}>
          {getSelectedCategoryName() || 'Seçili kategori'} için gerekli bilgileri girin
        </Text>
        <View style={styles.stepTipBox}>
          <Ionicons name="shield-checkmark" size={16} color="#2ECC71" />
          <Text style={styles.stepTipText}>Detaylı bilgi = Daha güvenilir görünüm</Text>
        </View>
      </View>
      
      {formData.category && categoryFields[formData.category as keyof typeof categoryFields]?.fields ? (
        <View style={styles.categoryFieldsContainer}>
          <Text style={styles.categoryFieldsTitle}>
            {getSelectedCategoryName()} Detayları
          </Text>
          {categoryFields[formData.category as keyof typeof categoryFields].fields.map((field) => {
            // Conditional field kontrolü - sadece Paketli Gıda için marka ve SKT göster
            if ((field as any).conditional) {
              if (formData.category === 'gida') {
                const productType = formData.categoryData['productType'];
                if (productType !== 'Paketli Gıda') {
                  return null; // Paketli Gıda değilse marka ve SKT alanlarını gösterme
                }
              } else {
                return null; // Other conditional fields - hide
              }
            }
            
            return (
            <View key={field.key} style={styles.categoryField}>
              <Text style={styles.inputLabel}>
                {field.label} {(field as any).conditional ? '' : '*'}
              </Text>
              
              {field.type === 'text' && (
                <TextInput
                  style={styles.input}
                  placeholder={field.placeholder}
                  value={formData.categoryData[field.key] || ''}
                  onChangeText={(text) => updateCategoryData(field.key, text)}
                />
              )}
              
              {field.type === 'number' && (
                <TextInput
                  style={styles.input}
                  placeholder={field.placeholder || '0'}
                  value={formData.categoryData[field.key]?.toString() || ''}
                  onChangeText={(text) => updateCategoryData(field.key, text)}
                  keyboardType="numeric"
                />
              )}
              
              {field.type === 'select' && (
                <TouchableOpacity
                  style={styles.selectButton}
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
                  <Text style={styles.selectButtonText}>
                    {formData.categoryData[field.key] || 'Seçin...'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#2ECC71" />
                </TouchableOpacity>
              )}
              
              {field.type === 'boolean' && (
                <View style={styles.booleanContainer}>
                  <TouchableOpacity
                    style={[
                      styles.booleanButton,
                      formData.categoryData[field.key] && styles.booleanButtonActive
                    ]}
                    onPress={() => updateCategoryData(field.key, !formData.categoryData[field.key])}
                  >
                    <Ionicons 
                      name={formData.categoryData[field.key] ? "checkmark-circle" : "ellipse-outline"} 
                      size={20} 
                      color={formData.categoryData[field.key] ? "#2ECC71" : "#7F8C8D"} 
                    />
                    <Text style={[
                      styles.booleanButtonText,
                      formData.categoryData[field.key] && styles.booleanButtonTextActive
                    ]}>
                      {formData.categoryData[field.key] ? 'Evet' : 'Hayır'}
                    </Text>
                  </TouchableOpacity>
                  {field.key === 'coldStorage' && (
                    <Text style={styles.booleanHelpText}>
                      💡 Soğuk hava deposunda saklanan ürünler daha uzun süre taze kalır
                    </Text>
                  )}
                  {field.key === 'organic' && (
                    <Text style={styles.booleanHelpText}>
                      🌱 Organik ürünler kimyasal gübre ve ilaç kullanılmadan yetiştirilir
                    </Text>
                  )}
                </View>
              )}
              
              {field.type === 'date' && (
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => openDatePicker(field.key)}
                >
                  <Text style={styles.selectButtonText}>
                    {formData.categoryData[field.key] || 'Tarih seçin...'}
                  </Text>
                  <Ionicons name="calendar" size={20} color="#2ECC71" />
                </TouchableOpacity>
              )}
            </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.infoContainer}>
          <Ionicons name="information-circle" size={48} color="#7F8C8D" />
          <Text style={styles.infoText}>
            Önce bir kategori seçin
          </Text>
        </View>
      )}
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <Ionicons name="document-text" size={28} color="#FFFFFF" />
        </View>
        <Text style={styles.stepTitle}>Ürün Başlığı ve Açıklaması</Text>
        <Text style={styles.stepDescription}>
          Ürününüz için açıklayıcı başlık ve detaylı açıklama yazın
        </Text>
        <View style={styles.stepTipBox}>
          <Ionicons name="chatbubble-ellipses" size={16} color="#2ECC71" />
          <Text style={styles.stepTipText}>İyi açıklama = Daha çok talep</Text>
        </View>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Ürün Başlığı *</Text>
        <TextInput
          style={styles.input}
          placeholder="Örn: Taze Organik Domates - 1 Kg"
          value={formData.title}
          onChangeText={(text) => setFormData({ ...formData, title: text })}
          maxLength={100}
        />
        <Text style={styles.characterCount}>{formData.title.length}/100</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Ürün Açıklaması *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="• Ürünün kalitesi ve özellikleri
• Hangi koşullarda saklanmalı
• Teslimat detayları
• İletişim bilgileri
• Özel notlar..."
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          multiline
          numberOfLines={6}
          maxLength={1000}
          textAlignVertical="top"
        />
        <Text style={styles.characterCount}>{formData.description.length}/1000</Text>
      </View>
    </View>
  );

  const renderStep5 = () => {
    const categoryConfig = categoryFields[formData.category as keyof typeof categoryFields];
    const hasStock = categoryConfig?.hasStock;
    const priceType = categoryConfig?.priceType;
    
    const getPriceLabel = () => {
      switch (priceType) {
        case 'per_service': return 'Hizmet Ücreti (TL)';
        case 'per_property': return 'Fiyat (TL)';
        case 'per_vehicle': return 'Fiyat (TL)';
        default: return 'Fiyat (TL)';
      }
    };
    
    const getPriceDescription = () => {
      switch (priceType) {
        case 'per_service': return 'Hizmetinizin ücretini belirleyin';
        case 'per_property': return 'Emlak fiyatını belirleyin';
        case 'per_vehicle': return 'Araç fiyatını belirleyin';
        default: return 'Ürününüzün fiyatını belirleyin';
      }
    };

    return (
      <View style={styles.stepContent}>
        <View style={styles.stepHeader}>
          <View style={styles.stepIconContainer}>
            <Ionicons name="cash" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.stepTitle}>
            {hasStock ? 'Fiyat ve Stok' : 'Fiyat Bilgileri'}
          </Text>
          <Text style={styles.stepDescription}>
            {getPriceDescription()}
          </Text>
          <View style={styles.stepTipBox}>
            <Ionicons name="trending-up" size={16} color="#2ECC71" />
            <Text style={styles.stepTipText}>Rekabetçi fiyat = Daha çok talep</Text>
          </View>
        </View>
        
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>{getPriceLabel()} *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={formData.price}
              onChangeText={(text) => setFormData({ ...formData, price: text })}
              keyboardType="numeric"
            />
          </View>
          {hasStock && (
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Stok *</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={formData.stock}
                onChangeText={(text) => setFormData({ ...formData, stock: text })}
                keyboardType="numeric"
              />
            </View>
          )}
        </View>
        
        {!hasStock && (
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#3498DB" />
            <Text style={styles.infoBoxText}>
              Bu kategori için stok bilgisi gerekmiyor. Fiyat bilgisi yeterli.
            </Text>
          </View>
        )}

        {categoryConfig?.hasUnit !== false && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Birim</Text>
            <View style={styles.unitContainer}>
              {(categoryConfig?.unit || ['kg', 'adet', 'paket', 'litre', 'gram']).map((unit) => (
                <TouchableOpacity
                  key={unit}
                  style={[
                    styles.unitButton,
                    formData.unit === unit && styles.unitButtonActive
                  ]}
                  onPress={() => setFormData({ ...formData, unit })}
                >
                  <Text style={[
                    styles.unitButtonText,
                    formData.unit === unit && styles.unitButtonTextActive
                  ]}>
                    {unit}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderStep6 = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <Ionicons name="images" size={28} color="#FFFFFF" />
        </View>
        <Text style={styles.stepTitle}>Medya Ekleme</Text>
        <Text style={styles.stepDescription}>
          Ürününüzü tanıtmak için resim ve video ekleyin
        </Text>
        <View style={styles.stepTipBox}>
          <Ionicons name="eye" size={16} color="#2ECC71" />
          <Text style={styles.stepTipText}>Güzel görseller = Daha çok ilgi</Text>
        </View>
      </View>
      
      <ScrollView 
        style={styles.mediaScrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.mediaScrollContent}
      >
        <View style={styles.mediaContainer}>
          {formData.media.map((item, index) => (
            <View key={index} style={styles.mediaItem}>
              {item.type === 'image' ? (
                <Image source={{ uri: item.uri }} style={styles.mediaPreview} />
              ) : (
                <View style={styles.videoPreview}>
                  <View style={[styles.mediaPreview, { backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }]}>
                    <Ionicons name="videocam" size={50} color="#FFFFFF" opacity={0.3} />
                  </View>
                  <View style={styles.videoOverlay}>
                    <Ionicons name="play-circle" size={40} color="#FFFFFF" />
                    <Text style={styles.videoText}>Video</Text>
                  </View>
                </View>
              )}
              
              {item.isPrimary && (
                <View style={styles.primaryBadge}>
                  <Text style={styles.primaryBadgeText}>Ana</Text>
                </View>
              )}
              
              <TouchableOpacity
                style={styles.removeMediaButton}
                onPress={() => removeMedia(index)}
              >
                <Ionicons name="close-circle" size={24} color="#E74C3C" />
              </TouchableOpacity>
              
              {!item.isPrimary && (
                <TouchableOpacity
                  style={styles.setPrimaryButton}
                  onPress={() => setPrimaryMedia(index)}
                >
                  <Text style={styles.setPrimaryButtonText}>Ana Yap</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
          
          {formData.media.length < 10 && (
            <View style={styles.mediaPickerContainer}>
              <TouchableOpacity style={styles.addMediaButton} onPress={pickImage}>
                <Ionicons name="camera" size={32} color="#2ECC71" />
                <Text style={styles.addMediaText}>Resim Ekle</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.addMediaButton} onPress={pickVideo}>
                <Ionicons name="videocam" size={32} color="#2ECC71" />
                <Text style={styles.addMediaText}>Video Ekle</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
      
      <View style={styles.helpBox}>
        <Ionicons name="information-circle" size={20} color="#2ECC71" />
        <Text style={styles.helpText}>
          💡 <Text style={{fontWeight: 'bold'}}>İpucu:</Text> En az 1, en fazla 10 medya ekleyebilirsiniz. 
          İlk eklediğiniz medya otomatik olarak ana resim olur.
        </Text>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1(); // Konum Bilgisi
      case 2: return renderStep2(); // Kategori Seçimi
      case 3: return renderStep3(); // Kategoriye Özel Bilgiler
      case 4: return renderStep4(); // Ürün Başlığı ve Açıklaması
      case 5: return renderStep5(); // Fiyat ve Stok
      case 6: return renderStep6(); // Medya Ekleme
      default: return renderStep1();
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2ECC71', '#27AE60']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            console.log('🔙 AddProductScreen: Back button pressed');
            try {
              if (navigation && navigation.goBack) {
                navigation.goBack();
              } else {
                console.log('🔙 AddProductScreen: Navigation not available, using fallback');
                // Fallback navigation
                (navigation as any).navigate('SellerDashboard');
              }
            } catch (error) {
              console.error('🔙 AddProductScreen: Navigation error:', error);
              // Fallback navigation
              (navigation as any).navigate('SellerDashboard');
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ürün Ekle</Text>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      {renderStepIndicator()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>

      <View style={styles.navigationButtons}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.prevButton} onPress={prevStep}>
            <Ionicons name="arrow-back" size={20} color="#2ECC71" />
            <Text style={styles.prevButtonText}>Geri</Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.buttonSpacer} />
        
        {currentStep < totalSteps ? (
          <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
            <Text style={styles.nextButtonText}>İleri</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.submitButton, { opacity: loading ? 0.7 : 1 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Yayınla</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Category Modal */}
      <Modal visible={showCategoryModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kategori Seçin</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              numColumns={2}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalCategoryItem, { borderColor: item.color }]}
                  onPress={() => handleCategorySelect(item)}
                >
                  <Ionicons name={item.icon as any} size={30} color={item.color} />
                  <Text style={styles.modalCategoryItemText}>{item.name}</Text>
                  {formData.category === item.id && (
                    <View style={[styles.modalCategorySelected, { backgroundColor: item.color }]}>
                      <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* City Modal */}
      <Modal visible={showCityModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Şehir Seçin</Text>
              <TouchableOpacity onPress={() => {
                setShowCityModal(false);
                setCitySearchText('');
              }}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Şehir ara..."
                value={citySearchText}
                onChangeText={setCitySearchText}
                placeholderTextColor="#999"
              />
            </View>
            
            {loadingCities ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2ECC71" />
                <Text style={styles.loadingText}>İller yükleniyor...</Text>
              </View>
            ) : (
              <FlatList
                data={filteredCities}
                keyExtractor={(item, index) => (item as any)._id || (item as any).name || index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => handleCitySelect(item)}
                  >
                    <Text style={styles.modalItemText}>{(item as any).name || item}</Text>
                    {formData.city === ((item as any).name || item) && (
                      <Ionicons name="checkmark" size={20} color="#2ECC71" />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* District Modal */}
      <Modal visible={showDistrictModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>İlçe Seçin</Text>
              <TouchableOpacity onPress={() => {
                setShowDistrictModal(false);
                setDistrictSearchText('');
              }}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="İlçe ara..."
                value={districtSearchText}
                onChangeText={setDistrictSearchText}
                placeholderTextColor="#999"
              />
            </View>
            
            {loadingDistricts ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2ECC71" />
                <Text style={styles.loadingText}>İlçeler yükleniyor...</Text>
              </View>
            ) : (
              <View>
                <FlatList
                  data={filteredDistricts}
                  keyExtractor={(item, index) => (item as any)._id || (item as any).name || item || index.toString()}
                  renderItem={({ item }) => {
                    return (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => handleDistrictSelect(item)}
                  >
                    <Text style={styles.modalItemText}>{(item as any).name || item}</Text>
                    {formData.district === ((item as any).name || item) && (
                      <Ionicons name="checkmark" size={20} color="#2ECC71" />
                    )}
                  </TouchableOpacity>
                );
                  }}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(2020, 0, 1)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  stepIndicator: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8F8F5',
    paddingVertical: 16,
  },
  stepProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  stepProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E8F8F5',
    borderRadius: 3,
    marginRight: 12,
    overflow: 'hidden',
  },
  stepProgressFill: {
    height: '100%',
    backgroundColor: '#2ECC71',
    borderRadius: 3,
  },
  stepProgressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2ECC71',
    minWidth: 30,
  },
  stepDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F8F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepDotActive: {
    backgroundColor: '#2ECC71',
  },
  stepDotCompleted: {
    backgroundColor: '#27AE60',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7F8C8D',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 10,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  stepLabelActive: {
    color: '#2ECC71',
    fontWeight: '600',
  },
  currentStepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  stepIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2ECC71',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepTipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F8F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  stepTipText: {
    fontSize: 12,
    color: '#2ECC71',
    marginLeft: 6,
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF3FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 16,
  },
  infoBoxText: {
    fontSize: 12,
    color: '#3498DB',
    marginLeft: 6,
    fontWeight: '500',
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContent: {
    paddingVertical: 20,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 12,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#E8F8F5',
    color: '#2C3E50',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'right',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 5,
  },
  unitContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  unitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E8F8F5',
    backgroundColor: '#FFFFFF',
  },
  unitButtonActive: {
    backgroundColor: '#2ECC71',
    borderColor: '#2ECC71',
  },
  unitButtonText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  unitButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  selectButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#E8F8F5',
  },
  disabledButton: {
    opacity: 0.5,
  },
  selectButtonText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  disabledText: {
    color: '#BDC3C7',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  categoryCard: {
    width: (width - 60) / 2,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E8F8F5',
    marginBottom: 15,
    position: 'relative',
  },
  categoryCardText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  categorySelectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 12,
    padding: 4,
  },
  categoryFieldsContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8F8F5',
  },
  categoryFieldsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
    textAlign: 'center',
  },
  categoryField: {
    marginBottom: 16,
  },
  booleanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E8F8F5',
    backgroundColor: '#FFFFFF',
  },
  booleanButtonActive: {
    borderColor: '#2ECC71',
    backgroundColor: '#E8F8F5',
  },
  booleanButtonText: {
    fontSize: 16,
    color: '#7F8C8D',
    marginLeft: 8,
  },
  booleanButtonTextActive: {
    color: '#2ECC71',
    fontWeight: '600',
  },
  booleanContainer: {
    marginBottom: 4,
  },
  booleanHelpText: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 8,
    marginLeft: 8,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  infoContainer: {
    alignItems: 'center',
    padding: 40,
  },
  infoText: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 16,
    textAlign: 'center',
  },
  mediaScrollContainer: {
    maxHeight: 300,
    marginBottom: 16,
  },
  mediaScrollContent: {
    paddingBottom: 10,
  },
  mediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-start',
  },
  mediaItem: {
    width: (width - 70) / 4,
    height: (width - 70) / 4,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E8F8F5',
  },
  mediaPreview: {
    width: '100%',
    height: '100%',
  },
  videoPreview: {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 4,
    fontWeight: '600',
  },
  primaryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#2ECC71',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  primaryBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  removeMediaButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  setPrimaryButton: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(46, 204, 113, 0.9)',
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  setPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  mediaPickerContainer: {
    width: (width - 60) / 3,
    height: (width - 60) / 3,
    gap: 8,
  },
  addMediaButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2ECC71',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  addMediaText: {
    color: '#2ECC71',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  mediaInfo: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 20,
  },
  helpBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E8F8F5',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2ECC71',
  },
  helpText: {
    flex: 1,
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
    marginLeft: 8,
  },
  navigationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8F8F5',
  },
  prevButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2ECC71',
    backgroundColor: '#FFFFFF',
  },
  prevButtonText: {
    color: '#2ECC71',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#2ECC71',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#27AE60',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonSpacer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F8F5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
  },
  modalItemText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  modalCategoryItem: {
    flex: 1,
    margin: 8,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E8F8F5',
    position: 'relative',
  },
  modalCategoryItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 8,
    textAlign: 'center',
  },
  modalCategorySelected: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 12,
    padding: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#7F8C8D',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8F8F5',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
  },
});

export default AddProductScreen;
