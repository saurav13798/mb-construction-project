// MB Construction - Admin System Connection Test

const axios = require('axios');
const colors = require('colors');

class AdminSystemTester {
    constructor() {
        this.baseUrl = 'http://localhost:3000';
        this.testResults = [];
        this.adminToken = null;
        this.testUsername = `testadmin_${Date.now()}`;
        this.testPassword = 'testpass123';
        this.registrationCode = 'MB2024ADMIN'; // From .env file
    }

    async runAllTests() {
        console.log('🚀 Starting MB Construction Admin System Tests\n'.cyan.bold);

        try {
            // Test 1: Server Health Check
            await this.testServerHealth();

            // Test 2: Admin Registration
            await this.testAdminRegistration();

            // Test 3: Admin Login
            await this.testAdminLogin();

            // Test 4: Token Verification
            await this.testTokenVerification();

            // Test 5: Dashboard Data Endpoints
            await this.testDashboardEndpoints();

            // Test 6: Contact Management
            await this.testContactManagement();

            // Test 7: Frontend Files
            await this.testFrontendFiles();

            // Display Results
            this.displayResults();

        } catch (error) {
            console.error('❌ Test suite failed:'.red.bold, error.message);
        }
    }

    async testServerHealth() {
        console.log('🔍 Testing server health...'.yellow);
        
        try {
            const response = await axios.get(`${this.baseUrl}/health`);
            
            if (response.status === 200 && response.data.status === 'OK') {
                this.addResult('Server Health', true, 'Server is running and healthy');
                console.log('✅ Server health check passed'.green);
            } else {
                throw new Error('Server health check failed');
            }
        } catch (error) {
            this.addResult('Server Health', false, error.message);
            console.log('❌ Server health check failed:'.red, error.message);
        }
    }

