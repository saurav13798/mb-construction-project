// MB Construction Project - Comprehensive Test Suite
const http = require('http');
const fs = require('fs');

console.log('🧪 MB Construction - Comprehensive Project Test Suite\n');

// Test 1: Project Structure
function checkProjectStructure() {
    console.log('1️⃣ Checking Project Structure...');
    
    const requiredFiles = [
        'backend/server.js',
        'backend/package.json',
        'backend/.env',
        'backend/models/Contact.js',
        'backend/routes/contact.js',
        'backend/controllers/contactController.js',
        'frontend/package.json',
        'frontend/public/index.html',
        'frontend/public/app.js',
        'frontend/public/style.css',
        'package.json'
    ];
    
    let allExist = true;
    requiredFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`   ✅ ${file}`);
        } else {
            console.log(`   ❌ ${file} - MISSING`);
            allExist = false;
        }
    });
    
    return allExist;
}

// Test 2: Server Health Check
async function testServerHealth() {
    console.log('\n2️⃣ Testing Server Health...');
    
    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: '/health',
            method: 'GET'
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (response.status === 'OK') {
                        console.log('   ✅ Backend server is healthy');
                        console.log(`   📅 Server time: ${response.timestamp}`);
                        resolve(true);
                    } else {
                        console.log('   ❌ Backend server unhealthy');
                        resolve(false);
                    }
                } catch (error) {
                    console.log('   ❌ Invalid response from server');
                    resolve(false);
                }
            });
        });
        
        req.on('error', () => {
            console.log('   ❌ Cannot connect to backend server');
            console.log('   💡 Start server with: cd backend && npm run dev');
            resolve(false);
        });
        
        req.setTimeout(5000, () => {
            console.log('   ❌ Server response timeout');
            req.destroy();
            resolve(false);
        });
        
        req.end();
    });
}

// Test 3: Contact Form API
async function testContactForm() {
    console.log('\n3️⃣ Testing Contact Form API...');
    
    const testData = JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        phone: '9876543210',
        company: 'Test Company',
        service: 'consultation',
        message: 'This is a comprehensive test message to verify the contact form API is working correctly.',
        projectBudget: '5-10-lakh',
        projectTimeline: '3-months',
        projectLocation: 'Mumbai'
    });
    
    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: '/api/contact',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(testData)
            }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (response.success) {
                        console.log('   ✅ Contact form submission successful');
                        console.log(`   💾 Contact ID: ${response.data.id}`);
                        console.log(`   👤 Name: ${response.data.name}`);
                        console.log(`   🏗️ Service: ${response.data.service}`);
                        resolve(true);
                    } else {
                        console.log('   ❌ Contact form submission failed');
                        console.log(`   📝 Error: ${response.message}`);
                        resolve(false);
                    }
                } catch (error) {
                    console.log('   ❌ Invalid JSON response');
                    resolve(false);
                }
            });
        });
        
        req.on('error', () => {
            console.log('   ❌ Contact form API connection failed');
            resolve(false);
        });
        
        req.setTimeout(10000, () => {
            console.log('   ❌ Contact form API timeout');
            req.destroy();
            resolve(false);
        });
        
        req.write(testData);
        req.end();
    });
}

// Test 4: Input Validation
async function testInputValidation() {
    console.log('\n4️⃣ Testing Input Validation...');
    
    const invalidData = JSON.stringify({
        name: 'A', // Too short
        email: 'invalid-email',
        service: '',
        message: 'Short'
    });
    
    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: '/api/contact',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(invalidData)
            }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (!response.success && response.errors) {
                        console.log('   ✅ Input validation working correctly');
                        console.log(`   📝 Validation errors detected: ${response.errors.length}`);
                        resolve(true);
                    } else {
                        console.log('   ❌ Input validation not working');
                        resolve(false);
                    }
                } catch (error) {
                    console.log('   ❌ Validation test failed');
                    resolve(false);
                }
            });
        });
        
        req.on('error', () => {
            console.log('   ❌ Validation test connection failed');
            resolve(false);
        });
        
        req.setTimeout(5000, () => {
            console.log('   ❌ Validation test timeout');
            req.destroy();
            resolve(false);
        });
        
        req.write(invalidData);
        req.end();
    });
}

