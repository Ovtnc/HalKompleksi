# Tailwind CSS Kurulum Kontrolü

## Kurulum Tamamlandı ✅

Tailwind CSS başarıyla kuruldu. Eğer stiller görünmüyorsa:

## 1. Dev Server'ı Yeniden Başlatın

```bash
cd web

# Eğer çalışıyorsa durdurun (Ctrl+C)
# Sonra tekrar başlatın:
npm run dev
```

## 2. Browser Cache'i Temizleyin

- Hard refresh: `Cmd+Shift+R` (Mac) veya `Ctrl+Shift+R` (Windows/Linux)
- Veya Developer Tools'u açıp Network sekmesinde "Disable cache" işaretleyin

## 3. Tailwind CSS Kontrolü

Browser console'da (F12) şunu kontrol edin:

```javascript
// Console'da çalıştırın:
getComputedStyle(document.body).backgroundColor
// "rgb(249, 250, 251)" gibi bir değer dönmeli (gray-50)
```

## 4. Dosya Kontrolü

Şu dosyaların var olduğundan emin olun:

- ✅ `tailwind.config.js` - Var
- ✅ `postcss.config.js` - Var
- ✅ `src/index.css` - Tailwind direktifleri içeriyor
- ✅ `package.json` - Tailwind CSS bağımlılıkları var

## 5. Vite Dev Server Log'ları

Dev server başlatıldığında şu mesajları görmelisiniz:

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

## Sorun Devam Ederse

1. **Node modules'ü temizleyin:**
```bash
cd web
rm -rf node_modules package-lock.json
npm install
```

2. **Vite cache'ini temizleyin:**
```bash
rm -rf node_modules/.vite
npm run dev
```

3. **Tailwind CSS'i manuel test edin:**

`src/index.css` dosyasına geçici olarak şunu ekleyin:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Test */
.test-tailwind {
  @apply bg-red-500 text-white p-4;
}
```

Sonra bir component'te kullanın ve görünüp görünmediğini kontrol edin.



