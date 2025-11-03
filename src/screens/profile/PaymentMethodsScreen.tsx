import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../services/AuthContext';

interface PaymentMethod {
  _id: string;
  type: 'card' | 'bank' | 'wallet';
  name: string;
  lastFour?: string;
  expiryDate?: string;
  isDefault: boolean;
  isVerified: boolean;
  bankName?: string;
  accountNumber?: string;
}

const PaymentMethodsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingMethod, setAddingMethod] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedType, setSelectedType] = useState<'card' | 'bank' | 'wallet'>('card');

  // Form states
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [iban, setIban] = useState('');

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      // TODO: Implement actual API call for payment methods
      setPaymentMethods([]);
    } catch (error) {
      console.error('Load payment methods error:', error);
      Alert.alert('Hata', 'Ödeme yöntemleri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMethod = async () => {
    try {
      setAddingMethod(true);
      
      // Validate form based on selected type
      if (selectedType === 'card') {
        if (!cardNumber || !expiryDate || !cvv || !cardName) {
          Alert.alert('Hata', 'Lütfen tüm kart bilgilerini doldurun');
          return;
        }
      } else if (selectedType === 'bank') {
        if (!bankName || !accountNumber || !iban) {
          Alert.alert('Hata', 'Lütfen tüm banka bilgilerini doldurun');
          return;
        }
      }

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newMethod: PaymentMethod = {
        _id: Date.now().toString(),
        type: selectedType,
        name: selectedType === 'card' ? cardName : `${bankName} Hesabı`,
        lastFour: selectedType === 'card' ? cardNumber.slice(-4) : accountNumber.slice(-4),
        expiryDate: selectedType === 'card' ? expiryDate : undefined,
        bankName: selectedType === 'bank' ? bankName : undefined,
        accountNumber: selectedType === 'bank' ? accountNumber : undefined,
        isDefault: paymentMethods.length === 0,
        isVerified: false,
      };

      setPaymentMethods([...paymentMethods, newMethod]);
      setShowAddForm(false);
      resetForm();
      Alert.alert('Başarılı', 'Ödeme yöntemi eklendi');
    } catch (error) {
      console.error('Add payment method error:', error);
      Alert.alert('Hata', 'Ödeme yöntemi eklenirken bir hata oluştu');
    } finally {
      setAddingMethod(false);
    }
  };

  const resetForm = () => {
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setCardName('');
    setBankName('');
    setAccountNumber('');
    setIban('');
  };

  const handleSetDefault = async (methodId: string) => {
    try {
      const updatedMethods = paymentMethods.map(method => ({
        ...method,
        isDefault: method._id === methodId
      }));
      setPaymentMethods(updatedMethods);
      Alert.alert('Başarılı', 'Varsayılan ödeme yöntemi güncellendi');
    } catch (error) {
      Alert.alert('Hata', 'Varsayılan ödeme yöntemi güncellenirken bir hata oluştu');
    }
  };

  const handleDeleteMethod = (methodId: string) => {
    Alert.alert(
      'Ödeme Yöntemini Sil',
      'Bu ödeme yöntemini silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            setPaymentMethods(paymentMethods.filter(method => method._id !== methodId));
            Alert.alert('Başarılı', 'Ödeme yöntemi silindi');
          }
        }
      ]
    );
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'card':
        return 'card-outline';
      case 'bank':
        return 'business-outline';
      case 'wallet':
        return 'wallet-outline';
      default:
        return 'card-outline';
    }
  };

  const getMethodColor = (type: string) => {
    switch (type) {
      case 'card':
        return '#2196F3';
      case 'bank':
        return '#4CAF50';
      case 'wallet':
        return '#FF9800';
      default:
        return '#666';
    }
  };

  const renderPaymentMethod = (method: PaymentMethod) => (
    <View key={method._id} style={styles.methodCard}>
      <View style={styles.methodHeader}>
        <View style={styles.methodInfo}>
          <View style={[styles.methodIcon, { backgroundColor: getMethodColor(method.type) + '20' }]}>
            <Ionicons 
              name={getMethodIcon(method.type) as any} 
              size={24} 
              color={getMethodColor(method.type)} 
            />
          </View>
          <View style={styles.methodDetails}>
            <Text style={styles.methodName}>{method.name}</Text>
            {method.type === 'card' && (
              <Text style={styles.methodNumber}>**** **** **** {method.lastFour}</Text>
            )}
            {method.type === 'bank' && (
              <Text style={styles.methodNumber}>{method.bankName} - {method.accountNumber}</Text>
            )}
            {method.expiryDate && (
              <Text style={styles.methodExpiry}>Son kullanma: {method.expiryDate}</Text>
            )}
          </View>
        </View>
        <View style={styles.methodActions}>
          {method.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Varsayılan</Text>
            </View>
          )}
          {!method.isVerified && (
            <View style={styles.verificationBadge}>
              <Text style={styles.verificationText}>Doğrulanmamış</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.methodFooter}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleSetDefault(method._id)}
          disabled={method.isDefault}
        >
          <Ionicons name="star-outline" size={16} color="#666" />
          <Text style={styles.actionText}>Varsayılan Yap</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert('Düzenle', 'Ödeme yöntemi düzenleme özelliği yakında eklenecek')}
        >
          <Ionicons name="create-outline" size={16} color="#666" />
          <Text style={styles.actionText}>Düzenle</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteMethod(method._id)}
        >
          <Ionicons name="trash-outline" size={16} color="#F44336" />
          <Text style={[styles.actionText, styles.deleteText]}>Sil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAddForm = () => (
    <View style={styles.addForm}>
      <Text style={styles.formTitle}>Yeni Ödeme Yöntemi Ekle</Text>
      
      {/* Method Type Selection */}
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[styles.typeButton, selectedType === 'card' && styles.typeButtonActive]}
          onPress={() => setSelectedType('card')}
        >
          <Ionicons name="card-outline" size={20} color={selectedType === 'card' ? '#FFFFFF' : '#2196F3'} />
          <Text style={[styles.typeText, selectedType === 'card' && styles.typeTextActive]}>
            Kart
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, selectedType === 'bank' && styles.typeButtonActive]}
          onPress={() => setSelectedType('bank')}
        >
          <Ionicons name="business-outline" size={20} color={selectedType === 'bank' ? '#FFFFFF' : '#4CAF50'} />
          <Text style={[styles.typeText, selectedType === 'bank' && styles.typeTextActive]}>
            Banka
          </Text>
        </TouchableOpacity>
      </View>

      {/* Card Form */}
      {selectedType === 'card' && (
        <>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Kart Sahibi Adı</Text>
            <TextInput
              style={styles.input}
              value={cardName}
              onChangeText={setCardName}
              placeholder="Ad Soyad"
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Kart Numarası</Text>
            <TextInput
              style={styles.input}
              value={cardNumber}
              onChangeText={setCardNumber}
              placeholder="1234 5678 9012 3456"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.rowInputs}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Son Kullanma</Text>
              <TextInput
                style={styles.input}
                value={expiryDate}
                onChangeText={setExpiryDate}
                placeholder="MM/YY"
                placeholderTextColor="#999"
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>CVV</Text>
              <TextInput
                style={styles.input}
                value={cvv}
                onChangeText={setCvv}
                placeholder="123"
                secureTextEntry
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </>
      )}

      {/* Bank Form */}
      {selectedType === 'bank' && (
        <>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Banka Adı</Text>
            <TextInput
              style={styles.input}
              value={bankName}
              onChangeText={setBankName}
              placeholder="Banka adını girin"
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Hesap Numarası</Text>
            <TextInput
              style={styles.input}
              value={accountNumber}
              onChangeText={setAccountNumber}
              placeholder="Hesap numarasını girin"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>IBAN</Text>
            <TextInput
              style={styles.input}
              value={iban}
              onChangeText={setIban}
              placeholder="TR00 0000 0000 0000 0000 0000 00"
              placeholderTextColor="#999"
            />
          </View>
        </>
      )}

      <View style={styles.formButtons}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            setShowAddForm(false);
            resetForm();
          }}
        >
          <Text style={styles.cancelButtonText}>İptal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddMethod}
          disabled={addingMethod}
        >
          {addingMethod ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.addButtonText}>Ekle</Text>
          )}
        </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Ödeme Yöntemleri</Text>
          <View style={{ width: 34 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#27AE60" />
            <Text style={styles.loadingText}>Yükleniyor...</Text>
          </View>
        ) : (
          <>
            {/* Payment Methods List */}
            {paymentMethods.length > 0 && (
              <View style={styles.methodsContainer}>
                {paymentMethods.map(renderPaymentMethod)}
              </View>
            )}

            {/* Add New Method */}
            {!showAddForm ? (
              <TouchableOpacity
                style={styles.addMethodButton}
                onPress={() => setShowAddForm(true)}
              >
                <Ionicons name="add-circle-outline" size={24} color="#27AE60" />
                <Text style={styles.addMethodText}>Yeni Ödeme Yöntemi Ekle</Text>
              </TouchableOpacity>
            ) : (
              renderAddForm()
            )}

            {/* Empty State */}
            {paymentMethods.length === 0 && !showAddForm && (
              <View style={styles.emptyContainer}>
                <Ionicons name="card-outline" size={64} color="#CCC" />
                <Text style={styles.emptyTitle}>Ödeme Yöntemi Yok</Text>
                <Text style={styles.emptyText}>
                  Henüz hiç ödeme yöntemi eklemediniz. Hızlı ödeme için bir yöntem ekleyin.
                </Text>
              </View>
            )}
          </>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  methodsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  methodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  methodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodDetails: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  methodNumber: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  methodExpiry: {
    fontSize: 12,
    color: '#999',
  },
  methodActions: {
    alignItems: 'flex-end',
  },
  defaultBadge: {
    backgroundColor: '#27AE60',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  defaultText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  verificationBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verificationText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  methodFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  actionText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '600',
  },
  deleteText: {
    color: '#F44336',
  },
  addMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#27AE60',
    borderStyle: 'dashed',
  },
  addMethodText: {
    fontSize: 16,
    color: '#27AE60',
    fontWeight: '600',
    marginLeft: 8,
  },
  addForm: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F9FA',
  },
  typeButtonActive: {
    backgroundColor: '#27AE60',
    borderColor: '#27AE60',
  },
  typeText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    fontWeight: '600',
  },
  typeTextActive: {
    color: '#FFFFFF',
  },
  inputContainer: {
    marginBottom: 16,
  },
  rowInputs: {
    flexDirection: 'row',
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
  addButton: {
    flex: 1,
    backgroundColor: '#27AE60',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default PaymentMethodsScreen;
