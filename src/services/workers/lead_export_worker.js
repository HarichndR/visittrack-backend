const { parentPort, workerData } = require('worker_threads');

const generateCsv = (leads) => {
  if (!leads || leads.length === 0) {
    return 'No data available\n';
  }
  
  const headers = [
    'Lead ID',
    'Visitor Name',
    'Email',
    'Phone',
    'Profession',
    'Interests',
    'Rating',
    'Status',
    'Notes',
    'Captured At'
  ];
  
  const rows = leads.map(lead => {
    return [
      lead._id,
      `"${lead.visitorSnapshot?.name || lead.visitorId?.name || ''}"`,
      `"${lead.visitorSnapshot?.email || lead.visitorId?.email || ''}"`,
      `"${lead.visitorSnapshot?.phone || lead.visitorId?.phone || ''}"`,
      `"${lead.visitorSnapshot?.profession || ''}"`,
      `"${(lead.visitorSnapshot?.interests || []).join('; ')}"`,
      lead.rating || 0,
      lead.status || 'COLD',
      `"${(lead.notes || '').replace(/"/g, '""')}"`, // Escape quotes in notes
      new Date(lead.createdAt).toISOString()
    ].join(',');
  });
  
  return [headers.join(','), ...rows].join('\n');
};

try {
  const csvString = generateCsv(workerData.leads);
  parentPort.postMessage({ status: 'done', data: csvString });
} catch (error) {
  parentPort.postMessage({ status: 'error', error: error.message });
}
