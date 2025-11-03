import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { adminAPI } from '../../services/api';

const AdminTestScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [userProducts, setUserProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const testSearchUsers = async () => {
    if (searchQuery.trim().length < 2) {
      Alert.alert('Uyarı', 'En az 2 karakter girin');
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 Testing search for:', searchQuery);
      const response = await adminAPI.searchUsers(searchQuery);
      console.log('🔍 Search response:', response);
      setSearchResults(response.users || []);
      Alert.alert('Başarılı', `${response.users?.length || 0} kullanıcı bulundu`);
    } catch (error) {
      console.error('❌ Search error:', error);
      Alert.alert('Hata', `Arama hatası: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const testGetUserProducts = async (userId: string) => {
    try {
      setLoading(true);
      console.log('🔄 Testing getUserProducts for:', userId);
      const response = await adminAPI.getUserProducts(userId);
      console.log('📱 User products response:', response);
      setUserProducts(response.products || []);
      Alert.alert('Başarılı', `${response.products?.length || 0} ürün bulundu`);
    } catch (error) {
      console.error('❌ GetUserProducts error:', error);
      Alert.alert('Hata', `Ürün getirme hatası: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetUsers = async () => {
    try {
      setLoading(true);
      console.log('🔄 Testing getUsers');
      const response = await adminAPI.getUsers();
      console.log('📱 Users response:', response);
      Alert.alert('Başarılı', `${response.users?.length || 0} kullanıcı bulundu`);
    } catch (error) {
      console.error('❌ GetUsers error:', error);
      Alert.alert('Hata', `Kullanıcı getirme hatası: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Panel Test</Text>
        <Text style={styles.subtitle}>API fonksiyonlarını test edin</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Kullanıcıları Getir</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={testGetUsers}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Yükleniyor...' : 'Tüm Kullanıcıları Getir'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Kullanıcı Ara</Text>
        <TextInput
          style={styles.input}
          placeholder="Kullanıcı adı, email veya telefon ara..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.halfButton]} 
            onPress={testSearchUsers}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Aranıyor...' : 'Kullanıcı Ara'}
            </Text>
          </TouchableOpacity>
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              style={[styles.button, styles.halfButton, styles.clearButton]} 
              onPress={clearSearch}
            >
              <Text style={styles.buttonText}>Temizle</Text>
            </TouchableOpacity>
          )}
        </View>

        {searchResults.length > 0 && (
          <View style={styles.results}>
            <Text style={styles.resultsTitle}>Arama Sonuçları:</Text>
            {searchResults.map((user: any) => (
              <TouchableOpacity
                key={user._id}
                style={styles.resultItem}
                onPress={() => testGetUserProducts(user._id)}
              >
                <Text style={styles.resultName}>{user.name}</Text>
                <Text style={styles.resultEmail}>{user.email}</Text>
                <Text style={styles.resultPhone}>{user.phone}</Text>
                <Text style={styles.resultType}>{user.userType}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Kullanıcı Ürünleri</Text>
        {userProducts.length > 0 && (
          <View style={styles.results}>
            <Text style={styles.resultsTitle}>Ürünler:</Text>
            {userProducts.map((product: any) => (
              <View key={product._id} style={styles.productItem}>
                <Text style={styles.productTitle}>{product.title}</Text>
                <Text style={styles.productPrice}>{product.price} ₺</Text>
                <Text style={styles.productCategory}>{product.category}</Text>
                <Text style={styles.productStatus}>
                  {product.isApproved ? '✅ Onaylı' : '⏳ Beklemede'}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2E8B57',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  section: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#F8F9FA',
  },
  button: {
    backgroundColor: '#2E8B57',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  halfButton: {
    flex: 1,
    marginBottom: 15,
  },
  clearButton: {
    backgroundColor: '#DC3545',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  results: {
    marginTop: 15,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
  },
  resultItem: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  resultName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  resultEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  resultPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  resultType: {
    fontSize: 12,
    color: '#2E8B57',
    fontWeight: '600',
    marginTop: 5,
  },
  productItem: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 14,
    color: '#2E8B57',
    fontWeight: '600',
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  productStatus: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
});

export default AdminTestScreen;
