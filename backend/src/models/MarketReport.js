const mongoose = require('mongoose');

const marketReportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  district: {
    type: String,
    trim: true
  },
  marketName: {
    type: String,
    trim: true
  },
  reportDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    url: String,
    publicId: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// TTL index for automatic deletion after 24 hours
marketReportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for formatted date
marketReportSchema.virtual('formattedDate').get(function() {
  return this.reportDate.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
});

// Virtual for location display
marketReportSchema.virtual('location').get(function() {
  if (this.district) {
    return `${this.district}, ${this.city}`;
  }
  return this.city;
});

module.exports = mongoose.model('MarketReport', marketReportSchema);
