const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');

// Expo URL'ini oluştur
const expoUrl = 'exp://192.168.0.27:8081';

// QR kod oluştur
async function generateQR() {
  try {
    console.log('🔗 Expo URL:', expoUrl);
    
    // QR kod oluştur
    const qrCodeDataURL = await qrcode.toDataURL(expoUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    // Base64'ten buffer'a çevir
    const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Masaüstüne kaydet
    const desktopPath = path.join(require('os').homedir(), 'Desktop');
    const qrPath = path.join(desktopPath, 'hal-kompleksi-qr.png');
    
    fs.writeFileSync(qrPath, buffer);
    
    console.log('✅ QR kod oluşturuldu!');
    console.log('📁 Konum:', qrPath);
    console.log('🔗 URL:', expoUrl);
    
  } catch (error) {
    console.error('❌ QR kod oluşturma hatası:', error);
  }
}

generateQR();

