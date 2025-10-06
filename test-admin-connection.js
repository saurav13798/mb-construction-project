// Admin Connection Test Script
// Run this with: node test-admin-connection.js

const http = require('http');

console.log('🔍 Testing Admin API Connection...\n');

// Test 1: Check if backend server is running
console.log('1. Testing backend server health...');
const healthReq = http.get('http://localhost:3000/health', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const health = JSON.parse(data);
            console.log('✅ Backend server is running');
            console.log(`   Status: ${health.status}`);
            console.log(`   Environment: ${health.environment}`);
            console.log(`   Database: ${health.database ? 'Connected' : 'Disconnected'}\n`);
        } catch (e) {
            console.log('✅ Backend server is running (non-JSON response)\n');
        }
        
        // Test 2: Check admin login endpoint
        console.log('2. Testing admin login endpoint...');
        const postData = JSON.stringify({
            username: 'test',
            password: 'test123'
        });
        
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/admin/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        const loginReq = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`   Status Code: ${res.statusCode}`);
                console.log(`   Response: ${data}`);
                
                if (res.statusCode === 401) {
                    console.log('✅ Admin login endpoint is working (invalid credentials expected)');
                } else if (res.statusCode === 200) {
                    console.log('✅ Admin login endpoint is working (login successful)');
                } else {
                    console.log('⚠️ Admin login endpoint returned unexpected status');
                }
                
                console.log('\n3. CORS Headers:');
                console.log(`   Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin']}`);
                console.log(`   Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods']}`);
                console.log(`   Access-Control-Allow-Headers: ${res.headers['access-control-allow-headers']}`);
            });
        });
        
        loginReq.on('error', (err) => {
            console.log('❌ Admin login endpoint error:', err.message);
        });
        
        loginReq.write(postData);
        loginReq.end();
    });
});

healthReq.on('error', (err) => {
    console.log('❌ Backend server is not running or not accessible');
    console.log(`   Error: ${err.message}`);
    console.log('\n💡 Solutions:');
    console.log('   1. Start the backend server: cd backend && npm run dev');
    console.log('   2. Check if port 3000 is available: netstat -an | find ":3000"');
    console.log('   3. Check MongoDB is running: net start MongoDB');
});

// Test 3: Check if frontend can access backend (simulate browser request)
setTimeout(() => {
    console.log('\n4. Testing CORS from frontend perspective...');
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/admin/login',
        method: 'OPTIONS',
        headers: {
            'Origin': 'http://localhost:8080',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type'
        }
    };
    
    const corsReq = http.request(options, (res) => {
        console.log(`   CORS Preflight Status: ${res.statusCode}`);
        if (res.statusCode === 200 || res.statusCode === 204) {
            console.log('✅ CORS is properly configured');
        } else {
            console.log('⚠️ CORS might have issues');
        }
        
        console.log('\n🎯 Diagnosis Complete!');
        console.log('\nIf all tests pass but admin login still fails:');
        console.log('1. Check browser console for detailed error messages');
        console.log('2. Verify admin user exists in database');
        console.log('3. Try creating a new admin user');
    });
    
    corsReq.on('error', (err) => {
        console.log('❌ CORS test failed:', err.message);
    });
    
    corsReq.end();
}, 2000);