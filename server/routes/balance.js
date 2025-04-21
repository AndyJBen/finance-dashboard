const express = require('express');
const db      = require('../db');
const router  = express.Router();
const BALANCE_KEY = 'bankBalance';

// GET /api/balance
router.get('/', async (req, res) => {
  console.log('GET /api/balance');
  try {
    const result = await db.query(
      'SELECT value FROM app_settings WHERE key = $1',
      [BALANCE_KEY]
    );
    if (result.rows.length === 0) {
      console.warn(`Key not found: '${BALANCE_KEY}', returning 0`);
      return res.json({ balance: 0 });
    }
    const val = parseFloat(result.rows[0].value);
    if (isNaN(val)) {
      console.error(`Invalid value in DB: ${result.rows[0].value}`);
      return res.json({ balance: 0 });
    }
    res.json({ balance: val });
  } catch (err) {
    console.error('Error fetching balance ▶', err);
    res.status(500).json({ error: 'Internal server error while fetching balance.' });
  }
});

// PUT /api/balance
router.put('/', async (req, res) => {
  const { balance } = req.body;
  console.log(`PUT /api/balance ▶ update to ${balance}`);
  if (typeof balance !== 'number' || isNaN(balance)) {
    return res.status(400).json({ error: 'Balance must be a valid number.' });
  }
  try {
    const result = await db.query(
      `INSERT INTO app_settings (key, value)
       VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = $2
       RETURNING value`,
      [BALANCE_KEY, balance.toFixed(2)]
    );
    res.json({ balance: parseFloat(result.rows[0].value) });
  } catch (err) {
    console.error('Error updating balance ▶', err);
    res.status(500).json({ error: 'Internal server error while updating balance.' });
  }
});

module.exports = router;
