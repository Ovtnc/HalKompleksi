const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Middleware to fix image URLs
const fixImageUrls = (req, res, next) => {
  const originalJson = res.json;
  res.json = function(data) {
    if (data && data.products) {
      data.products = data.products.map(product => {
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
    } else if (data && data.product) {
      if (data.product.images) {
        data.product.images = data.product.images.map(image => {
          if (image.url && image.url.startsWith('file://')) {
            image.url = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
          }
          return image;
        });
      }
    }
    return originalJson.call(this, data);
  };
  next();
};

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', fixImageUrls, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      city,
      minPrice,
      maxPrice,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { 
      $or: [
        { isApproved: true },
        { status: 'approved' }
      ]
    };

    // Category filter
    if (category) query.category = category;

    // Location filter
    if (city) query['location.city'] = new RegExp(city, 'i');

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Search filter - case insensitive search in title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
      console.log('Search query:', search, 'Generated MongoDB query:', query.$or);
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .populate('seller', 'name phone location sellerInfo profileImage')
      .sort(sortOptions)
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

    res.json({ products });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/search
// @desc    Search products
// @access  Public
router.get('/search', fixImageUrls, async (req, res) => {
  try {
    const {
      query: searchQuery,
      category,
      location,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { 
      $and: [
        {
          $or: [
            { isApproved: true },
            { status: 'approved' }
          ]
        }
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
      console.log('🔍 Search query:', searchQuery);
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

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    console.log('🔍 Final search query:', JSON.stringify(query, null, 2));

    const products = await Product.find(query)
      .populate('seller', 'name phone location sellerInfo profileImage')
      .sort(sortOptions)
      .limit(100);

    console.log('📊 Found products:', products.length);

    res.json({ products, total: products.length });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/products/categories
// @desc    Get product categories
// @access  Public
router.get('/categories', (req, res) => {
  const categories = [
    { id: 'meyve', name: 'Meyve', icon: 'nutrition' },
    { id: 'sebze', name: 'Sebze', icon: 'leaf' },
    { id: 'gida', name: 'Gıda', icon: 'restaurant' },
    { id: 'nakliye', name: 'Nakliye', icon: 'car' },
    { id: 'kasa', name: 'Kasa', icon: 'cube' },
    { id: 'zirai_ilac', name: 'Zirai İlaç', icon: 'medical' },
    { id: 'ambalaj', name: 'Ambalaj', icon: 'archive' },
    { id: 'indir_bindir', name: 'İndir-Bindir', icon: 'people' },
    { id: 'emlak', name: 'Emlak', icon: 'home' },
    { id: 'arac', name: 'Araç', icon: 'car-sport' }
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
router.get('/:id', fixImageUrls, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name phone location sellerInfo profileImage');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Increment view count
    await product.incrementViews();

    // Refresh seller info to get latest profile image
    if (product.seller) {
      console.log('Product seller info:', product.seller);
      console.log('Seller _id:', product.seller._id);
      console.log('Seller ID type:', typeof product.seller._id);
      
      const sellerId = product.seller._id || product.seller;
      console.log('Using seller ID:', sellerId);
      
      const updatedSeller = await User.findById(sellerId, 'name phone location sellerInfo profileImage');
      if (updatedSeller) {
        console.log('Updated seller info:', updatedSeller);
        product.seller = updatedSeller;
      } else {
        console.log('No updated seller found for ID:', sellerId);
      }
    }

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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
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
      categoryData: req.body.categoryData || {},
      images: processedImages
    };

    const product = new Product(productData);
    await product.save();

    const populatedProduct = await Product.findById(product._id)
      .populate('seller', 'name phone location sellerInfo profileImage');

    res.status(201).json({
      message: 'Product created successfully',
      product: populatedProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
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
  body('isAvailable').optional().isBoolean().withMessage('isAvailable must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
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
      return res.status(404).json({ message: 'Product not found' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('seller', 'name phone location sellerInfo profileImage');

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
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
    const { page = 1, limit = 10, status } = req.query;
    const query = { seller: req.user._id };

    if (status === 'active') query.isAvailable = true;
    if (status === 'inactive') query.isAvailable = false;

    const products = await Product.find(query)
      .populate('seller', 'name phone location sellerInfo profileImage')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Add favorites count to each product
    const productsWithFavoritesCount = products.map(product => ({
      ...product.toObject(),
      favoritesCount: product.favorites ? product.favorites.length : 0
    }));

    const total = await Product.countDocuments(query);

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
