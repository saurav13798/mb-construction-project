const jwt = require('jsonwebtoken');

// Admin login is handled by controller using DB-backed Admin model

function verifyAdminToken(req, res, next) {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error('No token provided');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') throw new Error('Unauthorized');
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Unauthorized access' });
  }
}

module.exports = { verifyAdminToken };
