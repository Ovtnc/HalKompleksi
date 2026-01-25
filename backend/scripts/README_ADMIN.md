# Admin Kullanıcı Oluşturma Scripti

Bu script, SSH üzerinden veya lokal olarak admin kullanıcısı oluşturmak için kullanılır.

## 📋 Gereksinimler

- Node.js yüklü olmalı
- MongoDB çalışıyor olmalı
- `.env` dosyasında `MONGODB_URI` tanımlı olmalı

## 🚀 Kullanım

### Lokal Kullanım

```bash
cd backend
node scripts/create-admin.js --email admin@halkompleksi.com --password Admin123! --name "Admin User"
```

### SSH ile Kullanım

```bash
# Sunucuya bağlan ve script'i çalıştır
ssh user@your-server.com "cd /path/to/backend && node scripts/create-admin.js --email admin@halkompleksi.com --password Admin123! --name 'Admin User'"
```

### Tek Satırda SSH ile (Daha Güvenli)

```bash
# Şifreyi environment variable olarak geçir (güvenli)
ssh user@your-server.com 'cd /path/to/backend && ADMIN_PASS="Admin123!" node scripts/create-admin.js --email admin@halkompleksi.com --password "$ADMIN_PASS" --name "Admin User"'
```

## 📝 Parametreler

| Parametre | Kısa | Zorunlu | Açıklama | Örnek |
|-----------|------|---------|----------|-------|
| Parametre | Kısa | Zorunlu | Açıklama | Örnek |
|-----------|------|---------|----------|-------|
| `--email` | `-e` | ✅ Evet | Admin kullanıcısının e-posta adresi | `admin@halkompleksi.com` |
| `--password` | `-p` | ✅ Evet | Admin kullanıcısının şifresi (min 6 karakter) | `Admin123!` |
| `--name` | `-n` | ✅ Evet | Admin kullanıcısının adı (2-50 karakter) | `"Admin User"` |
| `--phone` | - | ❌ Hayır | Admin kullanıcısının telefon numarası | `"05551234567"` |
| `--force-update` | `-f` | ❌ Hayır | Mevcut admin varsa şifreyi otomatik güncelle (SSH için) | - |

## 💡 Örnekler

### Basit Kullanım

```bash
node scripts/create-admin.js \
  --email admin@halkompleksi.com \
  --password Admin123! \
  --name "Admin User"
```

### Telefon Numarası ile

```bash
node scripts/create-admin.js \
  --email admin@halkompleksi.com \
  --password Admin123! \
  --name "Admin User" \
  --phone "05551234567"
```

### Kısa Parametreler ile

```bash
node scripts/create-admin.js \
  -e admin@halkompleksi.com \
  -p Admin123! \
  -n "Admin User"
```

### SSH ile Production Sunucuda (Non-Interactive)

```bash
# --force-update flag'i ile mevcut admin şifresini güncelle
ssh deploy@your-server.com << 'EOF'
cd /var/www/hal-kompleksi/backend
node scripts/create-admin.js \
  --email admin@halkompleksi.com \
  --password "GüvenliŞifre123!" \
  --name "System Admin" \
  --force-update
EOF
```

### Mevcut Admin Şifresini Güncelleme

```bash
# Interactive mode (lokal)
node scripts/create-admin.js \
  --email admin@halkompleksi.com \
  --password "YeniŞifre123!" \
  --name "Admin User"

# Non-interactive mode (SSH)
node scripts/create-admin.js \
  --email admin@halkompleksi.com \
  --password "YeniŞifre123!" \
  --name "Admin User" \
  --force-update
```

## ⚠️ Önemli Notlar

1. **Güvenlik**: Şifreleri komut satırında geçirirken dikkatli olun. Şifreler shell history'de görünebilir.

2. **Mevcut Kullanıcı**: Eğer aynı e-posta ile bir kullanıcı varsa:
   - Admin ise: Şifre güncelleme seçeneği sunulur
   - Admin değilse: İşlem iptal edilir

3. **Şifre Gereksinimleri**:
   - Minimum 6 karakter
   - Güçlü şifre kullanmanız önerilir

4. **E-posta Formatı**:
   - Geçerli e-posta formatı olmalı
   - Geçici e-posta servisleri kabul edilmez

## 🔍 Script Özellikleri

- ✅ E-posta formatı kontrolü
- ✅ Şifre uzunluk kontrolü
- ✅ Mevcut kullanıcı kontrolü
- ✅ Şifre hash'leme (bcrypt)
- ✅ Güvenli veritabanı bağlantısı
- ✅ Detaylı hata mesajları
- ✅ Kullanıcı bilgileri çıktısı

## 🐛 Sorun Giderme

### MongoDB Bağlantı Hatası

```bash
# MongoDB'nin çalıştığından emin olun
sudo systemctl status mongod

# Veya
mongosh
```

### .env Dosyası Eksik

```bash
# .env dosyasını oluşturun
cp .env.example .env

# MONGODB_URI'yi ayarlayın
echo "MONGODB_URI=mongodb://localhost:27017/hal-kompleksi" >> .env
```

### Permission Denied

```bash
# Script'i çalıştırılabilir yapın
chmod +x scripts/create-admin.js
```

## 📞 Destek

Sorun yaşarsanız, script'in çıktısını kontrol edin ve hata mesajlarını inceleyin.

