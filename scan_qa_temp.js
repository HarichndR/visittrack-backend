const mongoose = require('mongoose');
const config = require('./src/config/env');
const Visitor = require('./src/modules/visitor/visitor.model');

const API_URL = 'http://localhost:5001/api/v1';

async function runQA() {
  console.log('--- STARTING QA SCAN VERIFICATION ---');

  // 1. Setup Visitor Data
  console.log('1. Setting up Visitor with profession and interests...');
  await mongoose.connect(config.mongoose.url);
  const visitor = await Visitor.findOne({ email: 'visitor0@testmail.com' });
  if (!visitor) throw new Error('Visitor not found');
  
  visitor.profession = 'Architect';
  visitor.interests = ['Business', 'Marketing']; 
  await visitor.save();
  console.log('✅ Visitor updated.');

  // 2. Login as Exhibitor
  console.log('2. Logging in as Exhibitor...');
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'exhibitor0@example.com',
      password: 'admin123'
    })
  });
  const loginData = await loginRes.json();
  const token = loginData.data.tokens.access.token;
  console.log('✅ Logged in.');

  // 3. Scan Visitor (Create Lead)
  console.log('3. Scanning Visitor (Creating Lead)...');
  const leadRes = await fetch(`${API_URL}/leads`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({
      visitorId: visitor._id,
      notes: 'Very interested in the new stall layout'
    })
  });
  const leadData = await leadRes.json();
  console.log('Lead Data received:', JSON.stringify(leadData, null, 2));
  const lead = leadData.data;
  console.log('✅ Lead Captured.');

  // 4. Verify Snapshot & Notes
  console.log('4. Verifying Snapshot and Notes...');
  if (lead.notes === 'Very interested in the new stall layout') {
    console.log('✅ Note verified.');
  } else {
    console.error('❌ Note mismatch!');
  }

  if (lead.visitorSnapshot && 
      lead.visitorSnapshot.profession === 'Architect' && 
      lead.visitorSnapshot.interests.includes('Business')) {
    console.log('✅ Visitor Snapshot verified (Profession & Interests captured).');
  } else {
    console.error('❌ Snapshot verification failed!', lead.visitorSnapshot);
  }

  console.log('--- QA SCAN VERIFICATION COMPLETE ---');
  process.exit(0);
}

runQA().catch(err => {
  console.error('QA Script Error:', err.message);
  process.exit(1);
});
