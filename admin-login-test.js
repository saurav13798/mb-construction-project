// Comprehensive Admin Login Testing Script
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAdminLogin() {
  console.log('🔍 Starting comprehensive admin login testing...\n');

  // Test scenarios
  const testCases = [
    {
      name: 'Valid Admin Login',
      username: 'admin',
      password: 'admin123',
      expectedStatus: 200
    },
    {
      name: 'Invalid Username',
      username: 'nonexistent',
      password: 'admin123',
      expectedStatus: 401
    },
    {
      name: 'Invalid Password',
      username: 'admin',
      password: 'wrongpassword',
      expectedStatus: 401
    },
    {
      name: 'Empty Username',
      username: '',
      password: 'admin123',
      expectedStatus: 400
    },
    {
      name: 'Empty Password',
      username: 'admin',
      password: '',
      expectedStatus: 400
    },
    {
      name: 'Short Password',
      username: 'admin',
      password: '123',
      expectedStatus: 400
    }
  ];

  let passedTests = 0;
  let failedTests = 0;

  for (const testCase of testCases) {
    try {
      console.log(`Testing: ${testCase.name}`);
      
      const response = await axios.post(`${BASE_URL}/api/admin/login`, {
        username: testCase.username,
        password: testCase.password
      }, {
        validateStatus: () => true // Don't throw on non-2xx status codes
      });

      console.log(`  Status: ${response.status}`);
      console.log(`  Response: ${JSON.stringify(response.data)}`);

      if (response.status === testCase.expectedStatus) {
        console.log(`  ✅ PASSED\n`);
        passedTests++;
      } else {
        console.log(`  ❌ FAILED - Expected ${testCase.expectedStatus}, got ${response.status}\n`);
        failedTests++;
      }

    } catch (error) {
      console.log(`  ❌ ERROR: ${error.message}\n`);
      failedTests++;
    }
  }

  // Test JWT token validation
  console.log('🔐 Testing JWT token validation...');
  try {
    const loginResponse = await axios.post(`${BASE_URL}/api/admin/login`, {
      username: 'admin',
      password: 'admin123'
    });

    if (loginResponse.data.success && loginResponse.data.token) {
      console.log('✅ JWT token generated successfully');
      
      // Test protected endpoint with valid token
      const protectedResponse = await axios.get(`${BASE_URL}/api/admin/visits`, {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.token}`
        }
      });
      
      console.log(`✅ Protected endpoint accessible with token (Status: ${protectedResponse.status})`);
      
      // Test protected endpoint with invalid token
      try {
        await axios.get(`${BASE_URL}/api/admin/visits`, {
          headers: {
            'Authorization': 'Bearer invalid-token'
          }
        });
      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.log('✅ Invalid token properly rejected');
        } else {
          console.log(`❌ Unexpected error with invalid token: ${error.message}`);
        }
      }
      
    } else {
      console.log('❌ Failed to generate JWT token');
      failedTests++;
    }
  } catch (error) {
    console.log(`❌ JWT token test error: ${error.message}`);
    failedTests++;
  }

  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);

  if (failedTests === 0) {
    console.log('\n🎉 All admin login tests passed! No issues detected.');
  } else {
    console.log('\n⚠️ Some tests failed. Please review the errors above.');
  }
}

// Run the tests
testAdminLogin().catch(console.error);