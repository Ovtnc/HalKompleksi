const express = require('express');
const upload = require('../middleware/upload');
const { auth } = require('../middleware/auth');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Profil resimleri için ayrı storage
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'public/uploads/profiles';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const profileUpload = multer({
  storage: profileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları yüklenebilir'), false);
    }
  }
});

const router = express.Router();

// @route   POST /api/upload/profile-image
// @desc    Upload profile image
// @access  Private
router.post('/profile-image', auth, profileUpload.single('profileImage'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'Profil resmi dosyası bulunamadı'
      });
    }

    // Dosya URL'sini oluştur
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/profiles/${req.file.filename}`;

    res.json({
      message: 'Profil resmi başarıyla yüklendi',
      url: imageUrl,
      imageUrl: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({
      message: 'Profil resmi yüklenirken hata oluştu',
      error: error.message
    });
  }
});

// @route   POST /api/upload/image
// @desc    Upload single image
// @access  Private
router.post('/image', auth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'Resim dosyası bulunamadı'
      });
    }

    // Dosya URL'sini oluştur
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

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
router.post('/images', auth, upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: 'Resim dosyaları bulunamadı'
      });
    }

    // Dosya URL'lerini oluştur
    const imageUrls = req.files.map(file => ({
      url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`,
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
router.post('/media', auth, upload.single('media'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'Medya dosyası bulunamadı'
      });
    }

    // Dosya tipini belirle
    const fileType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
    
    // Dosya URL'sini oluştur
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    res.json({
      message: 'Medya başarıyla yüklendi',
      url: fileUrl,
      filename: req.file.filename,
      type: fileType,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      message: 'Medya yüklenirken hata oluştu',
      error: error.message
    });
  }
});

module.exports = router;
