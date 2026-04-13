const mongoose = require('mongoose');
const cache = require('./src/config/cache');
const logger = require('./src/utils/logger');

async function runCacheQA() {
  console.log('--- STARTING QA CACHE & CRON VERIFICATION ---');

  // 1. Verify Cache Set/Get with TTL
  console.log('1. Testing manual TTL...');
  await cache.set('test_key', 'test_value', { EX: 2 }); // 2 seconds
  
  let val = await cache.get('test_key');
  console.log('Immediate Get:', val === 'test_value' ? '✅ Success' : '❌ Failed');

  console.log('Waiting 3 seconds for expiration...');
  await new Promise(r => setTimeout(r, 3000));

  val = await cache.get('test_key');
  console.log('Expired Get:', val === null ? '✅ Success (Null)' : '❌ Failed (Value persistent)');

  // 2. Verify Cron Cleanup
  console.log('2. Testing Bulk Cron Cleanup...');
  // We manually inject an expired entry into the Map (since we have access to it in this script)
  // Wait, cache object doesn't expose storage, but we can call cleanup.
  
  // Set multiple keys
  await cache.set('bulk_1', 'v1', { EX: 1 });
  await cache.set('bulk_2', 'v2', { EX: 1 });
  
  console.log('Waiting for expiration...');
  await new Promise(r => setTimeout(r, 1500));

  // Manually trigger cleanup
  console.log('Triggering manual cleanup...');
  await cache.cleanup();
  
  console.log('✅ Cron Cleanup executed. Check logs for "Cache Cron: Cleared 2 expired items".');

  console.log('--- QA CACHE & CRON VERIFICATION COMPLETE ---');
  process.exit(0);
}

runCacheQA().catch(err => {
  console.error('QA Script Error:', err.message);
  process.exit(1);
});
