import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { marketReportsAPI } from '../../services/api';
import * as ImagePicker from 'expo-image-picker';

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

const MarketShareScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  
  // State
  const [reports, setReports] = useState<MarketReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReport, setEditingReport] = useState<MarketReport | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    city: '',
    district: '',
    marketName: '',
    reportDate: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Common cities for quick selection
  const cities = [
    'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya',
    'Gaziantep', 'Mersin', 'Diyarbakır', 'Kayseri', 'Eskişehir', 'Urfa',
    'Malatya', 'Erzurum', 'Van', 'Batman', 'Elazığ', 'İzmit', 'Manisa'
  ];


  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading market reports...');
      const response = await marketReportsAPI.getAll();
      console.log('📊 Market reports response:', response);
      setReports(response.reports || []);
    } catch (error) {
      console.error('❌ Load reports error:', error);
      Alert.alert('Hata', 'Raporlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      city: '',
      district: '',
      marketName: '',
      reportDate: new Date().toISOString().split('T')[0],
      description: ''
    });
    setSelectedImage(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (report: MarketReport) => {
    setEditingReport(report);
    setFormData({
      title: report.title,
      city: report.city,
      district: report.district || '',
      marketName: report.marketName || '',
      reportDate: new Date(report.reportDate).toISOString().split('T')[0],
      description: report.description || ''
    });
    setSelectedImage(report.image?.url || null);
    setShowEditModal(true);
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri erişimi gerekli');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // Kare olarak kırpmayı kaldırdık
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };


  const submitReport = async () => {
    if (!formData.title.trim() || !formData.city.trim()) {
      Alert.alert('Hata', 'Başlık ve şehir gereklidir');
      return;
    }

    try {
      setSubmitting(true);

      const submitData = {
        ...formData
      };

      let response;
      if (editingReport) {
        response = await marketReportsAPI.update(editingReport._id, submitData, selectedImage || undefined);
        Alert.alert('Başarılı', 'Rapor güncellendi');
      } else {
        response = await marketReportsAPI.create(submitData, selectedImage || undefined);
        Alert.alert('Başarılı', 'Rapor oluşturuldu');
      }

      setShowCreateModal(false);
      setShowEditModal(false);
      setEditingReport(null);
      resetForm();
      loadReports();
    } catch (error) {
      console.error('Submit report error:', error);
      Alert.alert('Hata', 'Rapor kaydedilirken hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteReport = async (reportId: string) => {
    Alert.alert(
      'Raporu Sil',
      'Bu raporu silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await marketReportsAPI.delete(reportId);
              Alert.alert('Başarılı', 'Rapor silindi');
              loadReports();
            } catch (error) {
              console.error('Delete report error:', error);
              Alert.alert('Hata', 'Rapor silinirken hata oluştu');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Süresi doldu';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}s ${minutes}dk kaldı`;
    } else {
      return `${minutes}dk kaldı`;
    }
  };

  const renderReportItem = ({ item }: { item: MarketReport }) => (
    <View style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View style={styles.reportTitleContainer}>
          <Text style={styles.reportTitle}>{item.title}</Text>
          <Text style={styles.reportLocation}>{item.city} {item.district && `- ${item.district}`}</Text>
        </View>
        <View style={styles.reportActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => openEditModal(item)}
          >
            <Ionicons name="create-outline" size={20} color="#27AE60" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteReport(item._id)}
          >
            <Ionicons name="trash-outline" size={20} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      </View>

      {item.image && (
        <Image source={{ uri: item.image.url }} style={styles.reportImage} />
      )}

      <View style={styles.reportInfo}>
        <Text style={styles.reportDate}>{formatDate(item.reportDate)}</Text>
        <Text style={[
          styles.reportStatus,
          { color: item.isActive ? '#27AE60' : '#E74C3C' }
        ]}>
          {item.isActive ? 'Aktif' : 'Pasif'}
        </Text>
        <Text style={styles.reportExpiry}>
          {getTimeRemaining(item.expiresAt)}
        </Text>
      </View>

      {item.description && (
        <Text style={styles.reportDescription}>{item.description}</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#27AE60" />
          <Text style={styles.loadingText}>Raporlar yükleniyor...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Modern Header */}
      <View style={styles.modernHeader}>
        <LinearGradient
          colors={['#2cbd69', '#27ae60']}
          style={styles.headerGradient}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.modernBackButton} 
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.modernHeaderTitle}>Piyasa Paylaş</Text>
              <Text style={styles.modernHeaderSubtitle}>Piyasa raporlarını yönetin</Text>
            </View>
            <TouchableOpacity
              style={styles.modernAddButton}
              onPress={openCreateModal}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Reports List */}
      <FlatList
        data={reports}
        renderItem={renderReportItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.reportsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#BDC3C7" />
            <Text style={styles.emptyText}>Henüz piyasa raporu yok</Text>
            <Text style={styles.emptySubtext}>İlk raporu oluşturmak için + butonuna basın</Text>
          </View>
        }
      />

      {/* Create/Edit Modal */}
      <Modal
        visible={showCreateModal || showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
                setEditingReport(null);
                resetForm();
              }}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingReport ? 'Raporu Düzenle' : 'Yeni Rapor'}
            </Text>
            <TouchableOpacity
              onPress={submitReport}
              disabled={submitting}
              style={styles.saveButton}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="checkmark" size={24} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Basic Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Temel Bilgiler</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Rapor Başlığı"
                value={formData.title}
                onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              />

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <TextInput
                    style={styles.input}
                    placeholder="Şehir"
                    value={formData.city}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, city: text }))}
                  />
                </View>
                <View style={styles.halfInput}>
                  <TextInput
                    style={styles.input}
                    placeholder="İlçe (Opsiyonel)"
                    value={formData.district}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, district: text }))}
                  />
                </View>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Pazar Adı (Opsiyonel)"
                value={formData.marketName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, marketName: text }))}
              />

              <TextInput
                style={styles.input}
                placeholder="Rapor Tarihi"
                value={formData.reportDate}
                onChangeText={(text) => setFormData(prev => ({ ...prev, reportDate: text }))}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Açıklama (Opsiyonel)"
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Image */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Fotoğraf</Text>
              <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                {selectedImage ? (
                  <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="camera" size={32} color="#BDC3C7" />
                    <Text style={styles.imagePlaceholderText}>Fotoğraf Seç</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#7F8C8D',
  },
  // Modern Header Styles
  modernHeader: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  modernHeaderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  modernHeaderSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  modernBackButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 25,
    padding: 12,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modernAddButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 25,
    padding: 12,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportsList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 8,
  },
  reportTitleContainer: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  reportLocation: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  reportActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  reportImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  reportInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 8,
  },
  reportDate: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  reportStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  reportExpiry: {
    fontSize: 12,
    color: '#E67E22',
  },
  reportDescription: {
    padding: 16,
    paddingTop: 0,
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7F8C8D',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#BDC3C7',
    marginTop: 8,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#27AE60',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  saveButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  imageButton: {
    marginBottom: 12,
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    height: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: '#BDC3C7',
    marginTop: 8,
  },
});

export default MarketShareScreen;
