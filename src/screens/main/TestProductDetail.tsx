import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TestProductDetailProps {
  navigation?: any;
  route?: any;
}

const TestProductDetail = ({ navigation, route }: TestProductDetailProps) => {
  const productId = route?.params?.productId;
  
  console.log('🧪 TEST: TestProductDetail rendered');
  console.log('🧪 TEST: Route:', route);
  console.log('🧪 TEST: ProductId:', productId);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation?.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Test Ürün Detayı</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Test Ürün Detay Sayfası</Text>
        <Text style={styles.productId}>Ürün ID: {productId || 'Bulunamadı'}</Text>
        <Text style={styles.info}>
          Bu sayfa ürün detaylarının çalışıp çalışmadığını test etmek için oluşturuldu.
        </Text>
        
        <TouchableOpacity 
          style={styles.testButton}
          onPress={() => {
            console.log('🧪 TEST: Test button pressed');
            alert('Test butonu çalışıyor!');
          }}
        >
          <Text style={styles.testButtonText}>Test Butonu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  productId: {
    fontSize: 18,
    color: '#4CAF50',
    marginBottom: 20,
    textAlign: 'center',
  },
  info: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  testButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TestProductDetail;
