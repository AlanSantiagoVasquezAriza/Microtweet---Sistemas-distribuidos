// ========================================
// api-gateway/src/middleware/auth.js
// ========================================
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please provide a valid token'
      });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.userId = decoded.userId;
      
      // Pass userId to downstream services via header
      req.headers['x-user-id'] = decoded.userId.toString();
      
      next();
    } catch (jwtError) {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'Token expired or malformed'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication error' });
  }
};

// Optional auth - doesn't fail if no token
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        req.headers['x-user-id'] = decoded.userId.toString();
      } catch (error) {
        // Token invalid but continue anyway
        console.log('Invalid token in optional auth, continuing...');
      }
    }
    
    next();
  } catch (error) {
    // Just continue without auth
    next();
  }
};

module.exports = { authMiddleware, optionalAuth };