// server/routes/balance.js
const express = require('express');
const db = require('../db'); // Import the database query function

const router = express.Router();
const BALANCE_KEY = 'bankBalance';

/**
 * GET /api/balance
 * Fetches the current bank balance stored in the app_settings table.
 * Returns { balance: number } or a default value if not found/invalid.
 */
router.get('/', async (req, res) => {
  console.log(`GET /api/balance`);
  try {
    const result = await db.query(
      'SELECT value FROM app_settings WHERE key = $1',
      [BALANCE_KEY]
    );

    if (result.rows.length === 0) {
      console.warn(`Key '${BALANCE_KEY}' not found. Returning 0.`);
      return res.json({ balance: 0 });
    }

    const balance = parseFloat(result.rows[0].value);
    if (isNaN(balance)) {
      console.error(`Invalid stored value for '${BALANCE_KEY}': ${result.rows[0].value}`);
      return res.json({ balance: 0 });
    }

    res.json({ balance });
  } catch (err) {
    console.error('Error fetching balance:', err);
    res.status(500).json({ error: 'Internal server error while fetching balance.' });
  }
});

/**
 * PUT /api/balance
 * Updates (or inserts) the bank balance value in the app_settings table.
 * Expects { balance: number } in the request body.
 * Returns the updated { balance: number }.
 */
router.put('/', async (req, res) => {
  const { balance } = req.body;
  console.log(`PUT /api/balance - update to: ${balance}`);

  if (typeof balance !== 'number' || isNaN(balance)) {
    return res.status(400).json({ error: 'Invalid balance. Must be a number.' });
  }

  try {
    const result = await db.query(
      `INSERT INTO app_settings (key, value)
       VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = $2
       RETURNING value`,
      [BALANCE_KEY, balance.toFixed(2)]
    );

    const updated = parseFloat(result.rows[0].value);
    res.json({ balance: updated });
  } catch (err) {
    console.error('Error updating balance:', err);
    res.status(500).json({ error: 'Internal server error while updating balance.' });
  }
});

module.exports = router;
