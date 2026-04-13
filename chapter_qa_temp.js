const mongoose = require('mongoose');
const config = require('./src/config/env');
const User = require('./src/modules/user/user.model');
const Organization = require('./src/modules/organization/organization.model');

const API_URL = 'http://localhost:5001/api/v1';

async function runChapterQA() {
  console.log('--- STARTING QA CHAPTER MEMBERSHIP VERIFICATION ---');

  await mongoose.connect(config.mongoose.url);
  const organizerUser = await User.findOne({ email: 'organizer@digitalevents.com' });
  const visitorUser = await User.findOne({ email: 'visitor@testmail.com' }); // Created in step 2 of seed

  if (!organizerUser || !visitorUser) throw new Error('Test users not found');

  // 1. Setup Organization
  console.log('1. Setting up Organization...');
  let org = await Organization.findOne({ owner: organizerUser._id });
  if (!org) {
    org = await Organization.create({
      name: 'Tech Innovators Circle',
      bio: 'A gathering of tech enthusiasts.',
      owner: organizerUser._id,
      isActive: true
    });
  }
  console.log(`✅ Organization ${org.name} ready.`);

  // 2. Login as Visitor & Request Join
  console.log('2. Visitor Requesting to Join...');
  const vLoginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'visitor@testmail.com', password: 'admin123' })
  });
  const vData = await vLoginRes.json();
  const vToken = vData.data.tokens.access.token;

  const joinRes = await fetch(`${API_URL}/organizations/${org._id}/join-request`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${vToken}` }
  });
  const joinData = await joinRes.json();
  console.log(`✅ Join Request Status: ${joinData.success ? 'Success' : 'Failed'}`);

  // 3. Login as Organizer & Approve
  console.log('3. Organizer Approving Request...');
  const oLoginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'organizer@digitalevents.com', password: 'admin123' })
  });
  const oData = await oLoginRes.json();
  const oToken = oData.data.tokens.access.token;

  // Find the request ID
  const requestsRes = await fetch(`${API_URL}/organizations/${org._id}/requests`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${oToken}` }
  });
  const requestsData = await requestsRes.json();
  const requestId = requestsData.data[0]._id;

  const approveRes = await fetch(`${API_URL}/organizations/requests/${requestId}`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${oToken}` 
    },
    body: JSON.stringify({ status: 'APPROVED', notes: 'Welcome to the chapter!' })
  });
  const approveData = await approveRes.json();
  
  if (approveData.data.status === 'APPROVED') {
    console.log('✅ Chapter Membership APPROVED verified.');
  } else {
    console.error('❌ Approval failed!', approveData);
  }

  // 4. Verify follower sync
  const updatedOrg = await Organization.findById(org._id);
  if (updatedOrg.followers.includes(visitorUser._id)) {
    console.log('✅ Legacy followers array synced with chapter membership.');
  } else {
    console.error('❌ Followers sync failed!');
  }

  console.log('--- QA CHAPTER MEMBERSHIP VERIFICATION COMPLETE ---');
  process.exit(0);
}

runChapterQA().catch(err => {
  console.error('QA Script Error:', err.message);
  process.exit(1);
});
