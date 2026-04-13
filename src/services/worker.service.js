const { Worker } = require('worker_threads');
const path = require('path');

/**
 * Execute lead export in a separate worker thread to avoid blocking the event loop
 * @param {Array} leads - The lead documents to format as CSV
 * @returns {Promise<string>}
 */
const exportLeadsToCsv = (leads) => {
  return new Promise((resolve, reject) => {
    const workerPath = path.join(__dirname, 'workers', 'lead_export_worker.js');
    const worker = new Worker(workerPath, {
      workerData: { leads: JSON.parse(JSON.stringify(leads)) } // Strip mongoose methods
    });

    worker.on('message', (message) => {
      if (message.status === 'done') {
        resolve(message.data);
      } else {
        reject(new Error(message.error));
      }
    });

    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
};

module.exports = {
  exportLeadsToCsv
};
