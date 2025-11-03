# App Store Yükleme Talimatları

## 1. SSL Sertifikası Kurulumu (Zorunlu)

Apple App Store HTTP bağlantılarına izin vermez. Backend sunucunuza SSL sertifikası kurmalısınız.

### Let's Encrypt ile SSL Kurulumu:

```bash
# Sunucunuza bağlanın
ssh root@109.199.114.223

# Certbot kurulumu
apt-get update
apt-get install certbot python3-certbot-nginx

# Domain adınız için sertifika alın
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Otomatik yenileme
certbot renew --dry-run
```

### Docker Nginx ile SSL Kullanımı:

```bash
# docker-compose.yml dosyasında volumes ekleyin
volumes:
  - ./nginx.conf:/etc/nginx/nginx.conf
  - /etc/letsencrypt:/etc/nginx/ssl:ro
```

## 2. EAS JSON Yapılandırması

`eas.json` dosyasındaki placeholder değerleri güncelleyin:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "sizin-apple-id@example.com",
        "ascAppId": "App Store Connect'ten ID",
        "appleTeamId": "Apple Developer Team ID"
      }
    }
  }
}
```

### Apple Bilgilerini Bulma:

1. **Apple ID**: Apple Developer hesabınızın email adresi
2. **ASC App ID**: App Store Connect → My Apps → App → App Information → Apple ID
3. **Team ID**: developer.apple.com → Membership → Team ID

## 3. Build ve Submit Komutları

```bash
cd /Users/okanvatanci/Desktop/hal-kompleksi/HalKompleksi

# iOS Production build
eas build --platform ios --profile production

# Build tamamlandıktan sonra App Store'a submit
eas submit --platform ios --latest

# Veya manuel submit için build indirin
# App Store Connect → TestFlight üzerinden yükleyin
```

## 4. App Store Connect Hazırlık

### Gerekli Ekran Görüntüleri:
- 6.7" (iPhone 14 Pro Max): 1290 x 2796 px
- 6.5" (iPhone 11 Pro Max): 1242 x 2688 px  
- 5.5" (iPhone 8 Plus): 1242 x 2208 px

Her boyut için en az 3 ekran görüntüsü.

### Gerekli Bilgiler:
- Uygulama açıklaması (Türkçe ve İngilizce)
- Anahtar kelimeler
- Destek URL'si
- Gizlilik politikası URL'si
- Kategori: Business / Productivity
- İçerik derecelendirmesi
- Fiyat (ücretsiz veya ücretli)

### Test Hesabı Bilgileri:
Apple Review ekibi için demo hesap oluşturun:
- Email: demo@halkompleksi.com
- Şifre: Demo123!
- Rol: seller (satıcı hesabı)

## 5. Backend Kontrol Listesi

✅ SSL sertifikası kurulu
✅ HTTPS üzerinden erişilebilir
✅ CORS ayarları yapılandırılmış
✅ Rate limiting aktif
✅ MongoDB erişilebilir
✅ Resim upload çalışıyor
✅ WhatsApp integration test edildi

## 6. Environment Variables

Production ortamında `.env` dosyası:

```bash
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb://localhost:27017/hal-kompleksi
JWT_SECRET=güçlü-bir-secret-key-buraya
CORS_ORIGIN=https://yourdomain.com
```

## 7. Test Süreci

1. **TestFlight Beta Test**: İlk önce TestFlight'a gönderin
2. **Internal Testing**: En az 5 kişiyle test edin
3. **External Testing**: Daha geniş bir grupla test edin
4. **App Review**: Sorunsuz çalıştığından emin olun
5. **Submit for Review**: Apple incelemesine gönderin

## 8. Yaygın Red Nedenleri

- ❌ HTTP kullanımı (HTTPS zorunlu)
- ❌ Test hesabı çalışmıyor
- ❌ Çökme/crash var
- ❌ Eksik veya hatalı metadata
- ❌ Gizlilik politikası eksik
- ❌ In-app purchase doğru yapılandırılmamış (varsa)
- ❌ API hataları

## 9. İnceleme Notları (Apple Review Notes)

App Store Connect'te şunları ekleyin:

```
Demo Hesap Bilgileri:
Email: demo@halkompleksi.com
Password: Demo123!
Rol: Satıcı

Test Talimatları:
1. Demo hesabı ile giriş yapın
2. Profil → Kişisel Bilgiler'den profil resmi yükleyebilirsiniz
3. Ana sayfada ürünleri görüntüleyebilirsiniz
4. Ürün detayına tıklayarak satıcı bilgilerini ve WhatsApp ile iletişim özelliğini test edebilirsiniz
5. Satıcı rolünde ürün ekleyebilirsiniz

Not: Backend sunucumuz 109.199.114.223:5001 adresinde çalışmaktadır.
```

## 10. Yükleme Sonrası

- App Store'da yayına girdikten sonra analytics ekleyin
- Crash reporting aktif edin (Sentry, Firebase Crashlytics)
- Push notification sertifikalarını yükleyin
- Deep linking test edin
- Güncellemeler için CI/CD pipeline kurun

## İletişim

Sorun yaşarsanız:
- Backend logs: `pm2 logs hal-kompleksi`
- Frontend: Expo Go veya TestFlight logs
- Apple rejection: Resolution Center üzerinden iletişim

