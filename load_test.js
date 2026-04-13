const autocannon = require('autocannon');
const axios = require('axios');

const API_URL = 'http://localhost:5001/api/v1';

async function runTest() {
  console.log('Login as Exhibitor...');
  let token;
  try {
    const res = await axios.post(`${API_URL}/auth/login`, {
      email: 'exhibitor0@example.com',
      password: 'admin123'
    });
    token = res.data.data.tokens.access.token;
    console.log('Got token for load test');
  } catch(e) {
    console.error('Login failed:', e.message);
    process.exit(1);
  }

  console.log('\n--- Test 1: Heavy Dashboard Queries (Pagination & Filtering) ---');
  await new Promise((resolve) => {
    const instance = autocannon({
      url: `${API_URL}/leads?limit=50&page=1`,
      connections: 50,
      duration: 10,
      headers: {
        Authorization: `Bearer ${token}`
      }
    }, (err, result) => {
      console.log(`Req/Sec: ${result.requests.average}`);
      console.log(`Latency (ms): ${result.latency.average}`);
      resolve();
    });
    autocannon.track(instance, { renderProgressBar: false });
  });

  console.log('\n--- Test 2: Worker Thread CSV Export ---');
  await new Promise((resolve) => {
    const instance = autocannon({
      url: `${API_URL}/leads/export`,
      connections: 10, // concurrent exports
      duration: 15,
      headers: {
        Authorization: `Bearer ${token}`
      }
    }, (err, result) => {
      console.log(`Req/Sec: ${result.requests.average}`);
      console.log(`Latency (ms): ${result.latency.average}`);
      resolve();
    });
    autocannon.track(instance, { renderProgressBar: false });
  });
}

runTest();
