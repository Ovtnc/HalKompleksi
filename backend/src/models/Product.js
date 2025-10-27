const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Ürün başlığı gereklidir'],
    trim: true,
    maxlength: [100, 'Başlık 100 karakterden fazla olamaz']
  },
  description: {
    type: String,
    required: [true, 'Ürün açıklaması gereklidir'],
    maxlength: [1000, 'Açıklama 1000 karakterden fazla olamaz']
  },
  price: {
    type: Number,
    required: [true, 'Fiyat gereklidir'],
    min: [0, 'Fiyat negatif olamaz']
  },
  currency: {
    type: String,
    default: 'TL',
    enum: ['TL', 'USD', 'EUR']
  },
  category: {
    type: String,
    required: [true, 'Kategori gereklidir'],
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
    required: [true, 'Satıcı gereklidir']
  },
  location: {
    city: {
      type: String,
      required: [true, 'Şehir gereklidir']
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
    min: [0, 'Stok negatif olamaz']
  },
  unit: {
    type: String,
    enum: ['kg', 'adet', 'paket', 'litre', 'gram', 'ton', 'kasa', 'km', 'gün', 'kişi', 'saat', 'rol', 'kutu', 'metre', 'm²', 'şişe', 'teneke', 'takım'],
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
  isRejected: {
    type: Boolean,
    default: false
  },
  approvedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: Date,
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: String
}, {
  timestamps: true
});

// Optimized indexes for better query performance
productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isAvailable: 1, isApproved: 1 });
productSchema.index({ seller: 1, isApproved: 1 });
productSchema.index({ 'location.city': 1, isAvailable: 1, isApproved: 1 });
productSchema.index({ price: 1, isAvailable: 1, isApproved: 1 });
productSchema.index({ createdAt: -1, isApproved: 1 });
productSchema.index({ favorites: 1, isApproved: 1 });
productSchema.index({ isFeatured: 1, isAvailable: 1, isApproved: 1 });
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
