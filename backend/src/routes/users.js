const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const { WEB_URL } = require('../config/urls');

const router = express.Router();

// Helper function to fix profile image URLs
const fixProfileImageUrl = (user) => {
  if (user && user.profileImage) {
    // If it's a file:// URL, replace with placeholder
    if (user.profileImage.startsWith('file://')) {
      user.profileImage = 'https://via.placeholder.com/100x100?text=Profile';
    }
    // If it's a relative path, make it absolute
    else if (user.profileImage.startsWith('/uploads/')) {
      user.profileImage = `${WEB_URL}${user.profileImage}`;
    }
  }
  return user;
};

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const fixedUser = fixProfileImageUrl(user);
    res.json({ user: fixedUser });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  auth,
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('İsim 2-50 karakter arasında olmalıdır'),
  body('phone').optional().trim(),
  body('location.city').optional().trim(),
  body('location.district').optional().trim(),
  body('location.address').optional().trim(),
  body('sellerInfo.companyName').optional().trim(),
  body('sellerInfo.taxNumber').optional().trim(),
  body('sellerInfo.address').optional().trim(),
  body('activeRole').optional().isIn(['buyer', 'seller']).withMessage('Aktif rol alıcı veya satıcı olmalıdır')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({
        message: 'Doğrulama başarısız',
        errors: errors.array()
      });
    }

    console.log('Profile update request:', req.body);
    const { name, phone, location, sellerInfo, activeRole } = req.body;
    
    console.log('🔍 activeRole from request:', activeRole);
    console.log('🔍 name from request:', name);
    console.log('🔍 phone from request:', phone);
    console.log('🔍 location from request:', location);
    
    // Fetch current user to merge updates
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
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

    console.log('🔍 User after update:', {
      id: user._id,
      name: user.name,
      phone: user.phone,
      location: user.location,
      activeRole: user.activeRole,
      userType: user.userType
    });

    // Note: Product seller information is populated from User model via reference
    // Products will automatically show updated seller info when fetched with populate
    // This is the correct approach - no need to duplicate data
    
    const fixedUser = fixProfileImageUrl(user);

    console.log('✅ User updated and fixed:', {
      id: fixedUser._id,
      name: fixedUser.name,
      phone: fixedUser.phone,
      location: fixedUser.location,
      activeRole: fixedUser.activeRole,
      userType: fixedUser.userType
    });

    res.json({
        message: 'Profil başarıyla güncellendi',
      user: fixedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   PUT /api/users/profile-image
// @desc    Update profile image
// @access  Private
router.put('/profile-image', [
  auth,
  body('profileImage').notEmpty().withMessage('Profil resmi URL\'si gereklidir')
], async (req, res) => {
  try {
    console.log('📸 Profile image update request:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        message: 'Doğrulama başarısız',
        errors: errors.array()
      });
    }

    const { profileImage } = req.body;
    console.log('📸 Updating profile image for user:', req.user._id, 'with URL:', profileImage);
    console.log('📸 URL length:', profileImage?.length || 0);
    console.log('📸 URL preview:', profileImage?.substring(0, 100));

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage },
      { new: true }
    ).select('-password');

    console.log('✅ User after profile image update:', {
      id: user._id,
      name: user.name,
      profileImage: user.profileImage
    });
    
    // Verify the update was saved to database
    const verifyUser = await User.findById(req.user._id).select('profileImage');
    console.log('✅ Verified profileImage from database:', verifyUser.profileImage);

    const fixedUser = fixProfileImageUrl(user);

    console.log('✅ Profile image updated and fixed:', {
      id: fixedUser._id,
      name: fixedUser.name,
      profileImage: fixedUser.profileImage
    });

    res.json({
        message: 'Profil resmi başarıyla güncellendi',
      user: fixedUser
    });
  } catch (error) {
    console.error('Update profile image error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
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
    res.status(500).json({ message: 'Sunucu hatası' });
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
    res.status(500).json({ message: 'Sunucu hatası' });
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
        message: 'Doğrulama başarısız',
        errors: errors.array()
      });
    }

    const { role } = req.body;

    // Check if user has this role
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
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
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   DELETE /api/users/account
// @desc    Delete user account permanently (Apple App Store requirement)
// @access  Private
router.delete('/account', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get all models
    const Product = require('../models/Product');
    const Order = require('../models/Order');
    
    // Delete user's products
    await Product.deleteMany({ seller: userId });
    
    // Delete user's orders (both as buyer and seller)
    await Order.deleteMany({ $or: [{ buyer: userId }, { seller: userId }] });
    
    // Delete user account permanently
    await User.findByIdAndDelete(userId);
    
    console.log(`✅ User account deleted: ${userId}`);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
