const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// @route   GET /api/categories
// @desc    Get all active categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    console.log('📂 Categories API called');
    const categories = await Category.find({ isActive: true })
      .select('name slug icon color description sortOrder')
      .sort({ sortOrder: 1, name: 1 });
    
    console.log('📊 Found categories:', categories.length);
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;