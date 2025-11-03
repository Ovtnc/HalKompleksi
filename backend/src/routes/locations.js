const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

// District Schema
const districtSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// City Schema
const citySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  districts: [districtSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
citySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Location = mongoose.model('Location', citySchema);

// @route   GET /api/locations/cities
// @desc    Get all Turkish cities
// @access  Public
router.get('/cities', async (req, res) => {
  try {
    const cities = await Location.find({ isActive: true })
      .select('name code')
      .sort({ name: 1 });
    
    res.json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// @route   GET /api/locations/districts
// @desc    Get districts for a specific city by name
// @access  Public
router.get('/districts', async (req, res) => {
  try {
    const { city } = req.query;
    console.log('🏙️ Districts request for city:', city);
    
    if (!city) {
      return res.status(400).json({ message: 'City parameter is required' });
    }
    
    const cityData = await Location.findOne({ 
      name: { $regex: new RegExp(city, 'i') }, 
      isActive: true 
    }).select('districts name');
    
    console.log('🏙️ Found city:', cityData ? cityData.name : 'Not found');
    
    if (!cityData) {
      console.log('❌ City not found for name:', city);
      return res.status(404).json({ message: 'City not found' });
    }
    
    const districts = cityData.districts ? cityData.districts.filter(district => district.isActive) : [];
    console.log('🏙️ Districts found:', districts.length);
    
    res.json(districts);
  } catch (error) {
    console.error('❌ Error fetching districts:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// @route   GET /api/locations/cities/:cityId/districts
// @desc    Get districts for a specific city
// @access  Public
router.get('/cities/:cityId/districts', async (req, res) => {
  try {
    console.log('🏙️ Districts request for city ID:', req.params.cityId);
    
    const city = await Location.findById(req.params.cityId)
      .select('districts name');
    
    console.log('🏙️ Found city:', city ? city.name : 'Not found');
    
    if (!city) {
      console.log('❌ City not found for ID:', req.params.cityId);
      return res.status(404).json({ message: 'City not found' });
    }
    
    const districts = city.districts ? city.districts.filter(district => district.isActive) : [];
    console.log('🏙️ Districts found:', districts.length);
    console.log('🏙️ City districts data:', city.districts);
    console.log('🏙️ Filtered districts:', districts);
    
    res.json({ districts, total: districts.length });
  } catch (error) {
    console.error('❌ Error fetching districts:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// @route   GET /api/locations/test-api
// @desc    Test Turkiye API response
// @access  Public
router.get('/test-api', async (req, res) => {
  try {
    const provincesResponse = await fetch('https://api.turkiyeapi.dev/v1/provinces');
    const provincesData = await provincesResponse.json();
    
    const trabzon = provincesData.data.find(p => p.name === 'Trabzon');
    
    res.json({
      trabzon: {
        name: trabzon.name,
        districtsCount: trabzon.districts?.length || 0,
        firstThreeDistricts: trabzon.districts?.slice(0, 3).map(d => d.name) || []
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
