const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  auth,
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('phone').optional().matches(/^[\+]?[1-9][\d]{0,15}$/).withMessage('Please provide a valid phone number'),
  body('location.city').optional().trim().isLength({ min: 2 }).withMessage('City must be at least 2 characters'),
  body('location.district').optional().trim().isLength({ min: 2 }).withMessage('District must be at least 2 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, phone, location, sellerInfo } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (location) updateData.location = location;
    if (sellerInfo && req.user.userType === 'seller') {
      updateData.sellerInfo = sellerInfo;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile-image
// @desc    Update profile image
// @access  Private
router.put('/profile-image', [
  auth,
  body('profileImage').isURL().withMessage('Please provide a valid image URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { profileImage } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile image updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/sellers
// @desc    Get all sellers
// @access  Public
router.get('/sellers', async (req, res) => {
  try {
    const { page = 1, limit = 10, city, rating } = req.query;
    const query = { userType: 'seller', isActive: true };

    if (city) query['location.city'] = new RegExp(city, 'i');
    if (rating) query['sellerInfo.rating'] = { $gte: parseFloat(rating) };

    const sellers = await User.find(query)
      .select('name email phone location sellerInfo profileImage')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ 'sellerInfo.rating': -1 });

    const total = await User.countDocuments(query);

    res.json({
      sellers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get sellers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/sellers/:id
// @desc    Get seller by ID
// @access  Public
router.get('/sellers/:id', async (req, res) => {
  try {
    const seller = await User.findOne({
      _id: req.params.id,
      userType: 'seller',
      isActive: true
    }).select('name email phone location sellerInfo profileImage');

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    res.json({ seller });
  } catch (error) {
    console.error('Get seller error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false });
    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
