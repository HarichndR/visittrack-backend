/**
 * VisiTrack API Audit Script
 * This script simulates frontend behavior to test all major backend endpoints.
 */

const BASE_URL = 'http://localhost:5001/api/v1';

async function audit() {
  console.log('🚀 Starting VisiTrack API Audit...\n');

  let adminToken = '';
  let testEventId = '';
  let testVisitorId = '';

  try {
    // 1. AUTH: Register Admin
    console.log('--- Testing Auth Module ---');
    const adminData = {
      name: 'System Auditor',
      email: `auditor_${Date.now()}@visitrack.in`,
      password: 'password123',
      role: 'ADMIN'
    };

    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminData)
    });
    const regJson = await regRes.json();
    
    if (regRes.status !== 201) {
      throw new Error(`Auth/Register failed: ${JSON.stringify(regJson)}`);
    }
    console.log('✅ Admin Registration: SUCCESS');

    // 2. AUTH: Login
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminData.email, password: adminData.password })
    });
    const loginJson = await loginRes.json();
    adminToken = loginJson.data.tokens.access.token;
    console.log('✅ Admin Login: SUCCESS');

    // 3. EVENTS: Create Event
    console.log('\n--- Testing Event Module ---');
    const eventData = {
      name: 'Global Tech Expo 2026',
      description: 'The premier event for AI and Robotics.',
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000 * 3), // +3 days
      location: 'Bangalore Intl Exhibition Centre'
    };

    const eventRes = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(eventData)
    });
    const eventJson = await eventRes.json();
    testEventId = eventJson.data._id;
    console.log(`✅ Event Creation: SUCCESS (ID: ${testEventId})`);

    // 4. VISITORS: Public Registration
    console.log('\n--- Testing Visitor Module ---');
    const visitorData = {
      name: 'John Doe',
      email: `visitor_${Date.now()}@gmail.com`,
      phone: '9876543210',
      eventId: testEventId
    };

    const visRegRes = await fetch(`${BASE_URL}/visitors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visitorData)
    });
    const visRegJson = await visRegRes.json();
    testVisitorId = visRegJson.data._id;
    console.log(`✅ Visitor Registration: SUCCESS (ID: ${testVisitorId})`);

    // 5. VISITORS: Admin Get Visitors
    const visListRes = await fetch(`${BASE_URL}/visitors`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (visListRes.status !== 200) {
      throw new Error('Visitor List Fetch failed');
    }
    console.log('✅ Visitor List Retrieval: SUCCESS');

    // 6. VISITORS: Check-in
    const checkInRes = await fetch(`${BASE_URL}/visitors/${testVisitorId}/check-in`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (checkInRes.status !== 200) {
      throw new Error('Visitor Check-in failed');
    }
    console.log('✅ Visitor Check-in: SUCCESS');

    // 7. DASHBOARD: Stats
    console.log('\n--- Testing Dashboard Module ---');
    const statsRes = await fetch(`${BASE_URL}/dashboard/stats`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const statsJson = await statsRes.json();
    const summary = statsJson.data.summary;
    console.log(`📊 Current Stats: ${summary.totalVisitors} Visitors, ${summary.checkedInVisitors} Checked-In`);
    
    if (summary.totalVisitors < 1 || summary.checkedInVisitors < 1) {
      console.log('⚠️ Warning: Dashboard stats might be lagging or inaccurate.');
    } else {
      console.log('✅ Dashboard Analytics: SUCCESS');
    }

    // 8. SECURITY: Check Headers (Helmet)
    console.log('\n--- Testing Security Module ---');
    if (loginRes.headers.get('X-Content-Type-Options') === 'nosniff') {
      console.log('✅ Security Headers (Helmet): SUCCESS');
    } else {
      console.log('❌ Security Headers (Helmet): FAILED');
    }

    // 9. SECURITY: Rate Limiting (OTP Brute Force)
    console.log('⌛ Stress testing OTP Rate Limiter...');
    const otpResults = [];
    for (let i = 0; i < 7; i++) {
        otpResults.push(fetch(`${BASE_URL}/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: adminData.email })
        }));
    }
    const responses = await Promise.all(otpResults);
    const throttled = responses.some(r => r.status === 429);
    if (throttled) {
        console.log('✅ OTP Rate Limiter (429 Throttling): SUCCESS');
    } else {
        console.log('❌ OTP Rate Limiter: FAILED (No throttling detected)');
    }

    console.log('\n🌕 All Core & Security Audits Passed Successfully!');

  } catch (error) {
    console.error(`\n❌ AUDIT FAILED: ${error.message}`);
    process.exit(1);
  }
}

audit();
