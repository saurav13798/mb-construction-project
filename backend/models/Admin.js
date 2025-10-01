const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
    unique: true,
    index: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    index: true
  },
  passwordHash: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

adminSchema.methods.verifyPassword = function(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

adminSchema.statics.hashPassword = async function(plain) {
  const rounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 10;
  return bcrypt.hash(plain, rounds);
};

module.exports = mongoose.model('Admin', adminSchema);


