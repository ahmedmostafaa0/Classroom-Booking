
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes
exports.protect = async (req, res, next) => {
  let token;
  
  // Check if authorization header exists and starts with 'Bearer'
  if (
    req.headers.authorization && 
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  // Check if token exists
  if (!token) {
    return res.status(401).json({
      message: 'Not authorized to access this route'
    });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret-key');
    
    // Find user by id
    const user = await User.findById(decoded.id);
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({
        message: 'User not found'
      });
    }
    
    // Add user to request
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      message: 'Not authorized to access this route'
    });
  }
};

// Middleware to check user role
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};
