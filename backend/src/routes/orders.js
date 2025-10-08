const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { buyer: req.user._id };

    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('product', 'title images price currency')
      .populate('seller', 'name phone location')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/seller
// @desc    Get seller's orders
// @access  Private (Seller only)
router.get('/seller', [auth, authorize('seller')], async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { seller: req.user._id };

    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('product', 'title images price currency')
      .populate('buyer', 'name phone location')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get seller orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', [
  auth,
  body('productId').isMongoId().withMessage('Valid product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('deliveryAddress').isObject().withMessage('Delivery address is required'),
  body('notes').optional().isString().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { productId, quantity, deliveryAddress, notes } = req.body;

    // Verify product exists and is available
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.isAvailable) {
      return res.status(400).json({ message: 'Product is not available' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    // Calculate total price
    const totalPrice = product.price * quantity;

    // Create order
    const order = new Order({
      buyer: req.user._id,
      seller: product.seller,
      product: productId,
      quantity,
      unitPrice: product.price,
      totalPrice,
      deliveryAddress,
      notes,
      status: 'pending'
    });

    await order.save();

    // Update product stock
    product.stock -= quantity;
    if (product.stock === 0) {
      product.isAvailable = false;
    }
    await product.save();

    // Populate order data
    const populatedOrder = await Order.findById(order._id)
      .populate('product', 'title images price currency')
      .populate('seller', 'name phone location')
      .populate('buyer', 'name phone location');

    res.status(201).json({
      message: 'Order created successfully',
      order: populatedOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private
router.put('/:id/status', [
  auth,
  body('status').isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check permissions
    if (order.buyer.toString() !== req.user._id.toString() && 
        order.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update status
    order.status = status;
    if (status === 'delivered') {
      order.deliveredAt = new Date();
    } else if (status === 'cancelled') {
      order.cancelledAt = new Date();
      // Restore product stock
      const product = await Product.findById(order.product);
      if (product) {
        product.stock += order.quantity;
        product.isAvailable = true;
        await product.save();
      }
    }

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('product', 'title images price currency')
      .populate('seller', 'name phone location')
      .populate('buyer', 'name phone location');

    res.json({
      message: 'Order status updated successfully',
      order: populatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('product', 'title images price currency')
      .populate('seller', 'name phone location')
      .populate('buyer', 'name phone location');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check permissions
    if (order.buyer.toString() !== req.user._id.toString() && 
        order.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/orders/:id
// @desc    Cancel order
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only buyer can cancel order
    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Can only cancel pending orders
    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Can only cancel pending orders' });
    }

    // Restore product stock
    const product = await Product.findById(order.product);
    if (product) {
      product.stock += order.quantity;
      product.isAvailable = true;
      await product.save();
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    await order.save();

    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
