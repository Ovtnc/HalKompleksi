# Tailwind CSS Debug Rehberi

## Yapılan Değişiklikler

1. ✅ `postcss.config.js` → CommonJS formatına çevrildi (`module.exports`)
2. ✅ `tailwind.config.js` → CommonJS formatına çevrildi (`module.exports`)
3. ✅ Vite cache temizlendi (`node_modules/.vite` ve `dist` silindi)
4. ✅ `index.css` içinde Tailwind direktifleri mevcut
5. ✅ Test component eklendi (`TailwindTest`)

## Kontrol Adımları

### 1. Dev Server'ı Yeniden Başlatın

```bash
cd web

# Eğer çalışıyorsa durdurun (Ctrl+C)
# Sonra:
npm run dev
```

### 2. Browser Console'da Test

F12 → Console'da şunu çalıştırın:

```javascript
// Test 1: Tailwind test component görünüyor mu?
document.querySelector('.bg-red-500')
// Bir element dönmeli

// Test 2: CSS dosyası yüklendi mi?
Array.from(document.styleSheets).find(sheet => 
  sheet.href && sheet.href.includes('index.css')
)
// Bir StyleSheet dönmeli

// Test 3: Tailwind class'ları var mı?
const testEl = document.createElement('div');
testEl.className = 'bg-gray-50 p-4';
document.body.appendChild(testEl);
getComputedStyle(testEl).backgroundColor
// "rgb(249, 250, 251)" dönmeli
testEl.remove();
```

### 3. Network Sekmesinde Kontrol

F12 → Network → CSS filtresi → `index.css` dosyasına tıklayın

**Beklenen içerik:**
```css
/* Tailwind base styles */
*, ::before, ::after {
  box-sizing: border-box;
  ...
}

.bg-gray-50 {
  background-color: rgb(249, 250, 251);
}

.text-primary {
  color: rgb(44, 189, 105);
}
...
```

**Eğer sadece şunlar görünüyorsa:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Bu durumda PostCSS çalışmıyor demektir!**

### 4. PostCSS Manuel Test

```bash
cd web
npx postcss-cli src/index.css -o test-output.css
cat test-output.css | head -50
```

Eğer çıktıda Tailwind class'ları görünüyorsa PostCSS çalışıyor demektir.

### 5. Vite Log'larını Kontrol

Dev server başlatıldığında terminal'de şu mesajları görmelisiniz:

```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
```

Eğer PostCSS/Tailwind hatası varsa terminal'de görünecektir.

## Alternatif Çözüm: Vite CSS Plugin

Eğer hala çalışmıyorsa, Vite config'e CSS plugin ekleyebiliriz:

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  // ...
})
```

## Son Çare: Inline Styles

Eğer hiçbir şey işe yaramazsa, geçici olarak inline style'lar kullanabiliriz (şu an bazı component'lerde mevcut).



