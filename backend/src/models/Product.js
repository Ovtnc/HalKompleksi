const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    default: 'TL',
    enum: ['TL', 'USD', 'EUR']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['meyve', 'sebze', 'nakliye', 'kasa', 'zirai_ilac', 'ambalaj', 'indir_bindir', 'emlak', 'arac', 'gida', 'baharat', 'diger']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: String,
    isPrimary: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      enum: ['image', 'video'],
      default: 'image'
    }
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller is required']
  },
  location: {
    city: {
      type: String,
      required: [true, 'City is required']
    },
    district: String,
    address: String
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  stock: {
    type: Number,
    default: 1,
    min: [0, 'Stock cannot be negative']
  },
  unit: {
    type: String,
    enum: ['kg', 'adet', 'paket', 'litre', 'gram', 'ton', 'kasa', 'km', 'gün', 'kişi', 'saat', 'rol', 'kutu', 'metre', 'm²'],
    default: 'kg'
  },
  categoryData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  tags: [String],
  views: {
    type: Number,
    default: 0
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for search
productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isAvailable: 1 });
productSchema.index({ seller: 1 });
// productSchema.index({ 'location.coordinates': '2dsphere' });

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary ? primary.url : (this.images[0] ? this.images[0].url : null);
});

// Method to increment views
productSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to toggle favorite
productSchema.methods.toggleFavorite = function(userId) {
  const index = this.favorites.indexOf(userId);
  if (index > -1) {
    this.favorites.splice(index, 1);
  } else {
    this.favorites.push(userId);
  }
  return this.save();
};

module.exports = mongoose.model('Product', productSchema);
