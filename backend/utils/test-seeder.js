const mongoose = require('mongoose');
const Admin = require('../models/Admin');

async function seedTestAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Test admin already exists');
      return;
    }

    // Create test admin
    const passwordHash = await Admin.hashPassword('admin123');
    await Admin.create({
      username: 'admin',
      email: 'admin@test.com',
      passwordHash
    });
    
    console.log('Test admin created successfully');
  } catch (error) {
    console.error('Error seeding test admin:', error);
  }
}

module.exports = { seedTestAdmin };