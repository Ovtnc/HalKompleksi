# ⚡ CLOUDFLARE HIZLI BAŞLANGIÇ REHBERİ

## 🎯 5 Dakikada Başla

### ✅ ADIM 1: Cloudflare'e Kayıt Ol (2 dk)
1. https://cloudflare.com → Sign Up
2. Domain ekle: `halkompleksi.com`
3. **Free Plan** seç

### ✅ ADIM 2: DNS Kayıtları (2 dk)

**A Record (Ana domain):**
```
Type: A
Name: @
IPv4: 109.199.114.223
Proxy: ✅ Proxied (turuncu bulut)
```

**A Record (www):**
```
Type: A
Name: www
IPv4: 109.199.114.223
Proxy: ✅ Proxied
```

### ✅ ADIM 3: Nameserver'ları Al
Cloudflare'den 2 nameserver alacaksın:
```
chad.ns.cloudflare.com
lola.ns.cloudflare.com
```
(Seninkiler farklı olabilir!)

### ✅ ADIM 4: Natro'da Nameserver Değiştir (5 dk)
1. https://www.natro.com → Giriş yap
2. Domain yönetimi → halkompleksi.com
3. Nameserver ayarları:
   - **ESKİ:** ns1.natro.com, ns2.natro.com
   - **YENİ:** Cloudflare'den aldığın nameserver'lar
4. Kaydet

### ✅ ADIM 5: SSL Aktif Et (1 dk)
Cloudflare'de:
1. **SSL/TLS** → **Flexible** seç
2. **Edge Certificates** → **Always Use HTTPS** → ON

### ✅ ADIM 6: Bekle (1-48 saat)
DNS yayılması bekleniyor...

**Kontrol:**
```bash
nslookup halkompleksi.com
# Sonuç: 109.199.114.223 görmeli
```

---

## 🔧 Server Tarafı (Nginx Config)

### Contabo'da:
```bash
ssh root@109.199.114.223
sudo nano /etc/nginx/sites-available/hal-kompleksi
```

**Basit Config:**
```nginx
server {
    listen 80;
    server_name halkompleksi.com www.halkompleksi.com;
    
    client_max_body_size 50M;
    
    location /api {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /uploads {
        alias /root/hal-kompleksi/backend/uploads;
        expires 30d;
    }
    
    location / {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
    }
}
```

**Aktif et:**
```bash
sudo ln -s /etc/nginx/sites-available/hal-kompleksi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 📱 URL'leri Güncelle

### Frontend (env.ts):
```typescript
const PROD_CONFIG = {
  API_URL: 'https://halkompleksi.com/api',
  WEB_URL: 'https://halkompleksi.com',
  DOMAIN: 'halkompleksi.com',
};
```

### Backend (urls.js):
```javascript
const PROD_CONFIG = {
  API_URL: 'https://halkompleksi.com/api',
  WEB_URL: 'https://halkompleksi.com',
  DOMAIN: 'halkompleksi.com',
  PORT: 5001,
};
```

**Backend'i restart et:**
```bash
pm2 restart hal-kompleksi
```

---

## ✅ Test Et

```bash
# Domain çalışıyor mu?
curl -I https://halkompleksi.com

# API çalışıyor mu?
curl https://halkompleksi.com/api/health

# SSL puanı (tarayıcıda aç)
https://www.ssllabs.com/ssltest/analyze.html?d=halkompleksi.com
```

---

## 🚨 Sık Karşılaşılan Sorunlar

### "DNS_PROBE_FINISHED_NXDOMAIN"
**Çözüm:** DNS henüz yayılmadı, bekle (1-48 saat)

### "522 Connection Timed Out"
**Çözüm:**
```bash
pm2 status
sudo systemctl status nginx
```

### API çalışmıyor
**Çözüm:**
```bash
pm2 logs hal-kompleksi
sudo tail -f /var/log/nginx/error.log
```

---

## 📋 Kısa Kontrol Listesi

- [ ] Cloudflare hesabı oluşturuldu
- [ ] DNS kayıtları eklendi (A record)
- [ ] Nameserver'lar Natro'da değiştirildi
- [ ] DNS propagation tamamlandı
- [ ] SSL Flexible mode aktif
- [ ] Nginx yapılandırıldı
- [ ] URL'ler güncellendi
- [ ] https://halkompleksi.com çalışıyor
- [ ] API erişimi test edildi
- [ ] Mobil uygulama test edildi

---

## 📚 Detaylı Bilgi

Tüm detaylar için: **`CLOUDFLARE_NATRO_CONTABO_SETUP.md`**

---

## ⏱️ Tahmini Süre

- ⚡ Kurulum: **15 dakika**
- ⏳ DNS Propagation: **1-48 saat** (genelde 1-2 saat)
- 🎉 Toplam: **2-48 saat**

---

## 🎉 Başarılı Olduğunda

✅ https://halkompleksi.com çalışacak
✅ Ücretsiz SSL sertifikanız olacak
✅ Yeşil kilit simgesi görünecek 🔒
✅ Mobil uygulama HTTPS ile çalışacak
✅ DDoS koruması aktif olacak

**BAŞARILAR!** 🚀

