const mongoose = require('mongoose');
const Contact = require('../models/Contact');
const Project = require('../models/Project_model');
const Service = require('../models/Service_model');
require('dotenv').config();

class DatabaseInitializer {
  constructor() {
    this.dbName = 'mb_construction';
    this.collections = ['contacts', 'projects', 'services'];
  }

  async connect() {
    try {
      const mongoUri = process.env.MONGODB_URI || `mongodb://localhost:27017/${this.dbName}`;
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to MongoDB:', mongoUri);
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
  }

  async createDatabase() {
    try {
      console.log('\n🗄️  Creating database structure...');
      
      // Get database instance
      const db = mongoose.connection.db;
      
      // List existing collections
      const existingCollections = await db.listCollections().toArray();
      const existingNames = existingCollections.map(col => col.name);
      
      console.log('📋 Existing collections:', existingNames.length > 0 ? existingNames : 'None');
      
      // Create collections if they don't exist
      for (const collectionName of this.collections) {
        if (!existingNames.includes(collectionName)) {
          await db.createCollection(collectionName);
          console.log(`✅ Created collection: ${collectionName}`);
        } else {
          console.log(`ℹ️  Collection already exists: ${collectionName}`);
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ Failed to create database structure:', error.message);
      return false;
    }
  }

  async createIndexes() {
    try {
      console.log('\n📊 Creating database indexes...');
      
      // Contact indexes
      await Contact.collection.createIndex({ email: 1 });
      await Contact.collection.createIndex({ service: 1 });
      await Contact.collection.createIndex({ status: 1 });
      await Contact.collection.createIndex({ createdAt: -1 });
      await Contact.collection.createIndex({ priority: 1, status: 1 });
      console.log('✅ Contact indexes created');
      
      // Project indexes
      await Project.collection.createIndex({ category: 1 });
      await Project.collection.createIndex({ featured: 1 });
      await Project.collection.createIndex({ status: 1 });
      await Project.collection.createIndex({ completionDate: -1 });
      console.log('✅ Project indexes created');
      
      // Service indexes
      await Service.collection.createIndex({ active: 1 });
      await Service.collection.createIndex({ order: 1 });
      await Service.collection.createIndex({ slug: 1 }, { unique: true });
      console.log('✅ Service indexes created');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to create indexes:', error.message);
      return false;
    }
  }

  async validateModels() {
    try {
      console.log('\n🔍 Validating data models...');
      
      // Test Contact model
      const testContact = new Contact({
        name: 'Test User',
        email: 'test@example.com',
        service: 'redevelopment',
        message: 'Test message for validation'
      });
      
      const contactValidation = testContact.validateSync();
      if (contactValidation) {
        console.log('❌ Contact model validation failed:', contactValidation.message);
        return false;
      }
      console.log('✅ Contact model validation passed');
      
      // Test Project model
      const testProject = new Project({
        title: 'Test Project',
        description: 'Test project description',
        category: 'redevelopment'
      });
      
      const projectValidation = testProject.validateSync();
      if (projectValidation) {
        console.log('❌ Project model validation failed:', projectValidation.message);
        return false;
      }
      console.log('✅ Project model validation passed');
      
      // Test Service model
      const testService = new Service({
        name: 'Test Service',
        description: 'Test service description'
      });
      
      const serviceValidation = testService.validateSync();
      if (serviceValidation) {
        console.log('❌ Service model validation failed:', serviceValidation.message);
        return false;
      }
      console.log('✅ Service model validation passed');
      
      return true;
    } catch (error) {
      console.error('❌ Model validation failed:', error.message);
      return false;
    }
  }

  async getStats() {
    try {
      console.log('\n📈 Database Statistics:');
      
      const contactCount = await Contact.countDocuments();
      const projectCount = await Project.countDocuments();
      const serviceCount = await Service.countDocuments();
      
      console.log(`📞 Contacts: ${contactCount}`);
      console.log(`🏗️  Projects: ${projectCount}`);
      console.log(`🔧 Services: ${serviceCount}`);
      
      // Contact status breakdown
      if (contactCount > 0) {
        const statusBreakdown = await Contact.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]);
        
        console.log('\n📊 Contact Status Breakdown:');
        statusBreakdown.forEach(item => {
          console.log(`   ${item._id}: ${item.count}`);
        });
      }
      
      // Service breakdown
      if (contactCount > 0) {
        const serviceBreakdown = await Contact.aggregate([
          { $group: { _id: '$service', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]);
        
        console.log('\n🔧 Service Request Breakdown:');
        serviceBreakdown.forEach(item => {
          console.log(`   ${item._id}: ${item.count}`);
        });
      }
      
      return true;
    } catch (error) {
      console.error('❌ Failed to get statistics:', error.message);
      return false;
    }
  }

  async testCRUD() {
    try {
      console.log('\n🧪 Testing CRUD operations...');
      
      // Test Contact CRUD
      const testContact = new Contact({
        name: 'CRUD Test User',
        email: 'crud.test@example.com',
        service: 'consultation',
        message: 'This is a CRUD test message'
      });
      
      // Create
      const savedContact = await testContact.save();
      console.log('✅ Contact CREATE operation successful');
      
      // Read
      const foundContact = await Contact.findById(savedContact._id);
      if (!foundContact) throw new Error('Contact not found');
      console.log('✅ Contact READ operation successful');
      
      // Update
      foundContact.status = 'contacted';
      await foundContact.save();
      console.log('✅ Contact UPDATE operation successful');
      
      // Delete
      await Contact.findByIdAndDelete(savedContact._id);
      console.log('✅ Contact DELETE operation successful');
      
      return true;
    } catch (error) {
      console.error('❌ CRUD test failed:', error.message);
      return false;
    }
  }

  async initialize() {
    console.log('🚀 Initializing MB Construction Database...\n');
    
    // Step 1: Connect to database
    const connected = await this.connect();
    if (!connected) return false;
    
    // Step 2: Create database structure
    const dbCreated = await this.createDatabase();
    if (!dbCreated) return false;
    
    // Step 3: Create indexes
    const indexesCreated = await this.createIndexes();
    if (!indexesCreated) return false;
    
    // Step 4: Validate models
    const modelsValid = await this.validateModels();
    if (!modelsValid) return false;
    
    // Step 5: Test CRUD operations
    const crudTest = await this.testCRUD();
    if (!crudTest) return false;
    
    // Step 6: Show statistics
    await this.getStats();
    
    console.log('\n🎉 Database initialization completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Run: node utils/database_seeder.js (to add sample data)');
    console.log('2. Start the server: npm run dev');
    console.log('3. Test API: http://localhost:3000/health');
    
    return true;
  }

  async cleanup() {
    try {
      await mongoose.connection.close();
      console.log('✅ Database connection closed');
    } catch (error) {
      console.error('❌ Error closing database connection:', error.message);
    }
  }
}

// Run initialization if called directly
if (require.main === module) {
  const initializer = new DatabaseInitializer();
  
  initializer.initialize()
    .then(success => {
      if (success) {
        console.log('\n✅ Database setup completed successfully!');
      } else {
        console.log('\n❌ Database setup failed!');
      }
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('\n❌ Unexpected error:', error);
      process.exit(1);
    })
    .finally(() => {
      initializer.cleanup();
    });
}

module.exports = DatabaseInitializer;