# Hal Kompleksi Backend API

Modern hal sitesi uygulaması için Node.js + Express.js backend API.

## 🚀 Özellikler

- **Authentication**: JWT tabanlı kimlik doğrulama
- **User Management**: Kullanıcı ve satıcı yönetimi
- **Product Management**: Ürün CRUD işlemleri
- **Chat System**: Gerçek zamanlı mesajlaşma
- **File Upload**: Ürün fotoğraf yükleme
- **Search & Filter**: Gelişmiş arama ve filtreleme
- **Rate Limiting**: API koruması
- **Security**: Helmet, CORS, validation

## 📦 Teknolojiler

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload
- **Cloudinary** - Image storage
- **Express Validator** - Input validation

## 🛠️ Kurulum

1. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

2. **Environment dosyasını oluşturun:**
   ```bash
   cp .env.example .env
   ```

3. **MongoDB'yi başlatın:**
   ```bash
   # macOS (Homebrew)
   brew services start mongodb-community
   
   # Ubuntu/Debian
   sudo systemctl start mongod
   ```

4. **Sunucuyu başlatın:**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Giriş yapma
- `GET /api/auth/me` - Mevcut kullanıcı
- `POST /api/auth/logout` - Çıkış yapma

### Users
- `GET /api/users/profile` - Profil bilgileri
- `PUT /api/users/profile` - Profil güncelleme
- `GET /api/users/sellers` - Satıcı listesi
- `GET /api/users/sellers/:id` - Satıcı detayı

### Products
- `GET /api/products` - Ürün listesi
- `GET /api/products/featured` - Öne çıkan ürünler
- `GET /api/products/categories` - Kategoriler
- `GET /api/products/:id` - Ürün detayı
- `POST /api/products` - Ürün ekleme (Satıcı)
- `PUT /api/products/:id` - Ürün güncelleme (Satıcı)
- `DELETE /api/products/:id` - Ürün silme (Satıcı)

### Chat
- `GET /api/chat/conversations` - Konuşmalar
- `GET /api/chat/conversations/:productId` - Ürün konuşması
- `POST /api/chat/messages` - Mesaj gönderme
- `PUT /api/chat/messages/:id/read` - Mesajı okundu işaretle
- `DELETE /api/chat/messages/:id` - Mesaj silme

## 🔧 Environment Variables

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:8082
MONGODB_URI=mongodb://localhost:27017/hal-kompleksi
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 📱 Frontend Entegrasyonu

Backend API'si React Native uygulaması ile entegre edilebilir:

```javascript
// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Authentication
const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};
```

## 🚀 Deployment

### Heroku
```bash
# Heroku CLI ile
heroku create hal-kompleksi-api
heroku addons:create mongolab:sandbox
git push heroku main
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📊 Database Schema

### User Model
- name, email, password, phone
- userType (buyer/seller)
- location, sellerInfo
- preferences, timestamps

### Product Model
- title, description, price, category
- images, seller, location
- isAvailable, stock, rating
- views, favorites, tags

### Chat Model
- participants, product, lastMessage
- unreadCount, isActive

## 🔒 Security

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation
- CORS configuration
- Helmet security headers

## 📈 Performance

- MongoDB indexing
- Pagination
- Image optimization
- Caching strategies
- Database connection pooling

## 🧪 Testing

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Load testing
npm run test:load
```

## 📝 License

MIT License - Hal Kompleksi Team
