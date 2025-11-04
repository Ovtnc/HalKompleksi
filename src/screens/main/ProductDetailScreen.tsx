import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Modal, 
  ActivityIndicator, 
  ScrollView, 
  Dimensions,
  Linking,
  Share,
  Alert,
  Platform,
  StatusBar,
  useWindowDimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { VideoView, useVideoPlayer } from 'expo-video';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { productsAPI } from '../../services/api';
import { ENV } from '../../config/env';
import { useAuth } from '../../contexts/AuthContext';
import { Product } from '../../types';

const API_BASE_URL = ENV.API_BASE_URL;

const COLORS = {
  primary: '#4CAF50',
  primaryDark: '#388E3C',
  primaryLight: '#66BB6A',
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#1B5E20',
  textSecondary: '#2E7D32',
  textLight: '#4CAF50',
  border: '#E0E0E0',
  whatsapp: '#25D366',
  error: '#F44336',
};

// Kategori-spesifik alanlar tanımları
const categoryFields: Record<string, any> = {
  meyve: {
    fields: [
      { key: 'variety', label: 'Çeşit', icon: 'leaf' },
      { key: 'harvest', label: 'Hasat Tarihi', icon: 'calendar', isDate: true },
      { key: 'organic', label: 'Organik', icon: 'leaf', isBoolean: true },
      { key: 'coldStorage', label: 'Soğuk Hava Deposu', icon: 'snow', isBoolean: true },
    ]
  },
  sebze: {
    fields: [
      { key: 'variety', label: 'Çeşit', icon: 'leaf' },
      { key: 'harvest', label: 'Hasat Tarihi', icon: 'calendar', isDate: true },
      { key: 'organic', label: 'Organik', icon: 'leaf', isBoolean: true },
      { key: 'coldStorage', label: 'Soğuk Hava Deposu', icon: 'snow', isBoolean: true },
    ]
  },
  gida: {
    fields: [
      { key: 'productType', label: 'Gıda Tipi', icon: 'fast-food' },
      { key: 'productionDate', label: 'Üretim Tarihi', icon: 'calendar', isDate: true },
      { key: 'brand', label: 'Marka', icon: 'pricetag' },
      { key: 'expiryDate', label: 'Son Kullanma Tarihi', icon: 'time', isDate: true },
    ]
  },
  nakliye: {
    fields: [
      { key: 'vehicleType', label: 'Araç Tipi', icon: 'car' },
      { key: 'capacity', label: 'Kapasite (Ton)', icon: 'cube' },
      { key: 'route', label: 'Güzergah', icon: 'navigate' },
      { key: 'availability', label: 'Müsaitlik', icon: 'time' },
    ]
  },
  kasa: {
    fields: [
      { key: 'material', label: 'Malzeme', icon: 'cube' },
      { key: 'size', label: 'Boyut', icon: 'resize' },
      { key: 'condition', label: 'Durum', icon: 'checkmark-circle' },
    ]
  },
  zirai_ilac: {
    fields: [
      { key: 'brand', label: 'Marka', icon: 'pricetag' },
      { key: 'productName', label: 'İlaç Adı', icon: 'medical' },
    ]
  },
  ambalaj: {
    fields: [
      { key: 'material', label: 'Malzeme', icon: 'cube' },
      { key: 'size', label: 'Boyut', icon: 'resize' },
      { key: 'color', label: 'Renk', icon: 'color-palette' },
      { key: 'quality', label: 'Kalite', icon: 'star' },
    ]
  },
  indir_bindir: {
    fields: [
      { key: 'workerCount', label: 'İşçi Sayısı', icon: 'people' },
      { key: 'experience', label: 'Deneyim', icon: 'trophy' },
      { key: 'equipment', label: 'Ekipman', icon: 'construct' },
      { key: 'availability', label: 'Müsaitlik', icon: 'time' },
    ]
  },
  emlak: {
    fields: [
      { key: 'propertyType', label: 'Emlak Tipi', icon: 'home' },
      { key: 'area', label: 'Alan (m²)', icon: 'resize' },
      { key: 'floor', label: 'Kat', icon: 'layers' },
      { key: 'rooms', label: 'Oda Sayısı', icon: 'grid' },
      { key: 'age', label: 'Bina Yaşı', icon: 'time' },
      { key: 'heating', label: 'Isıtma', icon: 'flame' },
      { key: 'rentalType', label: 'İlan Tipi', icon: 'pricetag' },
    ]
  },
  arac: {
    fields: [
      { key: 'brand', label: 'Marka', icon: 'car' },
      { key: 'model', label: 'Model', icon: 'car-sport' },
      { key: 'year', label: 'Model Yılı', icon: 'calendar' },
      { key: 'km', label: 'Kilometre', icon: 'speedometer' },
      { key: 'fuelType', label: 'Yakıt Tipi', icon: 'water' },
      { key: 'transmission', label: 'Vites', icon: 'settings' },
      { key: 'condition', label: 'Durum', icon: 'checkmark-circle' },
      { key: 'rentalType', label: 'İlan Tipi', icon: 'pricetag' },
    ]
  },
};

