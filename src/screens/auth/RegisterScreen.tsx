import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../services/AuthContext';
import { RegisterData } from '../../types';

const RegisterScreen = ({ navigation }: any) => {
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
    phone: '',
    userType: 'buyer',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, isLoading } = useAuth();

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    if (formData.password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır');
      return;
    }

    if (formData.name.length < 2) {
      Alert.alert('Hata', 'Ad soyad en az 2 karakter olmalıdır');
      return;
    }

    if (!/^[\+]?[0-9]{10,16}$/.test(formData.phone)) {
      Alert.alert('Hata', 'Geçerli bir telefon numarası giriniz (örn: 05551234567)');
      return;
    }

    try {
      console.log('Register attempt with data:', formData);
      await register(formData);
      // Alert kaldırıldı - loader otomatik kapanacak
    } catch (error) {
      console.error('Register error:', error);
      Alert.alert('Hata', (error as Error).message || 'Kayıt olurken bir hata oluştu');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2E7D32', '#4CAF50']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.logoContainer}>
              <Ionicons name="storefront" size={60} color="#FFFFFF" />
              <Text style={styles.logoText}>Kayıt Ol</Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.welcomeText}>Hesap Oluşturun</Text>
              
              <View style={styles.inputContainer}>
                <Ionicons name="person" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ad Soyad"
                  placeholderTextColor="#999"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="mail" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="E-posta adresiniz"
                  placeholderTextColor="#999"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View>
                <View style={styles.inputContainer}>
                  <Ionicons name="call" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="05XX XXX XX XX"
                    placeholderTextColor="#999"
                    value={formData.phone}
                    onChangeText={(text) => {
                      // Remove all non-digits
                      let cleaned = text.replace(/[^0-9]/g, '');
                      // Auto-add 0 at the start if user types without 0
                      if (cleaned.length > 0 && !cleaned.startsWith('0')) {
                        cleaned = '0' + cleaned;
                      }
                      // Limit to 11 digits (0 + 10 digits)
                      if (cleaned.length > 11) {
                        cleaned = cleaned.substring(0, 11);
                      }
                      setFormData({ ...formData, phone: cleaned });
                    }}
                    keyboardType="phone-pad"
                    maxLength={11}
                  />
                </View>
                <Text style={styles.helperText}>
                  +905551234567 (0 ile başlayarak 11 haneli yazın)
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Şifreniz"
                  placeholderTextColor="#999"
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  secureTextEntry={Boolean(!showPassword)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Şifre tekrar"
                  placeholderTextColor="#999"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={Boolean(!showConfirmPassword)}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.userTypeContainer}>
                <Text style={styles.userTypeLabel}>Hesap Türü:</Text>
                <View style={styles.userTypeButtons}>
                  <TouchableOpacity
                    style={[
                      styles.userTypeButton,
                      formData.userType === 'buyer' && styles.selectedUserType
                    ]}
                    onPress={() => setFormData({ ...formData, userType: 'buyer' })}
                  >
                    <Ionicons 
                      name="cart" 
                      size={20} 
                      color={formData.userType === 'buyer' ? '#FFFFFF' : '#2E7D32'} 
                    />
                    <Text style={[
                      styles.userTypeText,
                      formData.userType === 'buyer' && styles.selectedUserTypeText
                    ]}>
                      Alıcı
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.userTypeButton,
                      formData.userType === 'seller' && styles.selectedUserType
                    ]}
                    onPress={() => setFormData({ ...formData, userType: 'seller' })}
                  >
                    <Ionicons 
                      name="storefront" 
                      size={20} 
                      color={formData.userType === 'seller' ? '#FFFFFF' : '#2E7D32'} 
                    />
                    <Text style={[
                      styles.userTypeText,
                      formData.userType === 'seller' && styles.selectedUserTypeText
                    ]}>
                      Satıcı
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.registerButton, isLoading && styles.disabledButton]}
                onPress={handleRegister}
                disabled={Boolean(isLoading)}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.registerButtonText}>Kayıt Ol</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.loginButtonText}>
                  Zaten hesabınız var mı? Giriş yapın
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    marginLeft: 12,
    marginBottom: 8,
  },
  eyeIcon: {
    padding: 5,
  },
  userTypeContainer: {
    marginVertical: 20,
  },
  userTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  userTypeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2E7D32',
    backgroundColor: '#FFFFFF',
  },
  selectedUserType: {
    backgroundColor: '#2E7D32',
  },
  userTypeText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  selectedUserTypeText: {
    color: '#FFFFFF',
  },
  registerButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#A5D6A7',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#2E7D32',
    fontSize: 16,
  },
});

export default RegisterScreen;
