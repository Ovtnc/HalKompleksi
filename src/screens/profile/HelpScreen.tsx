import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const HelpScreen = ({ navigation }: any) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'Tümü', icon: 'apps' },
    { id: 'account', name: 'Hesap', icon: 'person' },
    { id: 'orders', name: 'Siparişler', icon: 'cart' },
    { id: 'payments', name: 'Ödeme', icon: 'card' },
    { id: 'technical', name: 'Teknik', icon: 'construct' },
  ];

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: 'Hesabımı nasıl oluşturabilirim?',
      answer: 'Ana sayfadan "Kayıt Ol" butonuna tıklayarak e-posta ve şifrenizi girerek kolayca hesap oluşturabilirsiniz. Kayıt işlemi tamamen ücretsizdir.',
      category: 'account',
    },
    
    {
      id: '3',
      question: 'Sipariş nasıl verebilirim?',
      answer: 'İstediğiniz ürünü seçin, miktarı belirleyin ve satıcıyla iletişime geçin. Satıcı size fiyat ve teslimat bilgilerini verecektir.',
      category: 'orders',
    },
    {
      id: '4',
      question: 'Ürün eklemek için ne yapmalıyım?',
      answer: 'Satıcı olarak giriş yapın, "Ürün Ekle" butonuna tıklayın ve ürün bilgilerini doldurun. Ürününüz onaylandıktan sonra görünür olacaktır.',
      category: 'orders',
    },
    {
      id: '5',
      question: 'Ödeme nasıl yapabilirim?',
      answer: 'Hal Kompleksi platformu üzerinden doğrudan ödeme yapılmaz. Satıcıyla iletişime geçerek ödeme yöntemini belirleyebilirsiniz.',
      category: 'payments',
    },
    {
      id: '6',
      question: 'Ürünümü nasıl düzenleyebilirim?',
      answer: 'Ürünlerim sayfasından düzenlemek istediğiniz ürünü seçin ve "Düzenle" butonuna tıklayın. Değişiklikleriniz kaydedildikten sonra güncellenecektir.',
      category: 'orders',
    },
    {
      id: '7',
      question: 'Ürünümü nasıl durdurabilirim?',
      answer: 'Ürünlerim sayfasından durdurmak istediğiniz ürünü seçin ve "Durdur" butonuna tıklayın. Ürününüz alıcılar tarafından görünmez olacaktır.',
      category: 'orders',
    },
   
   
    {
      id: '10',
      question: 'Öne çıkan ürünler nedir?',
      answer: 'Öne çıkan ürünler, özel olarak seçilmiş kaliteli ürünlerdir. Bu ürünler ana sayfada ve "Tümünü Gör" butonuna tıklayarak görüntüleyebilirsiniz.',
      category: 'technical',
    },
  ];

  const handleEmailPress = async () => {
    const email = 'halkompleksitr@gmail.com';
    const subject = encodeURIComponent('Hal Kompleksi - Yardım Talebi');
    const body = encodeURIComponent('\n\n---\nHal Kompleksi mobil uygulamasından gönderildi.');
    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;
    
    try {
      // Direkt mail uygulamasını açmayı dene - varsa otomatik açılır
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
        // Mail uygulaması başarıyla açıldı - kullanıcı mail yazıp gönderebilir
      } else {
        // Mail uygulaması yoksa - sadece bilgi ver
        Alert.alert(
          'E-posta Bilgisi',
          `E-posta adresimiz:\n\n${email}\n\nKonu: Hal Kompleksi - Yardım Talebi\n\nLütfen e-posta uygulamanızı kullanarak iletişime geçin.`,
          [{ text: 'Tamam', style: 'default' }]
        );
      }
    } catch (error) {
      // Hata durumunda kullanıcıya bilgi ver
      Alert.alert(
        'E-posta Bilgisi',
        `E-posta adresimiz:\n\n${email}\n\nLütfen e-posta uygulamanızı kullanarak iletişime geçin.`,
        [{ text: 'Tamam', style: 'default' }]
      );
    }
  };

  const contactMethods = [
    {
      id: '1',
      title: 'E-posta',
      value: 'halkompleksitr@gmail.com',
      icon: 'mail',
      color: '#3498DB',
      onPress: handleEmailPress,
    },
  ];

  const workingHours = [
    { day: 'Pazartesi - Cuma', hours: '09:00 - 18:00' },
    { day: 'Cumartesi', hours: '10:00 - 16:00' },
    { day: 'Pazar', hours: 'Kapalı' },
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderFAQItem = (item: FAQItem) => {
    const isExpanded = expandedId === item.id;
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.faqItem}
        onPress={() => toggleExpand(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.faqHeader}>
          <Text style={styles.faqQuestion}>{item.question}</Text>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#27AE60"
          />
        </View>
        {isExpanded && (
          <Text style={styles.faqAnswer}>{item.answer}</Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderContactMethod = (method: any) => (
    <TouchableOpacity
      key={method.id}
      style={styles.contactCard}
      onPress={method.onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.contactIconContainer, { backgroundColor: method.color + '20' }]}>
        <Ionicons name={method.icon as any} size={24} color={method.color} />
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactTitle}>{method.title}</Text>
        <Text style={styles.contactValue}>{method.value}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Modern Header */}
      <LinearGradient 
        colors={['#2cbd69', '#27ae60']} 
        start={{ x: 0, y: 0 }} 
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Yardım & Destek</Text>
            <Text style={styles.headerSubtitle}>Size nasıl yardımcı olabiliriz?</Text>
          </View>
          <View style={{ width: 34 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Modern Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#2cbd69" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Sorunuzu arayın..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#A0A0A0"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#A0A0A0" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Modern Categories Filter */}
        <View style={styles.categoriesSection}>
          <Text style={styles.categoriesTitle}>Kategoriler</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContent}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && styles.categoryChipActive
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Ionicons
                  name={category.icon as any}
                  size={16}
                  color={selectedCategory === category.id ? '#FFFFFF' : '#2cbd69'}
                />
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category.id && styles.categoryTextActive
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Modern FAQ Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="help-circle" size={24} color="#2cbd69" />
            <Text style={styles.sectionTitle}>Sık Sorulan Sorular</Text>
          </View>
          <View style={styles.faqContainer}>
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map(renderFAQItem)
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="search" size={48} color="#E0E0E0" />
                <Text style={styles.emptyText}>Aradığınız soru bulunamadı</Text>
                <Text style={styles.emptySubtext}>Farklı anahtar kelimeler deneyin</Text>
              </View>
            )}
          </View>
        </View>

        {/* Modern Contact Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="call" size={24} color="#2cbd69" />
            <Text style={styles.sectionTitle}>Bize Ulaşın</Text>
          </View>
          <View style={styles.contactContainer}>
            {contactMethods.map(renderContactMethod)}
          </View>
        </View>

        {/* Modern Working Hours Section */}
        

      
     
      </ScrollView>
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
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
  },
  content: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#2cbd69',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F1F3F4',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  categoriesSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoriesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  categoriesContainer: {
    paddingLeft: 0,
    marginBottom: 0,
  },
  categoriesContent: {
    paddingRight: 0,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryChipActive: {
    backgroundColor: '#2cbd69',
    borderColor: '#2cbd69',
    shadowColor: '#2cbd69',
    shadowOpacity: 0.3,
  },
  categoryText: {
    fontSize: 14,
    color: '#2cbd69',
    marginLeft: 8,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  section: {
    marginTop: 0,
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
  },
  faqContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#2cbd69',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F3F4',
  },
  faqItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 12,
    lineHeight: 22,
  },
  faqAnswer: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 12,
    lineHeight: 22,
    fontWeight: '400',
  },
  contactContainer: {
    marginBottom: 0,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#2cbd69',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F3F4',
  },
  contactIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  hoursCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 0,
    shadowColor: '#2cbd69',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F3F4',
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  dayText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  hourText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2cbd69',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
    fontWeight: '400',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#2cbd69',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F3F4',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default HelpScreen;

