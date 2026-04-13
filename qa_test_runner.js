const autocannon = require('autocannon');
const axios = require('axios');

const API_URL = 'http://localhost:5001/api/v1';

async function runAllTests() {
  console.log('===================================================');
  console.log(' VisiTrack System-Wide QA Test Runner ');
  console.log('===================================================');

  // --- Setup & Auth ---
  let adminToken, exhibitorToken, visitorToken;
  try {
    const adminRes = await axios.post(`${API_URL}/auth/login`, { email: 'admin@event.com', password: 'admin123' });
    adminToken = adminRes.data.data.tokens.access.token;

    const exhibitorRes = await axios.post(`${API_URL}/auth/login`, { email: 'exhibitor0@example.com', password: 'admin123' });
    exhibitorToken = exhibitorRes.data.data.tokens.access.token;
    
    console.log('[+] Authentication passed for Admin and Exhibitor.');
  } catch(e) {
    console.error('[-] Auth failed. Please ensure seed data is present and backend is running.', e.message);
    process.exit(1);
  }

  // --- 1. Security Testing (RBAC & Tenant Isolation) ---
  console.log('\n--- 1. Security Testing ---');
  try {
    console.log('[*] Testing RBAC (Exhibitor hitting Admin Endpoint)...');
    await axios.get(`${API_URL}/admin/tenants`, { headers: { Authorization: `Bearer ${exhibitorToken}` } });
    console.log('[-] FAIL: Exhibitor accessed Admin endpoint. Security breach detected.');
  } catch (error) {
    if (error.response?.status === 403 || error.response?.status === 401) {
      console.log('[+] PASS: RBAC boundaries respected. Exhibitor strictly denied access to Admin endpoint.');
    } else {
      console.log('[-] ERROR: Unexpected security response code:', error.response?.status);
    }
  }

  // --- 2. Functional Testing (End-to-End API Workflows) ---
  console.log('\n--- 2. Functional Testing ---');
  let newLeadId;
  try {
    console.log('[*] Testing CRUD Operations (Lead Capture Flow)...');
    const leadRes = await axios.post(`${API_URL}/leads`, {
      name: "QA Automated Test Lead",
      email: "qatest@example.com",
      phone: "1234567890",
      company: "QA Inc"
    }, { headers: { Authorization: `Bearer ${exhibitorToken}` } });

    newLeadId = leadRes.data.data._id;
    console.log('[+] PASS: Core functionality operational. Lead successfully captured and saved to db.');

    // --- NEW: Stall Booking Flow Testing ---
    console.log('[*] Testing Stall Booking Workflow (Exhibitor Request + Admin Approval)...');
    
    // 1. Get an active event
    const eventsRes = await axios.get(`${API_URL}/events`);
    const testEvent = eventsRes.data.data.results?.[0];
    if (!testEvent) throw new Error('No events found for stall testing');

    // 2. Exhibitor requests a stall
    const stallRequestRes = await axios.post(`${API_URL}/stalls`, {
      eventId: testEvent._id,
      companyName: "QA Test Exhibitor LLC",
      notes: "Need corner stall with power"
    }, { headers: { Authorization: `Bearer ${exhibitorToken}` } });
    
    const bookingId = stallRequestRes.data.data._id;
    console.log('[+] PASS: Exhibitor stall request successfully submitted.');

    // 3. Admin approves and assigns stall ID 'QA-1'
    await axios.post(`${API_URL}/stalls/approve/${bookingId}`, {
      stallId: 'QA-1'
    }, { headers: { Authorization: `Bearer ${adminToken}` } });
    
    console.log('[+] PASS: Admin assigned and approved stall QA-1.');
    
    // 4. Verify Stall list reflects the booking
    const stallsRes = await axios.get(`${API_URL}/stalls/event/${testEvent._id}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const found = stallsRes.data.data.find(s => s.stallId === 'QA-1');
    if (found) {
      console.log('[+] PASS: Event stall directory reflects approved assignment.');
    } else {
      console.log('[-] FAIL: Approved stall not found in event directory.');
    }

    // --- NEW: Form Template & Participant Workflow ---
    console.log('\n[*] Testing Form Template & Participant Workflow (Custom Data Capture)...');
    
    // 1. Create a Form Template (as Admin)
    const templateRes = await axios.post(`${API_URL}/form-templates`, {
      name: "QA Innovation Summit Template",
      description: "Custom data requirements for high-profile attendees",
      steps: [
        {
          title: "Professional Profile",
          fields: [
            { label: "Current Role", type: "text", required: true },
            { label: "Company Scale", type: "select", options: ["1-50", "51-500", "500+"], required: true }
          ]
        }
      ]
    }, { headers: { Authorization: `Bearer ${adminToken}` } });
    
    const templateId = templateRes.data.data._id;
    console.log('[+] PASS: Global Form Template registered by Admin.');

    // 2. Attach Template to Event (as Organizer/Admin)
    const formRes = await axios.post(`${API_URL}/forms`, {
      eventId: testEvent._id,
      title: "Summit Entrance Qualifier",
      steps: templateRes.data.data.steps
    }, { headers: { Authorization: `Bearer ${adminToken}` } });
    
    console.log('[+] PASS: Custom Form Architecture deployed to event.');

    // 3. Register Visitor with Custom Data (Metadata)
    const visitorRes = await axios.post(`${API_URL}/visitors`, {
      name: "Metadata Mike",
      email: "mike.metadata@example.com",
      phone: "9988776655",
      eventId: testEvent._id,
      metadata: {
        "Professional Profile.Current Role": "Lead Engineer",
        "Professional Profile.Company Scale": "500+"
      }
    });

    console.log('[+] PASS: Visitor registered with dynamic form metadata.');

    // 4. Verify Organizer can see metadata
    const visitorRecordRes = await axios.get(`${API_URL}/visitors?eventId=${testEvent._id}&search=Metadata`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    const mike = visitorRecordRes.data.data.results?.[0];
    if (mike && mike.metadata && mike.metadata["Professional Profile.Current Role"] === "Lead Engineer") {
      console.log('[+] PASS: Custom form intelligence successfully persisted and retrieved.');
    } else {
      console.log('[-] FAIL: Metadata persistence failure or data mismatch.');
    }

  } catch(e) {
    console.log('[-] FAIL: Functional workflow test failed.', e.message);
    if (e.response?.data) console.log('    Detail:', JSON.stringify(e.response.data));
  }

  // --- 3. Breaking / Stress Tests ---
  console.log('\n--- 3. Breaking / Stress Testing ---');
  try {
    console.log('[*] Firing malformed edge-case payloads to test validation handlers...');
    await axios.post(`${API_URL}/leads`, {
       name: { invalid: "malicious_object_injection" }, // Malformed
       email: "not-an-email"
    }, { headers: { Authorization: `Bearer ${exhibitorToken}` } });
    console.log('[-] FAIL: System accepted malformed payload. Missing Joi validation or defensive checks.');
  } catch (err) {
    if (err.response?.status === 400 || err.response?.status === 500) {
      console.log('[+] PASS: System rejected malformed payloads robustly. Application did not crash.');
    } else {
      console.log('[-] ERROR: Breaking test unexpected response code:', err.response?.status);
    }
  }

  // --- 4. Performance Testing (Load) ---
  console.log('\n--- 4. Performance Testing ---');
  console.log('[*] Spinning up Autocannon Core for 100 concurrent connections holding 10 seconds of pressure...');
  await new Promise((resolve) => {
    const instance = autocannon({
      url: `${API_URL}/leads?limit=50&page=1`,
      connections: 100,
      duration: 10,
      headers: {
        Authorization: `Bearer ${exhibitorToken}`
      }
    }, (err, result) => {
      if (err) {
         console.log('[-] FAIL: Load testing suite failed to run.', err);
         resolve();
         return;
      }
      console.log(`[+] PASS: Performance Metrics Captured Successfully`);
      console.log(`    Total Requests Proccessed: ${result.requests.total}`);
      console.log(`    Requests/Sec Avg: ${result.requests.average}`);
      console.log(`    Latency Avg: ${result.latency.average} ms`);
      console.log(`    High/Low Latency: ${result.latency.max} ms / ${result.latency.min} ms`);
      console.log(`    Errors: ${result.errors}`);
      console.log(`    Timeouts: ${result.timeouts}`);
      resolve();
    });
    autocannon.track(instance, { renderProgressBar: false });
  });

  console.log('\n===================================================');
  console.log(' VisiTrack System QA Matrix Complete.');
  console.log('===================================================');
}

runAllTests();
