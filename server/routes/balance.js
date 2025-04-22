// server/routes/balance.js - Updated for direct routing approach

const express = require('express');
const db = require('../db');
const router = express.Router();
const BALANCE_KEY = 'bankBalance';

// GET /api/balance - Fetches the current bank balance
router.get('/', async (req, res) => {
  console.log(`GET /api/balance handler executing`);
  try {
    const result = await db.query(
      'SELECT value FROM app_settings WHERE key = $1',
      [BALANCE_KEY]
    );

    if (result.rows.length === 0) {
      console.warn(`Setting key '${BALANCE_KEY}' not found. Returning 0.`);
      return res.json({ balance: 0 });
    }

    const balance = parseFloat(result.rows[0].value);
    if (isNaN(balance)) {
      console.error(`Invalid balance value: ${result.rows[0].value}`);
      return res.json({ balance: 0 });
    }

    console.log(`Found balance: ${balance}`);
    res.json({ balance });
  } catch (err) {
    console.error('Error fetching balance:', err);
    res.status(500).json({ error: 'Error fetching balance' });
  }
});

// PUT /api/balance - Updates the bank balance
router.put('/', async (req, res) => {
  console.log(`PUT /api/balance handler executing with body:`, req.body);
  const { balance } = req.body;

  if (typeof balance !== 'number' || isNaN(balance)) {
    return res.status(400).json({ error: 'Invalid balance' });
  }

  try {
    const result = await db.query(
      `INSERT INTO app_settings (key, value)
       VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = $2
       RETURNING value`,
      [BALANCE_KEY, balance.toFixed(2)]
    );

    const updatedBalance = parseFloat(result.rows[0].value);
    console.log(`Updated balance to: ${updatedBalance}`);
    res.json({ balance: updatedBalance });
  } catch (err) {
    console.error('Error updating balance:', err);
    res.status(500).json({ error: 'Error updating balance' });
  }
});

module.exports = router;