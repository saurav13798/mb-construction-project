const mongoose = require('mongoose');
const Project = require('../models/Project_model');
const Service = require('../models/Service_model');
const Contact = require('../models/Contact');
require('dotenv').config();

// Sample projects data
const sampleProjects = [
  {
    title: 'Residential Complex Redevelopment',
    description: 'Complete redevelopment of a 50-unit residential complex with modern amenities and sustainable design features.',
    category: 'redevelopment',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&h=300&fit=crop',
        alt: 'Modern residential complex',
        caption: 'Completed residential complex with modern architecture'
      }
    ],
    location: 'Mumbai, Maharashtra',
    clientName: 'Skyline Developers',
    projectValue: 15000000,
    startDate: new Date('2023-01-15'),
    completionDate: new Date('2024-03-20'),
    status: 'completed',
    featured: true,
    tags: ['residential', 'modern', 'sustainable'],
    teamSize: 25,
    challenges: 'Working within existing infrastructure while maintaining resident comfort',
    solutions: 'Phased construction approach with temporary accommodation arrangements'
  },
  {
    title: 'Highway Maintenance Project',
    description: 'Government contract for comprehensive maintenance and upgrades of 25km highway section including road surface, drainage, and signage.',
    category: 'maintenance',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=500&h=300&fit=crop',
        alt: 'Highway construction',
        caption: 'Highway maintenance and upgrade project'
      }
    ],
    location: 'Pune-Mumbai Highway',
    clientName: 'Maharashtra State Road Development Corporation',
    projectValue: 8500000,
    startDate: new Date('2023-06-01'),
    completionDate: new Date('2023-11-30'),
    status: 'completed',
    featured: true,
    tags: ['government', 'infrastructure', 'highway'],
    teamSize: 35,
    challenges: 'Maintaining traffic flow during construction hours',
    solutions: 'Night-shift work schedule and efficient traffic management systems'
  },
  {
    title: 'Commercial Office Building',
    description: '12-story modern office building with advanced infrastructure, HVAC systems, and smart building technologies.',
    category: 'redevelopment',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&h=300&fit=crop',
        alt: 'Modern office building',
        caption: 'State-of-the-art commercial office complex'
      }
    ],
    location: 'Bandra-Kurla Complex, Mumbai',
    clientName: 'Corporate Spaces Ltd.',
    projectValue: 45000000,
    startDate: new Date('2022-09-01'),
    completionDate: new Date('2024-06-15'),
    status: 'completed',
    featured: false,
    tags: ['commercial', 'high-rise', 'modern'],
    teamSize: 60,
    challenges: 'Complex MEP installations and coordination with multiple stakeholders',
    solutions: 'Advanced project management software and regular coordination meetings'
  },
  {
    title: 'Bridge Construction Project',
    description: 'Construction of steel and concrete bridge over river crossing, including approach roads and safety features.',
    category: 'infrastructure',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&h=300&fit=crop',
        alt: 'Bridge construction',
        caption: 'Modern bridge construction with advanced engineering'
      }
    ],
    location: 'Nashik, Maharashtra',
    clientName: 'Public Works Department',
    projectValue: 12000000,
    startDate: new Date('2023-03-01'),
    completionDate: new Date('2024-01-15'),
    status: 'completed',
    featured: true,
    tags: ['infrastructure', 'bridge', 'government'],
    teamSize: 40,
    challenges: 'Working over water body and managing environmental concerns',
    solutions: 'Specialized equipment and environmental compliance measures'
  }
];

// Sample services data
const sampleServices = [
  {
    name: 'Building Redevelopment',
    description: 'Comprehensive residential and commercial redevelopment projects with modern design and quality construction.',
    longDescription: 'Our redevelopment services include complete building transformation, structural improvements, modern amenities installation, and compliance with current building codes. We specialize in both residential and commercial projects, ensuring minimal disruption to occupants.',
    icon: '🏗️',
    features: [
      'Residential Redevelopment',
      'Commercial Buildings',
      'Modern Design Integration',
      'Quality Materials & Construction',
      'Building Code Compliance'
    ],
    pricing: 'project-based',
    active: true,
    order: 1
  },
  {
    name: 'Government Contract Services',
    description: 'Reliable maintenance services for government infrastructure projects with full compliance and quality assurance.',
    longDescription: 'We handle government contracts for road maintenance, building maintenance, and infrastructure development. Our team ensures full regulatory compliance, quality standards, and timely project completion.',
    icon: '🛣️',
    features: [
      'Road Maintenance & Upgrades',
      'Government Building Maintenance',
      'Infrastructure Development',
      'Regulatory Compliance',
      'Quality Assurance Programs'
    ],
    pricing: 'project-based',
    active: true,
    order: 2
  },
  {
    name: 'Manpower Supply',
    description: 'Skilled workforce supply from engineers to laborers for construction projects of all scales.',
    longDescription: 'We provide qualified manpower for construction projects including civil engineers, architects, project managers, skilled workers, and laborers. All personnel are trained and experienced in their respective fields.',
    icon: '👷',
    features: [
      'Qualified Engineers & Architects',
      'Skilled Construction Workers',
      'Project Management Staff',
      'Quality Control Inspectors',
      '24/7 Support & Coordination'
    ],
    pricing: 'hourly',
    active: true,
    order: 3
  }
];

