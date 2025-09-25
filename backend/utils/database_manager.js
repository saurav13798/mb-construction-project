const mongoose = require('mongoose');
const Contact = require('../models/Contact');
const Project = require('../models/Project_model');
const Service = require('../models/Service_model');
require('dotenv').config();

class DatabaseManager {
  constructor() {
    this.dbName = 'mb_construction';
  }

  async connect() {
    try {
      const mongoUri = process.env.MONGODB_URI || `mongodb://localhost:27017/${this.dbName}`;
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to MongoDB');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
  }

  async backup() {
    try {
      console.log('📦 Creating database backup...');
      
      const contacts = await Contact.find({}).lean();
      const projects = await Project.find({}).lean();
      const services = await Service.find({}).lean();
      
      const backup = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        data: {
          contacts,
          projects,
          services
        },
        stats: {
          contactCount: contacts.length,
          projectCount: projects.length,
          serviceCount: services.length
        }
      };
      
      const fs = require('fs');
      const path = require('path');
      const backupDir = path.join(__dirname, '../backups');
      
      // Create backups directory if it doesn't exist
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      const filename = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      const filepath = path.join(backupDir, filename);
      
      fs.writeFileSync(filepath, JSON.stringify(backup, null, 2));
      
      console.log(`✅ Backup created: ${filename}`);
      console.log(`📊 Backed up: ${backup.stats.contactCount} contacts, ${backup.stats.projectCount} projects, ${backup.stats.serviceCount} services`);
      
      return filepath;
    } catch (error) {
      console.error('❌ Backup failed:', error.message);
      return false;
    }
  }

  async restore(backupFile) {
    try {
      console.log(`📥 Restoring from backup: ${backupFile}`);
      
      const fs = require('fs');
      const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
      
      // Clear existing data
      await Contact.deleteMany({});
      await Project.deleteMany({});
      await Service.deleteMany({});
      
      // Restore data
      if (backupData.data.contacts.length > 0) {
        await Contact.insertMany(backupData.data.contacts);
      }
      
      if (backupData.data.projects.length > 0) {
        await Project.insertMany(backupData.data.projects);
      }
      
      if (backupData.data.services.length > 0) {
        await Service.insertMany(backupData.data.services);
      }
      
      console.log(`✅ Restore completed`);
      console.log(`📊 Restored: ${backupData.stats.contactCount} contacts, ${backupData.stats.projectCount} projects, ${backupData.stats.serviceCount} services`);
      
      return true;
    } catch (error) {
      console.error('❌ Restore failed:', error.message);
      return false;
    }
  }

  async reset() {
    try {
      console.log('🗑️  Resetting database...');
      
      await Contact.deleteMany({});
      await Project.deleteMany({});
      await Service.deleteMany({});
      
      console.log('✅ Database reset completed');
      return true;
    } catch (error) {
      console.error('❌ Database reset failed:', error.message);
      return false;
    }
  }

  async optimize() {
    try {
      console.log('⚡ Optimizing database...');
      
      // Rebuild indexes
      await Contact.collection.reIndex();
      await Project.collection.reIndex();
      await Service.collection.reIndex();
      
      console.log('✅ Database optimization completed');
      return true;
    } catch (error) {
      console.error('❌ Database optimization failed:', error.message);
      return false;
    }
  }

  async validate() {
    try {
      console.log('🔍 Validating database integrity...');
      
      let issues = [];
      
      // Check for duplicate emails in contacts
      const duplicateEmails = await Contact.aggregate([
        { $group: { _id: '$email', count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } }
      ]);
      
      if (duplicateEmails.length > 0) {
        issues.push(`Found ${duplicateEmails.length} duplicate email addresses in contacts`);
      }
      
      // Check for invalid service references
      const validServices = ['redevelopment', 'government-contract', 'manpower', 'consultation', 'other'];
      const invalidServices = await Contact.find({ service: { $nin: validServices } });
      
      if (invalidServices.length > 0) {
        issues.push(`Found ${invalidServices.length} contacts with invalid service types`);
      }
      
      // Check for projects without required fields
      const incompleteProjects = await Project.find({
        $or: [
          { title: { $exists: false } },
          { description: { $exists: false } },
          { category: { $exists: false } }
        ]
      });
      
      if (incompleteProjects.length > 0) {
        issues.push(`Found ${incompleteProjects.length} projects with missing required fields`);
      }
      
      if (issues.length === 0) {
        console.log('✅ Database validation passed - no issues found');
      } else {
        console.log('⚠️  Database validation found issues:');
        issues.forEach(issue => console.log(`   - ${issue}`));
      }
      
      return issues.length === 0;
    } catch (error) {
      console.error('❌ Database validation failed:', error.message);
      return false;
    }
  }

