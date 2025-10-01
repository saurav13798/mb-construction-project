const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters'],
    index: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    index: true
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[\d\s\-\(\)\.]{7,20}$/, 'Please provide a valid phone number']
  },
  company: {
    type: String,
    trim: true,
    maxlength: [200, 'Company name cannot exceed 200 characters']
  },
  
  // Service Information
  service: {
    type: String,
    required: [true, 'Service selection is required'],
    enum: {
      values: ['redevelopment', 'government-contract', 'manpower', 'consultation', 'other'],
      message: 'Please select a valid service type'
    },
    index: true
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    minlength: [10, 'Message must be at least 10 characters'],
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  
  // Inquiry Management
  status: {
    type: String,
    enum: ['new', 'contacted', 'in-progress', 'quoted', 'closed', 'cancelled'],
    default: 'new',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  source: {
    type: String,
    enum: ['website', 'referral', 'social-media', 'advertisement', 'other'],
    default: 'website'
  },
  
  // Project Details
  projectBudget: {
    type: String,
    enum: ['under-1-lakh', '1-5-lakh', '5-10-lakh', '10-50-lakh', '50-lakh-plus', 'not-specified'],
    default: 'not-specified'
  },
  projectTimeline: {
    type: String,
    enum: ['immediate', '1-month', '3-months', '6-months', '1-year', 'flexible'],
    default: 'flexible'
  },
  projectLocation: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  
  // Internal Notes
  internalNotes: [{
    note: {
      type: String,
      required: true,
      maxlength: [500, 'Note cannot exceed 500 characters']
    },
    addedBy: {
      type: String,
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Follow-up Information
  followUpDate: {
    type: Date
  },
  assignedTo: {
    type: String,
    trim: true
  },
  
  // Metadata
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  referrer: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
contactSchema.index({ createdAt: -1 });
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ service: 1, status: 1 });
contactSchema.index({ email: 1, createdAt: -1 });

// Virtual for full contact info
contactSchema.virtual('fullContactInfo').get(function() {
  return `${this.name} (${this.email})${this.company ? ` - ${this.company}` : ''}`;
});

// Virtual for days since inquiry
contactSchema.virtual('daysSinceInquiry').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to set priority based on service type
contactSchema.pre('save', function(next) {
  if (this.isNew) {
    // Set higher priority for government contracts and large projects
    if (this.service === 'government-contract') {
      this.priority = 'high';
    } else if (this.projectBudget === '50-lakh-plus') {
      this.priority = 'high';
    } else if (this.service === 'consultation') {
      this.priority = 'medium';
    }
  }
  next();
});

// Static method to get inquiry statistics
contactSchema.statics.getInquiryStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalInquiries: { $sum: 1 },
        newInquiries: {
          $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] }
        },
        inProgressInquiries: {
          $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
        },
        closedInquiries: {
          $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] }
        }
      }
    }
  ]);
};

// Static method to get service-wise breakdown
contactSchema.statics.getServiceBreakdown = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$service',
        count: { $sum: 1 },
        avgResponseTime: { $avg: '$daysSinceInquiry' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

module.exports = mongoose.model('Contact', contactSchema);
// Note: getServiceBreakdown is defined above; removed duplicate definition
