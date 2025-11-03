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

// Trust proxy - Nginx reverse proxy için gerekli
app.set('trust proxy', true);

const PORT = urlConfig.PORT;

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting - Trust proxy için ayarlandı
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // limit each IP to 1000 requests per minute (development)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Trust proxy ile çalış
  skip: (req) => false,
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

// Routes
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

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/uploads/profiles', express.static(path.join(__dirname, '../uploads/profiles')));
app.use('/uploads/products', express.static(path.join(__dirname, '../uploads/products')));
app.use('/uploads/market-reports', express.static(path.join(__dirname, '../uploads/market-reports')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Hal Kompleksi API is running',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
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