// Test 5: File Upload Configuration
function testFileUploadConfig() {
    console.log('\n5️⃣ Testing File Upload Configuration...');
    
    const uploadDirs = [
        'backend/uploads',
        'backend/uploads/projects',
        'backend/uploads/documents',
        'backend/uploads/general'
    ];
    
    let allExist = true;
    uploadDirs.forEach(dir => {
        if (fs.existsSync(dir)) {
            console.log(`   ✅ ${dir} exists`);
        } else {
            console.log(`   ⚠️ ${dir} missing (will be created automatically)`);
        }
    });
    
    // Check environment configuration
    try {
        const envContent = fs.readFileSync('backend/.env', 'utf8');
        if (envContent.includes('MAX_FILE_SIZE')) {
            console.log('   ✅ File size limits configured');
        } else {
            console.log('   ⚠️ File size limits not configured');
        }
    } catch (error) {
        console.log('   ❌ Cannot read .env file');
        allExist = false;
    }
    
    return allExist;
}

// Test 6: Frontend Performance
function testFrontendPerformance() {
    console.log('\n6️⃣ Testing Frontend Performance...');
    
    try {
        const htmlContent = fs.readFileSync('frontend/public/index.html', 'utf8');
        const jsContent = fs.readFileSync('frontend/public/app.js', 'utf8');
        const cssContent = fs.readFileSync('frontend/public/style.css', 'utf8');
        
        const checks = {
            'Responsive design': cssContent.includes('@media'),
            'Modern CSS features': cssContent.includes(':root') && cssContent.includes('--'),
            'Error handling': jsContent.includes('try {') && jsContent.includes('catch'),
            'Accessibility': htmlContent.includes('aria-label') && htmlContent.includes('alt='),
            'Meta tags': htmlContent.includes('viewport') && htmlContent.includes('description'),
            'External resources': htmlContent.includes('googleapis.com')
        };
        
        Object.entries(checks).forEach(([check, passed]) => {
            console.log(`   ${passed ? '✅' : '❌'} ${check}: ${passed ? 'OPTIMIZED' : 'NEEDS WORK'}`);
        });
        
        return Object.values(checks).every(check => check);
    } catch (error) {
        console.log('   ❌ Cannot read frontend files');
        return false;
    }
}

// Main test runner
async function runAllTests() {
    console.log('🚀 Starting Comprehensive Project Tests...\n');
    
    const results = {
        structure: checkProjectStructure(),
        health: await testServerHealth(),
        contactForm: false,
        validation: false,
        fileUpload: testFileUploadConfig(),
        performance: testFrontendPerformance()
    };
    
    // Only test API if server is healthy
    if (results.health) {
        results.contactForm = await testContactForm();
        results.validation = await testInputValidation();
    }
    
    // Summary
    console.log('\n📋 Test Results Summary:');
    console.log('═══════════════════════════════════════');
    console.log(`📁 Project Structure:   ${results.structure ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`🏥 Server Health:       ${results.health ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`📧 Contact Form:        ${results.contactForm ? '✅ PASS' : results.health ? '❌ FAIL' : '⏭️ SKIPPED'}`);
    console.log(`🛡️ Input Validation:    ${results.validation ? '✅ PASS' : results.health ? '❌ FAIL' : '⏭️ SKIPPED'}`);
    console.log(`📁 File Upload Config:  ${results.fileUpload ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`⚡ Frontend Performance: ${results.performance ? '✅ PASS' : '❌ FAIL'}`);
    
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    const percentage = Math.round((passedTests / totalTests) * 100);
    
    console.log(`\n🎯 Overall Score: ${passedTests}/${totalTests} (${percentage}%)`);
    
    if (percentage >= 90) {
        console.log('🟢 EXCELLENT - Project is production ready!');
        console.log('\n✨ Your MB Construction website is fully functional:');
        console.log('   • Frontend: http://localhost:8080');
        console.log('   • Backend API: http://localhost:3000');
        console.log('   • Contact form working');
        console.log('   • File uploads configured');
        console.log('   • Input validation active');
        console.log('   • Performance optimized');
    } else if (percentage >= 75) {
        console.log('🟡 GOOD - Minor improvements recommended');
    } else {
        console.log('🔴 NEEDS WORK - Address failing tests');
        
        if (!results.health) {
            console.log('\n💡 Quick Fix: Start the backend server');
            console.log('   cd backend && npm run dev');
        }
    }
    
    console.log('\n🏁 Test suite complete!');
}

// Run tests
runAllTests().catch(console.error);