import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Clipboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import { useDeepLink } from '../../contexts/DeepLinkContext';

const NewAuthScreen = ({ navigationParams }: { navigationParams?: { code?: string } }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false); // Kod doğrulandı mı?
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [resetCode, setResetCode] = useState(''); // Backend'den gelen 4 haneli kod (gösterim için)
  const [resetCodeInput, setResetCodeInput] = useState(''); // Kullanıcının girdiği kod (doğrulama için)
  const [resetToken, setResetToken] = useState(''); // Token (kod doğrulandıktan sonra)
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);

  // Register form state
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const { login, register, loadRememberedCredentials } = useAuth();
  const { pendingNavigation, clearPendingNavigation } = useDeepLink();

  // Load remembered credentials on component mount
  React.useEffect(() => {
    loadRememberedCredentials().then((credentials) => {
      if (credentials) {
        setLoginData({
          email: credentials.email,
          password: credentials.password
        });
        setRememberMe(true);
      }
    });
  }, []);

  // Handle deep link for reset password with code
  useEffect(() => {
    if (pendingNavigation && pendingNavigation.screen === 'ResetPassword' && pendingNavigation.params?.code) {
      const code = pendingNavigation.params.code;
      
      // Otomatik olarak şifre sıfırlama akışını başlat
      setIsLogin(true);
      setShowForgotPassword(true);
      setEmailSent(true); // Email gönderilmiş gibi göster
      setResetCodeInput(code); // Kodu otomatik yapıştır
      
      // Kodu otomatik doğrula (opsiyonel - kullanıcı manuel de doğrulayabilir)
      // handleVerifyCode(); // Bu satırı kaldırabiliriz, kullanıcı butona bassın
      
      clearPendingNavigation();
    }
  }, [pendingNavigation, clearPendingNavigation]);

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    if (!loginData.email.includes('@')) {
      Alert.alert('Hata', 'Geçerli bir e-posta adresi girin');
      return;
    }

    setIsLoading(true);

    try {
      await login(loginData.email, loginData.password, rememberMe);
      // Login successful - AuthContext will automatically navigate to the main page
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Giriş yapılırken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    const { name, email, phone, password, confirmPassword } = registerData;

    // Apple App Store Requirement: Phone number is optional, not required
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Hata', 'Lütfen zorunlu alanları doldurun');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Hata', 'Geçerli bir e-posta adresi girin');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır');
      return;
    }

    // Validate phone only if provided (optional field)
    if (phone && phone.length < 10) {
      Alert.alert('Hata', 'Geçerli bir telefon numarası girin (en az 10 haneli)');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        name,
        email,
        phone,
        password,
        userType: 'buyer'
      });
      // Register successful - AuthContext will automatically navigate to the main page
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Kayıt olurken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const updateLoginData = (field: string, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
  };

  const updateRegisterData = (field: string, value: string) => {
    setRegisterData(prev => ({ ...prev, [field]: value }));
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail || !forgotPasswordEmail.includes('@')) {
      Alert.alert('Hata', 'Lütfen geçerli bir e-posta adresi girin');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.forgotPassword(forgotPasswordEmail);
      
      if (response && response.code) {
        const codeValue = String(response.code).trim();
        setResetCode(codeValue);
        setResetCodeInput('');
        setCodeVerified(false);
        setEmailSent(true);
        
        Alert.alert(
          'Kod Gönderildi',
          '4 haneli doğrulama kodu e-posta adresinize gönderildi. Lütfen e-postanızı kontrol edin.',
          [{ text: 'Tamam' }]
        );
      } else if (response && response.userExists === false) {
        Alert.alert(
          'Bilgi',
          'Eğer bu e-posta adresi kayıtlıysa, şifre sıfırlama talimatları gönderilmiştir.',
          [{ text: 'Tamam' }]
        );
      } else {
        Alert.alert(
          'Hata',
          response?.message || 'Şifre sıfırlama kodu oluşturulamadı. Lütfen tekrar deneyin.',
          [{ text: 'Tamam' }]
        );
      }
    } catch (error: any) {
      
      const errorMessage = error.message || 'Şifre sıfırlama isteği gönderilemedi';
      
      if (errorMessage.includes('çok fazla') || errorMessage.includes('rate limit')) {
        Alert.alert(
          'Çok Fazla İstek',
          'Güvenlik nedeniyle çok fazla şifre sıfırlama talebi gönderdiniz. Lütfen 1 saat sonra tekrar deneyin.',
          [{ text: 'Tamam' }]
        );
      } else {
        Alert.alert('Hata', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    // Kod sadece rakam olmalı ve 4 haneli olmalı
    if (!resetCodeInput || resetCodeInput.length !== 4) {
      Alert.alert('Hata', 'Lütfen 4 haneli kodu girin');
      return;
    }
    
    // Sadece rakam kontrolü
    if (!/^\d{4}$/.test(resetCodeInput)) {
      Alert.alert('Hata', 'Kod sadece rakamlardan oluşmalıdır');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.verifyResetCode(forgotPasswordEmail, resetCodeInput);
      
      if (response && response.token) {
        setResetToken(response.token);
        setCodeVerified(true);
        Alert.alert('Başarılı', 'Kod doğrulandı. Yeni şifrenizi belirleyebilirsiniz.', [{ text: 'Tamam' }]);
      } else {
        Alert.alert('Hata', 'Kod doğrulama başarısız. Lütfen tekrar deneyin.');
      }
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Kod doğrulama başarısız. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetToken || !newPassword || !confirmNewPassword) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    // 2026 Security: Strong password requirements
    if (newPassword.length < 8) {
      Alert.alert('Hata', 'Şifre en az 8 karakter olmalıdır (2026 güvenlik standardı)');
      return;
    }

    // 2026 Security: Password complexity check
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(newPassword)) {
      Alert.alert(
        'Güvenlik Uyarısı',
        'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.'
      );
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor');
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.resetPassword(resetToken, newPassword);
      Alert.alert(
        'Başarılı',
        'Şifreniz başarıyla sıfırlandı. Yeni şifrenizle giriş yapabilirsiniz.',
        [
          {
            text: 'Tamam',
            onPress: () => {
              // Reset form and go back to login
              setShowForgotPassword(false);
              setEmailSent(false);
              setCodeVerified(false);
              setResetCode('');
              setResetCodeInput('');
              setResetToken('');
              setNewPassword('');
              setConfirmNewPassword('');
              setForgotPasswordEmail('');
              setIsLogin(true); // Login ekranına geri dön
              setIsLogin(true);
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Reset password error:', error);
      Alert.alert('Hata', error.message || 'Şifre sıfırlama başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="storefront" size={60} color="#34C759" />
          </View>
          <Text style={styles.title}>Hal Kompleksi</Text>
          <Text style={styles.subtitle}>Modern Alışveriş Platformu</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, isLogin && styles.activeTab]}
            onPress={() => setIsLogin(true)}
          >
            <Text style={[styles.tabText, isLogin && styles.activeTabText]}>
              Giriş Yap
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, !isLogin && styles.activeTab]}
            onPress={() => setIsLogin(false)}
          >
            <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>
              Kayıt Ol
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          {isLogin ? (
            // Login Form
            <>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="E-posta adresiniz"
                  placeholderTextColor="#999"
                  value={loginData.email}
                  onChangeText={(text) => updateLoginData('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Şifreniz"
                  placeholderTextColor="#999"
                  value={loginData.password}
                  onChangeText={(text) => updateLoginData('password', text)}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
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
                    {rememberMe && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                  </View>
                  <Text style={styles.rememberMeText}>Beni Hatırla</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.disabledButton]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Giriş Yap</Text>
                )}
              </TouchableOpacity>

              {/* Şifremi Unuttum Butonu - Giriş Yap butonunun altında - HER ZAMAN GÖRÜNÜR */}
              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={() => {
                  setShowForgotPassword(true);
                  setIsLogin(false);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="lock-open-outline" size={18} color="#34C759" style={{ marginRight: 6 }} />
                <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
              </TouchableOpacity>
            </>
          ) : showForgotPassword ? (
            // Şifre Sıfırlama Formu
            <>
              <View style={styles.backButtonContainer}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => {
                    setShowForgotPassword(false);
                    setIsLogin(true); // Login formuna geri dön
                    setEmailSent(false);
                    setCodeVerified(false);
                    setResetCode('');
                    setResetCodeInput('');
                    setResetToken('');
                    setNewPassword('');
                    setConfirmNewPassword('');
                    setForgotPasswordEmail('');
                  }}
                >
                  <Ionicons name="arrow-back" size={24} color="#34C759" />
                  <Text style={styles.backButtonText}>Geri</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>Şifre Sıfırlama</Text>

              {!emailSent ? (
                <>
                  <Text style={styles.descriptionText}>
                    E-posta adresinize 4 haneli şifre sıfırlama kodu göndereceğiz.
                  </Text>
                  
                  <View style={styles.inputContainer}>
                    <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
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
                    style={[styles.submitButton, isLoading && styles.disabledButton]}
                    onPress={handleForgotPassword}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.buttonText}>Gönder</Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : !codeVerified ? (
                /* AKIŞ ADIM 3-4: 4 haneli kod girişi ekranı */
                <>
                  <View style={styles.infoContainer}>
                    <Ionicons name="mail" size={48} color="#34C759" />
                    <Text style={styles.infoTitle}>Kod E-postanıza Gönderildi</Text>
                    <Text style={styles.infoText}>
                      E-posta adresinize gönderilen 4 haneli doğrulama kodunu girin.
                    </Text>
                    <Text style={styles.infoSubtext}>
                      E-postanızı kontrol edin ve spam klasörünü de kontrol etmeyi unutmayın.
                    </Text>
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Ionicons name="keypad-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="4 haneli kodu girin"
                      placeholderTextColor="#999"
                      value={resetCodeInput}
                      onChangeText={(text) => {
                        // Sadece rakam ve max 4 karakter
                        const numericValue = text.replace(/[^0-9]/g, '').slice(0, 4);
                        setResetCodeInput(numericValue);
                      }}
                      keyboardType="number-pad"
                      maxLength={4}
                      autoCapitalize="none"
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.submitButton, (isLoading || resetCodeInput.length !== 4) && styles.disabledButton]}
                    onPress={handleVerifyCode}
                    disabled={isLoading || resetCodeInput.length !== 4}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.buttonText}>Kodu Doğrula</Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                /* AKIŞ ADIM 5: Şifre sıfırlama ekranı (kod doğrulandıktan sonra) - Modern Tasarım */
                <>
                  <View style={styles.successHeader}>
                    <View style={styles.successIconContainer}>
                      <Ionicons name="checkmark-circle" size={48} color="#34C759" />
                    </View>
                    <Text style={styles.successTitle}>Kod Doğrulandı</Text>
                    <Text style={styles.successSubtitle}>Yeni şifrenizi belirleyin</Text>
                  </View>

                  <View style={styles.modernSecurityInfo}>
                    <Ionicons name="shield-checkmark" size={18} color="#34C759" />
                    <Text style={styles.modernSecurityText}>
                      Güvenlik: En az 8 karakter, büyük/küçük harf ve rakam
                    </Text>
                  </View>

                  <View style={styles.modernInputWrapper}>
                    <Text style={styles.inputLabel}>Yeni Şifre</Text>
                    <View style={styles.modernInputContainer}>
                      <Ionicons name="lock-closed" size={22} color="#34C759" style={styles.modernInputIcon} />
                      <TextInput
                        style={styles.modernInput}
                        placeholder="Şifrenizi girin"
                        placeholderTextColor="#BDBDBD"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={true}
                        keyboardType="default"
                      />
                      <TouchableOpacity
                        style={styles.modernEyeIcon}
                        onPress={() => setShowPassword(!showPassword)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={showPassword ? "eye-off" : "eye"}
                          size={22}
                          color="#666"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.modernInputWrapper}>
                    <Text style={styles.inputLabel}>Şifre Tekrar</Text>
                    <View style={styles.modernInputContainer}>
                      <Ionicons name="lock-closed" size={22} color="#34C759" style={styles.modernInputIcon} />
                      <TextInput
                        style={styles.modernInput}
                        placeholder="Şifrenizi tekrar girin"
                        placeholderTextColor="#BDBDBD"
                        value={confirmNewPassword}
                        onChangeText={setConfirmNewPassword}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={true}
                        keyboardType="default"
                      />
                      <TouchableOpacity
                        style={styles.modernEyeIcon}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={showConfirmPassword ? "eye-off" : "eye"}
                          size={22}
                          color="#666"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.modernSubmitButton, isLoading && styles.modernDisabledButton]}
                    onPress={handleResetPassword}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text style={styles.modernButtonText}>Şifreyi Sıfırla</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </>
          ) : (
            // Register Form
            <>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ad Soyad"
                  placeholderTextColor="#999"
                  value={registerData.name}
                  onChangeText={(text) => updateRegisterData('name', text)}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="E-posta adresiniz"
                  placeholderTextColor="#999"
                  value={registerData.email}
                  onChangeText={(text) => updateRegisterData('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View>
                <View style={styles.inputContainer}>
                  <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Telefon Numarası (Opsiyonel)"
                    placeholderTextColor="#999"
                    value={registerData.phone}
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
                      updateRegisterData('phone', cleaned);
                    }}
                    keyboardType="phone-pad"
                    maxLength={11}
                  />
                </View>
                <Text style={styles.helperText}>
                  Opsiyonel. +905551234567
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Şifreniz"
                  placeholderTextColor="#999"
                  value={registerData.password}
                  onChangeText={(text) => updateRegisterData('password', text)}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Şifre tekrar"
                  placeholderTextColor="#999"
                  value={registerData.confirmPassword}
                  onChangeText={(text) => updateRegisterData('confirmPassword', text)}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.disabledButton]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Hesap Oluştur</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 30,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#34C759',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  form: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E1E5E9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    paddingVertical: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  submitButton: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#B0BEC5',
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  rememberMeContainer: {
    marginBottom: 16,
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
    borderColor: '#34C759',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#34C759',
  },
  rememberMeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    marginLeft: 12,
    marginBottom: 8,
  },
  forgotPasswordButton: {
    marginTop: 20,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#34C759',
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 50, // Minimum height to ensure visibility
    zIndex: 10, // Ensure it's above other elements
  },
  forgotPasswordText: {
    fontSize: 16,
    color: '#34C759',
    fontWeight: '700',
  },
  tokenContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tokenLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  tokenDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tokenDisplay: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#333',
    paddingVertical: 4,
  },
  tokenToggleButton: {
    padding: 8,
    marginLeft: 8,
  },
  tokenCopyButton: {
    padding: 8,
    marginLeft: 4,
  },
  tokenWarning: {
    fontSize: 12,
    color: '#FF9800',
    marginTop: 8,
    fontStyle: 'italic',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  securityInfoText: {
    fontSize: 12,
    color: '#2E7D32',
    marginLeft: 8,
    flex: 1,
  },
  codeContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  codeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  codeDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  codeDisplay: {
    fontSize: 24,
    fontFamily: 'monospace',
    color: '#34C759',
    fontWeight: 'bold',
    letterSpacing: 8,
    marginRight: 12,
  },
  codeCopyButton: {
    padding: 8,
  },
  codeWarning: {
    fontSize: 12,
    color: '#FF9800',
    marginTop: 8,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 32,
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B5E20',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  infoSubtext: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  // Modern Password Reset Styles
  successHeader: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 10,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  modernSecurityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  modernSecurityText: {
    fontSize: 13,
    color: '#2E7D32',
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },
  modernInputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginLeft: 4,
  },
  modernInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  modernInputIcon: {
    marginRight: 12,
  },
  modernInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 0,
  },
  modernEyeIcon: {
    padding: 4,
    marginLeft: 8,
  },
  modernSubmitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    paddingVertical: 18,
    borderRadius: 14,
    marginTop: 8,
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modernDisabledButton: {
    backgroundColor: '#BDBDBD',
    shadowOpacity: 0,
  },
  modernButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  backButtonContainer: {
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#34C759',
    fontWeight: '500',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
});

export default NewAuthScreen;
