const axios = require('axios');

const API_URL = 'http://localhost:5001/api/v1';

async function runAudit() {
  console.log('🚀 Starting Backend Hardening Audit...\n');

  // 1. Test Restricted Registration (Security Guard)
  console.log('--- [SECURITY] Role Escalation Test ---');
  try {
    await axios.post(`${API_URL}/auth/register`, {
      name: 'Hacker',
      email: `hacker_${Date.now()}@test.com`,
      password: 'password123',
      role: 'ADMIN'
    });
    console.log('❌ FAIL: Registered as ADMIN directly!');
  } catch (err) {
    console.log('✅ PASS: Blocked direct ADMIN registration (' + err.response?.status + ')');
  }

  try {
    await axios.post(`${API_URL}/auth/register`, {
      name: 'Shadow Org',
      email: `shadow_${Date.now()}@test.com`,
      password: 'password123',
      role: 'ORGANIZER'
    });
    console.log('❌ FAIL: Registered as ORGANIZER directly!');
  } catch (err) {
    console.log('✅ PASS: Blocked direct ORGANIZER registration (' + err.response?.status + ')');
  }

  // 2. Test Organic Registration
  console.log('\n--- [BUSINESS] Valid Visitor Registration ---');
  try {
    const res = await axios.post(`${API_URL}/auth/register`, {
      name: 'Valid Visitor',
      email: `visitor_${Date.now()}@test.com`,
      password: 'password123',
      role: 'VISITOR'
    });
    console.log('✅ PASS: Registered as VISITOR successfully');
  } catch (err) {
    console.log('❌ FAIL: Could not register valid visitor: ' + err.message);
  }

  // 3. Test Joi Validation Guard
  console.log('\n--- [VALIDATION] Joi Schema Test ---');
  try {
    await axios.post(`${API_URL}/users/public-organizer-request`, {
      name: 'Missing Fields'
      // Missing businessName, description, phone
    });
    console.log('❌ FAIL: Accepted organizer request with missing fields!');
  } catch (err) {
    console.log('✅ PASS: Blocked invalid JSON payload (' + err.response?.status + ' - ' + err.response?.data?.message + ')');
  }

  // 4. Test Service Layer Resilience (Duplicates)
  console.log('\n--- [RESILIENCE] Duplicate Request Test ---');
  const sharedEmail = `exclusive_${Date.now()}@org.in`;
  const validPayload = {
    name: 'Unique Org',
    email: sharedEmail,
    businessName: 'Unique Business',
    phone: '1234567890',
    description: 'We organize data-heavy tech expos.'
  };

  try {
    await axios.post(`${API_URL}/users/public-organizer-request`, validPayload);
    console.log('✅ STEP: First request submitted');
    
    await axios.post(`${API_URL}/users/public-organizer-request`, validPayload);
    console.log('❌ FAIL: Accepted duplicate pending request!');
  } catch (err) {
    console.log('✅ PASS: Blocked duplicate application (' + err.response?.status + ' - ' + err.response?.data?.message + ')');
  }

  console.log('\n✨ Backend Audit Complete.');
}

runAudit().catch(console.error);
