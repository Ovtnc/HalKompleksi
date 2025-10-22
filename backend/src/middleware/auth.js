const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check both activeRole (for multi-role users) and userType (for single-role users)
    const userRole = req.user.activeRole || req.user.userType;
    
    // Also check if user has the required role in their userRoles array
    const hasRole = roles.includes(userRole) || 
                    (req.user.userRoles && req.user.userRoles.some(role => roles.includes(role)));

    if (!hasRole) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${roles.join(' or ')}. Current role: ${userRole}` 
      });
    }

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
