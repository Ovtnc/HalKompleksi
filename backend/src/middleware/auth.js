const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    console.log('🔐 [AUTH MIDDLEWARE] Authorization header:', authHeader ? `${authHeader.substring(0, 20)}...` : 'MISSING');
    
    const token = authHeader?.replace('Bearer ', '');
    console.log('🔐 [AUTH MIDDLEWARE] Token extracted:', token ? `YES (${token.length} chars)` : 'NO');
    console.log('🔐 [AUTH MIDDLEWARE] Token preview:', token ? `${token.substring(0, 30)}...` : 'N/A');
    
    if (!token) {
      console.error('❌ [AUTH MIDDLEWARE] No token provided');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    console.log('🔐 [AUTH MIDDLEWARE] Verifying token...');
    console.log('🔐 [AUTH MIDDLEWARE] JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
    console.log('🔐 [AUTH MIDDLEWARE] Using secret:', process.env.JWT_SECRET || 'your-secret-key');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('✅ [AUTH MIDDLEWARE] Token decoded, user ID:', decoded.id);
    
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.error('❌ [AUTH MIDDLEWARE] User not found for ID:', decoded.id);
      return res.status(401).json({ message: 'Token is not valid' });
    }

    if (!user.isActive) {
      console.error('❌ [AUTH MIDDLEWARE] User account is deactivated:', user.email);
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    console.log('✅ [AUTH MIDDLEWARE] Authentication successful for user:', user.email);
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ [AUTH MIDDLEWARE] Error:', error.message);
    console.error('❌ [AUTH MIDDLEWARE] Error stack:', error.stack);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Admin her zaman geçer
    if (req.user.userType === 'admin') {
      return next();
    }

    // Check if user has any of the required roles in their userRoles array
    // Her kullanıcı hem buyer hem seller olabilir, bu yüzden userRoles array'ini kontrol et
    const hasRole = req.user.userRoles && req.user.userRoles.some(role => roles.includes(role));
    
    // If userRoles array has the required role, allow access regardless of activeRole
    if (hasRole) {
      console.log(`✅ [AUTHORIZE] User has required role in userRoles. User roles: ${req.user.userRoles.join(', ')}, Required: ${roles.join(' or ')}, Active role: ${req.user.activeRole}`);
      return next();
    }
    
    // Fallback: Check activeRole or userType for backward compatibility
    const userRole = req.user.activeRole || req.user.userType;
    const hasRoleFallback = roles.includes(userRole);
    
    if (!hasRoleFallback) {
      console.error(`❌ [AUTHORIZE] Access denied. Required role: ${roles.join(' or ')}. User roles: ${req.user.userRoles?.join(', ') || 'none'}, Active role: ${userRole}`);
      return res.status(403).json({ 
        message: `Access denied. Required role: ${roles.join(' or ')}. Current role: ${userRole}. Available roles: ${req.user.userRoles?.join(', ') || userRole}` 
      });
    }
    
    console.log(`✅ [AUTHORIZE] User has required role via activeRole/userType. Active role: ${userRole}, Required: ${roles.join(' or ')}`);

    next();
  };
};

const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.userType !== 'admin') {
    return res.status(403).json({ 
      message: 'Access denied. Admin privileges required.' 
    });
  }

  next();
};

module.exports = { auth, authorize, adminOnly };
