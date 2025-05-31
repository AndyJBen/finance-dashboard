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
    console.log('✔ app_settings schema ensured');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bill_master (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT,
        recurrence_pattern TEXT DEFAULT 'none',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✔ bill_master schema ensured');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bills (
        id         SERIAL PRIMARY KEY,
        master_id  INT NOT NULL REFERENCES bill_master(id) ON DELETE CASCADE,
        amount     NUMERIC NOT NULL,
        due_date   DATE    NOT NULL,
        is_paid    BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✔ bills schema ensured');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS credit_cards (
        id         SERIAL PRIMARY KEY,
        name       TEXT    NOT NULL,
        balance    NUMERIC NOT NULL,
        sort_order INT     DEFAULT 0,
        include_in_due_balance BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await pool.query(`
      ALTER TABLE credit_cards
        ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0,
        ADD COLUMN IF NOT EXISTS include_in_due_balance BOOLEAN DEFAULT TRUE;
    `);
    console.log('✔ credit_cards schema ensured');
  } catch (err) {
    console.error('❌ Initialization error:', err);
  } finally  {
    console.log('Initialization finished.');
    process.exit(0);
  }
}

init();
