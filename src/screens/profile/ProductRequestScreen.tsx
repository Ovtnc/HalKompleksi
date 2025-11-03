import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { notificationsAPI, productsAPI, locationsAPI } from '../../services/api';

const { width } = Dimensions.get('window');

const ProductRequestScreen = ({ navigation, route }: any) => {
  const { initialCategory, initialKeywords, initialCity } = route?.params || {};
  
  const [category, setCategory] = useState(initialCategory || '');
  const [keywords, setKeywords] = useState(initialKeywords || '');
  const [city, setCity] = useState(initialCity || '');
  const [categories, setCategories] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [showCityModal, setShowCityModal] = useState(false);

  useEffect(() => {
    loadCategories();
    loadCities();
    loadMyRequests();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await productsAPI.getCategories();
      setCategories(response || []);
    } catch (error) {
      console.error('Load categories error:', error);
    }
  };

  const loadCities = async () => {
    try {
      const response = await locationsAPI.getCities();
      setCities(response.cities || []);
    } catch (error) {
      console.error('Load cities error:', error);
    }
  };

  const loadMyRequests = async () => {
    try {
      setLoadingRequests(true);
      const response = await notificationsAPI.getProductRequests();
      setMyRequests(response.requests || []);
    } catch (error) {
      console.error('Load requests error:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleSubmit = async () => {
    if (!category) {
      Alert.alert('Hata', 'Lütfen kategori seçin');
      return;
    }

    if (!keywords.trim()) {
      Alert.alert('Hata', 'Lütfen en az bir anahtar kelime girin');
      return;
    }

    try {
      setLoading(true);
      const keywordsArray = keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k);
      
      await notificationsAPI.createProductRequest(
        category,
        keywordsArray,
        '', // Açıklama kaldırıldı
        city || undefined // Şehir boşsa undefined gönder
      );

      Alert.alert(
        'Başarılı',
        'Ürün talebiniz oluşturuldu! Bu kategoride yeni ürün eklendiğinde bildirim alacaksınız.',
        [{ text: 'Tamam', onPress: () => {
          // Reset form
          setCategory('');
          setKeywords('');
          setCity('');
          loadMyRequests();
        }}]
      );
    } catch (error) {
      console.error('Create request error:', error);
      Alert.alert('Hata', 'Talep oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    try {
      await notificationsAPI.deleteProductRequest(requestId);
      Alert.alert('Başarılı', 'Talep silindi');
      loadMyRequests();
    } catch (error) {
      console.error('Delete request error:', error);
      Alert.alert('Hata', 'Talep silinirken hata oluştu');
    }
  };

  return (
    <View style={styles.container}>
      {/* Modern Header */}
      <LinearGradient
        colors={['#2E7D32', '#4CAF50']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Ürün Talebi</Text>
            <Text style={styles.headerSubtitle}>Aradığınız ürünü bulun</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Modern Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="bulb" size={24} color="#2E7D32" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Akıllı Ürün Bildirimi</Text>
            <Text style={styles.infoText}>
              Aradığınız ürün bulunamadı mı? Talep oluşturun, bu kategoride yeni ürün eklendiğinde size bildirim gönderelim!
            </Text>
          </View>
        </View>

        {/* Modern Form Card */}
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <Ionicons name="add-circle" size={24} color="#2E7D32" />
            <Text style={styles.formTitle}>Yeni Talep Oluştur</Text>
          </View>

          {/* Category Selection */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Kategori Seçin *</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.categoriesContainer}
              contentContainerStyle={styles.categoriesContent}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryCard,
                    category === cat.id && styles.categoryCardActive
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <View style={[
                    styles.categoryIcon,
                    category === cat.id && styles.categoryIconActive
                  ]}>
                    <Ionicons 
                      name={cat.icon as any} 
                      size={18} 
                      color={category === cat.id ? '#FFFFFF' : cat.color} 
                    />
                  </View>
                  <Text style={[
                    styles.categoryText,
                    category === cat.id && styles.categoryTextActive
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Keywords Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Anahtar Kelimeler</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="search" size={18} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.modernInput}
                placeholder="Örn: organik, taze, domates"
                placeholderTextColor="#999"
                value={keywords}
                onChangeText={setKeywords}
              />
            </View>
            <Text style={styles.inputHint}>Virgülle ayırarak birden fazla kelime girebilirsiniz</Text>
          </View>

          {/* City Selection */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Şehir Seçimi</Text>
            <TouchableOpacity
              style={styles.modernSelectButton}
              onPress={() => setShowCityModal(true)}
            >
              <View style={styles.selectButtonContent}>
                <Ionicons name="location" size={18} color="#2E7D32" />
                <Text style={city ? styles.selectButtonText : styles.selectButtonPlaceholder}>
                  {city || 'Tüm şehirlerde ara'}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={18} color="#999" />
            </TouchableOpacity>
            <Text style={styles.inputHint}>Şehir seçmezseniz tüm şehirlerde arama yapılır</Text>
          </View>

          {/* Modern Submit Button */}
          <TouchableOpacity
            style={styles.modernSubmitButton}
            onPress={handleSubmit}
            disabled={loading || !category}
          >
            <LinearGradient
              colors={category ? ['#2E7D32', '#4CAF50'] : ['#ccc', '#999']}
              style={styles.submitButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Talep Oluştur</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Modern Requests List */}
        {myRequests.length > 0 && (
          <View style={styles.requestsSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="list" size={20} color="#2E7D32" />
              <Text style={styles.sectionTitle}>Aktif Taleplerim</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{myRequests.length}</Text>
              </View>
            </View>
            
            {myRequests.map((request, index) => (
              <View key={request._id} style={styles.modernRequestCard}>
                <View style={styles.requestCardHeader}>
                  <View style={styles.requestCategoryBadge}>
                    <Ionicons name="folder" size={14} color="#2E7D32" />
                    <Text style={styles.requestCategoryText}>{request.category}</Text>
                  </View>
                  {request.city && (
                    <View style={styles.requestLocationBadge}>
                      <Ionicons name="location" size={12} color="#FF6B6B" />
                      <Text style={styles.requestLocationText}>{request.city}</Text>
                    </View>
                  )}
                </View>
                
                {request.keywords && request.keywords.length > 0 && (
                  <View style={styles.keywordsSection}>
                    <Text style={styles.keywordsLabel}>Anahtar Kelimeler:</Text>
                    <View style={styles.keywordsContainer}>
                      {request.keywords.map((keyword: string, keywordIndex: number) => (
                        <View key={keywordIndex} style={styles.modernKeywordChip}>
                          <Text style={styles.modernKeywordText}>{keyword}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                
                <View style={styles.requestCardFooter}>
                  <View style={styles.requestDateContainer}>
                    <Ionicons name="time" size={12} color="#999" />
                    <Text style={styles.requestDate}>
                      {new Date(request.createdAt).toLocaleDateString('tr-TR')}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.modernDeleteButton}
                    onPress={() => {
                      Alert.alert(
                        'Talebi Sil',
                        'Bu talebi silmek istediğinizden emin misiniz?',
                        [
                          { text: 'İptal', style: 'cancel' },
                          { 
                            text: 'Sil', 
                            style: 'destructive',
                            onPress: () => handleDeleteRequest(request._id)
                          }
                        ]
                      );
                    }}
                  >
                    <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modern City Selection Modal */}
      <Modal
        visible={showCityModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modernModalContent}>
            <View style={styles.modernModalHeader}>
              <Text style={styles.modernModalTitle}>Şehir Seçin</Text>
              <TouchableOpacity
                style={styles.modernModalCloseButton}
                onPress={() => setShowCityModal(false)}
              >
                <Ionicons name="close" size={24} color="#2E7D32" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={[{ id: 'all', name: 'Tüm Şehirler' }, ...cities]}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modernCityItem,
                    city === item.name && styles.modernCityItemSelected
                  ]}
                  onPress={() => {
                    setCity(item.name === 'Tüm Şehirler' ? '' : item.name);
                    setShowCityModal(false);
                  }}
                >
                  <View style={styles.cityItemContent}>
                    <Ionicons 
                      name="location" 
                      size={18} 
                      color={city === item.name ? '#2E7D32' : '#999'} 
                    />
                    <Text style={[
                      styles.modernCityItemText,
                      city === item.name && styles.modernCityItemTextSelected
                    ]}>
                      {item.name}
                    </Text>
                  </View>
                  {city === item.name && (
                    <Ionicons name="checkmark-circle" size={20} color="#2E7D32" />
                  )}
                </TouchableOpacity>
              )}
              style={styles.modernCityList}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  
  // Modern Info Card
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#4A5568',
    lineHeight: 16,
  },

  // Modern Form Card
  formCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A202C',
    marginLeft: 8,
  },

  // Input Sections
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },

  // Category Cards
  categoriesContainer: {
    marginHorizontal: -4,
  },
  categoriesContent: {
    paddingHorizontal: 4,
  },
  categoryCard: {
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    minWidth: 70,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryCardActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryIconActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4A5568',
    textAlign: 'center',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },

  // Modern Input
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  modernInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#2D3748',
  },

  // Modern Select Button
  modernSelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  selectButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectButtonText: {
    fontSize: 14,
    color: '#2D3748',
    marginLeft: 8,
  },
  selectButtonPlaceholder: {
    fontSize: 14,
    color: '#A0AEC0',
    marginLeft: 8,
  },

  // Modern Submit Button
  modernSubmitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Input Hint
  inputHint: {
    fontSize: 11,
    color: '#A0AEC0',
    marginTop: 6,
    fontStyle: 'italic',
  },

  // Requests Section
  requestsSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A202C',
    marginLeft: 8,
    flex: 1,
  },
  badge: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Modern Request Cards
  modernRequestCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  requestCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  requestCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  requestCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
  requestLocationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  requestLocationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B6B',
  },

  // Keywords Section
  keywordsSection: {
    marginBottom: 12,
  },
  keywordsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 6,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  modernKeywordChip: {
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modernKeywordText: {
    fontSize: 11,
    color: '#4A5568',
    fontWeight: '500',
  },

  // Request Card Footer
  requestCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
  },
  requestDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  requestDate: {
    fontSize: 11,
    color: '#A0AEC0',
  },
  modernDeleteButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#FFF5F5',
  },

  // Modern Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modernModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modernModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modernModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A202C',
  },
  modernModalCloseButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F7FAFC',
  },
  modernCityList: {
    maxHeight: 400,
  },
  modernCityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F7FAFC',
  },
  modernCityItemSelected: {
    backgroundColor: '#E8F5E9',
  },
  cityItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modernCityItemText: {
    fontSize: 14,
    color: '#4A5568',
    marginLeft: 8,
  },
  modernCityItemTextSelected: {
    color: '#2E7D32',
    fontWeight: '600',
  },
});

export default ProductRequestScreen;

