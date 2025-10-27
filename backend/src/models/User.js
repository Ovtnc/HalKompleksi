const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'İsim gereklidir'],
    trim: true,
    maxlength: [50, 'İsim 50 karakterden fazla olamaz']
  },
  email: {
    type: String,
    required: [true, 'E-posta gereklidir'],
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Lütfen geçerli bir e-posta adresi girin']
  },
  password: {
    type: String,
    required: [true, 'Şifre gereklidir'],
    minlength: [6, 'Şifre en az 6 karakter olmalıdır']
  },
  phone: {
    type: String,
    required: [true, 'Telefon numarası gereklidir'],
    match: [/^[\+]?[0-9]{10,16}$/, 'Lütfen geçerli bir telefon numarası girin']
  },
  userType: {
    type: String,
    enum: ['buyer', 'seller', 'admin'],
    required: [true, 'Kullanıcı tipi gereklidir']
  },
  userRoles: [{
    type: String,
    enum: ['buyer', 'seller'],
  }],
  activeRole: {
    type: String,
    enum: ['buyer', 'seller', 'admin'],
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpiry: {
    type: Date
  },
  profileImage: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  location: {
    city: String,
    district: String,
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  sellerInfo: {
    businessName: String,
    businessType: String,
    companyName: String,
    taxNumber: String,
    address: String,
    description: String,
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    }
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    language: {
      type: String,
      default: 'tr'
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'location.city': 1 });
userSchema.index({ createdAt: -1 });

// Set userRoles and activeRole based on userType for backward compatibility
userSchema.pre('save', function(next) {
  // If userRoles is not set or empty, initialize from userType
  if (!this.userRoles || this.userRoles.length === 0) {
    if (this.userType === 'buyer' || this.userType === 'seller') {
      this.userRoles = [this.userType];
    }
  }
  
  // If activeRole is not set, use userType
  if (!this.activeRole) {
    this.activeRole = this.userType;
  }
  
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
