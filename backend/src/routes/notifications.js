const express = require('express');
const Notification = require('../models/Notification');
const ProductRequest = require('../models/ProductRequest');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get user's notifications
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    const query = { user: req.user._id };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .populate('product', 'title images price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      user: req.user._id, 
      isRead: false 
    });

    res.json({
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   POST /api/notifications/product-request
// @desc    Create a product request (buyer wants to be notified)
// @access  Private
router.post('/product-request', auth, async (req, res) => {
  try {
    const { category, keywords, description, city } = req.body;

    // Check if similar request already exists
    const existingRequest = await ProductRequest.findOne({
      user: req.user._id,
      category,
      isActive: true
    });

    if (existingRequest) {
      // Update existing request
      existingRequest.keywords = keywords || existingRequest.keywords;
      existingRequest.description = description || existingRequest.description;
      existingRequest.city = city || existingRequest.city;
      await existingRequest.save();

      return res.json({
        message: 'Product request updated',
        request: existingRequest
      });
    }

    // Create new request
    const request = new ProductRequest({
      user: req.user._id,
      category,
      keywords: keywords || [],
      description,
      city
    });

    await request.save();

    res.json({
      message: 'Product request created. You will be notified when matching products are added.',
      request
    });
  } catch (error) {
    console.error('Create product request error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   GET /api/notifications/product-requests
// @desc    Get user's product requests
// @access  Private
router.get('/product-requests', auth, async (req, res) => {
  try {
    const requests = await ProductRequest.find({
      user: req.user._id,
      isActive: true
    }).sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    console.error('Get product requests error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   DELETE /api/notifications/product-requests/:id
// @desc    Delete a product request
// @access  Private
router.delete('/product-requests/:id', auth, async (req, res) => {
  try {
    const request = await ProductRequest.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!request) {
      return res.status(404).json({ message: 'Product request not found' });
    }

    res.json({ message: 'Product request deleted' });
  } catch (error) {
    console.error('Delete product request error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   GET /api/notifications/request-products/:requestId
// @desc    Get all products that match a specific product request
// @access  Private
router.get('/request-products/:requestId', auth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Find the notification to get the original request details
    const notification = await Notification.findOne({
      _id: requestId,
      user: req.user._id,
      type: 'product_available'
    });

    if (!notification) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Get the request data from notification
    const { category, city } = notification.data;
    
    // Build search query based on the original request
    const Product = require('../models/Product');
    const query = { 
      $and: [
        {
          $or: [
            { isApproved: true },
            { status: 'approved' }
          ]
        },
        { category: category }
      ]
    };

    // Add location filter if specified in original request
    if (city) {
      query.$and.push({ 'location.city': new RegExp(city, 'i') });
    }

    // Add keyword matching if keywords were specified
    if (notification.data.keywords && notification.data.keywords.length > 0) {
      // Create a more flexible search for keywords
      const keywordConditions = [];
      
      notification.data.keywords.forEach(keyword => {
        const keywordRegex = new RegExp(keyword, 'i');
        keywordConditions.push(
          { title: keywordRegex },
          { description: keywordRegex },
          { tags: keywordRegex }
        );
      });
      
      if (keywordConditions.length > 0) {
        query.$and.push({ $or: keywordConditions });
      }
    }
    
    // Also add searchQuery if available for more specific matching
    if (notification.data.searchQuery) {
      const searchRegex = new RegExp(notification.data.searchQuery, 'i');
      query.$and.push({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { tags: searchRegex }
        ]
      });
    }

    console.log('🔍 Request products query:', JSON.stringify(query, null, 2));

    const products = await Product.find(query)
      .populate('seller', 'name phone location sellerInfo profileImage')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      requestInfo: {
        category,
        city,
        keywords: notification.data.keywords || [],
        originalRequestId: requestId
      }
    });
  } catch (error) {
    console.error('Get request products error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// @route   GET /api/notifications/grouped-products
// @desc    Get all product notifications grouped by request criteria
// @access  Private
router.get('/grouped-products', auth, async (req, res) => {
  try {
    // Get all product_available notifications for the user
    const notifications = await Notification.find({
      user: req.user._id,
      type: 'product_available'
    }).sort({ createdAt: -1 });

    // Group notifications by request criteria (category + city + keywords)
    const groupedNotifications = {};
    
    notifications.forEach(notification => {
      const { category, city, keywords } = notification.data;
      const groupKey = `${category}_${city || 'all'}_${(keywords || []).join(',')}`;
      
      if (!groupedNotifications[groupKey]) {
        groupedNotifications[groupKey] = {
          requestInfo: {
            category,
            city,
            keywords: keywords || [],
            firstNotificationId: notification._id
          },
          notifications: [],
          productCount: 0,
          latestNotification: notification.createdAt
        };
      }
      
      groupedNotifications[groupKey].notifications.push(notification);
      groupedNotifications[groupKey].productCount++;
      
      if (notification.createdAt > groupedNotifications[groupKey].latestNotification) {
        groupedNotifications[groupKey].latestNotification = notification.createdAt;
      }
    });

    // Convert to array and sort by latest notification
    const groupedArray = Object.values(groupedNotifications).sort((a, b) => 
      new Date(b.latestNotification) - new Date(a.latestNotification)
    );

    res.json({
      groupedRequests: groupedArray,
      totalGroups: groupedArray.length
    });
  } catch (error) {
    console.error('Get grouped products error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;

