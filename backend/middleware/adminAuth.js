const jwt = require('jsonwebtoken');

const adminUsername = 'admin';
const adminPassword = 'admin123';

function adminLogin(req, res) {
  const { username, password } = req.body;
  if (username === adminUsername && password === adminPassword) {
    const token = jwt.sign({ role: 'admin' }, process.env.JWTSECRET, { expiresIn: '1d' });
    return res.json({ success: true, token });
  }
  return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
}

function verifyAdminToken(req, res, next) {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error('No token provided');
    const decoded = jwt.verify(token, process.env.JWTSECRET);
    if (decoded.role !== 'admin') throw new Error('Unauthorized');
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Unauthorized access' });
  }
}

module.exports = { adminLogin, verifyAdminToken };
