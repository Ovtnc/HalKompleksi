import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StatusBar,
  Dimensions,
  Share,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { marketReportsAPI } from '../../services/api';
import ImageViewerScreen from './ImageViewerScreen';
import { ENV } from '../../config/env';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';

const { width } = Dimensions.get('window');

interface MarketReport {
  _id: string;
  title: string;
  city: string;
  district: string;
  marketName: string;
  reportDate: string;
  description: string;
  image?: {
    url: string;
  };
  createdBy: {
    name: string;
  };
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
}

interface MarketReportDetailScreenProps {
  navigation?: any;
  route?: {
    params?: {
      reportId: string;
    };
  };
}

const MarketReportDetailScreen = ({ navigation, route }: MarketReportDetailScreenProps) => {
  const insets = useSafeAreaInsets();
  const reportId = route?.params?.reportId;
  const [report, setReport] = useState<MarketReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (reportId) {
      loadReport();
    }
  }, [reportId]);

  const loadReport = async () => {
    try {
      setLoading(true);
      if (!reportId) {
        Alert.alert('Hata', 'Rapor ID bulunamadı');
        navigation?.goBack();
        return;
      }

      const response = await marketReportsAPI.getReport(reportId);
      setReport(response);
    } catch (error) {
      console.error('Error loading report:', error);
      Alert.alert('Hata', 'Piyasa raporu yüklenirken bir hata oluştu');
      navigation?.goBack();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      weekday: 'long'
    });
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Süresi dolmuş';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} gün kaldı`;
    }
    
    return `${hours}s ${minutes}d`;
  };

  const fixImageUrl = (url: string) => {
    if (!url) return url;
    return url.replace('localhost:5001', ENV.API_BASE_URL.replace('/api', ''));
  };

  const handleDownloadImage = async () => {
    if (!report?.image?.url) {
      Alert.alert('Hata', 'İndirilecek resim bulunamadı');
      return;
    }

    try {
      setDownloading(true);
      
      // İzin kontrolü
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Resim indirmek için galeri erişim izni gereklidir');
        setDownloading(false);
        return;
      }

      const imageUrl = fixImageUrl(report.image.url);
      const filename = `piyasa-raporu-${report._id}.jpg`;
      const fileUri = FileSystem.documentDirectory + filename;

      // Resmi indir - legacy API kullanarak
      const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri);
      
      if (downloadResult.status === 200 && downloadResult.uri) {
        // Galeriye kaydet
        const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
        
        // Album oluştur veya varsa ekle
        const albumName = 'HalKompleksi';
        let album = await MediaLibrary.getAlbumAsync(albumName);
        if (!album) {
          album = await MediaLibrary.createAlbumAsync(albumName, asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }
        
        Alert.alert('Başarılı', 'Resim galerinize kaydedildi');
      } else {
        throw new Error('İndirme başarısız');
      }
    } catch (error: any) {
      console.error('Download error:', error);
      const errorMessage = error?.message || 'Resim indirilirken bir hata oluştu';
      Alert.alert('Hata', errorMessage);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!report) return;

    try {
      // Create share message with proper formatting
      let shareMessage = `${report.title}\n\n`;
      shareMessage += `📍 ${report.city} - ${report.district || 'Merkez'}\n`;
      shareMessage += `🏪 ${report.marketName}\n`;
      shareMessage += `📅 ${formatDate(report.reportDate)}\n\n`;
      shareMessage += `${report.description || 'Detaylı piyasa raporu için uygulamayı açın.'}\n\n`;
      shareMessage += `#HalKompleksi #PiyasaRaporu`;
      
      // Add image URL to message if available
      if (report.image?.url) {
        const imageUrl = fixImageUrl(report.image.url);
        shareMessage += `\n\n${imageUrl}`;
      }

      const shareContent = {
        title: `${report.title} - ${report.city} Piyasa Raporu`,
        message: shareMessage,
      };

      const result = await Share.share(shareContent);
      
      if (result.action === Share.sharedAction) {
        console.log('Rapor başarıyla paylaşıldı');
      }
    } catch (error) {
      console.error('Paylaşım hatası:', error);
      Alert.alert('Hata', 'Paylaşım sırasında bir hata oluştu');
    }
  };

  const handleImagePress = () => {
    if (report?.image?.url) {
      setShowImageViewer(true);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity
            onPress={() => navigation?.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Piyasa Raporu</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2cbd69" />
          <Text style={styles.loadingText}>Rapor yükleniyor...</Text>
        </View>
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity
            onPress={() => navigation?.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Piyasa Raporu</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#E74C3C" />
          <Text style={styles.errorText}>Rapor yüklenemedi</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadReport}>
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Piyasa Raporu</Text>
        <TouchableOpacity
          onPress={handleShare}
          style={styles.shareButton}
        >
          <Ionicons name="share-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image */}
        {report.image && (
          <TouchableOpacity 
            style={styles.imageContainer}
            onPress={handleImagePress}
            activeOpacity={0.9}
          >
            <Image 
              source={{ uri: fixImageUrl(report.image.url) }} 
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay}>
              <Ionicons name="expand" size={28} color="#FFFFFF" />
              <Text style={styles.imageOverlayText}>Büyütmek için dokunun</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Report Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.reportTitle}>{report.title}</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color="#2cbd69" />
            <Text style={styles.infoText}>
              {report.city} - {report.district || 'Merkez'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="storefront" size={20} color="#2cbd69" />
            <Text style={styles.infoText}>{report.marketName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color="#2cbd69" />
            <Text style={styles.infoText}>{formatDate(report.reportDate)}</Text>
          </View>

          <View style={[
            styles.statusBadge,
            { backgroundColor: report.isActive ? '#E8F5E8' : '#FFE8E8' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: report.isActive ? '#2cbd69' : '#E74C3C' }
            ]}>
              {getTimeRemaining(report.expiresAt)}
            </Text>
          </View>
        </View>

        {/* Description */}
        {report.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Açıklama</Text>
            <Text style={styles.descriptionText}>{report.description}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Ionicons name="person" size={16} color="#999" />
            <Text style={styles.footerText}>Paylaşan: {report.createdBy.name}</Text>
          </View>
          <Text style={styles.footerDate}>
            {formatDate(report.createdAt)} tarihinde paylaşıldı
          </Text>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionContainer, { paddingBottom: insets.bottom + 16 }]}>
        {report.image && (
          <TouchableOpacity
            style={[styles.actionButton, styles.downloadButton]}
            onPress={handleDownloadImage}
            disabled={downloading}
          >
            {downloading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="download-outline" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>İndir</Text>
              </>
            )}
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, styles.shareButtonLarge]}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Paylaş</Text>
        </TouchableOpacity>
      </View>

      {/* Image Viewer Modal */}
      {report.image && (
        <ImageViewerScreen
          visible={showImageViewer}
          images={[fixImageUrl(report.image.url)]}
          onClose={() => setShowImageViewer(false)}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#2cbd69',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2cbd69',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#E0E0E0',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlayText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 16,
    lineHeight: 30,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#555',
    marginLeft: 12,
    flex: 1,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  descriptionContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 24,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    marginLeft: 8,
  },
  footerDate: {
    fontSize: 12,
    color: '#BBB',
  },
  bottomSpacing: {
    height: 100,
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  downloadButton: {
    backgroundColor: '#3498DB',
  },
  shareButtonLarge: {
    backgroundColor: '#2cbd69',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MarketReportDetailScreen;
