const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');
const { notifyProductPending, notifyMatchingBuyers } = require('../utils/notifications');

const router = express.Router();

// Helper function to fix image URLs
const fixImageUrls = (products) => {
  return products.map(product => {
    if (product.images) {
      product.images = product.images.map(image => {
        if (image.url && image.url.startsWith('file://')) {
          // Replace file:// URLs with placeholder
          image.url = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
        }
        return image;
      });
    }
    return product;
  });
};

// Helper function to clean categoryData - remove empty, null, undefined, and invalid date values
const cleanCategoryData = (categoryData) => {
  if (!categoryData || typeof categoryData !== 'object') {
    return {};
  }

  const cleaned = {};
  
  for (const [key, value] of Object.entries(categoryData)) {
    // Skip empty, null, or undefined values
    if (value === null || value === undefined || value === '') {
      continue;
    }

    // For date fields, validate the date
    if (key.toLowerCase().includes('date') || key === 'harvest' || key === 'expiryDate' || key === 'productionDate') {
      try {
        const date = new Date(value);
        // Check if date is valid
        if (!isNaN(date.getTime())) {
          cleaned[key] = value;
        }
        // Skip invalid dates
      } catch (e) {
        // Skip dates that can't be parsed
        continue;
      }
    } else {
      // For non-date fields, keep the value if it's not empty
      cleaned[key] = value;
    }
  }

  return cleaned;
};

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      city,
      location,
      minPrice,
      maxPrice,
      search,
      query,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      stockAvailable,
      organic,
      coldStorage,
      featured,
      inStock
    } = req.query;

    const mongoQuery = { 
      $and: [
        {
          $or: [
            { isApproved: true },
            { status: 'approved' }
          ]
        },
        { isAvailable: true }  // Only show available products
      ]
    };

    console.log('🔍 Products API: Query filters:', mongoQuery);

    // Category filter
    if (category) mongoQuery.category = category;

    // Location filter
    const locationFilter = location || city;
    if (locationFilter) mongoQuery['location.city'] = new RegExp(locationFilter, 'i');

    // Price range filter
    if (minPrice || maxPrice) {
      mongoQuery.price = {};
      if (minPrice) mongoQuery.price.$gte = parseFloat(minPrice);
      if (maxPrice) mongoQuery.price.$lte = parseFloat(maxPrice);
    }

    // Search filter - case insensitive search in title and description
    const searchTerm = search || query;
    if (searchTerm) {
      mongoQuery.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { tags: { $regex: searchTerm, $options: 'i' } }
      ];
      console.log('Search query:', searchTerm, 'Generated MongoDB query:', mongoQuery.$or);
    }

    // Additional filters
    if (stockAvailable === 'true') {
      mongoQuery.stock = { $gt: 0 };
    }

    if (organic === 'true') {
      mongoQuery['categoryData.organic'] = true;
    }

    if (coldStorage === 'true') {
      mongoQuery['categoryData.coldStorage'] = true;
    }

    if (featured === 'true') {
      mongoQuery.isFeatured = true;
    }

    if (inStock === 'true') {
      mongoQuery.stock = { $gt: 0 };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(mongoQuery)
      .populate('seller', 'name phone location sellerInfo profileImage')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(mongoQuery);

    // Fix image URLs
    const fixedProducts = fixImageUrls(products);

    // Set cache headers to prevent stale seller information
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    res.json({
      products: fixedProducts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({
      isFeatured: true,
      $or: [
        { isApproved: true },
        { status: 'approved' }
      ]
    })
      .populate('seller', 'name phone location sellerInfo profileImage')
      .sort({ createdAt: -1 })
      .limit(10);

    // Set cache headers to ensure fresh seller information
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    res.json({ products });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/search
// @desc    Search products
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const {
      query: searchQuery,
      category,
      location,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      featured
    } = req.query;

    const query = { 
      $and: [
        {
          $or: [
            { isApproved: true },
            { status: 'approved' }
          ]
        },
        { isAvailable: true }  // Only show available products
      ]
    };

    // Search filter - prioritize title search
    if (searchQuery) {
      query.$and.push({
        $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } }
        ]
      });
    }

    // Category filter
    if (category && category !== 'all') {
      query.$and.push({ category: category });
    }

    // Location filter
    if (location && location !== 'all') {
      query.$and.push({ 'location.city': new RegExp(location, 'i') });
    }

    // Price range filter
    if (minPrice || maxPrice) {
      const priceQuery = {};
      if (minPrice) priceQuery.$gte = parseFloat(minPrice);
      if (maxPrice) priceQuery.$lte = parseFloat(maxPrice);
      query.$and.push({ price: priceQuery });
    }

    // Featured filter
    if (featured === 'true') {
      query.$and.push({ isFeatured: true });
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .populate('seller', 'name phone location sellerInfo profileImage')
      .sort(sortOptions)
      .limit(100);

    // Fix image URLs
    const fixedProducts = fixImageUrls(products);

    res.json({ products: fixedProducts, total: products.length });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

// @route   GET /api/products/categories
// @desc    Get product categories
// @access  Public
router.get('/categories', (req, res) => {
  const categories = [
    { id: 'meyve', name: 'Meyve', icon: 'leaf', color: '#2ECC71' },
    { id: 'sebze', name: 'Sebze', icon: 'nutrition', color: '#27AE60' },
    { id: 'gida', name: 'Gıda', icon: 'basket', color: '#E67E22' },
    { id: 'nakliye', name: 'Nakliye', icon: 'car', color: '#3498DB' },
    { id: 'kasa', name: 'Kasa', icon: 'cube', color: '#9B59B6' },
    { id: 'zirai_ilac', name: 'Zirai İlaç', icon: 'medical', color: '#E74C3C' },
    { id: 'ambalaj', name: 'Ambalaj', icon: 'archive', color: '#1ABC9C' },
    { id: 'indir_bindir', name: 'İndir-Bindir', icon: 'people', color: '#F39C12' },
    { id: 'emlak', name: 'Emlak', icon: 'home', color: '#8E44AD' },
    { id: 'arac', name: 'Araç', icon: 'car-sport', color: '#34495E' }
  ];

  res.json({ categories });
});

// @route   GET /api/products/favorites
// @desc    Get user's favorite products
// @access  Private
router.get('/favorites', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const products = await Product.find({ 
      favorites: req.user._id,
      isApproved: true 
    })
      .populate('seller', 'name phone profileImage sellerInfo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments({ 
      favorites: req.user._id,
      isApproved: true 
    });

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/products/:id/views
// @desc    Increment product views
// @access  Public
router.put('/:id/views', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ 
      message: 'Views incremented successfully',
      views: product.views 
    });
  } catch (error) {
    console.error('Error incrementing views:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const User = require('../models/User');
    
    // Get product first
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get seller ID
    const sellerId = product.seller;
    console.log('📦 Product seller ID:', sellerId);

    // Fetch seller directly from User collection to ensure fresh data
    const seller = await User.findById(sellerId).select('name phone location sellerInfo profileImage');
    console.log('👤 Fresh seller data from User collection:', {
      name: seller?.name,
      phone: seller?.phone,
      location: seller?.location,
      profileImage: seller?.profileImage
    });

    // Manually attach fresh seller data to product
    product.seller = seller;

    // Increment view count
    await product.incrementViews();
    
    // Ensure seller is still attached after incrementViews
    if (!product.seller || typeof product.seller === 'string') {
      product.seller = await User.findById(sellerId).select('name phone location sellerInfo profileImage');
    }

    // Log final seller info
    console.log('✅ Final product seller info:', {
      sellerId: product.seller?._id,
      sellerName: product.seller?.name,
      sellerPhone: product.seller?.phone,
      sellerLocation: product.seller?.location,
      sellerProfileImage: product.seller?.profileImage
    });

    // Fix image URLs
    if (product.images) {
      product.images = product.images.map(image => {
        if (image.url && image.url.startsWith('file://')) {
          image.url = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
        }
        // Eğer URL localhost ile başlıyorsa, doğru port ile değiştir
        else if (image.url && image.url.includes('localhost')) {
          image.url = image.url.replace('localhost:5000', 'localhost:5001');
        }
        return image;
      });
    }

    // Set cache headers to ensure fresh seller information
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Seller only)
router.post('/', [
  auth,
  authorize('seller'),
  body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be 10-1000 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').isIn(['meyve', 'sebze', 'nakliye', 'kasa', 'zirai_ilac', 'ambalaj', 'indir_bindir', 'emlak', 'arac', 'gida', 'baharat', 'diger']).withMessage('Invalid category'),
  body('location.city').trim().isLength({ min: 2 }).withMessage('City is required'),
  body('images').optional().isArray().withMessage('Images must be an array')
], async (req, res) => {
  try {
    console.log('🚀 Product creation request received');
    console.log('📦 Request body:', req.body);
    console.log('👤 User:', req.user._id);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Ensure images have required URL field
    const processedImages = req.body.images && req.body.images.length > 0 
      ? req.body.images.map(img => ({
          ...img,
          url: img.url || 'https://via.placeholder.com/400x300?text=No+Image'
        }))
      : [{ url: 'https://via.placeholder.com/400x300?text=No+Image', isPrimary: true, type: 'image' }];

    const productData = {
      ...req.body,
      seller: req.user._id,
      isApproved: false, // Products need admin approval
      approvedAt: null,
      approvedBy: null,
      categoryData: cleanCategoryData(req.body.categoryData),
      images: processedImages
    };

    console.log('📦 Final product data:', productData);

    const product = new Product(productData);
    await product.save();
    console.log('✅ Product saved to database:', product._id);

    const populatedProduct = await Product.findById(product._id)
      .populate('seller', 'name phone location sellerInfo profileImage');

    // Notify seller that product is pending approval
    await notifyProductPending(req.user._id, product._id, product.title);
    console.log('📧 Notification sent to seller');

    res.status(201).json({
      message: 'Product created successfully',
      product: populatedProduct
    });
  } catch (error) {
    console.error('❌ Create product error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Seller only)
router.put('/:id', [
  auth,
  authorize('seller'),
  body('title').optional().trim().isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be 10-1000 characters'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a positive integer'),
  body('unit').optional().isString().withMessage('Unit must be a string'),
  body('category').optional().isString().withMessage('Category must be a string'),
  body('location').optional().isObject().withMessage('Location must be an object'),
  body('categoryData').optional().isObject().withMessage('CategoryData must be an object'),
  body('images').optional().isArray().withMessage('Images must be an array'),
  body('isAvailable').optional().isBoolean().withMessage('isAvailable must be a boolean')
], async (req, res) => {
  try {
    console.log('🔄 Update product request:', {
      productId: req.params.id,
      userId: req.user._id,
      body: req.body
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.user._id
    });

    if (!product) {
      console.log('❌ Product not found or not owned by user');
      return res.status(404).json({ message: 'Product not found' });
    }

    console.log('✅ Product found, updating...');

    // Clean categoryData if it exists in the update
    const updateData = { ...req.body };
    if (updateData.categoryData) {
      updateData.categoryData = cleanCategoryData(updateData.categoryData);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('seller', 'name phone location sellerInfo profileImage');

    console.log('✅ Product updated successfully');

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('❌ Update product error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   GET /api/products/seller/count
// @desc    Get seller's product count
// @access  Private (Seller only)
router.get('/seller/count', [auth, authorize('seller')], async (req, res) => {
  try {
    console.log('📊 Backend: Getting seller product count for user:', req.user._id);
    
    const totalProducts = await Product.countDocuments({ seller: req.user._id });
    const activeProducts = await Product.countDocuments({ 
      seller: req.user._id, 
      isAvailable: true 
    });
    const pendingProducts = await Product.countDocuments({ 
      seller: req.user._id, 
      isApproved: false 
    });
    const approvedProducts = await Product.countDocuments({ 
      seller: req.user._id, 
      isApproved: true 
    });

    const result = {
      total: totalProducts,
      active: activeProducts,
      pending: pendingProducts,
      approved: approvedProducts
    };
    
    console.log('📊 Backend: Product count result:', result);
    res.json(result);
  } catch (error) {
    console.error('Get seller product count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Seller only)
router.delete('/:id', [auth, authorize('seller')], async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.user._id
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/products/:id/favorite
// @desc    Toggle product favorite
// @access  Private
router.post('/:id/favorite', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.toggleFavorite(req.user._id);

    res.json({ message: 'Favorite status updated' });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/products/:id/favorite
// @desc    Remove product from favorites
// @access  Private
router.delete('/:id/favorite', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.toggleFavorite(req.user._id);

    res.json({ message: 'Product removed from favorites' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/seller/my-products
// @desc    Get seller's products
// @access  Private (Seller only)
router.get('/seller/my-products', [auth, authorize('seller')], async (req, res) => {
  try {
    console.log('📦 Backend: My products request received');
    console.log('📦 Backend: User ID:', req.user._id);
    console.log('📦 Backend: User type:', req.user.userType);
    console.log('📦 Backend: User roles:', req.user.userRoles);
    console.log('📦 Backend: Active role:', req.user.activeRole);
    
    const { page = 1, limit = 10, status } = req.query;
    const query = { seller: req.user._id };

    if (status === 'active') query.isAvailable = true;
    if (status === 'inactive') query.isAvailable = false;

    console.log('📦 Backend: Getting seller products with query:', query);
    console.log('📦 Backend: Status filter:', status);

    const products = await Product.find(query)
      .populate('seller', 'name phone location sellerInfo profileImage')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    console.log('📦 Backend: Found products:', products.length);
    console.log('📦 Backend: Products availability:', products.map(p => ({ id: p._id, isAvailable: p.isAvailable })));

    // Add favorites count to each product
    const productsWithFavoritesCount = products.map(product => ({
      ...product.toObject(),
      favoritesCount: product.favorites ? product.favorites.length : 0
    }));

    const total = await Product.countDocuments(query);

    // Set cache headers to ensure fresh seller information
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');

    res.json({
      products: productsWithFavoritesCount,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get seller products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product (Seller or Admin only)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user is the seller or an admin
    if (product.seller.toString() !== req.user._id.toString() && req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    // Delete associated images from filesystem
    let deletedImagesCount = 0;
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        try {
          const imageUrl = image.url || image;
          
          // Extract filename from URL
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
        }
      }
    }

    // Delete product from database
    await Product.findByIdAndDelete(req.params.id);

    console.log(`Product deleted: ${product.title}, Images deleted: ${deletedImagesCount}, By: ${req.user.userType}`);

    res.json({
      message: 'Product and images deleted successfully',
      deletedImages: deletedImagesCount
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
