// server/db.js
const { Pool } = require('pg');

// Create a connection pool using environment variables
// Make sure your .env file in the server/ directory has the correct
// DB_USER, DB_HOST, DB_DATABASE, DB_PASSWORD, DB_PORT values
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test the connection (optional, but helpful for debugging)
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client for DB connection test:', err.stack);
  }
  client.query('SELECT NOW()', (err, result) => {
    release(); // Release the client back to the pool
    if (err) {
      return console.error('Error executing DB connection test query:', err.stack);
    }
    console.log('Database connection successful. Current time from DB:', result.rows[0].now);
  });
});


// Export a query function that uses the pool
module.exports = {
  query: (text, params) => pool.query(text, params),
  // You can add other specific DB functions here if needed
  // e.g., getClient: () => pool.connect() // If you need manual transaction control
};
