const mongoose = require('mongoose');

const productRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  keywords: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  notifiedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for efficient queries
productRequestSchema.index({ category: 1, isActive: 1, createdAt: -1 });
productRequestSchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model('ProductRequest', productRequestSchema);