// Sample contacts data
const sampleContacts = [
  {
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@example.com',
    phone: '+919876543210',
    company: 'Kumar Enterprises',
    service: 'redevelopment',
    message: 'Looking for residential building redevelopment in Pune. Need modern design with 20 units. Timeline is flexible but prefer to start within 3 months.',
    projectBudget: '10-50-lakh',
    projectTimeline: '3-months',
    projectLocation: 'Pune, Maharashtra',
    status: 'new',
    priority: 'medium',
    source: 'website'
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@gmail.com',
    phone: '+918765432109',
    service: 'manpower',
    message: 'Need skilled construction workers for our upcoming project in Mumbai. Require 50 workers including masons, electricians, and general laborers.',
    projectBudget: '5-10-lakh',
    projectTimeline: '1-month',
    projectLocation: 'Mumbai, Maharashtra',
    status: 'contacted',
    priority: 'high',
    source: 'website',
    internalNotes: [{
      note: 'Called client, very interested. Scheduled site visit for next week.',
      addedBy: 'Sales Team',
      addedAt: new Date()
    }]
  },
  {
    name: 'Municipal Corporation Officer',
    email: 'projects@municipal.gov.in',
    phone: '+917654321098',
    company: 'Mumbai Municipal Corporation',
    service: 'government-contract',
    message: 'Road maintenance contract for 15km stretch in Andheri area. Includes pothole filling, road marking, and drainage maintenance.',
    projectBudget: '50-lakh-plus',
    projectTimeline: '6-months',
    projectLocation: 'Andheri, Mumbai',
    status: 'in-progress',
    priority: 'high',
    source: 'website',
    assignedTo: 'Government Relations Team',
    followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  },
  {
    name: 'Amit Patel',
    email: 'amit.patel@techcorp.com',
    phone: '+916543210987',
    company: 'TechCorp Solutions',
    service: 'consultation',
    message: 'Need consultation for office space renovation. Looking for modern design ideas and cost estimation.',
    projectBudget: '1-5-lakh',
    projectTimeline: 'flexible',
    projectLocation: 'Bangalore, Karnataka',
    status: 'quoted',
    priority: 'low',
    source: 'website'
  },
  {
    name: 'Sunita Desai',
    email: 'sunita.desai@gmail.com',
    phone: '+915432109876',
    service: 'redevelopment',
    message: 'Family home redevelopment project. 3-story building needs complete renovation with modern amenities.',
    projectBudget: '10-50-lakh',
    projectTimeline: '1-year',
    projectLocation: 'Nashik, Maharashtra',
    status: 'closed',
    priority: 'medium',
    source: 'referral',
    internalNotes: [
      {
        note: 'Project completed successfully. Client very satisfied.',
        addedBy: 'Project Manager',
        addedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      },
      {
        note: 'Client referred 2 new customers.',
        addedBy: 'Sales Team',
        addedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
      }
    ]
  }
];

class DatabaseSeeder {
  async connect() {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mb_construction');
      console.log('Connected to MongoDB for seeding');
    } catch (error) {
      console.error('Database connection failed:', error);
      process.exit(1);
    }
  }

  async seedProjects() {
    try {
      console.log('Seeding projects...');

      // Clear existing projects
      await Project.deleteMany({});

      // Insert sample projects
      await Project.insertMany(sampleProjects);

      console.log(`✅ ${sampleProjects.length} projects seeded successfully`);
    } catch (error) {
      console.error('Error seeding projects:', error);
    }
  }

  async seedServices() {
    try {
      console.log('Seeding services...');

      // Clear existing services
      await Service.deleteMany({});

      // Insert sample services one by one to handle slug generation
      for (const serviceData of sampleServices) {
        const service = new Service(serviceData);
        await service.save();
      }

      console.log(`✅ ${sampleServices.length} services seeded successfully`);
    } catch (error) {
      console.error('Error seeding services:', error);
    }
  }

  async seedContacts() {
    try {
      console.log('Seeding contacts...');

      // Clear existing contacts
      await Contact.deleteMany({});

      // Insert sample contacts
      await Contact.insertMany(sampleContacts);

      console.log(`✅ ${sampleContacts.length} contacts seeded successfully`);
      
      // Display statistics
      const stats = await Contact.getInquiryStats();
      console.log('📊 Contact Statistics:', stats[0]);
      
      const serviceBreakdown = await Contact.getServiceBreakdown();
      console.log('🔧 Service Breakdown:', serviceBreakdown);
    } catch (error) {
      console.error('Error seeding contacts:', error);
    }
  }

  async run() {
    await this.connect();
    await this.seedProjects();
    await this.seedServices();
    await this.seedContacts();

    console.log('\n🎉 Database seeding completed!');
    console.log('\n📋 Summary:');
    console.log(`- ${sampleProjects.length} projects`);
    console.log(`- ${sampleServices.length} services`);
    console.log(`- ${sampleContacts.length} contacts`);
    
    process.exit(0);
  }
}

// Run seeder if called directly
if (require.main === module) {
  const seeder = new DatabaseSeeder();
  seeder.run();
}

module.exports = DatabaseSeeder;