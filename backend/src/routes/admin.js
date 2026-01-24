const express = require('express');
const { auth, adminOnly } = require('../middleware/auth');
const Product = require('../models/Product');
const User = require('../models/User');
const MarketReport = require('../models/MarketReport');
const fs = require('fs');
const path = require('path');
const { notifyProductApproved, notifyProductRejected, notifyProductFeatured, notifyMatchingBuyers } = require('../utils/notifications');
const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private (Admin only)
router.get('/dashboard', [auth, adminOnly], async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const pendingProducts = await Product.countDocuments({ 
      isApproved: false, 
      isRejected: { $ne: true } 
    });
    const approvedProducts = await Product.countDocuments({ isApproved: true });
    const activeUsers = await User.countDocuments({ isActive: true });
    const blockedUsers = await User.countDocuments({ isActive: false });
    const featuredProducts = await Product.countDocuments({ isFeatured: true });
    const totalMarketReports = await MarketReport.countDocuments();
    
    // Calculate total views and favorites
    const allProducts = await Product.find().select('views favorites');
    const totalViews = allProducts.reduce((sum, product) => sum + (product.views || 0), 0);
    const totalFavorites = allProducts.reduce((sum, product) => sum + (product.favorites?.length || 0), 0);

    // Recent activity
    const recentProducts = await Product.find()
      .populate('seller', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentUsers = await User.find()
      .select('name email userType createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalUsers,
        totalProducts,
        pendingProducts,
        approvedProducts,
        activeUsers,
        blockedUsers,
        featuredProducts,
        totalMarketReports,
        totalViews,
        totalFavorites
      },
      recentProducts,
      recentUsers
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   GET /api/admin/products/pending
// @desc    Get pending products for approval
// @access  Private (Admin only)
router.get('/products/pending', [auth, adminOnly], async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const products = await Product.find({ 
      isApproved: false, 
      isRejected: { $ne: true } 
    })
      .populate('seller', 'name email phone userType')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments({ 
      isApproved: false, 
      isRejected: { $ne: true } 
    });

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get pending products error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   GET /api/admin/products/rejected
// @desc    Get rejected products
// @access  Private (Admin only)
router.get('/products/rejected', [auth, adminOnly], async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const products = await Product.find({ isRejected: true })
      .populate('seller', 'name email phone userType')
      .populate('rejectedBy', 'name email')
      .sort({ rejectedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments({ isRejected: true });

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get rejected products error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   PUT /api/admin/products/:id/approve
// @desc    Approve a product
// @access  Private (Admin only)
router.put('/products/:id/approve', [auth, adminOnly], async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }

    product.isApproved = true;
    product.approvedAt = new Date();
    product.approvedBy = req.user._id;
    
    await product.save();

    const populatedProduct = await Product.findById(product._id)
      .populate('seller', 'name email phone userType')
      .populate('approvedBy', 'name email');

    // Notify seller about approval
    await notifyProductApproved(product.seller, product._id, product.title);

    // Notify buyers with matching product requests
    await notifyMatchingBuyers(populatedProduct);

    res.json({
      message: 'Product approved successfully',
      product: populatedProduct
    });
  } catch (error) {
    console.error('Approve product error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   PUT /api/admin/products/:id/reject
// @desc    Reject a product (remove approval status)
// @access  Private (Admin only)
router.put('/products/:id/reject', [auth, adminOnly], async (req, res) => {
  try {
    console.log('🚫 Admin: Rejecting product:', req.params.id);
    console.log('🚫 Admin: Reject reason:', req.body.reason);
    
    const { reason } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      console.log('❌ Admin: Product not found:', req.params.id);
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }

    console.log('🚫 Admin: Found product:', product.title);
    console.log('🚫 Admin: Current approval status:', product.isApproved);

    // Mark as rejected
    product.isApproved = false;
    product.isRejected = true;
    product.isFeatured = false; // Onaysız ürün öne çıkamaz
    product.rejectionReason = reason || 'Admin tarafından onay kaldırıldı';
    product.rejectedAt = new Date();
    product.rejectedBy = req.user._id || req.user.id;
    
    console.log('🚫 Admin: Updating product with rejection...');
    console.log('🚫 Admin: Product before update:', {
      isApproved: product.isApproved,
      isRejected: product.isRejected,
      rejectionReason: product.rejectionReason,
      rejectedAt: product.rejectedAt,
      rejectedBy: product.rejectedBy
    });
    
    // Use updateOne instead of save() to ensure the update is applied
    const updateResult = await Product.updateOne(
      { _id: req.params.id },
      {
        $set: {
          isApproved: false,
          isRejected: true,
          isFeatured: false,
          rejectionReason: reason || 'Admin tarafından onay kaldırıldı',
          rejectedAt: new Date(),
          rejectedBy: req.user._id || req.user.id
        }
      }
    );
    
    console.log('✅ Admin: Product updated successfully:', updateResult);
    
    // Fetch the updated product to verify
    const updatedProduct = await Product.findById(req.params.id);
    console.log('✅ Admin: Updated product:', {
      isApproved: updatedProduct.isApproved,
      isRejected: updatedProduct.isRejected,
      rejectionReason: updatedProduct.rejectionReason,
      rejectedAt: updatedProduct.rejectedAt,
      rejectedBy: updatedProduct.rejectedBy
    });

    // Notify seller about rejection
    console.log('🔔 Admin: Sending rejection notification...');
    await notifyProductRejected(product.seller, product._id, product.title, reason);
    console.log('✅ Admin: Rejection notification sent');

    res.json({
      message: 'Product approval removed',
      reason: reason || 'No reason provided'
    });
  } catch (error) {
    console.error('❌ Admin: Reject product error:', error);
    console.error('❌ Admin: Error details:', error.message);
    console.error('❌ Admin: Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/users', [auth, adminOnly], async (req, res) => {
  try {
    const { page = 1, limit = 10, userType, isActive } = req.query;
    
    const query = {};
    if (userType) query.userType = userType;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   PUT /api/admin/users/:id/block
// @desc    Block/unblock a user
// @access  Private (Admin only)
router.put('/users/:id/block', [auth, adminOnly], async (req, res) => {
  try {
    console.log('🔒 Admin: Block user request received');
    console.log('🔒 Admin: Request params:', req.params);
    console.log('🔒 Admin: Request body:', req.body);
    console.log('🔒 Admin: Current user:', req.user ? { id: req.user._id, email: req.user.email } : 'NOT FOUND');
    
    const { isActive } = req.body;
    
    if (isActive === undefined || isActive === null) {
      console.error('❌ Admin: isActive is missing in request body');
      return res.status(400).json({ message: 'isActive parametresi gereklidir' });
    }
    
    // Ensure isActive is a boolean
    const isActiveBoolean = isActive === true || isActive === 'true' || isActive === 1 || isActive === '1';
    
    console.log('🔒 Admin: Blocking user:', {
      userId: req.params.id,
      isActive: isActive,
      isActiveType: typeof isActive,
      isActiveBoolean: isActiveBoolean
    });
    
    // Validate user ID format
    if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      console.error('❌ Admin: Invalid user ID format:', req.params.id);
      return res.status(400).json({ message: 'Geçersiz kullanıcı ID formatı' });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      console.error('❌ Admin: User not found:', req.params.id);
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    console.log('🔒 Admin: Found user:', {
      id: user._id,
      email: user.email,
      currentIsActive: user.isActive
    });

    // Prevent blocking yourself
    const currentUserId = req.user._id ? req.user._id.toString() : (req.user.id ? req.user.id.toString() : null);
    if (!currentUserId) {
      console.error('❌ Admin: Cannot determine current user ID');
      return res.status(500).json({ message: 'Kullanıcı kimliği belirlenemedi' });
    }
    
    if (user._id.toString() === currentUserId) {
      console.error('❌ Admin: User trying to block themselves');
      return res.status(400).json({ message: 'Kendi hesabınızı engelleyemezsiniz' });
    }

    console.log('🔒 Admin: Updating user isActive field...');
    
    // Use updateOne to avoid triggering pre-save hooks that might cause issues
    const updateResult = await User.updateOne(
      { _id: req.params.id },
      { $set: { isActive: isActiveBoolean } }
    );

    console.log('🔒 Admin: Update result:', {
      matchedCount: updateResult.matchedCount,
      modifiedCount: updateResult.modifiedCount,
      acknowledged: updateResult.acknowledged
    });

    if (updateResult.matchedCount === 0) {
      console.error('❌ Admin: User not found during update');
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    if (updateResult.modifiedCount === 0) {
      console.log('⚠️ Admin: User status not changed (already set to this value)');
    }

    // Fetch updated user - use lean() to avoid triggering validation
    console.log('🔒 Admin: Fetching updated user...');
    const updatedUser = await User.findById(req.params.id).select('-password').lean();

    if (!updatedUser) {
      console.error('❌ Admin: Updated user not found after update');
      return res.status(500).json({ message: 'Kullanıcı güncellendikten sonra bulunamadı' });
    }

    console.log('✅ Admin: User blocked/unblocked successfully:', {
      userId: req.params.id,
      oldIsActive: user.isActive,
      newIsActive: updatedUser.isActive
    });

    res.json({
      message: `Kullanıcı ${isActiveBoolean ? 'aktifleştirildi' : 'engellendi'}`,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        userType: updatedUser.userType,
        isActive: updatedUser.isActive
      }
    });
  } catch (error) {
    console.error('❌ Admin: Block user error:', error);
    console.error('❌ Admin: Error name:', error.name);
    console.error('❌ Admin: Error message:', error.message);
    console.error('❌ Admin: Error stack:', error.stack);
    
    // Check for specific error types
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Geçersiz kullanıcı ID formatı',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Doğrulama hatası',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    res.status(500).json({ 
      message: 'Sunucu hatası',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Private (Admin only)
router.delete('/users/:id', [auth, adminOnly], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Delete user's products first
    await Product.deleteMany({ seller: req.params.id });
    
    // Delete the user
    await User.findByIdAndDelete(req.params.id);

    res.json({
      message: 'User and associated products deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   GET /api/admin/products
// @desc    Get all products with admin controls
// @access  Private (Admin only)
router.get('/products', [auth, adminOnly], async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    // Base query - only show approved products by default
    let query = {
      isApproved: true,
      isRejected: { $ne: true }
    };
    
    // Override for pending products
    if (status === 'pending') {
      query = {
        isApproved: false,
        isRejected: { $ne: true }
      };
    }
    
    // Override for all products (admin can see all)
    if (status === 'all') {
      query = {}; // Reset query to show all products
    }

    // Add search functionality
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      if (Object.keys(query).length === 0) {
        // If query is empty, create new query with search
        query = {
          $or: [
            { title: searchRegex },
            { description: searchRegex },
            { category: searchRegex },
            { 'location.city': searchRegex }
          ]
        };
      } else {
        // Add search to existing query
        query.$and = query.$and || [];
        query.$and.push({
          $or: [
            { title: searchRegex },
            { description: searchRegex },
            { category: searchRegex },
            { 'location.city': searchRegex }
          ]
        });
      }
    }

    console.log('🔍 Admin: Products query:', { status, search, query });

    const products = await Product.find(query)
      .populate('seller', 'name email phone userType')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    console.log('🔍 Admin: Found products:', products.length, 'Total:', total);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get admin products error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   DELETE /api/admin/products/:id
// @desc    Delete product and its images (Admin only)
// @access  Private (Admin only)
router.delete('/products/:id', [auth, adminOnly], async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }

    // Delete associated images from filesystem
    let deletedImagesCount = 0;
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        try {
          const imageUrl = image.url || image;
          
          // Extract filename from URL
          // URL format: http://192.168.0.27:5001/uploads/media-1234567890.jpg
          if (imageUrl && imageUrl.includes('/uploads/')) {
            const filename = imageUrl.split('/uploads/').pop();
            const filePath = path.join(__dirname, '../../public/uploads', filename);
            
            // Check if file exists and delete
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              deletedImagesCount++;
              console.log(`Deleted image: ${filename}`);
            }
          }
        } catch (imgError) {
          console.error('Error deleting image:', imgError);
          // Continue with next image even if one fails
        }
      }
    }

    // Delete product from database
    await Product.findByIdAndDelete(req.params.id);

    console.log(`Product deleted: ${product.title}, Images deleted: ${deletedImagesCount}`);

    res.json({
      message: 'Product and images deleted successfully',
      deletedImages: deletedImagesCount
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   PUT /api/admin/products/:id/featured
// @desc    Toggle featured status of a product
// @access  Private (Admin only)
router.put('/products/:id/featured', [auth, adminOnly], async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }

    // Toggle featured status
    const wasFeatured = product.isFeatured;
    product.isFeatured = !product.isFeatured;
    await product.save();

    // Notify seller if product was just featured
    if (product.isFeatured && !wasFeatured) {
      await notifyProductFeatured(product.seller, product._id, product.title);
    }

    res.json({
      message: `Product ${product.isFeatured ? 'marked as featured' : 'unmarked as featured'}`,
      isFeatured: product.isFeatured
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   GET /api/admin/products/featured
// @desc    Get all featured products
// @access  Private (Admin only)
router.get('/products/featured', [auth, adminOnly], async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true })
      .populate('seller', 'name email phone profileImage')
      .sort({ createdAt: -1 });

    res.json({
      products
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   GET /api/admin/users/search
// @desc    Search users by name, email, or phone
// @access  Private (Admin only)
router.get('/users/search', [auth, adminOnly], async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({ users: [] });
    }

    const searchRegex = new RegExp(q, 'i');
    
    const users = await User.find({
      $or: [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ]
    })
      .select('name email phone userType isActive createdAt')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      users
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   GET /api/admin/users/:userId/products
// @desc    Get all products for a specific user
// @access  Private (Admin only)
router.get('/users/:userId/products', [auth, adminOnly], async (req, res) => {
  try {
    const { userId } = req.params;
    
    const products = await Product.find({ seller: userId })
      .populate('seller', 'name email phone profileImage')
      .sort({ createdAt: -1 })
      .lean(); // Convert to plain objects for easier manipulation
    
    // Transform media array to ensure backward compatibility
    const transformedProducts = products.map(product => {
      // Ensure media array has correct format
      if (product.images && product.images.length > 0) {
        product.media = product.images.map(img => ({
          url: img.url || img,
          type: img.type || 'image',
          isPrimary: img.isPrimary || false
        }));
      } else {
        product.media = [];
      }
      return product;
    });

    res.json({
      products: transformedProducts
    });
  } catch (error) {
    console.error('Get user products error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   POST /api/admin/load-cities
// @desc    Load Turkish cities and districts from Turkiye API
// @access  Public (Temporarily for setup)
router.post('/load-cities', async (req, res) => {
  try {
    console.log('🏙️ Admin: Loading cities from Turkiye API...');
    
    // Import Location model
    const Location = require('../models/Location');
    
    // Fetch data from Turkiye API
    const response = await fetch('https://turkiyeapi.dev/api/v1/provinces');
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    const citiesData = data.data;
    
    console.log(`✅ Fetched ${citiesData.length} cities from API`);
    
    let savedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    
    // Save each city to database
    for (const cityData of citiesData) {
      try {
        // Check if city already exists
        const existingCity = await Location.findOne({ name: cityData.name });
        
        // Prepare districts
        const districts = (cityData.districts || []).map(district => ({
          name: district.name,
          isActive: true,
          createdAt: new Date()
        }));
        
        if (existingCity) {
          // Update existing city
          existingCity.code = cityData.id.toString().padStart(2, '0');
          existingCity.districts = districts;
          existingCity.isActive = true;
          existingCity.updatedAt = new Date();
          await existingCity.save();
          updatedCount++;
          console.log(`🔄 Updated: ${cityData.name} (${districts.length} districts)`);
        } else {
          // Create new city
          const newCity = new Location({
            name: cityData.name,
            code: cityData.id.toString().padStart(2, '0'),
            districts: districts,
            isActive: true
          });
          await newCity.save();
          savedCount++;
          console.log(`✅ Saved: ${cityData.name} (${districts.length} districts)`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Error processing ${cityData.name}:`, error.message);
      }
    }
    
    // Verify the data
    const totalCities = await Location.countDocuments({ isActive: true });
    
    res.json({
      success: true,
      message: 'Cities loaded successfully',
      stats: {
        newCities: savedCount,
        updatedCities: updatedCount,
        errors: errorCount,
        totalCities: totalCities
      }
    });
  } catch (error) {
    console.error('❌ Load cities error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to load cities', 
      error: error.message 
    });
  }
});

module.exports = router;