interface ProductDetailScreenProps {
  navigation?: any;
  route: {
    params?: {
      product?: Product;
      productId?: string;
      _id?: string;
      id?: string;
    };
  };
}

const normalizeImageUrl = (url: string | null | undefined): string | null => {
  if (!url || typeof url !== 'string') return null;
  if (url.startsWith('file://')) return null;
  if (url.includes('localhost:5000')) {
    url = url.replace('localhost:5000', ENV.API_BASE_URL.replace('/api', ''));
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('/')) {
    return `${API_BASE_URL}${url}`;
  }
  return null;
};

// Video Player Component
interface VideoPlayerComponentProps {
  videoUrl: string;
  style?: any;
  autoPlay?: boolean;
}

const VideoPlayerComponent: React.FC<VideoPlayerComponentProps> = ({ 
  videoUrl, 
  style,
  autoPlay = false 
}) => {
  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = true;
    player.muted = false;
    if (autoPlay) {
      player.play();
    }
  });

  return (
    <View style={[{ flex: 1, backgroundColor: '#000' }, style]}>
      <VideoView
        player={player}
        contentFit="cover"
        nativeControls={true}
        style={{ flex: 1 }}
      />
    </View>
  );
};

const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({ route, navigation: navProp }) => {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const IMAGE_HEIGHT = SCREEN_HEIGHT * 0.45;
  const SAFE_AREA_TOP = Platform.OS === 'ios' ? 50 : 40;
  
  const routeProduct = route.params?.product || route.params;
  const productId = route.params?.productId || route.params?._id || route.params?.id || (routeProduct as Product)?._id || (routeProduct as Product)?.id;
  const hookNavigation = useNavigation<NavigationProp<any>>();
  const navigation = navProp || hookNavigation;
  const { user } = useAuth();
  
  const handleGoBack = useCallback(() => {
    try {
      console.log('🔙 handleGoBack called');
      console.log('🔙 navigation object:', navigation);
      
      if (navigation) {
        console.log('🔙 navigation exists');
        if (typeof navigation.goBack === 'function') {
          console.log('🔙 goBack is function');
          if (navigation.canGoBack && typeof navigation.canGoBack === 'function') {
            console.log('🔙 canGoBack check:', navigation.canGoBack());
            if (navigation.canGoBack()) {
              console.log('🔙 calling goBack');
              navigation.goBack();
            }
          } else {
            console.log('🔙 calling goBack directly');
            navigation.goBack();
          }
        } else {
          console.log('🔙 goBack is not a function');
        }
      } else {
        console.log('🔙 navigation is null/undefined');
      }
    } catch (error) {
      console.error('🔙 Navigation error:', error);
    }
  }, [navigation]);
  
  // Always load fresh from server to get latest seller information
  // Don't use route params product to avoid stale seller data
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(!!productId);
  const [error, setError] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [videoThumbs, setVideoThumbs] = useState<Record<number, string>>({});
  
  // Zoom and pan values with persistence
  const imageScale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const imageTranslateX = useSharedValue(0);
  const imageTranslateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Media items with type information
  const allMedia = useMemo(() => {
    if (!product) return [];
    
    const media: Array<{ url: string; type: 'image' | 'video' }> = [];
    
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((img) => {
        let url: string | null = null;
        let mediaType: 'image' | 'video' = 'image';
        
        if (typeof img === 'string') {
          url = normalizeImageUrl(img);
        } else if (img && typeof img === 'object' && img.url) {
          url = normalizeImageUrl(img.url);
          // Check if it's a video
          if (img.type === 'video') {
            mediaType = 'video';
          }
        }
        
        if (url) {
          media.push({ url, type: mediaType });
        }
      });
    }
    
    const primaryImage = (product as any).primaryImage;
    if (primaryImage) {
      const normalized = normalizeImageUrl(
        typeof primaryImage === 'string' ? primaryImage : primaryImage.url || ''
      );
      if (normalized) {
        media.push({ url: normalized, type: 'image' });
      }
    }
    
    const image = (product as any).image;
    if (image) {
      const normalized = normalizeImageUrl(
        typeof image === 'string' ? image : image.url || ''
      );
      if (normalized) {
        media.push({ url: normalized, type: 'image' });
      }
    }
    
    return media;
  }, [product]);

  // All images (for backward compatibility)
  const allImages = useMemo(() => {
    return allMedia.map(m => m.url);
  }, [allMedia]);

  // Generate thumbnails for video items so that their preview is visible in the thumbnail strip
  useEffect(() => {
    let cancelled = false;
    const generate = async () => {
      const results: Record<number, string> = {};
      for (let i = 0; i < allMedia.length; i++) {
        const m = allMedia[i];
        if (m.type === 'video') {
          try {
            const { uri } = await VideoThumbnails.getThumbnailAsync(m.url, { time: 1000 });
            results[i] = uri;
          } catch (e) {
            // ignore, keep default icon fallback
          }
        }
      }
      if (!cancelled) setVideoThumbs(results);
    };
    if (allMedia.length > 0) generate();
    return () => { cancelled = true; };
  }, [allMedia]);

  const sellerProfileImage = useMemo(() => {
    if (!product?.seller?.profileImage) return null;
    return normalizeImageUrl(product.seller.profileImage);
  }, [product?.seller?.profileImage]);

  const loadProduct = useCallback(async (forceRefresh = false) => {
    if (!productId) {
      setError(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(false);
      
      // Always force refresh to get latest seller information
      // API function already handles cache busting internally
      const productData = await productsAPI.getProduct(productId);
      
      if (productData && productData.title) {
        console.log('✅ Product loaded - Seller info:', {
          name: productData.seller?.name,
          phone: productData.seller?.phone,
          location: productData.seller?.location,
          sellerType: typeof productData.seller
        });
        
        // Verify seller is populated (should be object, not ObjectId)
        if (!productData.seller || typeof productData.seller === 'string') {
          console.warn('⚠️ Seller not populated properly!');
        }
        
        setProduct(productData);
      } else {
        setError(true);
      }
    } catch (err: any) {
      console.error('Error loading product:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const checkFavorite = useCallback(async () => {
    if (!product?._id || !user) return;
    
    try {
      const favorites = await productsAPI.getFavorites();
      const favoriteIds = (favorites.products || favorites || []).map((p: any) => p._id || p.id);
      setIsFavorite(favoriteIds.includes(product._id || product.id));
    } catch (err) {
      console.error('Error checking favorite:', err);
      setIsFavorite(false);
    }
  }, [product?._id, user]);

  // Always load product fresh when screen focuses - ensures seller info is up-to-date
  useFocusEffect(
    useCallback(() => {
      if (productId) {
        console.log('🔄 Screen focused, loading fresh product data...');
        loadProduct(true);
      }
    }, [productId, loadProduct])
  );

  // Initial load when productId changes
  useEffect(() => {
    if (productId) {
      console.log('🔄 Initial load, fetching fresh product...');
      loadProduct(true);
    }
  }, [productId]);

  useEffect(() => {
    if (product?._id && user) {
      checkFavorite();
    }
  }, [product?._id, user, checkFavorite]);

  // Reset zoom and pan when image changes
  useEffect(() => {
    imageScale.value = 1;
    savedScale.value = 1;
    imageTranslateX.value = 0;
    imageTranslateY.value = 0;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  }, [currentImageIndex]);

  const goToNextImage = useCallback(() => {
    if (currentImageIndex < allMedia.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentImageIndex(prev => prev + 1);
    }
  }, [currentImageIndex, allMedia.length]);

  const goToPreviousImage = useCallback(() => {
    if (currentImageIndex > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentImageIndex(prev => prev - 1);
    }
  }, [currentImageIndex]);

  // Pinch gesture for zoom (preserves zoom level)
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      imageScale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      savedScale.value = imageScale.value;
      // Scale sınırları (1x - 4x)
      if (imageScale.value < 1) {
        imageScale.value = withSpring(1);
        savedScale.value = 1;
        // Reset pan when zoom resets
        imageTranslateX.value = withSpring(0);
        imageTranslateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else if (imageScale.value > 4) {
        imageScale.value = withSpring(4);
        savedScale.value = 4;
      }
    })
    .runOnJS(true);

  // Pan gesture for moving zoomed image
  const panGesture = Gesture.Pan()
    .minPointers(1)
    .maxPointers(1)
    .onUpdate((event) => {
      // Always allow panning, but handle swipe detection separately
      if (savedScale.value > 1) {
        // When zoomed, allow panning
        imageTranslateX.value = savedTranslateX.value + event.translationX;
        imageTranslateY.value = savedTranslateY.value + event.translationY;
      } else {
        // When not zoomed, track translation for swipe detection
        imageTranslateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      if (savedScale.value > 1) {
        // Calculate pan limits based on zoom level
        const maxTranslateX = (screenWidth * (savedScale.value - 1)) / 2;
        const maxTranslateY = (screenHeight * (savedScale.value - 1)) / 2;
        
        // Clamp X translation
        if (imageTranslateX.value > maxTranslateX) {
          imageTranslateX.value = withSpring(maxTranslateX);
        } else if (imageTranslateX.value < -maxTranslateX) {
          imageTranslateX.value = withSpring(-maxTranslateX);
        } else {
          imageTranslateX.value = withSpring(imageTranslateX.value);
        }
        
        // Clamp Y translation
        if (imageTranslateY.value > maxTranslateY) {
          imageTranslateY.value = withSpring(maxTranslateY);
        } else if (imageTranslateY.value < -maxTranslateY) {
          imageTranslateY.value = withSpring(-maxTranslateY);
        } else {
          imageTranslateY.value = withSpring(imageTranslateY.value);
        }
        
        savedTranslateX.value = imageTranslateX.value;
        savedTranslateY.value = imageTranslateY.value;
      } else {
        // Swipe between images when not zoomed
        const threshold = 100;
        if (Math.abs(event.translationX) > threshold) {
          if (event.translationX > 0) {
            runOnJS(goToPreviousImage)();
          } else {
            runOnJS(goToNextImage)();
          }
        }
        imageTranslateX.value = withSpring(0);
        imageTranslateY.value = withSpring(0);
      }
    })
    .runOnJS(true);

  // Combine gestures - Simultaneous allows both to work together
  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: imageScale.value },
      { translateX: imageTranslateX.value },
      { translateY: imageTranslateY.value },
    ],
  }));

  const handleFavorite = useCallback(async () => {
    if (!user) {
      Alert.alert('Giriş Gerekli', 'Favorilere eklemek için lütfen giriş yapın.');
      return;
    }

    if (!productId) return;

    try {
      setFavoriteLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      if (isFavorite) {
        await productsAPI.removeFromFavorites(productId);
        setIsFavorite(false);
      } else {
        await productsAPI.addToFavorites(productId);
        setIsFavorite(true);
      }
    } catch (err: any) {
      console.error('Error toggling favorite:', err);
      Alert.alert('Hata', err?.message || 'İşlem gerçekleştirilemedi');
    } finally {
      setFavoriteLoading(false);
    }
  }, [user, productId, isFavorite]);

  // Ürün URL'si oluştur
  const getProductUrl = useCallback(() => {
    return ENV.getProductUrl(productId || '');
  }, [productId]);

  // Ürün Deep Link oluştur
  const getProductDeepLink = useCallback(() => {
    return ENV.getProductDeepLink(productId || '');
  }, [productId]);

  // Paylaşım mesajı oluştur (Universal Link ile)
  const getShareMessage = useCallback(() => {
    const webUrl = getProductUrl();
    return `🌿 ${product?.title || 'Ürün'}\n\n💰 Fiyat: ${product?.price || 0} ${product?.currency || '₺'}/${product?.unit || 'kg'}\n📦 Stok: ${product?.stock || 0} ${product?.unit || 'kg'}\n📍 Konum: ${locationString}\n\n👉 Ürünü görüntüle: ${webUrl}\n\n📱 Hal Kompleksi - Çiftçiler ve Alıcılar Buluşuyor`;
  }, [product, locationString, getProductUrl]);

  // Paylaşım (Native Share Sheet)
  const handleShare = useCallback(async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const message = getShareMessage();
      
      await Share.share({
        message,
        title: product?.title || 'Ürün',
      });
    } catch (err: any) {
      if (err.code !== 'SHARE_CANCELLED') {
        console.error('Error sharing:', err);
      }
    }
  }, [product, getShareMessage]);

  const handleWhatsApp = useCallback(async () => {
    if (!product?.seller?.phone) {
      Alert.alert('Hata', 'Satıcının telefon numarası bulunamadı');
      return;
    }
    
    try {
      // Otomatik mesaj hazırla
      const autoMessage = `Merhaba, Hal Kompleksi üzerinden "${product?.title || 'ürününüz'}" hakkında bilgi almak istiyorum.\n\nFiyat: ${product?.price || 0} ${product?.currency || '₺'}/${product?.unit || 'kg'}\nStok: ${product?.stock || 0} ${product?.unit || 'kg'}`;
      const encodedMessage = encodeURIComponent(autoMessage);
      
      // Telefon numarası artık DB'de +905XXXXXXXXX formatında
      // Sadece rakamları al (+ işaretini kaldır)
      const cleanPhone = product.seller.phone.replace(/\+/g, '');
      
      // WhatsApp URL format with pre-filled message (+ işareti olmadan)
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
      
      console.log('📱 Opening WhatsApp');
      console.log('📱 Phone (stored):', product.seller.phone);
      console.log('📱 Phone (clean):', cleanPhone);
      console.log('📱 WhatsApp URL:', whatsappUrl);
      
      // Try to open directly
      try {
        const supported = await Linking.canOpenURL(whatsappUrl);
        console.log('📱 Can open URL:', supported);
        
        if (supported) {
          await Linking.openURL(whatsappUrl);
        } else {
          // Fallback: try opening anyway (sometimes canOpenURL fails but URL still works)
          await Linking.openURL(whatsappUrl);
        }
      } catch (openError) {
        console.log('📱 Direct open failed, trying alternative:', openError);
        
        // Alternative: Try with whatsapp:// scheme if https fails
        const whatsappScheme = `whatsapp://send?phone=${cleanPhone}&text=${encodedMessage}`;
        try {
          await Linking.openURL(whatsappScheme);
        } catch (schemeError) {
          // Last resort: Open in browser
          console.log('📱 WhatsApp scheme failed, opening in browser');
          await Linking.openURL(whatsappUrl);
        }
      }
    } catch (err: any) {
      console.error('📱 WhatsApp error:', err);
      Alert.alert(
        'Hata', 
        `WhatsApp açılamadı. Lütfen WhatsApp'ın kurulu olduğundan emin olun.\n\nHata: ${err?.message || 'Bilinmeyen hata'}`
      );
    }
  }, [product]);

  const handleCall = useCallback(async () => {
    if (!product?.seller?.phone) return;
    
    try {
      // Telefon numarası +905XXXXXXXXX formatında
      // tel: protokolü için + işareti ile kullanabiliriz
      const telUrl = `tel:${product.seller.phone}`;
      
      console.log('📞 Calling:', product.seller.phone);
      
      const canOpen = await Linking.canOpenURL(telUrl);
      if (canOpen) {
        await Linking.openURL(telUrl);
      } else {
        Alert.alert('Hata', 'Telefon araması yapılamadı');
      }
    } catch (err) {
      console.error('📞 Call error:', err);
      Alert.alert('Hata', 'Arama yapılamadı');
    }
  }, [product?.seller?.phone]);

  const locationString = useMemo(() => {
    if (!product?.location) return 'Belirtilmemiş';
    if (typeof product.location === 'string') return product.location;
    const city = product.location.city || '';
    const district = product.location.district || '';
    return `${city} ${district}`.trim() || 'Belirtilmemiş';
  }, [product?.location]);

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Ürün yükleniyor...</Text>
        </View>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
          <Text style={styles.errorText}>Ürün bulunamadı</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              if (error) {
                loadProduct();
              } else {
                navigation.goBack();
              }
            }}
          >
            <Text style={styles.retryButtonText}>{error ? 'Tekrar Dene' : 'Geri Dön'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        {/* Scrollable Content with Image */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Image Section - Scrollable */}
          <View style={[styles.imageSection, { height: IMAGE_HEIGHT }]}>
            {/* Action Bar - Scrollable - Must be on top */}
            <View style={[styles.actionBar, { top: SAFE_AREA_TOP }]} pointerEvents="box-none">
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleGoBack}
                activeOpacity={0.7}
              >
                <View style={styles.actionButtonBg}>
                  <Ionicons name="arrow-back" size={22} color="#fff" />
                </View>
              </TouchableOpacity>

              <View style={styles.rightActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonMargin]}
                  onPress={handleShare}
                  activeOpacity={0.7}
                >
                  <View style={styles.actionButtonBg}>
                    <Ionicons name="share-outline" size={22} color="#fff" />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonMargin]}
                  onPress={handleFavorite}
                  disabled={favoriteLoading}
                  activeOpacity={0.7}
                >
                  <View style={styles.actionButtonBg}>
                    {favoriteLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Ionicons 
                        name={isFavorite ? "heart" : "heart-outline"} 
                        size={22} 
                        color={isFavorite ? "#FF3040" : "#fff"} 
                      />
                    )}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.actionButtonBg}>
                    <Ionicons name="expand" size={22} color="#fff" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {allMedia.length > 0 ? (
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => setModalVisible(true)}
                style={styles.imageTouchable}
                hitSlop={{ top: 0, bottom: 0, left: 0, right: 0 }}
              >
                {allMedia[currentImageIndex].type === 'video' ? (
                  <VideoPlayerComponent 
                    videoUrl={allMedia[currentImageIndex].url}
                    style={styles.productImage}
                  />
                ) : (
                  <Image
                    source={{ 
                      uri: allMedia[currentImageIndex].url,
                      cache: 'force-cache'
                    }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                )}
                
                {/* Gradient Overlay for Title */}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']}
                  style={styles.imageGradient}
                >
                  {/* Product Title on Image */}
                  <View style={styles.titleContainer}>
                    <View style={styles.titleRow}>
                    <Text style={styles.productTitleOnImage} numberOfLines={2}>
                      {String(product.title || 'Ürün Başlığı')}
                    </Text>
                      {product.isFeatured ? (
                        <View style={styles.featuredBadgeOnImage}>
                          <Ionicons name="star" size={12} color="#FFD700" />
                          <Text style={styles.featuredTextOnImage}>Öne Çıkan</Text>
                        </View>
                      ) : null}
                    </View>
                    {product.category ? (
                      <View style={styles.categoryBadgeOnImage}>
                        <Ionicons name="pricetag" size={10} color={COLORS.primaryLight} />
                        <Text style={styles.categoryTextOnImage}>{String(product.category)}</Text>
                      </View>
                    ) : null}

                   
                  </View>
                </LinearGradient>
                
                {/* Navigation Arrows */}
                {allImages.length > 1 && (
                  <>
                    {currentImageIndex > 0 && (
                      <TouchableOpacity
                        style={styles.imageNavButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          goToPreviousImage();
                        }}
                      >
                        <Ionicons name="chevron-back" size={24} color="#fff" />
                      </TouchableOpacity>
                    )}
                    {currentImageIndex < allMedia.length - 1 && (
                      <TouchableOpacity
                        style={[styles.imageNavButton, styles.imageNavButtonRight]}
                        onPress={(e) => {
                          e.stopPropagation();
                          goToNextImage();
                        }}
                      >
                        <Ionicons name="chevron-forward" size={24} color="#fff" />
                      </TouchableOpacity>
                    )}
                    
                    <View style={styles.imageCounter}>
                      <Text style={styles.imageCounterText}>
                        {currentImageIndex + 1} / {allMedia.length}
                      </Text>
                      {allMedia[currentImageIndex].type === 'video' && (
                        <View style={styles.videoBadge}>
                          <Ionicons name="videocam" size={10} color="#fff" />
                        </View>
                      )}
                    </View>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.noImageContainer}>
                <Ionicons name="image-outline" size={64} color={COLORS.primaryLight} />
                <Text style={styles.noImageText}>Görsel bulunamadı</Text>
              </View>
            )}
         
          </View>
          {/* Product Info Card */}
          <View style={styles.productCard}>
            {/* Thumbnails under header, above price */}
            {Array.isArray(allMedia) && allMedia.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbRow}>
                {allMedia.map((m, idx) => (
                  <TouchableOpacity
                    key={`${idx}-${m.url}`}
                    style={[styles.thumbItem, idx === currentImageIndex && styles.thumbItemActive]}
                    onPress={() => setCurrentImageIndex(idx)}
                    activeOpacity={0.8}
                  >
                    {m.type === 'image' ? (
                      <Image
                        source={{ uri: m.url, cache: 'force-cache' }}
                        style={styles.thumbImage}
                        resizeMode="cover"
                      />
                    ) : videoThumbs[idx] ? (
                      <Image
                        source={{ uri: videoThumbs[idx], cache: 'force-cache' }}
                        style={styles.thumbImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.thumbImage, styles.thumbVideo]}> 
                        <Ionicons name="videocam" size={18} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Price Section */}
            <View style={styles.priceSection}>
              <Text style={styles.priceLabel}>Fiyat</Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>{String(product.price || 0)}</Text>
                <Text style={styles.currency}>{String(product.currency || '₺')}</Text>
                <Text style={styles.unit}>/ {String(product.unit || 'kg')}</Text>
              </View>
            </View>

            {/* Description */}
            <View style={styles.descriptionSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="document-text" size={20} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Ürün Açıklaması</Text>
              </View>
              <Text style={styles.description}>
                {String(product.description || 'Açıklama bulunamadı.')}
              </Text>
            </View>

            {/* Info Grid */}
            <View style={styles.infoGrid}>
              {/* Stok bilgisi - tüm ürünler için */}
              <View style={styles.infoCard}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="cube" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.infoLabel}>Stok</Text>
                <Text style={styles.infoValue}>
                  {String(product.stock || 0)} {String(product.unit || 'kg')}
                </Text>
              </View>

              {/* Konum bilgisi - tüm ürünler için */}
              <View style={styles.infoCard}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="location" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.infoLabel}>Konum</Text>
                <Text style={styles.infoValue} numberOfLines={2}>
                  {String(locationString)}
                </Text>
              </View>

              {/* Kategori-spesifik alanlar */}
              {product.category && categoryFields[product.category] && product.categoryData && 
                categoryFields[product.category].fields.map((field: any) => {
                  const value = (product.categoryData as any)?.[field.key];
                  
                  // Değer yoksa gösterme
                  if (value === undefined || value === null || value === '') return null;
                  
                  // Boolean değerleri formatla
                  let displayValue = value;
                  if (field.isBoolean) {
                    displayValue = value ? 'Evet' : 'Hayır';
                  } else if (field.isDate && value) {
                    // Tarih formatla ve geçersiz tarihleri kontrol et
                    try {
                      const date = new Date(value);
                      // Geçersiz tarih kontrolü - Invalid Date durumunda gösterme
                      if (isNaN(date.getTime())) {
                        return null;
                      }
                      displayValue = date.toLocaleDateString('tr-TR');
                    } catch (e) {
                      // Hata durumunda bu alanı gösterme
                      return null;
                    }
                  } else {
                    displayValue = String(value);
                  }
                  
                  return (
                    <View key={field.key} style={styles.infoCard}>
                      <View style={styles.infoIconContainer}>
                        <Ionicons name={field.icon as any} size={24} color={COLORS.primary} />
                      </View>
                      <Text style={styles.infoLabel}>{field.label}</Text>
                      <Text style={styles.infoValue} numberOfLines={2}>
                        {displayValue}
                      </Text>
                    </View>
                  );
                })
              }
            </View>

            {/* Seller Card */}
            <View style={styles.sellerCard}>
              <View style={styles.sellerContent}>
                <View style={styles.sellerImageContainer}>
                  {sellerProfileImage ? (
                    <Image 
                      source={{ uri: sellerProfileImage }} 
                      style={styles.sellerImage}
                    />
                  ) : (
                    <LinearGradient
                      colors={[COLORS.primary, COLORS.primaryLight]}
                      style={styles.sellerImagePlaceholder}
                    >
                      <Ionicons name="person" size={28} color="#fff" />
                    </LinearGradient>
                  )}
                  
                </View>
                
                <View style={styles.sellerInfo}>
                  <Text style={styles.sellerLabel}>SATICI</Text>
                  <Text style={styles.sellerName}>
                    {product.seller?.name ? String(product.seller.name) : 'Satıcı bilgisi yok'}
                  </Text>
                  {product.seller?.phone ? (
                    <View style={styles.contactRow}>
                      <Ionicons name="call" size={12} color={COLORS.primary} />
                      <Text style={styles.contactText}>{String(product.seller.phone)}</Text>
                    </View>
                  ) : null}
                  {typeof product.location === 'object' && product.location?.city ? (
                    <View style={styles.contactRow}>
                      <Ionicons name="location" size={12} color={COLORS.primary} />
                      <Text style={styles.contactText}>
                        {String(product.location.city)}
                        {product.location.district ? `, ${String(product.location.district)}` : null}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>

            {/* Contact Buttons */}
            {product.seller?.phone ? (
              <View style={styles.contactButtons}>
                <TouchableOpacity
                  style={[styles.contactButton, styles.whatsappButton]}
                  onPress={handleWhatsApp}
                  activeOpacity={0.8}
                >
                  <Ionicons name="logo-whatsapp" size={24} color="#fff" />
                  <Text style={styles.contactButtonText}>Mesaj Gönder</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.contactButton, styles.callButton]}
                  onPress={handleCall}
                  activeOpacity={0.8}
                >
                  <Ionicons name="call" size={24} color="#fff" />
                  <Text style={styles.contactButtonText}>Ara</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </ScrollView>

        {/* Full Screen Image Modal */}
        <Modal 
          visible={modalVisible} 
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.modalContainer}>
              <GestureDetector gesture={composedGesture}>
                <Animated.View 
                  style={[styles.fullScreenImageContainer, animatedImageStyle]}
                >
                  {allMedia.length > 0 && allMedia[currentImageIndex].type === 'video' ? (
                    <VideoPlayerComponent 
                      videoUrl={allMedia[currentImageIndex].url}
                      style={styles.fullScreenImage}
                      autoPlay={true}
                    />
                  ) : (
                    <Image 
                      source={{ 
                        uri: allImages[currentImageIndex],
                        cache: 'force-cache'
                      }} 
                      style={styles.fullScreenImage}
                      resizeMode="contain"
                    />
                  )}
                </Animated.View>
              </GestureDetector>

              <TouchableOpacity
                style={[styles.modalCloseButton, { top: SAFE_AREA_TOP }]}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}
              >
                <View style={styles.closeButtonBg}>
                  <Ionicons name="close" size={24} color="white" />
                </View>
              </TouchableOpacity>
            </View>
          </GestureHandlerRootView>
        </Modal>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 24,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Image Section - Scrollable
  imageSection: {
    width: '100%',
    backgroundColor: '#000',
    overflow: 'hidden',
    position: 'relative',
  },
  imageTouchable: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 80,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  titleContainer: {
    marginTop: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  productTitleOnImage: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    lineHeight: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  featuredBadgeOnImage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 249, 230, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: 8,
  },
  featuredTextOnImage: {
    color: '#B8860B',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  categoryBadgeOnImage: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.5)',
    marginBottom: 20,
  },
  categoryTextOnImage: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  priceBadgeOnImage: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceBadgeValue: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  priceBadgeCurrency: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  priceBadgeUnit: {
    color: '#4B5563',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  imageNavButton: {
    position: 'absolute',
    left: 16,
    top: '50%',
    transform: [{ translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  imageNavButtonRight: {
    left: undefined,
    right: 16,
  },
  thumbOverlayContainer: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
  },
  thumbRow: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  thumbItem: {
    width: 72,
    height: 72,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  thumbItemActive: {
    borderColor: COLORS.primary,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbVideo: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageCounter: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    zIndex: 10,
  },
  imageCounterText: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 13,
    fontWeight: '600',
  },
  videoBadge: {
    marginLeft: 8,
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  noImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.border,
  },
  noImageText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  // Action Bar - Scrollable
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    pointerEvents: 'box-none',
  },
  rightActions: {
    flexDirection: 'row',
  },
  actionButton: {
    borderRadius: 20,
    overflow: 'hidden',
    zIndex: 1001,
  },
  actionButtonMargin: {
    marginRight: 12,
  },
  actionButtonBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  // ScrollView
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  // Product Card
  productCard: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginTop: -28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  priceSection: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  priceLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 28,
    color: COLORS.primary,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  currency: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: '700',
    marginLeft: 4,
  },
  unit: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
    fontWeight: '500',
  },
  descriptionSection: {
    marginBottom: 24,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  description: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 24,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    marginHorizontal: -6,
  },
  infoCard: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: 12,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '700',
    textAlign: 'center',
  },
  sellerCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    marginBottom: 16,
  },
  sellerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  sellerImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  sellerImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  sellerImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFD700',
    marginLeft: 2,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sellerName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  contactButtons: {
    flexDirection: 'row',
    marginHorizontal: -6,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  whatsappButton: {
    backgroundColor: COLORS.whatsapp,
  },
  callButton: {
    backgroundColor: COLORS.primary,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImageContainer: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: Dimensions.get('window').width,
    height: '100%',
  },
  modalCloseButton: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
  },
  closeButtonBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});

export default ProductDetailScreen;
