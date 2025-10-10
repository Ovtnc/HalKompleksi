const express = require('express');
const { auth, adminOnly } = require('../middleware/auth');
const Product = require('../models/Product');
const User = require('../models/User');
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
    const pendingProducts = await Product.countDocuments({ isApproved: false });
    const approvedProducts = await Product.countDocuments({ isApproved: true });
    const activeUsers = await User.countDocuments({ isActive: true });
    const blockedUsers = await User.countDocuments({ isActive: false });
    const featuredProducts = await Product.countDocuments({ isFeatured: true });
    
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
        totalViews,
        totalFavorites
      },
      recentProducts,
      recentUsers
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/products/pending
// @desc    Get pending products for approval
// @access  Private (Admin only)
router.get('/products/pending', [auth, adminOnly], async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const products = await Product.find({ isApproved: false })
      .populate('seller', 'name email phone userType')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments({ isApproved: false });

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get pending products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/products/:id/approve
// @desc    Approve a product
// @access  Private (Admin only)
router.put('/products/:id/approve', [auth, adminOnly], async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
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
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/products/:id/reject
// @desc    Reject a product (remove approval status)
// @access  Private (Admin only)
router.put('/products/:id/reject', [auth, adminOnly], async (req, res) => {
  try {
    const { reason } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Remove approval and featured status
    product.isApproved = false;
    product.isFeatured = false; // Onaysız ürün öne çıkamaz
    product.rejectionReason = reason || 'Admin tarafından onay kaldırıldı';
    product.rejectedAt = new Date();
    
    await product.save();

    // Notify seller about rejection
    await notifyProductRejected(product.seller, product._id, product.title, reason);

    res.json({
      message: 'Product approval removed',
      reason: reason || 'No reason provided'
    });
  } catch (error) {
    console.error('Reject product error:', error);
    res.status(500).json({ message: 'Server error' });
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
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/block
// @desc    Block/unblock a user
// @access  Private (Admin only)
router.put('/users/:id/block', [auth, adminOnly], async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      message: `User ${isActive ? 'unblocked' : 'blocked'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Private (Admin only)
router.delete('/users/:id', [auth, adminOnly], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
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
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/products
// @desc    Get all products with admin controls
// @access  Private (Admin only)
router.get('/products', [auth, adminOnly], async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = {};
    if (status === 'approved') query.isApproved = true;
    if (status === 'pending') query.isApproved = false;

    const products = await Product.find(query)
      .populate('seller', 'name email phone userType')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get admin products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/products/:id
// @desc    Delete product and its images (Admin only)
// @access  Private (Admin only)
router.delete('/products/:id', [auth, adminOnly], async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
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
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/products/:id/featured
// @desc    Toggle featured status of a product
// @access  Private (Admin only)
router.put('/products/:id/featured', [auth, adminOnly], async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
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
    res.status(500).json({ message: 'Server error' });
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
    res.status(500).json({ message: 'Server error' });
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
    res.status(500).json({ message: 'Server error' });
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
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
