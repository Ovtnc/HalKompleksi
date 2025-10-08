const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Buyer is required']
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller is required']
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  deliveryAddress: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    district: {
      type: String,
      required: [true, 'District is required']
    },
    postalCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  deliveryDate: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  cancellationReason: String,
  trackingNumber: String,
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'transfer'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentDate: Date,
  refundDate: Date,
  refundReason: String
}, {
  timestamps: true
});

// Index for efficient queries
orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ seller: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ product: 1 });

// Virtual for order number
orderSchema.virtual('orderNumber').get(function() {
  return `ORD-${this._id.toString().slice(-8).toUpperCase()}`;
});

// Method to calculate total
orderSchema.methods.calculateTotal = function() {
  this.totalPrice = this.unitPrice * this.quantity;
  return this.totalPrice;
};

// Method to update status
orderSchema.methods.updateStatus = function(newStatus, reason = null) {
  this.status = newStatus;
  
  if (newStatus === 'delivered') {
    this.deliveredAt = new Date();
  } else if (newStatus === 'cancelled') {
    this.cancelledAt = new Date();
    this.cancellationReason = reason;
  }
  
  return this.save();
};

// Static method to get order statistics
orderSchema.statics.getOrderStats = function(userId, userType) {
  const matchField = userType === 'seller' ? 'seller' : 'buyer';
  
  return this.aggregate([
    { $match: { [matchField]: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: '$totalPrice' }
      }
    }
  ]);
};

module.exports = mongoose.model('Order', orderSchema);
