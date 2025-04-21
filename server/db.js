// server/db.js
const { Pool } = require('pg');

console.log("💥 DATABASE_URL in db.js:", process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Render’s managed DBs
  },
});

// Optional test to verify connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Error acquiring client for DB connection test:', err.stack);
  }
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) {
      return console.error('❌ Error executing DB test query:', err.stack);
    }
    console.log('✅ DB connection successful. Time from DB:', result.rows[0].now);
  });
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
