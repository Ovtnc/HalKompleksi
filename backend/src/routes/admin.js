const express = require('express');
const { auth, adminOnly } = require('../middleware/auth');
const Product = require('../models/Product');
const User = require('../models/User');
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
        blockedUsers
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
// @desc    Reject a product
// @access  Private (Admin only)
router.put('/products/:id/reject', [auth, adminOnly], async (req, res) => {
  try {
    const { reason } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete the product or mark as rejected
    await Product.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Product rejected and removed',
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
// @desc    Delete product (Admin only)
// @access  Private (Admin only)
router.delete('/products/:id', [auth, adminOnly], async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
