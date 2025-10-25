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
  body('phone').optional().trim(),
  body('location.city').optional().trim(),
  body('location.district').optional().trim(),
  body('location.address').optional().trim(),
  body('sellerInfo.companyName').optional().trim(),
  body('sellerInfo.taxNumber').optional().trim(),
  body('sellerInfo.address').optional().trim(),
  body('activeRole').optional().isIn(['buyer', 'seller']).withMessage('Active role must be buyer or seller')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    console.log('Profile update request:', req.body);
    const { name, phone, location, sellerInfo, activeRole } = req.body;
    
    console.log('🔍 activeRole from request:', activeRole);
    
    // Fetch current user to merge updates
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updateData = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (activeRole) {
      updateData.activeRole = activeRole;
      console.log('🔍 Setting activeRole in updateData:', activeRole);
    }
    
    // Merge location data
    if (location) {
      updateData.location = {
        city: location.city || currentUser.location?.city,
        district: location.district || currentUser.location?.district,
        address: location.address || currentUser.location?.address,
        coordinates: location.coordinates || currentUser.location?.coordinates
      };
    }
    
    // Merge seller info data
    if (sellerInfo && currentUser.userType === 'seller') {
      updateData.sellerInfo = {
        businessName: sellerInfo.businessName || currentUser.sellerInfo?.businessName,
        businessType: sellerInfo.businessType || currentUser.sellerInfo?.businessType,
        companyName: sellerInfo.companyName || currentUser.sellerInfo?.companyName,
        taxNumber: sellerInfo.taxNumber || currentUser.sellerInfo?.taxNumber,
        address: sellerInfo.address || currentUser.sellerInfo?.address,
        description: sellerInfo.description || currentUser.sellerInfo?.description,
        rating: currentUser.sellerInfo?.rating || 0,
        totalRatings: currentUser.sellerInfo?.totalRatings || 0
      };
    }

    console.log('🔍 Final updateData:', updateData);
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    console.log('✅ User updated:', {
      id: user._id,
      activeRole: user.activeRole,
      userType: user.userType
    });

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
  body('profileImage').notEmpty().withMessage('Profile image URL is required')
], async (req, res) => {
  try {
    console.log('Profile image update request:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { profileImage } = req.body;
    console.log('Updating profile image for user:', req.user._id, 'with URL:', profileImage);

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

// @route   POST /api/users/switch-role
// @desc    Switch user active role
// @access  Private
router.post('/switch-role', [
  auth,
  body('role').isIn(['buyer', 'seller']).withMessage('Role must be buyer or seller')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { role } = req.body;

    // Check if user has this role
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add role to userRoles if not already present
    if (!user.userRoles.includes(role)) {
      user.userRoles.push(role);
    }

    // Set active role
    user.activeRole = role;
    await user.save();

    const updatedUser = await User.findById(req.user._id).select('-password');

    res.json({
      message: 'Role switched successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        userType: updatedUser.userType,
        userRoles: updatedUser.userRoles,
        activeRole: updatedUser.activeRole,
        profileImage: updatedUser.profileImage,
        location: updatedUser.location,
        sellerInfo: updatedUser.sellerInfo
      }
    });
  } catch (error) {
    console.error('Switch role error:', error);
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
