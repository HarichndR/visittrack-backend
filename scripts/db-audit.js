const mongoose = require('mongoose');

const mongoUri = 'mongodb+srv://harichndrsolunke4_db_user:oyTa17WRmQbebI60@cluster0.dg1eofu.mongodb.net/?appName=Cluster0';

async function auditData() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const collections = await mongoose.connection.db.listCollections().toArray();
    const results = {};

    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      results[collection.name] = count;
    }

    console.log('--- Database Audit Results ---');
    console.table(results);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Audit failed:', err);
    process.exit(1);
  }
}

auditData();
