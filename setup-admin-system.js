// MB Construction - Admin System Setup Script

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AdminSystemSetup {
    constructor() {
        this.requiredFiles = [
            'frontend/public/admin.html',
            'frontend/public/admin-register.html',
            'frontend/public/admin-dashboard.js',
            'frontend/public/admin-register.js',
            'backend/models/Admin.js',
            'backend/controllers/adminController.js',
            'backend/routes/admin.js',
            'backend/middleware/adminAuth.js'
        ];
    }

    async setup() {
        console.log('🚀 Setting up MB Construction Admin System\n');

        try {
            // Check if we're in the right directory
            this.checkProjectStructure();

            // Check required files
            this.checkRequiredFiles();

            // Check backend dependencies
            this.checkBackendDependencies();

            // Verify environment configuration
            this.checkEnvironmentConfig();

            // Display setup completion
            this.displaySetupComplete();

        } catch (error) {
            console.error('❌ Setup failed:', error.message);
            process.exit(1);
        }
    }

    checkProjectStructure() {
        console.log('🔍 Checking project structure...');

        const requiredDirs = ['frontend/public', 'backend'];
        
        for (const dir of requiredDirs) {
            if (!fs.existsSync(dir)) {
                throw new Error(`Required directory not found: ${dir}`);
            }
        }

        console.log('✅ Project structure is correct');
    }

    checkRequiredFiles() {
        console.log('\n🔍 Checking required files...');

        const missingFiles = [];

        for (const file of this.requiredFiles) {
            if (!fs.existsSync(file)) {
                missingFiles.push(file);
            }
        }

        if (missingFiles.length > 0) {
            console.log('❌ Missing files:');
            missingFiles.forEach(file => console.log(`  - ${file}`));
            throw new Error('Some required files are missing');
        }

        console.log('✅ All required files are present');
    }

    checkBackendDependencies() {
        console.log('\n🔍 Checking backend dependencies...');

        const packageJsonPath = 'backend/package.json';
        
        if (!fs.existsSync(packageJsonPath)) {
            throw new Error('backend/package.json not found');
        }

        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const requiredDeps = [
            'express',
            'mongoose',
            'bcryptjs',
            'jsonwebtoken',
            'express-validator',
            'cors',
            'helmet',
            'express-rate-limit',
            'compression',
            'dotenv'
        ];

        const missingDeps = [];
        const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };

        for (const dep of requiredDeps) {
            if (!allDeps[dep]) {
                missingDeps.push(dep);
            }
        }

        if (missingDeps.length > 0) {
            console.log('❌ Missing dependencies:');
            missingDeps.forEach(dep => console.log(`  - ${dep}`));
            
            console.log('\n📦 Installing missing dependencies...');
            try {
                process.chdir('backend');
                execSync(`npm install ${missingDeps.join(' ')}`, { stdio: 'inherit' });
                process.chdir('..');
                console.log('✅ Dependencies installed successfully');
            } catch (error) {
                throw new Error('Failed to install dependencies: ' + error.message);
            }
        } else {
            console.log('✅ All required dependencies are installed');
        }
    }

    checkEnvironmentConfig() {
        console.log('\n🔍 Checking environment configuration...');

        const envPath = 'backend/.env';
        
        if (!fs.existsSync(envPath)) {
            throw new Error('backend/.env file not found');
        }

        const envContent = fs.readFileSync(envPath, 'utf8');
        const requiredEnvVars = [
            'MONGODB_URI',
            'JWT_SECRET',
            'ADMIN_REGISTRATION_CODE'
        ];

        const missingVars = [];

        for (const envVar of requiredEnvVars) {
            if (!envContent.includes(`${envVar}=`)) {
                missingVars.push(envVar);
            }
        }

        if (missingVars.length > 0) {
            console.log('❌ Missing environment variables:');
            missingVars.forEach(envVar => console.log(`  - ${envVar}`));
            throw new Error('Some required environment variables are missing');
        }

        // Check if JWT_SECRET is secure enough
        const jwtSecretMatch = envContent.match(/JWT_SECRET=(.+)/);
        if (jwtSecretMatch && jwtSecretMatch[1].length < 32) {
            console.log('⚠️  JWT_SECRET should be at least 32 characters long for security');
        }

        console.log('✅ Environment configuration is correct');
    }

    displaySetupComplete() {
        console.log('\n🎉 Admin System Setup Complete!\n');
        
        console.log('📋 Setup Summary:');
        console.log('✅ Project structure verified');
        console.log('✅ Required files present');
        console.log('✅ Dependencies installed');
        console.log('✅ Environment configured');

        console.log('\n🚀 Next Steps:');
        console.log('1. Start the backend server:');
        console.log('   cd backend && npm start');
        console.log('');
        console.log('2. Open your browser and navigate to:');
        console.log('   http://localhost:3000/admin-register.html');
        console.log('');
        console.log('3. Create an admin account using registration code:');
        console.log('   MB2024ADMIN');
        console.log('');
        console.log('4. After registration, login at:');
        console.log('   http://localhost:3000/admin.html');
        console.log('');
        console.log('5. Run the test suite to verify everything works:');
        console.log('   node test-admin-system.js');

        console.log('\n📚 Admin System Features:');
        console.log('• Secure admin registration with registration code');
        console.log('• JWT-based authentication');
        console.log('• Dashboard with contact and visit analytics');
        console.log('• Contact management (view, mark as read, delete)');
        console.log('• Responsive design with professional UI');
        console.log('• Real-time data updates');

        console.log('\n🔐 Security Features:');
        console.log('• Password hashing with bcrypt');
        console.log('• JWT token expiration');
        console.log('• Rate limiting');
        console.log('• Input validation');
        console.log('• CORS protection');
        console.log('• Helmet security headers');

        console.log('\n⚠️  Important Notes:');
        console.log('• Change ADMIN_REGISTRATION_CODE in production');
        console.log('• Use a strong JWT_SECRET (32+ characters)');
        console.log('• Configure proper MongoDB connection');
        console.log('• Set up SSL/HTTPS in production');
    }
}

// Run setup if this file is executed directly
if (require.main === module) {
    const setup = new AdminSystemSetup();
    setup.setup().catch(console.error);
}

module.exports = AdminSystemSetup;