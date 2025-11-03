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
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../services/AuthContext';

const SecuritySettingsScreen = ({ navigation }: any) => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [enabling2FA, setEnabling2FA] = useState(false);
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  // 2FA states
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(30); // minutes

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      setLoading(true);
      // Load user's security settings
      console.log('Loading security settings...');
    } catch (error) {
      console.error('Load security settings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Hata', 'Yeni şifreler eşleşmiyor');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır');
      return;
    }

    try {
      setChangingPassword(true);
      
      // Implement password change API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // Mock API call
      
      Alert.alert('Başarılı', 'Şifreniz başarıyla değiştirildi');
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Change password error:', error);
      Alert.alert('Hata', 'Şifre değiştirilirken bir hata oluştu');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleToggle2FA = async () => {
    try {
      setEnabling2FA(true);
      
      if (twoFactorEnabled) {
        // Disable 2FA
        Alert.alert(
          '2FA Devre Dışı Bırak',
          'İki faktörlü kimlik doğrulamayı devre dışı bırakmak istediğinizden emin misiniz?',
          [
            { text: 'İptal', style: 'cancel' },
            {
              text: 'Devre Dışı Bırak',
              style: 'destructive',
              onPress: async () => {
                await new Promise(resolve => setTimeout(resolve, 1500));
                setTwoFactorEnabled(false);
                Alert.alert('Başarılı', '2FA devre dışı bırakıldı');
              }
            }
          ]
        );
      } else {
        // Enable 2FA
        await new Promise(resolve => setTimeout(resolve, 2000));
        setTwoFactorEnabled(true);
        Alert.alert(
          '2FA Etkinleştirildi',
          'İki faktörlü kimlik doğrulama başarıyla etkinleştirildi. Lütfen güvenlik kodlarınızı kaydedin.'
        );
      }
    } catch (error) {
      console.error('Toggle 2FA error:', error);
      Alert.alert('Hata', '2FA ayarları güncellenirken bir hata oluştu');
    } finally {
      setEnabling2FA(false);
    }
  };

  const handleLogoutAllDevices = () => {
    Alert.alert(
      'Tüm Cihazlardan Çıkış',
      'Tüm cihazlardan çıkış yapmak istediğinizden emin misiniz? Bu işlem tüm oturumları sonlandırır.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            try {
              // Implement logout all devices API call
              Alert.alert('Başarılı', 'Tüm cihazlardan çıkış yapıldı');
            } catch (error) {
              Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu');
            }
          }
        }
      ]
    );
  };

  const renderPasswordForm = () => (
    <View style={styles.passwordForm}>
      <Text style={styles.formTitle}>Şifre Değiştir</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Mevcut Şifre</Text>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Mevcut şifrenizi girin"
          secureTextEntry
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Yeni Şifre</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Yeni şifrenizi girin"
          secureTextEntry
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Yeni Şifre Tekrar</Text>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Yeni şifrenizi tekrar girin"
          secureTextEntry
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.formButtons}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            setShowPasswordForm(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
          }}
        >
          <Text style={styles.cancelButtonText}>İptal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleChangePassword}
          disabled={changingPassword}
        >
          {changingPassword ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Değiştir</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSecurityItem = (
    title: string,
    description: string,
    icon: string,
    onPress: () => void,
    rightElement?: React.ReactNode,
    danger?: boolean
  ) => (
    <TouchableOpacity
      style={[styles.securityItem, danger && styles.dangerItem]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.securityItemLeft}>
        <View style={[styles.securityIcon, danger && styles.dangerIcon]}>
          <Ionicons name={icon as any} size={20} color={danger ? '#F44336' : '#27AE60'} />
        </View>
        <View style={styles.securityInfo}>
          <Text style={[styles.securityTitle, danger && styles.dangerText]}>{title}</Text>
          <Text style={styles.securityDescription}>{description}</Text>
        </View>
      </View>
      {rightElement || <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />}
    </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Güvenlik Ayarları</Text>
          <View style={{ width: 34 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Password Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔐 Şifre Güvenliği</Text>
          <View style={styles.sectionContent}>
            {!showPasswordForm ? (
              renderSecurityItem(
                'Şifre Değiştir',
                'Hesap şifrenizi güncelleyin',
                'key-outline',
                () => setShowPasswordForm(true)
              )
            ) : (
              renderPasswordForm()
            )}
          </View>
        </View>

        {/* Two-Factor Authentication */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛡️ İki Faktörlü Kimlik Doğrulama</Text>
          <View style={styles.sectionContent}>
            <View style={styles.securityItem}>
              <View style={styles.securityItemLeft}>
                <View style={styles.securityIcon}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#27AE60" />
                </View>
                <View style={styles.securityInfo}>
                  <Text style={styles.securityTitle}>2FA Etkinleştir</Text>
                  <Text style={styles.securityDescription}>
                    Ek güvenlik için iki faktörlü kimlik doğrulama
                  </Text>
                </View>
              </View>
              {enabling2FA ? (
                <ActivityIndicator size="small" color="#27AE60" />
              ) : (
                <Switch
                  value={twoFactorEnabled}
                  onValueChange={handleToggle2FA}
                  trackColor={{ false: '#E0E0E0', true: '#27AE60' }}
                  thumbColor={twoFactorEnabled ? '#FFFFFF' : '#FFFFFF'}
                />
              )}
            </View>
          </View>
        </View>

        {/* Login Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔍 Oturum Güvenliği</Text>
          <View style={styles.sectionContent}>
            <View style={styles.securityItem}>
              <View style={styles.securityItemLeft}>
                <View style={styles.securityIcon}>
                  <Ionicons name="notifications-outline" size={20} color="#27AE60" />
                </View>
                <View style={styles.securityInfo}>
                  <Text style={styles.securityTitle}>Giriş Bildirimleri</Text>
                  <Text style={styles.securityDescription}>
                    Yeni girişlerde bildirim al
                  </Text>
                </View>
              </View>
              <Switch
                value={loginAlerts}
                onValueChange={setLoginAlerts}
                trackColor={{ false: '#E0E0E0', true: '#27AE60' }}
                thumbColor={loginAlerts ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>

            {renderSecurityItem(
              'Tüm Cihazlardan Çıkış',
              'Tüm oturumları sonlandır',
              'log-out-outline',
              handleLogoutAllDevices,
              undefined,
              true
            )}
          </View>
        </View>

        {/* Security Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#2196F3" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Güvenlik İpuçları</Text>
              <Text style={styles.infoText}>
                • Güçlü ve benzersiz şifreler kullanın{'\n'}
                • 2FA'yı etkinleştirin{'\n'}
                • Şüpheli aktiviteleri bildirin{'\n'}
                • Düzenli olarak şifrenizi güncelleyin
              </Text>
            </View>
          </View>
        </View>
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
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dangerItem: {
    backgroundColor: '#FFEBEE',
  },
  securityItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  securityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  dangerIcon: {
    backgroundColor: '#FFEBEE',
  },
  securityInfo: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  dangerText: {
    color: '#F44336',
  },
  securityDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  passwordForm: {
    padding: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#27AE60',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
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
});

export default SecuritySettingsScreen;
