// MB Construction - Quick Data Viewer
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mb_construction')
  .then(() => {
    console.log('🔗 Connected to MongoDB');
    viewAllData();
  })
  .catch(err => {
    console.log('❌ Connection failed:', err.message);
    console.log('💡 Make sure MongoDB is running: net start MongoDB');
    process.exit(1);
  });

async function viewAllData() {
  try {
    console.log('\n📊 MB Construction - Saved Data Overview');
    console.log('==========================================\n');

    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('📭 No collections found. Database might be empty.');
      console.log('💡 Try submitting a contact form on your website first.');
      return;
    }

    for (const collection of collections) {
      const collectionName = collection.name;
      const count = await mongoose.connection.db.collection(collectionName).countDocuments();
      
      console.log(`📁 Collection: ${collectionName}`);
      console.log(`📊 Total Records: ${count}`);
      
      if (count > 0) {
        const sampleData = await mongoose.connection.db.collection(collectionName).findOne();
        console.log('📋 Sample Record:');
        console.log(JSON.stringify(sampleData, null, 2));
      }
      console.log('─'.repeat(50));
    }

    // Detailed contact data if exists
    const contacts = await mongoose.connection.db.collection('contacts').find().toArray();
    if (contacts.length > 0) {
      console.log('\n📧 CONTACT FORM SUBMISSIONS:');
      console.log('============================');
      contacts.forEach((contact, index) => {
        console.log(`\n${index + 1}. Contact Submission:`);
        console.log(`   Name: ${contact.name}`);
        console.log(`   Email: ${contact.email}`);
        console.log(`   Phone: ${contact.phone || 'Not provided'}`);
        console.log(`   Company: ${contact.company || 'Not provided'}`);
        console.log(`   Service: ${contact.service || 'Not specified'}`);
        console.log(`   Message: ${contact.message}`);
        console.log(`   Budget: ${contact.projectBudget || 'Not specified'}`);
        console.log(`   Timeline: ${contact.projectTimeline || 'Not specified'}`);
        console.log(`   Location: ${contact.projectLocation || 'Not specified'}`);
        console.log(`   Submitted: ${contact.createdAt || contact.submittedAt || 'Unknown'}`);
        console.log('   ' + '─'.repeat(40));
      });
    } else {
      console.log('\n📭 No contact form submissions found.');
      console.log('💡 Submit a contact form on http://localhost:8080 to see data here.');
    }

    // Detailed project data if exists
    const projects = await mongoose.connection.db.collection('projects').find().toArray();
    if (projects.length > 0) {
      console.log('\n🏗️ PROJECTS DATA:');
      console.log('=================');
      projects.forEach((project, index) => {
        console.log(`\n${index + 1}. Project:`);
        console.log(`   Title: ${project.title || project.name}`);
        console.log(`   Description: ${project.description}`);
        console.log(`   Category: ${project.category || 'Not specified'}`);
        console.log(`   Status: ${project.status || 'Active'}`);
        console.log(`   Featured: ${project.featured ? 'Yes' : 'No'}`);
        console.log(`   Created: ${project.createdAt || 'Unknown'}`);
        console.log('   ' + '─'.repeat(40));
      });
    } else {
      console.log('\n📭 No projects found.');
      console.log('💡 Run "npm run db:seed" to add sample projects.');
    }

    // Summary
    console.log('\n📈 DATA SUMMARY:');
    console.log('================');
    console.log(`📧 Total Contacts: ${contacts.length}`);
    console.log(`🏗️ Total Projects: ${projects.length}`);
    console.log(`📁 Total Collections: ${collections.length}`);

  } catch (error) {
    console.log('❌ Error viewing data:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}