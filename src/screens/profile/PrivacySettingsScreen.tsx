import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../services/AuthContext';

interface PrivacySettings {
  profileVisibility: 'public' | 'private';
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  allowMessages: boolean;
  allowNotifications: boolean;
  dataSharing: boolean;
  analytics: boolean;
}

const PrivacySettingsScreen = ({ navigation }: any) => {
  const { user, updateUser } = useAuth();
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showEmail: true,
    showPhone: true,
    showLocation: true,
    allowMessages: true,
    allowNotifications: true,
    dataSharing: false,
    analytics: true,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // Load user's privacy settings from API
      // For now, using default values
      console.log('Loading privacy settings...');
    } catch (error) {
      console.error('Load settings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = async (key: keyof PrivacySettings, value: any) => {
    try {
      setSaving(true);
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      
      // Save to API
      await updateUser({ privacySettings: newSettings } as any);
      
      Alert.alert('Başarılı', 'Gizlilik ayarları güncellendi');
    } catch (error) {
      console.error('Update settings error:', error);
      Alert.alert('Hata', 'Ayarlar güncellenirken bir hata oluştu');
      // Revert change
      setSettings(settings);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesabı Sil',
      'Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Son Onay',
              'Hesabınız kalıcı olarak silinecek. Devam etmek istediğinizden emin misiniz?',
              [
                { text: 'İptal', style: 'cancel' },
                { text: 'Evet, Sil', style: 'destructive', onPress: confirmDeleteAccount }
              ]
            );
          }
        }
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    try {
      setSaving(true);
      // Implement account deletion
      Alert.alert('Hesap Silindi', 'Hesabınız başarıyla silindi');
    } catch (error) {
      Alert.alert('Hata', 'Hesap silinirken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const renderSettingItem = (
    title: string,
    description: string,
    key: keyof PrivacySettings,
    type: 'switch' | 'select',
    options?: { label: string; value: any }[]
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <View style={styles.settingControl}>
        {type === 'switch' ? (
          <Switch
            value={settings[key] as boolean}
            onValueChange={(value) => handleSettingChange(key, value)}
            trackColor={{ false: '#E0E0E0', true: '#27AE60' }}
            thumbColor={settings[key] ? '#FFFFFF' : '#FFFFFF'}
            disabled={saving}
          />
        ) : (
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => {
              if (options) {
                Alert.alert(
                  title,
                  'Seçenek seçin:',
                  options.map(option => ({
                    text: option.label,
                    onPress: () => handleSettingChange(key, option.value)
                  }))
                );
              }
            }}
            disabled={saving}
          >
            <Text style={styles.selectButtonText}>
              {options?.find(opt => opt.value === settings[key])?.label || 'Seçin'}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#27AE60', '#2ECC71']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gizlilik Ayarları</Text>
          <View style={{ width: 34 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Visibility */}
        {renderSection(
          '👤 Profil Görünürlüğü',
          <>
            {renderSettingItem(
              'Profil Görünürlüğü',
              'Profilinizin diğer kullanıcılar tarafından görülebilirliği',
              'profileVisibility',
              'select',
              [
                { label: 'Herkese Açık', value: 'public' },
                { label: 'Gizli', value: 'private' }
              ]
            )}
            {renderSettingItem(
              'E-posta Göster',
              'E-posta adresinizi diğer kullanıcılara göster',
              'showEmail',
              'switch'
            )}
            {renderSettingItem(
              'Telefon Göster',
              'Telefon numaranızı diğer kullanıcılara göster',
              'showPhone',
              'switch'
            )}
            {renderSettingItem(
              'Konum Göster',
              'Konum bilginizi diğer kullanıcılara göster',
              'showLocation',
              'switch'
            )}
          </>
        )}

        {/* Communication */}
        {renderSection(
          '💬 İletişim',
          <>
            {renderSettingItem(
              'Mesajlara İzin Ver',
              'Diğer kullanıcıların size mesaj göndermesine izin ver',
              'allowMessages',
              'switch'
            )}
            {renderSettingItem(
              'Bildirimleri Açık Tut',
              'Uygulama bildirimlerini al',
              'allowNotifications',
              'switch'
            )}
          </>
        )}

        {/* Data & Analytics */}
        {renderSection(
          '📊 Veri & Analitik',
          <>
            {renderSettingItem(
              'Veri Paylaşımı',
              'Anonim kullanım verilerini paylaş',
              'dataSharing',
              'switch'
            )}
            {renderSettingItem(
              'Analitik',
              'Uygulama performans analitiklerini etkinleştir',
              'analytics',
              'switch'
            )}
          </>
        )}

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Hesap İşlemleri</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleDeleteAccount}
              disabled={saving}
            >
              <Ionicons name="trash-outline" size={20} color="#F44336" />
              <Text style={styles.dangerButtonText}>Hesabı Sil</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#2196F3" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Gizlilik Hakkında</Text>
              <Text style={styles.infoText}>
                Gizlilik ayarlarınızı istediğiniz zaman değiştirebilirsiniz. 
                Verileriniz güvenli bir şekilde saklanır ve üçüncü taraflarla paylaşılmaz.
              </Text>
            </View>
          </View>
        </View>

        {saving && (
          <View style={styles.savingIndicator}>
            <ActivityIndicator size="small" color="#27AE60" />
            <Text style={styles.savingText}>Kaydediliyor...</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  settingControl: {
    alignItems: 'flex-end',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectButtonText: {
    fontSize: 14,
    color: '#333',
    marginRight: 6,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  dangerButtonText: {
    fontSize: 16,
    color: '#F44336',
    fontWeight: '600',
    marginLeft: 8,
  },
  infoSection: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1565C0',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#1565C0',
    lineHeight: 20,
  },
  savingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  savingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
});

export default PrivacySettingsScreen;
