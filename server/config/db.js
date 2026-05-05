const { Pool, types } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Prevent node-postgres from parsing DATE columns into local timezone Date objects.
// This ensures dates like '2024-05-05' are returned as the exact string '2024-05-05'.
types.setTypeParser(1082, (val) => val);

pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log('✅ PostgreSQL connected');
  }
});

pool.on('error', (err) => {
  console.error('❌ Unexpected PostgreSQL error:', err);
  process.exit(-1);
});

module.exports = pool;
