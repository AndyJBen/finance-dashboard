// server/init-db.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const pool = require('./db');

async function init() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS app_settings (
        key   TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
      INSERT INTO app_settings(key, value)
        VALUES ('bankBalance','0')
        ON CONFLICT (key) DO NOTHING;
    `);
    console.log('✔ app_settings ready');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bills (
        id           SERIAL PRIMARY KEY,
        name         TEXT    NOT NULL,
        amount       NUMERIC NOT NULL,
        due_date     DATE    NOT NULL,
        category     TEXT,
        is_paid      BOOLEAN DEFAULT FALSE,
        is_recurring BOOLEAN DEFAULT FALSE,
        created_at   TIMESTAMP DEFAULT NOW(),
        updated_at   TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✔ bills ready');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS credit_cards (
        id         SERIAL PRIMARY KEY,
        name       TEXT    NOT NULL,
        balance    NUMERIC NOT NULL,
        sort_order INT     DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✔ credit_cards ready');
  } catch (err) {
    console.error('❌ Initialization error:', err);
  } finally  {
    console.log('Initialization finished.');
    process.exit(0);
  }
}

init();