  async getDetailedStats() {
    try {
      console.log('📊 Generating detailed statistics...\n');
      
      // Contact statistics
      const totalContacts = await Contact.countDocuments();
      const contactsByStatus = await Contact.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      const contactsByService = await Contact.aggregate([
        { $group: { _id: '$service', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      const contactsByPriority = await Contact.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      // Project statistics
      const totalProjects = await Project.countDocuments();
      const projectsByCategory = await Project.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      const projectsByStatus = await Project.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      // Service statistics
      const totalServices = await Service.countDocuments();
      const activeServices = await Service.countDocuments({ active: true });
      
      // Recent activity
      const recentContacts = await Contact.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      });
      
      // Display results
      console.log('📞 CONTACT STATISTICS:');
      console.log(`   Total Contacts: ${totalContacts}`);
      console.log(`   Recent (7 days): ${recentContacts}`);
      
      console.log('\n   By Status:');
      contactsByStatus.forEach(item => {
        console.log(`     ${item._id}: ${item.count}`);
      });
      
      console.log('\n   By Service:');
      contactsByService.forEach(item => {
        console.log(`     ${item._id}: ${item.count}`);
      });
      
      console.log('\n   By Priority:');
      contactsByPriority.forEach(item => {
        console.log(`     ${item._id}: ${item.count}`);
      });
      
      console.log('\n🏗️  PROJECT STATISTICS:');
      console.log(`   Total Projects: ${totalProjects}`);
      
      console.log('\n   By Category:');
      projectsByCategory.forEach(item => {
        console.log(`     ${item._id}: ${item.count}`);
      });
      
      console.log('\n   By Status:');
      projectsByStatus.forEach(item => {
        console.log(`     ${item._id}: ${item.count}`);
      });
      
      console.log('\n🔧 SERVICE STATISTICS:');
      console.log(`   Total Services: ${totalServices}`);
      console.log(`   Active Services: ${activeServices}`);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to generate statistics:', error.message);
      return false;
    }
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

// Command line interface
if (require.main === module) {
  const manager = new DatabaseManager();
  const command = process.argv[2];
  
  const commands = {
    backup: () => manager.backup(),
    reset: () => manager.reset(),
    optimize: () => manager.optimize(),
    validate: () => manager.validate(),
    stats: () => manager.getDetailedStats(),
    restore: () => {
      const backupFile = process.argv[3];
      if (!backupFile) {
        console.error('❌ Please provide backup file path');
        return false;
      }
      return manager.restore(backupFile);
    }
  };
  
  if (!command || !commands[command]) {
    console.log('📋 Available commands:');
    console.log('   backup  - Create database backup');
    console.log('   restore <file> - Restore from backup');
    console.log('   reset   - Clear all data');
    console.log('   optimize - Rebuild indexes');
    console.log('   validate - Check data integrity');
    console.log('   stats   - Show detailed statistics');
    console.log('\nUsage: node database_manager.js <command>');
    process.exit(1);
  }
  
  manager.connect()
    .then(() => commands[command]())
    .then(success => {
      if (success !== false) {
        console.log('\n✅ Operation completed successfully!');
      } else {
        console.log('\n❌ Operation failed!');
      }
      process.exit(success !== false ? 0 : 1);
    })
    .catch(error => {
      console.error('\n❌ Unexpected error:', error);
      process.exit(1);
    })
    .finally(() => {
      manager.cleanup();
    });
}

module.exports = DatabaseManager;