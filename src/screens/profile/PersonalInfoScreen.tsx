import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  StatusBar,
  ActivityIndicator,
  TextInput,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { ENV } from '../../config/env';

interface PersonalInfoScreenProps {
  navigation?: any;
}

const PersonalInfoScreen: React.FC<PersonalInfoScreenProps> = ({ navigation }) => {
  const { user, updateUser, sessionExpired, clearSessionExpired, validateToken, setSessionExpired, refreshToken, clearToken } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    district: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: (user as any)?.location?.address || '',
        city: (user as any)?.location?.city || '',
        district: (user as any)?.location?.district || '',
      });
    }
  }, [user]);

  // Handle session expired
  useEffect(() => {
    if (sessionExpired) {
      Alert.alert(
        'Oturum Süresi Doldu', 
        'Lütfen tekrar giriş yapın', 
        [
          { 
            text: 'Tamam', 
            onPress: async () => {
              // Clear token and user data when user confirms
              await AsyncStorage.removeItem('authToken');
              await AsyncStorage.removeItem('userData');
              clearSessionExpired();
              navigation.navigate('Login');
            }
          }
        ]
      );
    }
  }, [sessionExpired, clearSessionExpired, navigation]);

  const handleImagePick = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert('Hata', 'Galeriye erişim izni gerekli');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadingImage(true);
        try {
          const imageUri = result.assets[0].uri;
          console.log('📸 Image selected:', imageUri);
          
          // Upload image to backend first
          const uploadResponse = await uploadProfileImage(imageUri);
          console.log('📤 Upload response:', uploadResponse);
          
          if (uploadResponse.success) {
            // Update user profile image with backend URL using AuthContext
            await updateUser({ profileImage: uploadResponse.url });
            Alert.alert('Başarılı', 'Profil fotoğrafı başarıyla yüklendi');
          } else {
            throw new Error(uploadResponse.message || 'Upload failed');
          }
        } catch (error) {
          console.error('Profile image update error:', error);
          const errorMessage = (error as Error).message;
          
          // Check if it's a token error - try to refresh token first
          if (errorMessage.includes('Token is not valid') || 
              errorMessage.includes('authorization denied') ||
              errorMessage.includes('Oturum süreniz dolmuş')) {
            console.log('🔄 Token error detected, attempting token refresh...');
            try {
              const refreshed = await refreshToken();
              if (refreshed) {
                console.log('✅ Token refreshed, retrying upload...');
                // Retry the upload
                const retryResponse = await uploadProfileImage(imageUri);
                if (retryResponse.success) {
                  await updateUser({ profileImage: retryResponse.url });
                  Alert.alert('Başarılı', 'Profil fotoğrafı başarıyla yüklendi');
                } else {
                  throw new Error(retryResponse.message || 'Upload failed on retry');
                }
              } else {
                console.log('❌ Token refresh failed, clearing token...');
                await clearToken();
                Alert.alert('Oturum Süresi Doldu', 'Lütfen tekrar giriş yapın');
              }
            } catch (refreshError) {
              console.error('Token refresh error:', refreshError);
              await clearToken();
              Alert.alert('Oturum Süresi Doldu', 'Lütfen tekrar giriş yapın');
            }
          } else {
            Alert.alert('Hata', 'Profil fotoğrafı güncellenirken bir hata oluştu: ' + errorMessage);
          }
        } finally {
          setUploadingImage(false);
        }
      }
    } catch (error) {
      setUploadingImage(false);
      console.error('Image picker error:', error);
      Alert.alert('Hata', 'Profil fotoğrafı güncellenirken bir hata oluştu');
    }
  };

  const uploadProfileImage = async (imageUri: string) => {
    try {
      console.log('📤 [UPLOAD] Starting profile image upload...');
      console.log('📤 [UPLOAD] Image URI:', imageUri);
      
      // Check AsyncStorage first
      console.log('📤 [UPLOAD] Step 1: Checking AsyncStorage for token...');
      let token = await AsyncStorage.getItem('authToken');
      console.log('📤 [UPLOAD] AsyncStorage result:', token ? `✅ Found (${token.length} chars)` : '❌ NOT FOUND');
      
      if (token) {
        console.log('📤 [UPLOAD] Token preview (first 30 chars):', token.substring(0, 30) + '...');
        console.log('📤 [UPLOAD] Token preview (last 30 chars):', '...' + token.substring(token.length - 30));
      }
      
      if (!token) {
        // Also check SecureStore as fallback (for migration from old storage)
        console.log('📤 [UPLOAD] Step 2: Checking SecureStore as fallback...');
        try {
          const secureToken = await SecureStore.getItemAsync('authToken');
          if (secureToken) {
            console.log('✅ [UPLOAD] Found token in SecureStore, migrating to AsyncStorage...');
            await AsyncStorage.setItem('authToken', secureToken);
            token = secureToken;
            console.log('✅ [UPLOAD] Token migrated successfully');
          } else {
            console.log('❌ [UPLOAD] No token in SecureStore either');
          }
        } catch (e) {
          console.log('❌ [UPLOAD] SecureStore error:', e.message);
        }
      }
      
      if (!token) {
        console.error('❌ [UPLOAD] No authentication token found in any storage');
        throw new Error('No authentication token found');
      }
      
      console.log('✅ [UPLOAD] Token retrieved successfully, proceeding with upload...');

      // Create FormData with proper file format for React Native
      const formData = new FormData();
      const fileExtension = imageUri.split('.').pop() || 'jpg';
      const fileName = `profile_${Date.now()}.${fileExtension}`;
      
      // React Native FormData format - both iOS and Android
      formData.append('profileImage', {
        uri: imageUri,
        type: 'image/jpeg',
        name: fileName,
      });
      
      console.log('📤 FormData file info:', {
        fileName,
        uri: imageUri,
        platform: Platform.OS
      });

      console.log('📤 Uploading to:', `${ENV.API_BASE_URL}/upload/profile-image`);
      console.log('📤 Image URI:', imageUri);

      // Don't set Content-Type header, let fetch set it automatically with boundary
      console.log('📤 [UPLOAD] Step 3: Sending request to backend...');
      console.log('📤 [UPLOAD] Request URL:', `${ENV.API_BASE_URL}/upload/profile-image`);
      console.log('📤 [UPLOAD] Authorization header:', `Bearer ${token.substring(0, 30)}...`);
      
      const response = await fetch(`${ENV.API_BASE_URL}/upload/profile-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // React Native automatically sets Content-Type with boundary for FormData
        },
        body: formData,
      });

      console.log('📤 [UPLOAD] Response headers:', Object.fromEntries(response.headers.entries()));

      console.log('📤 [UPLOAD] Step 4: Response received');
      console.log('📤 [UPLOAD] Response status:', response.status);
      console.log('📤 [UPLOAD] Response ok:', response.ok);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          // If response is not JSON, use status text
          const text = await response.text();
          console.error('📤 Upload error response (non-JSON):', text);
          errorData = { message: `Upload failed with status ${response.status}` };
        }
        
        console.error('📤 Upload error data:', errorData);
        
        // If token is invalid, sessionExpired state will handle the redirect
        if (errorData.message?.includes('Token is not valid') || 
            errorData.message?.includes('authorization denied') ||
            errorData.message?.includes('No token')) {
          console.log('🔄 Token invalid, sessionExpired state will handle redirect');
          throw new Error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        }
        
        throw new Error(errorData.message || `Upload failed with status ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        url: result.url,
        filename: result.filename
      };
    } catch (error) {
      console.error('Upload profile image error:', error);
      return {
        success: false,
        message: (error as Error).message
      };
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        location: {
          city: formData.city,
          district: formData.district,
          address: formData.address,
        }
      };

      // Use AuthContext updateUser function which handles backend API
      await updateUser(updateData);
      
      Alert.alert('Başarılı', 'Bilgileriniz güncellendi');
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Hata', 'Bilgiler güncellenirken bir hata oluştu: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#27AE60" />
      
      {/* Header */}
      <LinearGradient colors={['#27AE60', '#2ECC71']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation?.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kişisel Bilgiler</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Ionicons name={isEditing ? 'checkmark' : 'create'} size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Image */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {user?.profileImage ? (
              <Image
                source={{ uri: user.profileImage }}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.defaultAvatar}>
                <Ionicons name="person" size={40} color="#27AE60" />
              </View>
            )}
            <TouchableOpacity
              style={styles.editAvatarButton}
              onPress={handleImagePick}
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Ad Soyad</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Ad soyad girin"
              />
            ) : (
              <Text style={styles.fieldValue}>{formData.name || '-'}</Text>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Telefon</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="Telefon numarası girin"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.fieldValue}>{formData.phone || '-'}</Text>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Şehir</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
                placeholder="Şehir girin"
              />
            ) : (
              <Text style={styles.fieldValue}>{formData.city || '-'}</Text>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>İlçe</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.district}
                onChangeText={(text) => setFormData({ ...formData, district: text })}
                placeholder="İlçe girin"
              />
            ) : (
              <Text style={styles.fieldValue}>{formData.district || '-'}</Text>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Adres</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                placeholder="Adres girin"
                multiline
                numberOfLines={3}
              />
            ) : (
              <Text style={styles.fieldValue}>{formData.address || '-'}</Text>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        {isEditing && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setIsEditing(false);
                setFormData({
                  name: user?.name || '',
                  phone: user?.phone || '',
                  address: (user as any)?.location?.address || '',
                  city: (user as any)?.location?.city || '',
                  district: (user as any)?.location?.district || '',
                });
              }}
            >
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveProfile}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Kaydet</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontWeight: '600',
    color: '#FFFFFF',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  defaultAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#27AE60',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  fieldValue: {
    fontSize: 16,
    color: '#34495E',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  input: {
    fontSize: 16,
    color: '#2C3E50',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27AE60',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E9ECEF',
    paddingVertical: 15,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C757D',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#27AE60',
    paddingVertical: 15,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default PersonalInfoScreen;