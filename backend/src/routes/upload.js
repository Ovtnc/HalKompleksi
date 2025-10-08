const express = require('express');
const upload = require('../middleware/upload');
const { auth } = require('../middleware/auth');
const path = require('path');

const router = express.Router();

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
      isPrimary: false
    }));

    // İlk resmi primary yap
    if (imageUrls.length > 0) {
      imageUrls[0].isPrimary = true;
    }

    res.json({
      message: 'Resimler başarıyla yüklendi',
      images: imageUrls
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      message: 'Resimler yüklenirken hata oluştu',
      error: error.message
    });
  }
});

module.exports = router;
