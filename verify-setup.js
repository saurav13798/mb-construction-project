// MB Construction Website Setup Verification Script
const fs = require('fs');
const path = require('path');

console.log('🔍 MB Construction Website - Setup Verification\n');

// Check if required files exist
const requiredFiles = [
  'frontend/public/index.html',
  'frontend/public/style.css',
  'frontend/public/app.js',
  'frontend/package.json',
  'backend/server.js',
  'backend/package.json',
  'backend/.env',
  'backend/models/Contact.js',
  'backend/controllers/contactController.js',
  'backend/routes/contact.js',
  'README.md',
  'package.json'
];

const requiredDirectories = [
  'frontend',
  'frontend/public',
  'backend',
  'backend/models',
  'backend/controllers',
  'backend/routes',
  'backend/middleware',
  'backend/utils'
];

let allFilesExist = true;
let allDirsExist = true;

console.log('📁 Checking directory structure...');
requiredDirectories.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir}/`);
  } else {
    console.log(`❌ ${dir}/ - MISSING`);
    allDirsExist = false;
  }
});

console.log('\n📄 Checking required files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Check package.json dependencies
console.log('\n📦 Checking dependencies...');

// Backend dependencies
try {
  const backendPackage = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
  const requiredBackendDeps = [
    'express',
    'mongoose',
    'cors',
    'helmet',
    'express-rate-limit',
    'express-validator',
    'dotenv',
    'bcryptjs',
    'jsonwebtoken',
    'multer',
    'nodemailer'
  ];
  
  let backendDepsOk = true;
  requiredBackendDeps.forEach(dep => {
    if (backendPackage.dependencies && backendPackage.dependencies[dep]) {
      console.log(`✅ Backend: ${dep}`);
    } else {
      console.log(`❌ Backend: ${dep} - MISSING`);
      backendDepsOk = false;
    }
  });
  
  if (!backendDepsOk) {
    console.log('⚠️  Run: cd backend && npm install');
  }
} catch (error) {
  console.log('❌ Error reading backend/package.json');
}

// Frontend dependencies
try {
  const frontendPackage = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
  if (frontendPackage.devDependencies && frontendPackage.devDependencies['live-server']) {
    console.log('✅ Frontend: live-server');
  } else {
    console.log('❌ Frontend: live-server - MISSING');
    console.log('⚠️  Run: cd frontend && npm install');
  }
} catch (error) {
  console.log('❌ Error reading frontend/package.json');
}

// Check environment file
console.log('\n🔧 Checking configuration...');
try {
  const envContent = fs.readFileSync('backend/.env', 'utf8');
  const requiredEnvVars = ['PORT', 'MONGODB_URI', 'JWT_SECRET'];
  
  requiredEnvVars.forEach(envVar => {
    if (envContent.includes(envVar)) {
      console.log(`✅ Environment: ${envVar}`);
    } else {
      console.log(`❌ Environment: ${envVar} - MISSING`);
    }
  });
} catch (error) {
  console.log('❌ Error reading backend/.env file');
}

// Check if node_modules exist
console.log('\n📚 Checking installations...');
if (fs.existsSync('backend/node_modules')) {
  console.log('✅ Backend dependencies installed');
} else {
  console.log('❌ Backend dependencies not installed');
  console.log('   Run: cd backend && npm install');
}

if (fs.existsSync('frontend/node_modules')) {
  console.log('✅ Frontend dependencies installed');
} else {
  console.log('❌ Frontend dependencies not installed');
  console.log('   Run: cd frontend && npm install');
}

if (fs.existsSync('node_modules')) {
  console.log('✅ Root dependencies installed');
} else {
  console.log('❌ Root dependencies not installed');
  console.log('   Run: npm install');
}

// Final summary
console.log('\n📋 Setup Verification Summary:');
console.log(`   Directory Structure: ${allDirsExist ? '✅ COMPLETE' : '❌ INCOMPLETE'}`);
console.log(`   Required Files: ${allFilesExist ? '✅ COMPLETE' : '❌ INCOMPLETE'}`);

if (allDirsExist && allFilesExist) {
  console.log('\n🎉 Setup verification PASSED!');
  console.log('\n🚀 Ready to run:');
  console.log('   1. Start MongoDB: net start MongoDB');
  console.log('   2. Seed data (optional): npm run seed');
  console.log('   3. Start servers: npm start');
  console.log('   4. Open browser: http://localhost:8080');
} else {
  console.log('\n⚠️  Setup verification FAILED!');
  console.log('   Please check the missing files/directories above.');
  console.log('   Refer to Complete_Setup_Instructions.md for help.');
}

console.log('\n📖 Documentation:');
console.log('   - README.md - Project overview and features');
console.log('   - Complete_Setup_Instructions.md - Detailed setup guide');
console.log('   - MongoDB_Windows_Setup.md - MongoDB installation guide');
console.log('   - PROJECT_STATUS.md - Current project status');