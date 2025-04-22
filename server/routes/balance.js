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
// Path is relative to the '/api/balance' mount point in server.js
router.get('/', async (req, res) => {
  console.log(`GET /api/balance - Fetching balance for key: ${BALANCE_KEY}`);
  try {
    const result = await db.query(
      'SELECT value FROM app_settings WHERE key = $1',
      [BALANCE_KEY]
    );

    if (result.rows.length === 0) {
      console.warn(`Setting key '${BALANCE_KEY}' not found in database. Returning 0.`);
      return res.json({ balance: 0 });
    }

    const balance = parseFloat(result.rows[0].value);

    if (isNaN(balance)) {
        console.error(`Invalid balance value found in DB for key '${BALANCE_KEY}': ${result.rows[0].value}`);
        return res.json({ balance: 0 });
    }

    console.log(`GET /api/balance - Found balance: ${balance}`);
    res.json({ balance });

  } catch (err) {
    console.error('Error fetching bank balance:', err);
    res.status(500).json({ error: 'Internal server error while fetching balance.' });
  }
});

/**
 * PUT /api/balance
 * Updates (or inserts) the bank balance value in the app_settings table.
 * Expects { balance: number } in the request body.
 * Returns the updated { balance: number }.
 */
// Path is relative to the '/api/balance' mount point in server.js
router.put('/', async (req, res) => {
  const { balance } = req.body;
  console.log(`PUT /api/balance - Received request to update balance to: ${balance}`);

  if (typeof balance !== 'number' || isNaN(balance)) {
    console.error(`PUT /api/balance - Invalid balance value received: ${balance}`);
    return res.status(400).json({ error: 'Invalid balance value provided. Must be a number.' });
  }

  const balanceString = balance.toFixed(2);

  try {
    const result = await db.query(
      `INSERT INTO app_settings (key, value)
       VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = $2
       RETURNING value`,
      [BALANCE_KEY, balanceString]
    );

    const updatedBalance = parseFloat(result.rows[0].value);

    console.log(`PUT /api/balance - Successfully updated balance to: ${updatedBalance}`);
    res.json({ balance: updatedBalance });

  } catch (err) {
    console.error('Error updating bank balance:', err);
    res.status(500).json({ error: 'Internal server error while updating balance.' });
  }
});

module.exports = router; // Export the router for use in server.js