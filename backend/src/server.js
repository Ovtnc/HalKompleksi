const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();

const connectDB = require('./config/database');
const urlConfig = require('./config/urls');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');
const locationRoutes = require('./routes/locations');
const notificationRoutes = require('./routes/notifications');
const marketReportRoutes = require('./routes/marketReports');
const categoryRoutes = require('./routes/categories');

const app = express();
const PORT = urlConfig.PORT;

// Connect to MongoDB
connectDB();

// Initialize cities on startup (if not exists)
const initializeCities = async () => {
  try {
    const Location = require('./models/Location');
    const count = await Location.countDocuments();
    
    if (count === 0) {
      console.log('📍 No cities found in database. Loading cities from Turkiye API...');
      
      const response = await fetch('https://turkiyeapi.dev/api/v1/provinces');
      if (!response.ok) {
        console.error('❌ Failed to fetch cities from Turkiye API');
        return;
      }
      
      const data = await response.json();
      const citiesData = data.data;
      
      let savedCount = 0;
      for (const cityData of citiesData) {
        try {
          const districts = (cityData.districts || []).map(district => ({
            name: district.name,
            isActive: true,
            createdAt: new Date()
          }));
          
          const newCity = new Location({
            name: cityData.name,
            code: cityData.id.toString().padStart(2, '0'),
            districts: districts,
            isActive: true
          });
          
          await newCity.save();
          savedCount++;
        } catch (error) {
          console.error(`❌ Error saving city ${cityData.name}:`, error.message);
        }
      }
      
      console.log(`✅ Loaded ${savedCount} cities successfully`);
    } else {
      console.log(`✅ Cities already loaded (${count} cities found)`);
    }
  } catch (error) {
    console.error('❌ Error initializing cities:', error);
  }
};

// Initialize cities after database connection
setTimeout(() => {
  initializeCities().catch(console.error);
}, 2000);

// Security middleware - CSP'yi web sayfaları için gevşet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  },
}));

// Rate limiting - Development için daha gevşek ayarlar
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // limit each IP to 1000 requests per minute (development)
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration - Development'ta tüm originlere izin ver
app.use(cors({
  origin: urlConfig.IS_DEVELOPMENT ? '*' : [
    urlConfig.FRONTEND_URL,
    urlConfig.WEB_URL,
    'http://localhost:8081', 
    'http://localhost:8088', 
    'http://192.168.0.27:8081', 
    'http://192.168.0.27:8088', 
    'http://localhost:5001',
    'http://192.168.0.27:5001',
    'http://192.168.1.109:8081',
    'http://192.168.1.109:8082',
    'http://109.199.114.223:8081',
    'http://109.199.114.223:8088',
    'http://109.199.114.223:5001',
    'exp://192.168.0.27:8081',
    'exp://192.168.1.109:8081',
    'exp://192.168.1.109:8082',
    'exp://109.199.114.223:8081',
    'exp://109.199.114.223:8088'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

// Static dosya servisi - resimler için
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}, express.static('public/uploads'));

// Static dosya servisi - profil resimleri için
app.use('/uploads/profiles', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}, express.static('public/uploads/profiles'));

// Body parsing middleware (video için artırıldı)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging middleware
app.use(morgan('combined'));

// =============================================================================
// API ROUTES - Önce API route'ları tanımla (öncelik sırası önemli!)
// =============================================================================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/market-reports', marketReportRoutes);
app.use('/api/categories', categoryRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Hal Kompleksi API is running',
    timestamp: new Date().toISOString()
  });
});

