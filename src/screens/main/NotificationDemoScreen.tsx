import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import NotificationCenter from '../../components/NotificationCenter';

const NotificationDemoScreen = ({ navigation }: any) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const handleNotificationPress = () => {
    setShowNotifications(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />
      
      <LinearGradient
        colors={['#2E7D32', '#4CAF50']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bildirim Demo</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={48} color="#2196F3" />
          <Text style={styles.infoTitle}>Gelişmiş Bildirim Sistemi</Text>
          <Text style={styles.infoText}>
            Artık bir ürün talep ettiğinizde, o talebe uygun tüm ürünleri aynı anda görebilirsiniz. 
            Tek bir ürün yerine, talebinizle ilgili tüm ürünleri liste halinde görüntüleyebilirsiniz.
          </Text>
        </View>

        <View style={styles.featuresList}>
          <Text style={styles.featuresTitle}>Yeni Özellikler:</Text>
          
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>
              Talep bazlı ürün listesi - Tek bildirimle tüm ürünleri görün
            </Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>
              Gelişmiş filtreleme - Kategori, şehir, anahtar kelime bazlı
            </Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>
              Sayfalama desteği - Büyük ürün listelerini kolayca yükleyin
            </Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>
              Çoklu ürün karşılaştırması - Ürünleri yan yana karşılaştırın
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.demoButton}
          onPress={handleNotificationPress}
        >
          <LinearGradient
            colors={['#9C27B0', '#E91E63']}
            style={styles.demoButtonGradient}
          >
            <Ionicons name="notifications" size={20} color="#fff" />
            <Text style={styles.demoButtonText}>Bildirimleri Görüntüle</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.exampleCard}>
          <Text style={styles.exampleTitle}>Örnek Senaryo:</Text>
          <Text style={styles.exampleText}>
            1. "Organik domates" için talep oluşturun{'\n'}
            2. Satıcılar domates ürünleri ekler{'\n'}
            3. Bildirim panelinde "Ürün Eklendi" bildirimi görünür{'\n'}
            4. Bildirime tıklayın → Tüm domates ürünlerini görün{'\n'}
            5. İstediğiniz ürünü seçin ve detayına gidin
          </Text>
        </View>
      </View>

      <NotificationCenter 
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        navigation={navigation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 20,
  },
  featuresList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 18,
  },
  demoButton: {
    marginBottom: 20,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#9C27B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  demoButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 8,
  },
  demoButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  exampleCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
});

export default NotificationDemoScreen;
