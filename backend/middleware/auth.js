const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    console.log('No token provided in request');
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_for_development');
    console.log('Token verified successfully:', { userId: decoded.id, role: decoded.role });
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', {
      message: error.message,
      token: token.substring(0, 10) + '...',
      headers: req.headers
    });
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired. Please login again.' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token. Please login again.' });
    }
    
    res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Requires Admin role' });
  }
  next();
};

const isTrainer = (req, res, next) => {
  if (req.user.role !== 'Trainer' && req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Requires Trainer or Admin role' });
  }
  next();
};

module.exports = { authenticateToken, isAdmin, isTrainer };