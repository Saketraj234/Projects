const User = require('../models/User');
const storage = require('../utils/storage');

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

    if (storage.isUsingInMemory) {
      // Check if user exists in in-memory storage
      const user = storage.users.find(u => u._id === userId);
      
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

      return next();
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
