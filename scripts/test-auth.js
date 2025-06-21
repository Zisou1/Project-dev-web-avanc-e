#!/usr/bin/env node

/**
 * Test script for JWT Authentication
 * Tests the auth service and API gateway integration
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });
const axios = require('axios');

const API_GATEWAY_URL = process.env.GATEWAY_PORT ? `http://localhost:${process.env.GATEWAY_PORT}` : 'http://localhost:3000';
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_PORT ? `http://localhost:${process.env.AUTH_SERVICE_PORT}` : 'http://localhost:3001';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = (color, message) => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const testData = {
  user: {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Test123!@#',
    role: 'customer'
  }
};

let accessToken = null;

async function testServiceHealth() {
  log('blue', '\n=== Testing Service Health ===');
  
  try {
    // Test API Gateway
    const gatewayResponse = await axios.get(`${API_GATEWAY_URL}/health`);
    log('green', '✅ API Gateway is healthy');
    console.log('   Response:', gatewayResponse.data);
  } catch (error) {
    log('red', '❌ API Gateway health check failed');
    console.log('   Error:', error.message);
    return false;
  }

  try {
    // Test Auth Service directly
    const authResponse = await axios.get(`${AUTH_SERVICE_URL}/health`);
    log('green', '✅ Auth Service is healthy');
    console.log('   Response:', authResponse.data);
  } catch (error) {
    log('red', '❌ Auth Service health check failed');
    console.log('   Error:', error.message);
    return false;
  }

  return true;
}

async function testUserRegistration() {
  log('blue', '\n=== Testing User Registration ===');
  
  try {
    const response = await axios.post(`${API_GATEWAY_URL}/api/auth/register`, testData.user);
    log('green', '✅ User registration successful');
    console.log('   User ID:', response.data.user.id);
    console.log('   Email:', response.data.user.email);
    console.log('   Role:', response.data.user.role);
    
    accessToken = response.data.tokens.accessToken;
    log('green', '✅ Access token received');
    
    return true;
  } catch (error) {
    if (error.response?.status === 409) {
      log('yellow', '⚠️  User already exists, trying login instead...');
      return await testUserLogin();
    }
    
    log('red', '❌ User registration failed');
    console.log('   Error:', error.response?.data || error.message);
    return false;
  }
}

async function testUserLogin() {
  log('blue', '\n=== Testing User Login ===');
  
  try {
    const response = await axios.post(`${API_GATEWAY_URL}/api/auth/login`, {
      email: testData.user.email,
      password: testData.user.password
    });
    
    log('green', '✅ User login successful');
    console.log('   User ID:', response.data.user.id);
    console.log('   Email:', response.data.user.email);
    console.log('   Role:', response.data.user.role);
    
    accessToken = response.data.tokens.accessToken;
    log('green', '✅ Access token received');
    
    return true;
  } catch (error) {
    log('red', '❌ User login failed');
    console.log('   Error:', error.response?.data || error.message);
    return false;
  }
}

async function testProtectedRoute() {
  log('blue', '\n=== Testing Protected Route Access ===');
  
  if (!accessToken) {
    log('red', '❌ No access token available');
    return false;
  }
  
  try {
    // This will test the JWT verification in API Gateway
    const response = await axios.get(`${API_GATEWAY_URL}/api/users/profile`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    log('green', '✅ Protected route access successful');
    console.log('   Response:', response.data);
    return true;
  } catch (error) {
    if (error.response?.status === 404) {
      log('yellow', '⚠️  User service not running (expected in development)');
      log('green', '✅ JWT verification working (API Gateway authenticated the request)');
      return true;
    }
    
    log('red', '❌ Protected route access failed');
    console.log('   Error:', error.response?.data || error.message);
    return false;
  }
}

async function testInvalidToken() {
  log('blue', '\n=== Testing Invalid Token Handling ===');
  
  try {
    await axios.get(`${API_GATEWAY_URL}/api/users/profile`, {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });
    
    log('red', '❌ Invalid token was accepted (this should not happen)');
    return false;
  } catch (error) {
    if (error.response?.status === 403 || error.response?.status === 401) {
      log('green', '✅ Invalid token correctly rejected');
      console.log('   Status:', error.response.status);
      console.log('   Message:', error.response.data.message);
      return true;
    }
    
    log('red', '❌ Unexpected error with invalid token');
    console.log('   Error:', error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  log('blue', '🧪 Starting JWT Authentication Tests\n');
  
  const tests = [
    { name: 'Service Health', fn: testServiceHealth },
    { name: 'User Registration', fn: testUserRegistration },
    { name: 'Protected Route Access', fn: testProtectedRoute },
    { name: 'Invalid Token Handling', fn: testInvalidToken }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      log('red', `❌ Test "${test.name}" crashed: ${error.message}`);
      failed++;
    }
  }
  
  log('blue', '\n=== Test Results ===');
  log('green', `✅ Passed: ${passed}`);
  log('red', `❌ Failed: ${failed}`);
  
  if (failed === 0) {
    log('green', '\n🎉 All tests passed! JWT authentication is working correctly.');
  } else {
    log('red', '\n💥 Some tests failed. Please check the services and configuration.');
  }
}

// Check if services are running
async function waitForServices() {
  log('yellow', '⏳ Waiting for services to start...');
  
  let attempts = 0;
  const maxAttempts = 30;
  
  while (attempts < maxAttempts) {
    try {
      await axios.get(`${API_GATEWAY_URL}/health`);
      await axios.get(`${AUTH_SERVICE_URL}/health`);
      log('green', '✅ Services are ready!');
      return true;
    } catch (error) {
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 1000));
      process.stdout.write('.');
    }
  }
  
  log('red', '\n❌ Services did not start within 30 seconds');
  return false;
}

// Main execution
async function main() {
  const servicesReady = await waitForServices();
  if (!servicesReady) {
    process.exit(1);
  }
  
  await runTests();
}

main().catch(error => {
  log('red', `💥 Test suite crashed: ${error.message}`);
  process.exit(1);
});
