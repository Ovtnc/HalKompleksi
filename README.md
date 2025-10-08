# Hal Kompleksi - Modern Market Place App

## 📱 Proje Hakkında
Hal Kompleksi, modern bir pazar yeri uygulamasıdır. React Native ile geliştirilmiş mobil uygulama ve Node.js ile geliştirilmiş backend API'si içerir.

## 🚀 Özellikler
- **Modern UI/UX**: Kullanıcı dostu arayüz
- **Ürün Yönetimi**: Satıcılar ürün ekleyebilir, düzenleyebilir
- **Arama ve Filtreleme**: Gelişmiş arama ve filtreleme sistemi
- **Kategori Yönetimi**: 10 farklı kategori
- **Favori Ürünler**: Kullanıcılar ürünleri favorilere ekleyebilir
- **Admin Paneli**: Ürün ve kullanıcı yönetimi
- **Responsive Design**: Tüm cihazlarda uyumlu

## 🛠️ Teknolojiler
- **Frontend**: React Native, Expo, TypeScript
- **Backend**: Node.js, Express.js, MongoDB
- **Authentication**: JWT Token
- **Image Upload**: Multer
- **API**: RESTful API

## 📂 Proje Yapısı
```
hal-kompleksi/
├── backend/          # Node.js Backend
├── HalKompleksi/     # React Native Frontend
└── README.md
```

## 🚀 Kurulum
1. Backend'i başlatın:
```bash
cd backend
npm install
PORT=5001 node src/server.js
```

2. Frontend'i başlatın:
```bash
cd HalKompleksi
npm install
npx expo start
```

## 📱 Kullanım
- iOS Simülatör: `npx expo start --ios`
- Android: `npx expo start --android`
- Web: `npx expo start --web`

## 🔧 API Endpoints
- `GET /api/products` - Tüm ürünleri getir
- `GET /api/products/categories` - Kategorileri getir
- `POST /api/auth/login` - Giriş yap
- `POST /api/auth/register` - Kayıt ol

## 📄 Lisans
MIT License

## 👨‍💻 Geliştirici
Okan Vatanci - [GitHub](https://github.com/Ovtnc)
