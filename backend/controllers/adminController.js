const Admin = require('../models/Admin');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { username, email, password, registrationCode } = req.body;
    if (!process.env.ADMIN_REGISTRATION_CODE || registrationCode !== process.env.ADMIN_REGISTRATION_CODE) {
      return res.status(403).json({ success: false, message: 'Invalid registration code' });
    }

    const existing = await Admin.findOne({ username });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Username already taken' });
    }

    const passwordHash = await Admin.hashPassword(password);
    const admin = await Admin.create({ username, email, passwordHash });

    return res.status(201).json({ success: true, data: { id: admin._id, username: admin.username } });
  } catch (err) {
    console.error('Admin registration error:', err);
    console.error('Registration error details:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      requestBody: { ...req.body, password: '[REDACTED]' }
    });
    return res.status(500).json({ success: false, message: 'Failed to register admin', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const ok = await admin.verifyPassword(password);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ role: 'admin', sub: admin._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });
    return res.json({ success: true, token });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ success: false, message: 'Failed to login' });
  }
};


