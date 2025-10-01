const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testContactSubmission() {
  try {
    console.log('🧪 Testing contact form submission...');
    
    const testData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1-234-567-8900',
      company: 'Test Company',
      service: 'redevelopment',
      message: 'This is a test message for the contact form. It should be long enough to pass validation.',
      projectBudget: '1-5-lakh',
      projectTimeline: '3-months',
      projectLocation: 'Mumbai, Maharashtra'
    };
    
    const response = await axios.post(`${BASE_URL}/api/contact`, testData);
    
    console.log('✅ Contact submission successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Contact submission failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

async function testAdminRegistration() {
  try {
    console.log('🧪 Testing admin registration...');
    
    const testData = {
      username: 'testadmin',
      email: 'admin@test.com',
      password: 'testpassword123',
      registrationCode: process.env.ADMIN_REGISTRATION_CODE || 'MB2024ADMIN'
    };
    
    const response = await axios.post(`${BASE_URL}/api/admin/register`, testData);
    
    console.log('✅ Admin registration successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Admin registration failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

async function testHealthCheck() {
  try {
    console.log('🧪 Testing health check...');
    
    const response = await axios.get(`${BASE_URL}/health`);
    
    console.log('✅ Health check successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Health check failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

async function runTests() {
  console.log('🚀 Starting API tests...\n');
  
  await testHealthCheck();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await testContactSubmission();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await testAdminRegistration();
  
  console.log('\n🏁 Tests completed!');
}

// Add axios to package.json if not present
if (require.main === module) {
  runTests();
}

module.exports = { testContactSubmission, testAdminRegistration, testHealthCheck };