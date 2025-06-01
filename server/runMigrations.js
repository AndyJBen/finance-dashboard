const fs = require('fs');
const path = require('path');
const db = require('./db');

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  await db.query(`CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    filename TEXT UNIQUE,
    executed_at TIMESTAMP DEFAULT NOW()
  )`);

  for (const file of files) {
    const already = await db.query('SELECT 1 FROM migrations WHERE filename = $1', [file]);
    if (already.rows.length > 0) continue;

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    console.log(`Running migration ${file}`);
    try {
      await db.query(sql);
      await db.query('INSERT INTO migrations (filename) VALUES ($1)', [file]);
      console.log(`Migration ${file} complete`);
    } catch (err) {
      console.error(`Migration ${file} failed:`, err);
      throw err;
    }
  }
}

module.exports = runMigrations;
