const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const MarketReport = require('../models/MarketReport');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/market-reports');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'market-report-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları yüklenebilir!'), false);
    }
  }
});

// @route   GET /api/market-reports
// @desc    Get all active market reports
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { city, limit = 50, page = 1 } = req.query;
    
    const query = { isActive: true };
    if (city) {
      query.city = new RegExp(city, 'i');
    }

    const reports = await MarketReport.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MarketReport.countDocuments(query);

    res.json({
      reports,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get market reports error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/market-reports/:id
// @desc    Get single market report
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const report = await MarketReport.findById(req.params.id)
      .populate('createdBy', 'name phone');

    if (!report) {
      return res.status(404).json({ message: 'Piyasa raporu bulunamadı' });
    }

    res.json(report);
  } catch (error) {
    console.error('Get market report error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/market-reports
// @desc    Create new market report (Admin only)
// @access  Private (Admin)
router.post('/', [auth, adminOnly, upload.single('image')], async (req, res) => {
  try {
    const {
      title,
      city,
      district,
      marketName,
      reportDate,
      description
    } = req.body;

    // Validate required fields
    if (!title || !city) {
      return res.status(400).json({ 
        message: 'Başlık ve şehir gereklidir' 
      });
    }

    // Calculate expiration date (24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create market report
    const marketReport = new MarketReport({
      title,
      city,
      district,
      marketName,
      reportDate: reportDate ? new Date(reportDate) : new Date(),
      description,
      createdBy: req.user.id,
      expiresAt
    });

    // Handle image upload
    if (req.file) {
      marketReport.image = {
        url: `/uploads/market-reports/${req.file.filename}`,
        publicId: req.file.filename
      };
    }

    await marketReport.save();
    await marketReport.populate('createdBy', 'name');

    console.log('📊 Market report created:', {
      id: marketReport._id,
      title: marketReport.title,
      city: marketReport.city,
      expiresAt: marketReport.expiresAt
    });

    res.status(201).json(marketReport);
  } catch (error) {
    console.error('Create market report error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/market-reports/:id
// @desc    Update market report (Admin only)
// @access  Private (Admin)
router.put('/:id', [auth, adminOnly, upload.single('image')], async (req, res) => {
  try {
    const {
      title,
      city,
      district,
      marketName,
      reportDate,
      description,
      isActive
    } = req.body;

    const report = await MarketReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Piyasa raporu bulunamadı' });
    }

    // Update fields
    if (title) report.title = title;
    if (city) report.city = city;
    if (district !== undefined) report.district = district;
    if (marketName !== undefined) report.marketName = marketName;
    if (reportDate) report.reportDate = new Date(reportDate);
    if (description !== undefined) report.description = description;
    if (isActive !== undefined) report.isActive = isActive;

    // Handle new image upload
    if (req.file) {
      // Delete old image if exists
      if (report.image && report.image.publicId) {
        const oldImagePath = path.join(__dirname, '../../uploads/market-reports', report.image.publicId);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      report.image = {
        url: `/uploads/market-reports/${req.file.filename}`,
        publicId: req.file.filename
      };
    }

    await report.save();
    await report.populate('createdBy', 'name');

    console.log('📊 Market report updated:', {
      id: report._id,
      title: report.title,
      city: report.city
    });

    res.json(report);
  } catch (error) {
    console.error('Update market report error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/market-reports/:id
// @desc    Delete market report (Admin only)
// @access  Private (Admin)
router.delete('/:id', [auth, adminOnly], async (req, res) => {
  try {
    const report = await MarketReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Piyasa raporu bulunamadı' });
    }

    // Delete associated image
    if (report.image && report.image.publicId) {
      const imagePath = path.join(__dirname, '../../uploads/market-reports', report.image.publicId);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await MarketReport.findByIdAndDelete(req.params.id);

    console.log('📊 Market report deleted:', {
      id: report._id,
      title: report.title
    });

    res.json({ message: 'Piyasa raporu silindi' });
  } catch (error) {
    console.error('Delete market report error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/market-reports/admin/all
// @desc    Get all market reports for admin (including inactive)
// @access  Private (Admin)
router.get('/admin/all', [auth, adminOnly], async (req, res) => {
  try {
    const { city, isActive, limit = 50, page = 1 } = req.query;
    
    const query = {};
    if (city) {
      query.city = new RegExp(city, 'i');
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const reports = await MarketReport.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MarketReport.countDocuments(query);

    res.json({
      reports,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get admin market reports error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/market-reports/cities/list
// @desc    Get list of cities with market reports
// @access  Public
router.get('/cities/list', async (req, res) => {
  try {
    const cities = await MarketReport.distinct('city', { isActive: true });
    res.json({ cities: cities.sort() });
  } catch (error) {
    console.error('Get cities error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
