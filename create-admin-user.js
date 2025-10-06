// Create Admin User Script
// Run this with: node create-admin-user.js

const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

// Admin model (simplified version)
const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String },
    passwordHash: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

adminSchema.statics.hashPassword = async function(password) {
    return await bcryptjs.hash(password, 12);
};

adminSchema.methods.verifyPassword = async function(password) {
    return await bcryptjs.compare(password, this.passwordHash);
};

const Admin = mongoose.model('Admin', adminSchema);

async function createAdminUser() {
    try {
        console.log('🔍 Connecting to MongoDB...');
        await mongoose.connect('mongodb://localhost:27017/mb_construction');
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username: 'admin' });
        if (existingAdmin) {
            console.log('⚠️ Admin user already exists');
            console.log('   Username: admin');
            console.log('   Created: ' + existingAdmin.createdAt);
            
            // Test the password
            const testPassword = await existingAdmin.verifyPassword('admin123');
            if (testPassword) {
                console.log('✅ Default password (admin123) is working');
            } else {
                console.log('❌ Default password (admin123) is not working');
                console.log('💡 Try resetting the password or use a different password');
            }
        } else {
            console.log('📝 Creating new admin user...');
            
            const passwordHash = await Admin.hashPassword('admin123');
            const admin = new Admin({
                username: 'admin',
                email: 'admin@mbconstruction.com',
                passwordHash: passwordHash
            });
            
            await admin.save();
            console.log('✅ Admin user created successfully!');
            console.log('   Username: admin');
            console.log('   Password: admin123');
            console.log('   Email: admin@mbconstruction.com');
        }

        // List all admin users
        const allAdmins = await Admin.find({}, 'username email createdAt');
        console.log('\n📋 All Admin Users:');
        allAdmins.forEach((admin, index) => {
            console.log(`   ${index + 1}. ${admin.username} (${admin.email || 'no email'}) - Created: ${admin.createdAt.toLocaleDateString()}`);
        });

        console.log('\n🎯 Login Instructions:');
        console.log('1. Go to: http://localhost:8080/admin.html');
        console.log('2. Username: admin');
        console.log('3. Password: admin123');
        console.log('4. Make sure backend server is running on port 3000');

    } catch (error) {
        console.error('❌ Error:', error.message);
        
        if (error.message.includes('ECONNREFUSED')) {
            console.log('\n💡 MongoDB Connection Failed:');
            console.log('1. Make sure MongoDB is installed and running');
            console.log('2. Start MongoDB service: net start MongoDB');
            console.log('3. Check if MongoDB is listening on port 27017');
        }
    } finally {
        await mongoose.disconnect();
        console.log('\n📦 Disconnected from MongoDB');
    }
}

// Run the script
createAdminUser();