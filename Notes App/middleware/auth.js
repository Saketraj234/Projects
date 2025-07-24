const User = require('../models/User');

// Middleware to protect routes
exports.protect = async (req, res, next) => {
  try {
    // Check if user ID is in the request
    const userId = req.header('x-auth-user');
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Set user in request
    req.user = {
      id: user._id
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};