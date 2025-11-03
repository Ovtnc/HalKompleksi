const express = require('express');
const { productUpload, profileUpload, marketReportUpload } = require('../middleware/upload');
const { auth } = require('../middleware/auth');
const path = require('path');

const router = express.Router();

// @route   POST /api/upload/profile-image
// @desc    Upload profile image
// @access  Private
router.post('/profile-image', auth, (req, res, next) => {
  profileUpload.single('profileImage')(req, res, (err) => {
    if (err) {
      console.error('❌ Multer error:', err);
      return res.status(400).json({
        message: 'Dosya yükleme hatası: ' + err.message
      });
    }
    next();
  });
}, (req, res) => {
  try {
    console.log('📤 Profile image upload request received');
    console.log('📤 User ID:', req.user?._id);
    console.log('📤 Request file:', req.file ? 'File received' : 'No file');
    console.log('📤 Request body keys:', Object.keys(req.body || {}));
    console.log('📤 Request headers:', {
      'content-type': req.headers['content-type'],
      'authorization': req.headers['authorization'] ? 'Present' : 'Missing'
    });
    
    if (!req.file) {
      console.error('❌ No file received in upload request');
      console.error('❌ Multer error:', req.file);
      console.error('❌ Request body:', req.body);
      return res.status(400).json({
        message: 'Profil resmi dosyası bulunamadı'
      });
    }

    console.log('✅ File received:', {
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Dosya URL'sini oluştur
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/profiles/${req.file.filename}`;

    console.log('✅ Profile image uploaded successfully:', imageUrl);
    console.log('✅ URL components:', {
      protocol: req.protocol,
      host: req.get('host'),
      filename: req.file.filename,
      fullUrl: imageUrl
    });

    res.json({
      message: 'Profil resmi başarıyla yüklendi',
      url: imageUrl,
      imageUrl: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('❌ Profile image upload error:', error);
    res.status(500).json({
      message: 'Profil resmi yüklenirken hata oluştu',
      error: error.message
    });
  }
});

// @route   POST /api/upload/image
// @desc    Upload single image
// @access  Private
router.post('/image', auth, productUpload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'Resim dosyası bulunamadı'
      });
    }

    // Dosya URL'sini oluştur
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/products/${req.file.filename}`;

    res.json({
      message: 'Resim başarıyla yüklendi',
      url: imageUrl,
      imageUrl: imageUrl, // Backward compatibility
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      message: 'Resim yüklenirken hata oluştu',
      error: error.message
    });
  }
});

// @route   POST /api/upload/images
// @desc    Upload multiple images
// @access  Private
router.post('/images', auth, productUpload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: 'Resim dosyaları bulunamadı'
      });
    }

    // Dosya URL'lerini oluştur
    const imageUrls = req.files.map(file => ({
      url: `${req.protocol}://${req.get('host')}/uploads/products/${file.filename}`,
      filename: file.filename,
      type: file.mimetype.startsWith('video/') ? 'video' : 'image',
      isPrimary: false
    }));

    // İlk resmi primary yap
    if (imageUrls.length > 0) {
      imageUrls[0].isPrimary = true;
    }

    res.json({
      message: 'Dosyalar başarıyla yüklendi',
      images: imageUrls
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      message: 'Dosyalar yüklenirken hata oluştu',
      error: error.message
    });
  }
});

// @route   POST /api/upload/media
// @desc    Upload single media file (image or video)
// @access  Private
router.post('/media', auth, (req, res, next) => {
  productUpload.single('media')(req, res, (err) => {
    if (err) {
      console.error('❌ Media upload error:', err);
      
      // Multer hataları için özel mesajlar
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          message: 'Dosya boyutu çok büyük. Maksimum 50MB yükleyebilirsiniz.',
          error: 'FILE_TOO_LARGE'
        });
      }
      
      if (err.message.includes('Sadece')) {
        return res.status(400).json({
          message: err.message,
          error: 'INVALID_FILE_TYPE'
        });
      }
      
      return res.status(500).json({
        message: 'Video yüklenirken bir hata oluştu: ' + err.message,
        error: err.code || 'UPLOAD_ERROR'
      });
    }
    next();
  });
}, (req, res) => {
  try {
    if (!req.file) {
      console.error('❌ No media file received');
      return res.status(400).json({
        message: 'Medya dosyası bulunamadı'
      });
    }

    // Dosya tipini belirle
    const fileType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
    
    console.log(`✅ ${fileType.toUpperCase()} uploaded:`, {
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
    
    // Dosya URL'sini oluştur
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/products/${req.file.filename}`;

    res.json({
      message: fileType === 'video' ? 'Video başarıyla yüklendi' : 'Görsel başarıyla yüklendi',
      url: fileUrl,
      filename: req.file.filename,
      type: fileType,
      size: req.file.size
    });
  } catch (error) {
    console.error('❌ Media upload processing error:', error);
    res.status(500).json({
      message: 'Medya yüklenirken hata oluştu',
      error: error.message
    });
  }
});

module.exports = router;
