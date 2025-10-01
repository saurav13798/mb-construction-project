const mongoose = require('mongoose');
require('dotenv').config();

async function setupDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    // Try to connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mb_construction';
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connected to MongoDB successfully');
    
    // Test database operations
    const db = mongoose.connection.db;
    
    // List existing collections
    const collections = await db.listCollections().toArray();
    console.log('📋 Existing collections:', collections.map(c => c.name));
    
    // Create a test document
    const testCollection = db.collection('test');
    await testCollection.insertOne({ test: true, timestamp: new Date() });
    console.log('✅ Test document created successfully');
    
    // Clean up test document
    await testCollection.deleteOne({ test: true });
    console.log('✅ Test document cleaned up');
    
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 MongoDB is not running. Please:');
      console.error('1. Install MongoDB Community Server');
      console.error('2. Start MongoDB service');
      console.error('3. Or use MongoDB Atlas (cloud)');
      console.error('4. See MONGODB_SETUP.md for detailed instructions');
    }
    
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

setupDatabase();