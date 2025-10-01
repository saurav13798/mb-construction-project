// Server Log and Error Monitoring Script
const axios = require('axios');

async function monitorServerErrors() {
  console.log('🔍 Monitoring server for potential errors during login...\n');

  // Test multiple rapid login attempts to see if any errors occur
  const testUsers = [
    { username: 'admin', password: 'admin123' },
    { username: 'testadmin', password: 'wrongpass' },
    { username: 'nonexistent', password: 'anypass' },
    { username: 'admin', password: 'admin123' }
  ];

  console.log('Testing rapid login attempts...');
  
  for (let i = 0; i < testUsers.length; i++) {
    try {
      const start = Date.now();
      const response = await axios.post('http://localhost:3000/api/admin/login', testUsers[i], {
        validateStatus: () => true,
        timeout: 5000
      });
      const duration = Date.now() - start;
      
      console.log(`Request ${i + 1}: ${response.status} (${duration}ms) - ${testUsers[i].username}`);
      
      if (response.status >= 500) {
        console.log(`❌ Server error detected: ${JSON.stringify(response.data)}`);
      }
      
    } catch (error) {
      console.log(`❌ Network/timeout error on request ${i + 1}: ${error.message}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Test concurrent login attempts
  console.log('\nTesting concurrent login attempts...');
  
  const concurrentPromises = Array(5).fill().map(async (_, index) => {
    try {
      const response = await axios.post('http://localhost:3000/api/admin/login', {
        username: 'admin',
        password: 'admin123'
      }, {
        validateStatus: () => true,
        timeout: 5000
      });
      return { index, status: response.status, success: response.data.success };
    } catch (error) {
      return { index, error: error.message };
    }
  });

  const results = await Promise.all(concurrentPromises);
  results.forEach(result => {
    if (result.error) {
      console.log(`Concurrent request ${result.index}: ERROR - ${result.error}`);
    } else {
      console.log(`Concurrent request ${result.index}: ${result.status} - Success: ${result.success}`);
    }
  });

  // Test malformed requests
  console.log('\nTesting malformed requests...');
  
  const malformedTests = [
    { name: 'Invalid JSON', body: '{"username":"admin","password":' },
    { name: 'Missing Content-Type', headers: {}, body: '{"username":"admin","password":"admin123"}' },
    { name: 'Very long username', body: JSON.stringify({ username: 'a'.repeat(1000), password: 'admin123' }) }
  ];

  for (const test of malformedTests) {
    try {
      const response = await axios.post('http://localhost:3000/api/admin/login', test.body, {
        headers: test.headers || { 'Content-Type': 'application/json' },
        validateStatus: () => true,
        timeout: 5000
      });
      console.log(`${test.name}: ${response.status}`);
    } catch (error) {
      console.log(`${test.name}: ERROR - ${error.message}`);
    }
  }

  console.log('\n✅ Server error monitoring complete.');
}

monitorServerErrors().catch(console.error);