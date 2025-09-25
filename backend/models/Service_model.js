const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    maxlength: [100, 'Service name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  longDescription: {
    type: String,
    trim: true,
    maxlength: [2000, 'Long description cannot exceed 2000 characters']
  },
  icon: {
    type: String,
    trim: true
  },
  features: [{
    type: String,
    trim: true,
    maxlength: [100, 'Feature cannot exceed 100 characters']
  }],
  pricing: {
    type: String,
    enum: ['fixed', 'hourly', 'project-based', 'negotiable'],
    default: 'negotiable'
  },
  active: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  slug: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true
  }
}, {
  timestamps: true
});

// Create slug before saving
serviceSchema.pre('save', function(next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Create indexes
serviceSchema.index({ active: 1 });
serviceSchema.index({ order: 1 });
serviceSchema.index({ slug: 1 });

module.exports = mongoose.model('Service', serviceSchema);