// Public stats endpoint for landing page
app.get('/api/stats', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const User = require('./models/User');
    const Location = require('./models/Location');
    
    console.log('📊 Stats API called');
    
    // Get real counts from database
    const [totalUsers, totalProducts, totalCities, blockedUsers] = await Promise.all([
      User.countDocuments({}), // Tüm kullanıcılar (isActive kontrolü yok)
      Product.countDocuments({ isApproved: true }), // Onaylı ürünler (isAvailable kontrolü yok)
      Location.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }) // Bloklu kullanıcılar
    ]);
    
    // Aktif kullanıcı = Toplam - Bloklu
    const activeUsers = totalUsers - blockedUsers;
    
    console.log('📊 Raw counts - Total Users:', totalUsers, 'Blocked:', blockedUsers, 'Active:', activeUsers);
    console.log('📊 Products:', totalProducts, 'Cities:', totalCities);
    
    // Get unique categories count
    const categories = await Product.distinct('category', { isApproved: true });
    const categoryCount = categories.length;
    
    // Gerçek sayıları göster - yuvarlama YOK!
    const stats = {
      users: activeUsers > 0 ? activeUsers : totalUsers, // Aktif kullanıcılar veya toplam
      products: totalProducts,
      cities: totalCities,
      categories: categoryCount,
      // Debug bilgisi
      _debug: {
        totalUsers: totalUsers,
        activeUsers: activeUsers,
        blockedUsers: blockedUsers
      }
    };
    
    console.log('📊 Sending real stats:', stats);
    
    res.json(stats);
  } catch (error) {
    console.error('❌ Stats error:', error);
    // Fallback değerler dön (hata durumunda) - düşük tutuyoruz
    res.json({
      users: 0,
      products: 0,
      cities: 81,  // Türkiye'de 81 il var, bu kesin
      categories: 10  // 10 kategori var, bu da kesin
    });
  }
});

// =============================================================================
// STATIC FILE SERVING - Resim ve dosya servisi
// =============================================================================
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/uploads/profiles', express.static(path.join(__dirname, '../uploads/profiles')));
app.use('/uploads/products', express.static(path.join(__dirname, '../uploads/products')));
app.use('/uploads/market-reports', express.static(path.join(__dirname, '../uploads/market-reports')));

// =============================================================================
// WEBSITE ROUTES - En son web sayfaları (catch-all olmaması için spesifik)
// Not: Bu route'lar en sonda olmalı ki API route'ları ile çakışmasın
// =============================================================================

// Apple App Site Association for iOS Universal Links (API gibi davranır)
app.get('/.well-known/apple-app-site-association', (req, res) => {
  res.json({
    applinks: {
      apps: [],
      details: [
        {
          appID: 'TEAM_ID.com.halkompleksi.app',
          paths: ['/product/*']
        }
      ]
    }
  });
});

// Android assetlinks.json for App Links (API gibi davranır)
app.get('/.well-known/assetlinks.json', (req, res) => {
  res.json([
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: 'com.halkompleksi.app',
        sha256_cert_fingerprints: [
          'YOUR_SHA256_FINGERPRINT_HERE'
        ]
      }
    }
  ]);
});

// Privacy Policy page (spesifik route - API'den önce gelmesi sorun değil)
app.get('/privacy-policy.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/privacy-policy.html'));
});

// Terms of Service page (spesifik route)
app.get('/terms-of-service.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/terms-of-service.html'));
});

// Web product route for universal links (spesifik route)
// /product/:productId ile /api/products ÇAKIŞMAZ (farklı path'ler)
app.get('/product/:productId', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/product.html'));
});

// Landing page - root route (en son, catch-all gibi)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('============================================');
  console.log('🚀 Hal Kompleksi API');
  console.log('============================================');
  console.log(`📍 Server: http://0.0.0.0:${PORT}`);
  console.log(`🌐 API URL: ${urlConfig.API_URL}`);
  console.log(`🖥️  Web URL: ${urlConfig.WEB_URL}`);
  console.log(`📱 Frontend URL: ${urlConfig.FRONTEND_URL}`);
  console.log(`🏷️  Domain: ${urlConfig.DOMAIN}`);
  console.log(`🌍 Environment: ${urlConfig.IS_PRODUCTION ? 'production' : 'development'}`);
  console.log(`📦 MongoDB: ${process.env.MONGODB_URI ? 'cloud' : 'localhost'}`);
  console.log('============================================');
});
