const mongoose = require('mongoose');
const config = require('./src/config/env');
const Lead = require('./src/modules/lead/lead.model');
const User = require('./src/modules/user/user.model');

const API_URL = 'http://localhost:5001/api/v1';

async function runIsolationQA() {
  console.log('--- STARTING QA SECURITY & ISOLATION VERIFICATION ---');

  await mongoose.connect(config.mongoose.url);
  
  // 1. Find two different exhibitors
  console.log('1. Identifying test exhibitors...');
  const exhibitor0 = await User.findOne({ email: 'exhibitor0@example.com' });
  const exhibitor1 = await User.findOne({ email: 'exhibitor1@example.com' });

  // 2. Find a lead belonging to Exhibitor 1
  const lead1Res = await Lead.findOne({ capturedBy: exhibitor1._id });
  if (!lead1Res) throw new Error('Lead for Exhibitor 1 not found in seeded data');
  console.log(`✅ Lead ${lead1Res._id} found for Exhibitor 1.`);

  // 3. Login as Exhibitor 0
  console.log('3. Logging in as Exhibitor 0...');
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'exhibitor0@example.com', password: 'admin123' })
  });
  const loginData = await loginRes.json();
  const token0 = loginData.data.tokens.access.token;

  // 4. Attempt to access Lead 1 as Exhibitor 0
  console.log('4. Attempting Cross-Exhibitor Lead Access...');
  const getLeadRes = await fetch(`${API_URL}/leads/${lead1Res._id}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token0}` }
  });
  
  // Note: Current system might return a 404 or just the lead if missing isolation check in getLeadId
  // Let's see what happens.
  const leadResult = await getLeadRes.json();
  console.log(`Access Result: ${getLeadRes.status} ${leadResult.message || ''}`);

  if (getLeadRes.status === 403 || (getLeadRes.status === 200 && leadResult.data === null)) {
    console.log('✅ Isolation Verified: Access blocked or Data null.');
  } else if (getLeadRes.status === 200 && leadResult.data) {
    console.warn('⚠️ SECURITY ALERT: Exhibitor 0 was able to access Exhibitor 1\'s lead data!');
  }

  console.log('--- QA SECURITY & ISOLATION VERIFICATION COMPLETE ---');
  process.exit(0);
}

runIsolationQA().catch(err => {
  console.error('QA Script Error:', err.message);
  process.exit(1);
});
