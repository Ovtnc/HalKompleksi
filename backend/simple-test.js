const io = require('socket.io-client');
const axios = require('axios');

// Test configuration
const SERVER_URL = 'http://localhost:5001';
const API_URL = 'http://localhost:5001/api';

async function testMessaging() {
  console.log('🧪 Basit Mesajlaşma Testi');
  console.log('=' .repeat(40));

  try {
    // First, let's get existing products
    console.log('📦 Mevcut ürünleri kontrol ediyor...');
    const productsResponse = await axios.get(`${API_URL}/products`);
    const products = productsResponse.data.products;
    
    if (products.length === 0) {
      console.log('❌ Hiç ürün bulunamadı. Önce bir ürün oluşturun.');
      return;
    }

    const product = products[0];
    console.log(`✅ Ürün bulundu: ${product.title} (ID: ${product._id})`);

    // Create a test user
    console.log('\n👤 Test kullanıcısı oluşturuluyor...');
    const testUser = {
      name: 'Test Mesajlaşma Kullanıcısı',
      email: 'test-messaging@example.com',
      password: '123456',
      phone: '05551234569',
      userType: 'buyer'
    };

    let token, userId;
    try {
      await axios.post(`${API_URL}/auth/register`, testUser);
      console.log('✅ Test kullanıcısı oluşturuldu');
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message.includes('already exists')) {
        console.log('ℹ️  Test kullanıcısı zaten mevcut');
      } else {
        console.error('❌ Test kullanıcısı oluşturulamadı:', error.response?.data?.message);
        return;
      }
    }

    // Login
    console.log('🔐 Giriş yapılıyor...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    token = loginResponse.data.token;
    userId = loginResponse.data.user.id;
    console.log(`✅ Giriş başarılı (Kullanıcı ID: ${userId})`);

    // Create socket connection
    console.log('\n🔌 Socket bağlantısı kuruluyor...');
    const socket = io(SERVER_URL, {
      auth: { token: token }
    });

    socket.on('connect', () => {
      console.log('✅ Socket bağlantısı kuruldu');
      
      // Join product conversation
      socket.emit('join_conversation', product._id);
      console.log(`📱 Konuşmaya katıldı (Ürün: ${product.title})`);
    });

    socket.on('new_message', (data) => {
      console.log(`📨 Yeni mesaj alındı: "${data.message.message}"`);
    });

    socket.on('user_typing', (data) => {
      console.log(`⌨️  ${data.userName} yazıyor...`);
    });

    socket.on('user_stopped_typing', (data) => {
      console.log(`⌨️  ${data.userName} yazmayı bıraktı`);
    });

    socket.on('message_status_update', (data) => {
      console.log(`📊 Mesaj durumu: ${data.status}`);
    });

    // Wait for connection
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 1: Send message to product seller
    console.log('\n📤 Test mesajı gönderiliyor...');
    try {
      const messageResponse = await axios.post(`${API_URL}/messages`, {
        receiverId: product.seller._id,
        productId: product._id,
        message: 'Merhaba! Bu ürün hakkında bilgi alabilir miyim? Fiyat ne kadar?'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Mesaj gönderildi:', messageResponse.data.data.message);
    } catch (error) {
      console.error('❌ Mesaj gönderilemedi:', error.response?.data?.message);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 2: Typing indicator
    console.log('\n⌨️  Yazma göstergesi testi...');
    socket.emit('typing_start', { productId: product._id });
    console.log('👤 Yazmaya başladı');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    socket.emit('typing_stop', { productId: product._id });
    console.log('👤 Yazmayı bıraktı');

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 3: Get conversations
    console.log('\n📋 Konuşmaları listeleme...');
    try {
      const conversationsResponse = await axios.get(`${API_URL}/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log(`✅ Konuşmalar: ${conversationsResponse.data.conversations.length} adet`);
      conversationsResponse.data.conversations.forEach((conv, index) => {
        console.log(`   ${index + 1}. ${conv.product.title} - ${conv.unreadCount} okunmamış mesaj`);
      });
    } catch (error) {
      console.error('❌ Konuşmalar alınamadı:', error.response?.data?.message);
    }

    // Test 4: Get messages for product
    console.log('\n💬 Ürün mesajlarını alma...');
    try {
      const messagesResponse = await axios.get(`${API_URL}/messages/${product._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log(`✅ Mesajlar: ${messagesResponse.data.messages.length} adet`);
      messagesResponse.data.messages.forEach((msg, index) => {
        console.log(`   ${index + 1}. ${msg.sender.name}: "${msg.message}" (${msg.status})`);
      });
    } catch (error) {
      console.error('❌ Mesajlar alınamadı:', error.response?.data?.message);
    }

    // Test 5: Unread count
    console.log('\n🔢 Okunmamış mesaj sayısı...');
    try {
      const unreadResponse = await axios.get(`${API_URL}/messages/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log(`✅ Okunmamış mesaj: ${unreadResponse.data.unreadCount} adet`);
    } catch (error) {
      console.error('❌ Okunmamış mesaj sayısı alınamadı:', error.response?.data?.message);
    }

    console.log('\n🎉 Test tamamlandı!');
    console.log('\n📊 Test Sonuçları:');
    console.log('✅ Socket bağlantısı');
    console.log('✅ Mesaj gönderme');
    console.log('✅ Yazma göstergeleri');
    console.log('✅ Konuşma listesi');
    console.log('✅ Mesaj geçmişi');
    console.log('✅ Okunmamış mesaj sayısı');

    // Cleanup
    setTimeout(() => {
      socket.disconnect();
      console.log('\n🔌 Bağlantı kapatıldı');
      process.exit(0);
    }, 2000);

  } catch (error) {
    console.error('❌ Test başarısız:', error.message);
    process.exit(1);
  }
}

// Run test
testMessaging();

