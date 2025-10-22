const express = require('express');
const router = express.Router();
const Location = require('../models/Location');

// @route   GET /api/locations/cities
// @desc    Get all cities from database
// @access  Public
router.get('/cities', async (req, res) => {
  try {
    const cities = await Location.find({ isActive: true })
      .select('name')
      .sort({ name: 1 });
    
    res.json({ cities: cities.map(city => city.name) });
  } catch (error) {
    console.error('Get cities error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/locations/districts/:city
// @desc    Get districts for a specific city
// @access  Public
router.get('/districts/:city', async (req, res) => {
  try {
    const cityName = req.params.city;
    const city = await Location.findOne({ 
      name: cityName, 
      isActive: true 
    }).select('districts');
    
    if (!city) {
      return res.json({ 
        city: cityName,
        districts: [] 
      });
    }
    
    const districts = city.districts
      .filter(district => district.isActive)
      .map(district => district.name);
    
    res.json({ 
      city: cityName,
      districts: districts 
    });
  } catch (error) {
    console.error('Get districts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/locations/cities
// @desc    Create a new city with districts (Admin only)
// @access  Private/Admin
router.post('/cities', async (req, res) => {
  try {
    const { name, districts } = req.body;
    
    // Check if city already exists
    const existingCity = await Location.findOne({ name });
    if (existingCity) {
      return res.status(400).json({ message: 'City already exists' });
    }
    
    const city = new Location({
      name,
      districts: districts.map(district => ({ name: district }))
    });
    
    await city.save();
    
    res.status(201).json({ 
      message: 'City created successfully',
      city: {
        id: city._id,
        name: city.name,
        districts: city.districts.map(d => d.name)
      }
    });
  } catch (error) {
    console.error('Create city error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/locations/cities/:cityId
// @desc    Update city and districts
// @access  Private/Admin
router.put('/cities/:cityId', async (req, res) => {
  try {
    const { name, districts } = req.body;
    const cityId = req.params.cityId;
    
    const city = await Location.findById(cityId);
    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }
    
    city.name = name;
    city.districts = districts.map(district => ({ name: district }));
    
    await city.save();
    
    res.json({ 
      message: 'City updated successfully',
      city: {
        id: city._id,
        name: city.name,
        districts: city.districts.map(d => d.name)
      }
    });
  } catch (error) {
    console.error('Update city error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/locations/cities/:cityId
// @desc    Delete city (soft delete)
// @access  Private/Admin
router.delete('/cities/:cityId', async (req, res) => {
  try {
    const cityId = req.params.cityId;
    
    const city = await Location.findById(cityId);
    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }
    
    city.isActive = false;
    await city.save();
    
    res.json({ message: 'City deleted successfully' });
  } catch (error) {
    console.error('Delete city error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;