import React, { useState, useEffect } from 'react';
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
import { authAPI } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isLoadingForgotPassword, setIsLoadingForgotPassword] = useState(false);
  const { login, isLoading } = useAuth();

  useEffect(() => {
    loadSavedCredentials();
  }, []);

  const loadSavedCredentials = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('rememberedEmail');
      const savedPassword = await AsyncStorage.getItem('rememberedPassword');
      const rememberMeStatus = await AsyncStorage.getItem('rememberMe');
      
      if (savedEmail && rememberMeStatus === 'true') {
        setEmail(savedEmail);
        setPassword(savedPassword || '');
        setRememberMe(true);
      }
    } catch (error) {
      console.error('Error loading saved credentials:', error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    try {
      console.log('Login attempt with email:', email);
      await login(email, password);
      
      // Save credentials if remember me is checked
      if (rememberMe) {
        await AsyncStorage.setItem('rememberedEmail', email);
        await AsyncStorage.setItem('rememberedPassword', password);
        await AsyncStorage.setItem('rememberMe', 'true');
      } else {
        // Clear saved credentials if remember me is unchecked
        await AsyncStorage.removeItem('rememberedEmail');
        await AsyncStorage.removeItem('rememberedPassword');
        await AsyncStorage.removeItem('rememberMe');
      }
      
      // Alert kaldırıldı - loader otomatik kapanacak
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Hata', (error as Error).message || 'Giriş yapılırken bir hata oluştu');
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail || !forgotPasswordEmail.includes('@')) {
      Alert.alert('Hata', 'Lütfen geçerli bir e-posta adresi girin');
      return;
    }

    setIsLoadingForgotPassword(true);
    try {
      await authAPI.forgotPassword(forgotPasswordEmail);
      setEmailSent(true);
      Alert.alert(
        'Başarılı',
        'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen e-postanızı kontrol edin ve token\'ı girin.',
        [{ text: 'Tamam' }]
      );
    } catch (error: any) {
      console.error('Forgot password error:', error);
      Alert.alert('Hata', error.message || 'Şifre sıfırlama isteği gönderilemedi');
    } finally {
      setIsLoadingForgotPassword(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetToken || !newPassword || !confirmNewPassword) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor');
      return;
    }

    setIsLoadingForgotPassword(true);
    try {
      await authAPI.resetPassword(resetToken, newPassword);
      Alert.alert(
        'Başarılı',
        'Şifreniz başarıyla sıfırlandı. Yeni şifrenizle giriş yapabilirsiniz.',
        [
          {
            text: 'Tamam',
            onPress: () => {
              setShowForgotPassword(false);
              setEmailSent(false);
              setResetToken('');
              setNewPassword('');
              setConfirmNewPassword('');
              setForgotPasswordEmail('');
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Reset password error:', error);
      Alert.alert('Hata', error.message || 'Şifre sıfırlama başarısız');
    } finally {
      setIsLoadingForgotPassword(false);
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
              <Ionicons name="storefront" size={80} color="#FFFFFF" />
              <Text style={styles.logoText}>Hal Kompleksi</Text>
              <Text style={styles.subtitle}>Modern Alışveriş Platformu</Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.welcomeText}>Hoş Geldiniz</Text>
              
              <View style={styles.inputContainer}>
                <Ionicons name="mail" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="E-posta adresiniz"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Şifreniz"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
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

              {/* Remember Me Checkbox */}
              <View style={styles.rememberMeContainer}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkedBox]}>
                    {rememberMe && (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={styles.rememberMeText}>Beni Hatırla</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.disabledButton]}
                onPress={handleLogin}
                disabled={Boolean(isLoading)}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.loginButtonText}>Giriş Yap</Text>
                )}
              </TouchableOpacity>

              {/* Şifremi Unuttum Butonu - Her zaman görünür */}
              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={() => {
                  console.log('🔓 Şifremi Unuttum butonuna tıklandı');
                  setShowForgotPassword(true);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="lock-open-outline" size={18} color="#27AE60" style={{ marginRight: 6 }} />
                <Text style={styles.forgotPasswordButtonText}>Şifremi Unuttum</Text>
              </TouchableOpacity>

              {/* Şifre Sıfırlama Formu */}
              {showForgotPassword && (
                <>
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => {
                      setShowForgotPassword(false);
                      setEmailSent(false);
                      setResetToken('');
                      setNewPassword('');
                      setConfirmNewPassword('');
                      setForgotPasswordEmail('');
                    }}
                  >
                    <Ionicons name="arrow-back" size={20} color="#2E7D32" />
                    <Text style={styles.backButtonText}>Geri</Text>
                  </TouchableOpacity>

                  <Text style={styles.forgotPasswordTitle}>Şifre Sıfırlama</Text>

                  {!emailSent ? (
                    <>
                      <Text style={styles.forgotPasswordDescription}>
                        E-posta adresinize şifre sıfırlama bağlantısı göndereceğiz.
                      </Text>
                      
                      <View style={styles.inputContainer}>
                        <Ionicons name="mail" size={20} color="#666" style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="E-posta adresiniz"
                          placeholderTextColor="#999"
                          value={forgotPasswordEmail}
                          onChangeText={setForgotPasswordEmail}
                          keyboardType="email-address"
                          autoCapitalize="none"
                        />
                      </View>

                      <TouchableOpacity
                        style={[styles.loginButton, isLoadingForgotPassword && styles.disabledButton]}
                        onPress={handleForgotPassword}
                        disabled={isLoadingForgotPassword}
                      >
                        {isLoadingForgotPassword ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Text style={styles.loginButtonText}>Gönder</Text>
                        )}
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <Text style={styles.forgotPasswordDescription}>
                        E-postanıza gönderilen token'ı ve yeni şifrenizi girin.
                      </Text>
                      
                      <View style={styles.inputContainer}>
                        <Ionicons name="key" size={20} color="#666" style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Token (e-postanızdan kopyalayın)"
                          placeholderTextColor="#999"
                          value={resetToken}
                          onChangeText={setResetToken}
                          autoCapitalize="none"
                        />
                      </View>

                      <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Yeni Şifre"
                          placeholderTextColor="#999"
                          value={newPassword}
                          onChangeText={setNewPassword}
                          secureTextEntry={!showNewPassword}
                        />
                        <TouchableOpacity
                          onPress={() => setShowNewPassword(!showNewPassword)}
                          style={styles.eyeIcon}
                        >
                          <Ionicons
                            name={showNewPassword ? 'eye-off' : 'eye'}
                            size={20}
                            color="#666"
                          />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="Yeni Şifre Tekrar"
                          placeholderTextColor="#999"
                          value={confirmNewPassword}
                          onChangeText={setConfirmNewPassword}
                          secureTextEntry={!showConfirmNewPassword}
                        />
                        <TouchableOpacity
                          onPress={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                          style={styles.eyeIcon}
                        >
                          <Ionicons
                            name={showConfirmNewPassword ? 'eye-off' : 'eye'}
                            size={20}
                            color="#666"
                          />
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        style={[styles.loginButton, isLoadingForgotPassword && styles.disabledButton]}
                        onPress={handleResetPassword}
                        disabled={isLoadingForgotPassword}
                      >
                        {isLoadingForgotPassword ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Text style={styles.loginButtonText}>Şifreyi Sıfırla</Text>
                        )}
                      </TouchableOpacity>
                    </>
                  )}
                </>
              )}

              {!showForgotPassword && (
                <TouchableOpacity
                  style={styles.registerButton}
                  onPress={() => navigation.navigate('Register')}
                >
                  <Text style={styles.registerButtonText}>
                    Hesabınız yok mu? Kayıt olun
                  </Text>
                </TouchableOpacity>
              )}
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
    marginBottom: 40,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#E8F5E8',
    marginTop: 5,
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
  eyeIcon: {
    padding: 5,
  },
  rememberMeContainer: {
    marginBottom: 15,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#2E7D32',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#2E7D32',
  },
  rememberMeText: {
    fontSize: 14,
    color: '#666',
  },
  loginButton: {
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
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotPasswordButton: {
    marginTop: 18,
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27AE60',
  },
  forgotPasswordButtonText: {
    color: '#27AE60',
    fontSize: 16,
    fontWeight: '700',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '500',
    marginLeft: 8,
  },
  forgotPasswordTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 10,
  },
  forgotPasswordDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  registerButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#2E7D32',
    fontSize: 16,
  },
});

export default LoginScreen;
