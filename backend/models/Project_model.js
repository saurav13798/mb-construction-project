const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Project category is required'],
    enum: {
      values: ['redevelopment', 'maintenance', 'manpower', 'infrastructure'],
      message: 'Category must be one of: redevelopment, maintenance, manpower, infrastructure'
    }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    caption: {
      type: String,
      default: ''
    }
  }],
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  clientName: {
    type: String,
    trim: true,
    maxlength: [100, 'Client name cannot exceed 100 characters']
  },
  projectValue: {
    type: Number,
    min: 0
  },
  startDate: {
    type: Date
  },
  completionDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'completed', 'on-hold'],
    default: 'completed'
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  teamSize: {
    type: Number,
    min: 1
  },
  challenges: {
    type: String,
    trim: true
  },
  solutions: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Create indexes
projectSchema.index({ category: 1 });
projectSchema.index({ featured: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ completionDate: -1 });
projectSchema.index({ createdAt: -1 });

// Virtual for project duration
projectSchema.virtual('duration').get(function() {
  if (this.startDate && this.completionDate) {
    const diffTime = Math.abs(this.completionDate - this.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return null;
});

// Virtual for formatted dates
projectSchema.virtual('formattedStartDate').get(function() {
  return this.startDate ? this.startDate.toLocaleDateString('en-IN') : '';
});

projectSchema.virtual('formattedCompletionDate').get(function() {
  return this.completionDate ? this.completionDate.toLocaleDateString('en-IN') : '';
});

// Ensure virtual fields are serialized
projectSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Project', projectSchema);