    async testAdminRegistration() {
        console.log('\n🔍 Testing admin registration...'.yellow);
        
        try {
            const registrationData = {
                username: this.testUsername,
                email: `${this.testUsername}@test.com`,
                password: this.testPassword,
                registrationCode: this.registrationCode
            };

            const response = await axios.post(`${this.baseUrl}/api/admin/register`, registrationData);
            
            if (response.status === 201 && response.data.success) {
                this.addResult('Admin Registration', true, 'Admin account created successfully');
                console.log('✅ Admin registration passed'.green);
            } else {
                throw new Error('Registration failed: ' + (response.data.message || 'Unknown error'));
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message;
            this.addResult('Admin Registration', false, errorMsg);
            console.log('❌ Admin registration failed:'.red, errorMsg);
        }
    }

    async testAdminLogin() {
        console.log('\n🔍 Testing admin login...'.yellow);
        
        try {
            const loginData = {
                username: this.testUsername,
                password: this.testPassword
            };

            const response = await axios.post(`${this.baseUrl}/api/admin/login`, loginData);
            
            if (response.status === 200 && response.data.success && response.data.token) {
                this.adminToken = response.data.token;
                this.addResult('Admin Login', true, 'Login successful, token received');
                console.log('✅ Admin login passed'.green);
            } else {
                throw new Error('Login failed: ' + (response.data.message || 'No token received'));
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message;
            this.addResult('Admin Login', false, errorMsg);
            console.log('❌ Admin login failed:'.red, errorMsg);
        }
    }

    async testTokenVerification() {
        console.log('\n🔍 Testing token verification...'.yellow);
        
        if (!this.adminToken) {
            this.addResult('Token Verification', false, 'No token available from login');
            console.log('❌ Token verification skipped - no token available'.red);
            return;
        }

        try {
            const response = await axios.get(`${this.baseUrl}/api/admin/verify`, {
                headers: {
                    'Authorization': `Bearer ${this.adminToken}`
                }
            });
            
            if (response.status === 200 && response.data.success) {
                this.addResult('Token Verification', true, 'Token is valid');
                console.log('✅ Token verification passed'.green);
            } else {
                throw new Error('Token verification failed');
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message;
            this.addResult('Token Verification', false, errorMsg);
            console.log('❌ Token verification failed:'.red, errorMsg);
        }
    }

    async testDashboardEndpoints() {
        console.log('\n🔍 Testing dashboard endpoints...'.yellow);
        
        if (!this.adminToken) {
            this.addResult('Dashboard Endpoints', false, 'No token available');
            console.log('❌ Dashboard endpoints skipped - no token available'.red);
            return;
        }

        const endpoints = [
            { name: 'Contacts Count', url: '/api/admin/contacts/count' },
            { name: 'Visits Data', url: '/api/admin/visits' },
            { name: 'Contacts List', url: '/api/admin/contacts' }
        ];

        let passedCount = 0;

        for (const endpoint of endpoints) {
            try {
                const response = await axios.get(`${this.baseUrl}${endpoint.url}`, {
                    headers: {
                        'Authorization': `Bearer ${this.adminToken}`
                    }
                });
                
                if (response.status === 200 && response.data.success !== false) {
                    console.log(`  ✅ ${endpoint.name} - OK`.green);
                    passedCount++;
                } else {
                    console.log(`  ❌ ${endpoint.name} - Failed`.red);
                }
            } catch (error) {
                console.log(`  ❌ ${endpoint.name} - Error: ${error.response?.data?.message || error.message}`.red);
            }
        }

        const allPassed = passedCount === endpoints.length;
        this.addResult('Dashboard Endpoints', allPassed, `${passedCount}/${endpoints.length} endpoints working`);
    }

    async testContactManagement() {
        console.log('\n🔍 Testing contact management...'.yellow);
        
        if (!this.adminToken) {
            this.addResult('Contact Management', false, 'No token available');
            console.log('❌ Contact management skipped - no token available'.red);
            return;
        }

        try {
            // Test getting all contacts
            const response = await axios.get(`${this.baseUrl}/api/admin/contacts/all`, {
                headers: {
                    'Authorization': `Bearer ${this.adminToken}`
                }
            });
            
            if (response.status === 200) {
                this.addResult('Contact Management', true, 'Contact management endpoints working');
                console.log('✅ Contact management passed'.green);
            } else {
                throw new Error('Contact management failed');
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message;
            this.addResult('Contact Management', false, errorMsg);
            console.log('❌ Contact management failed:'.red, errorMsg);
        }
    }

    async testFrontendFiles() {
        console.log('\n🔍 Testing frontend files...'.yellow);
        
        const files = [
            { name: 'Admin Login Page', url: '/admin.html' },
            { name: 'Admin Registration Page', url: '/admin-register.html' },
            { name: 'Admin Dashboard JS', url: '/admin-dashboard.js' },
            { name: 'Admin Registration JS', url: '/admin-register.js' }
        ];

        let passedCount = 0;

        for (const file of files) {
            try {
                const response = await axios.get(`${this.baseUrl}${file.url}`);
                
                if (response.status === 200) {
                    console.log(`  ✅ ${file.name} - Available`.green);
                    passedCount++;
                } else {
                    console.log(`  ❌ ${file.name} - Not found`.red);
                }
            } catch (error) {
                if (error.response?.status === 404) {
                    console.log(`  ❌ ${file.name} - Not found (404)`.red);
                } else {
                    console.log(`  ❌ ${file.name} - Error: ${error.message}`.red);
                }
            }
        }

        const allPassed = passedCount === files.length;
        this.addResult('Frontend Files', allPassed, `${passedCount}/${files.length} files available`);
    }

    addResult(testName, passed, message) {
        this.testResults.push({
            test: testName,
            passed,
            message
        });
    }

    displayResults() {
        console.log('\n📊 Test Results Summary'.cyan.bold);
        console.log('='.repeat(50).cyan);

        const passedTests = this.testResults.filter(r => r.passed).length;
        const totalTests = this.testResults.length;

        this.testResults.forEach(result => {
            const status = result.passed ? '✅ PASS'.green : '❌ FAIL'.red;
            console.log(`${status} ${result.test}: ${result.message}`);
        });

        console.log('='.repeat(50).cyan);
        console.log(`Overall: ${passedTests}/${totalTests} tests passed`.cyan.bold);

        if (passedTests === totalTests) {
            console.log('\n🎉 All tests passed! Admin system is fully functional.'.green.bold);
            console.log('\n📝 Next Steps:'.yellow.bold);
            console.log('1. Open http://localhost:3000/admin-register.html to create an admin account');
            console.log('2. Use registration code: MB2024ADMIN');
            console.log('3. After registration, login at http://localhost:3000/admin.html');
            console.log('4. Access the admin dashboard to manage contacts and view analytics');
        } else {
            console.log('\n⚠️  Some tests failed. Please check the errors above.'.yellow.bold);
        }

        // Cleanup test user
        this.cleanupTestUser();
    }

    async cleanupTestUser() {
        console.log('\n🧹 Cleaning up test data...'.yellow);
        
        try {
            // Note: In a real scenario, you'd want to add a cleanup endpoint
            // For now, we'll just log that cleanup should be done manually
            console.log(`ℹ️  Test user "${this.testUsername}" should be removed manually from database`.blue);
        } catch (error) {
            console.log('⚠️  Could not cleanup test user automatically'.yellow);
        }
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const tester = new AdminSystemTester();
    tester.runAllTests().catch(console.error);
}

module.exports = AdminSystemTester;