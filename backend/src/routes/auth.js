const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/emailService');

const router = express.Router();

// Helper functions for validation
const validateEmail = (email) => {
  // More strict email regex
  const emailRegex = /^[a-zA-Z0-9][a-zA-Z0-9._-]*@[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(email)) {
    return false;
  }
  
  // Disposable email domains (common ones)
  const disposableDomains = [
    '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'temp-mail.org',
    'throwaway.email', 'yopmail.com', 'getnada.com', 'tempmail.com',
    'fakeinbox.com', 'trashmail.com', 'dispostable.com', 'mohmal.com'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  if (disposableDomains.includes(domain)) {
    return false;
  }
  
  // Check for suspicious patterns
  if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
    return false;
  }
  
  return true;
};

const validateTurkishPhone = (phone) => {
  // Remove all spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Check if it starts with +90, 90, 0, or nothing
  let normalized = cleaned;
  
  if (normalized.startsWith('+90')) {
    normalized = normalized.substring(3);
  } else if (normalized.startsWith('90') && normalized.length === 12) {
    normalized = normalized.substring(2);
  } else if (normalized.startsWith('0')) {
    normalized = normalized.substring(1);
  }
  
  // Should be exactly 10 digits after normalization
  if (normalized.length !== 10 || !/^\d+$/.test(normalized)) {
    return false;
  }
  
  // Turkish mobile operators: Must start with 5
  // Valid formats: 5XX XXX XX XX (where XX are digits)
  // First digit after 0 must be 5 for mobile numbers
  if (normalized.startsWith('5')) {
    // Check second digit (50X, 51X, 52X, 53X, 54X, 55X, 56X, 57X, 58X, 59X)
    const secondDigit = normalized.substring(1, 2);
    if (secondDigit >= '0' && secondDigit <= '9') {
      return true; // Valid mobile number (05XX XXX XX XX)
    }
  }
  
  // Landline numbers: Must start with area codes (212, 216, 312, 324, 232, etc.)
  // For landline, first digit after 0 should be 2 or 3 or 4
  const firstDigit = normalized.substring(0, 1);
  if (['2', '3', '4'].includes(firstDigit)) {
    // Basic landline check - accept 3-digit area codes
    return true;
  }
  
  return false;
};

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d'
  });
};

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('İsim 2-50 karakter arasında olmalıdır'),
  body('email')
    .trim()
    .normalizeEmail()
    .custom((value) => {
      if (!validateEmail(value)) {
        throw new Error('Lütfen geçerli bir e-posta adresi girin. Geçici e-posta adresleri kabul edilmez.');
      }
      return true;
    }),
  body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır'),
  body('phone')
    .trim()
    .custom((value) => {
      if (!validateTurkishPhone(value)) {
        throw new Error('Lütfen geçerli bir Türkiye telefon numarası girin. Format: 05XX XXX XX XX veya +90 5XX XXX XX XX');
      }
      return true;
    }),
  body('userType').isIn(['buyer', 'seller', 'admin']).withMessage('Kullanıcı tipi alıcı, satıcı veya admin olmalıdır')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Doğrulama başarısız',
        errors: errors.array()
      });
    }

    const { name, email, password, phone, userType } = req.body;

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists with this email
    const existingUserByEmail = await User.findOne({ email: normalizedEmail });
    if (existingUserByEmail) {
      return res.status(400).json({
        message: 'Bu e-posta adresi ile zaten bir kullanıcı mevcut'
      });
    }

    // Normalize phone number
    const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');
    let cleanedPhone = normalizedPhone;
    if (cleanedPhone.startsWith('+90')) {
      cleanedPhone = '0' + cleanedPhone.substring(3);
    } else if (cleanedPhone.startsWith('90') && cleanedPhone.length === 12) {
      cleanedPhone = '0' + cleanedPhone.substring(2);
    } else if (!cleanedPhone.startsWith('0')) {
      cleanedPhone = '0' + cleanedPhone;
    }

    // Check if user already exists with this phone
    const existingUserByPhone = await User.findOne({ phone: cleanedPhone });
    if (existingUserByPhone) {
      return res.status(400).json({
        message: 'Bu telefon numarası ile zaten bir kullanıcı mevcut'
      });
    }

    // Create user
    // Her kullanıcı hem buyer hem seller olabilir (admin hariç)
    const userRoles = ['buyer', 'seller'];
    const activeRole = userType; // Seçilen rolle başla, sonra değiştirilebilir
    
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: cleanedPhone,
      userType,
      userRoles, // Hem buyer hem seller rolü ver
      activeRole // Başlangıç rolü
    });

    await user.save();

    const token = generateToken(user._id);

    // Send welcome email
    try {
      await sendWelcomeEmail(email, name);
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
      // Don't fail registration if email fails
    }

    res.status(201).json({
      message: 'Kullanıcı başarıyla kaydedildi',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        userRoles: user.userRoles,
        activeRole: user.activeRole,
        profileImage: user.profileImage,
        isActive: user.isActive,
        isApproved: user.isApproved || true
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      message: 'Kayıt sırasında sunucu hatası'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Lütfen geçerli bir e-posta adresi girin'),
  body('password').notEmpty().withMessage('Şifre gereklidir')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Doğrulama başarısız',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: 'Geçersiz kimlik bilgileri'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        message: 'Geçersiz kimlik bilgileri'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(400).json({
        message: 'Hesap deaktif edilmiş'
      });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Giriş başarılı',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        userRoles: user.userRoles,
        activeRole: user.activeRole,
        profileImage: user.profileImage,
        isActive: user.isActive,
        isApproved: user.isApproved || true
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Giriş sırasında sunucu hatası'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        userType: req.user.userType,
        userRoles: req.user.userRoles,
        activeRole: req.user.activeRole,
        profileImage: req.user.profileImage,
        location: req.user.location,
        sellerInfo: req.user.sellerInfo,
        isActive: req.user.isActive,
        isApproved: req.user.isApproved || true
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      message: 'Sunucu hatası'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', auth, (req, res) => {
  res.json({
    message: 'Çıkış başarılı'
  });
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Lütfen geçerli bir e-posta adresi girin')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Doğrulama başarısız',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: 'Bu e-posta adresi ile kullanıcı bulunamadı'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save();

    // Send password reset email
    try {
      const emailResult = await sendPasswordResetEmail(email, resetToken);
      if (emailResult.success) {
        res.json({
          message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi'
        });
      } else {
        console.error('Email sending failed:', emailResult.error);
        res.status(500).json({
          message: 'Sıfırlama e-postası gönderilemedi. Lütfen daha sonra tekrar deneyin.'
        });
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      res.status(500).json({
        message: 'Sıfırlama e-postası gönderilemedi. Lütfen daha sonra tekrar deneyin.'
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      message: 'Sunucu hatası'
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh', async (req, res) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify the old token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Check if user still exists and is active
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    // Generate new token
    const newToken = generateToken(user._id);
    
    res.json({
      message: 'Token refreshed successfully',
      token: newToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      message: 'Token is not valid'
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Sıfırlama anahtarı gereklidir'),
  body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Doğrulama başarısız',
        errors: errors.array()
      });
    }

    const { token, password } = req.body;

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: 'Geçersiz veya süresi dolmuş sıfırlama anahtarı'
      });
    }

    // Update password
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.json({
      message: 'Şifre sıfırlama başarılı'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      message: 'Sunucu hatası'
    });
  }
});

module.exports = router;
