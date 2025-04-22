// server/routes/balance.js
const express = require('express');
const db = require('../db'); // Import the database query function

const router = express.Router();
// Define the key used to store the balance in the app_settings table
const BALANCE_KEY = 'bankBalance';

/**
 * GET /api/balance
 * Fetches the current bank balance stored in the app_settings table.
 * Returns { balance: number } or a default value if not found/invalid.
 */
router.get('/', async (req, res) => {
  console.log(`GET /api/balance - Fetching balance for key: ${BALANCE_KEY}`);
  try {
    // Query the database for the setting value associated with BALANCE_KEY
    const result = await db.query(
      'SELECT value FROM app_settings WHERE key = $1',
      [BALANCE_KEY]
    );

    // Check if the setting key was found
    if (result.rows.length === 0) {
      // If the key doesn't exist, return a default balance (e.g., 0)
      console.warn(`Setting key '${BALANCE_KEY}' not found in database. Returning 0.`);
      // It might be better to insert the default value here if it's missing
      // await db.query('INSERT INTO app_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', [BALANCE_KEY, '0']);
      return res.json({ balance: 0 });
    }

    // The value is stored as TEXT, attempt to parse it into a floating-point number
    const balance = parseFloat(result.rows[0].value);

    // Validate if the parsed value is a valid number
    if (isNaN(balance)) {
        console.error(`Invalid balance value found in DB for key '${BALANCE_KEY}': ${result.rows[0].value}`);
        // Return 0 or send an error if the stored value is corrupted
        return res.json({ balance: 0 }); // Defaulting to 0 for safety
    }

    // Send the valid balance back to the client
    console.log(`GET /api/balance - Found balance: ${balance}`);
    res.json({ balance });

  } catch (err) {
    // Handle any database or unexpected errors
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
router.put('/', async (req, res) => {
  const { balance } = req.body; // Destructure the balance from the request body
  console.log(`PUT /api/balance - Received request to update balance to: ${balance}`);

  // Validate the incoming balance value
  if (typeof balance !== 'number' || isNaN(balance)) {
    console.error(`PUT /api/balance - Invalid balance value received: ${balance}`);
    return res.status(400).json({ error: 'Invalid balance value provided. Must be a number.' });
  }

  // Format the balance to a string with 2 decimal places for storing in the TEXT column
  // Adjust this if your database column type is NUMERIC or DECIMAL
  const balanceString = balance.toFixed(2);

  try {
    // Use PostgreSQL's UPSERT functionality:
    // INSERT the key/value pair.
    // If the key (BALANCE_KEY) already exists (ON CONFLICT), then UPDATE the value.
    // RETURNING value ensures we get the final stored value back.
    const result = await db.query(
      `INSERT INTO app_settings (key, value)
       VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = $2
       RETURNING value`,
      [BALANCE_KEY, balanceString]
    );

    // Parse the returned value back to a number to send to the client
    const updatedBalance = parseFloat(result.rows[0].value);

    console.log(`PUT /api/balance - Successfully updated balance to: ${updatedBalance}`);
    res.json({ balance: updatedBalance }); // Send back the updated balance

  } catch (err) {
    // Handle any database or unexpected errors during the update/insert
    console.error('Error updating bank balance:', err);
    res.status(500).json({ error: 'Internal server error while updating balance.' });
  }
});

module.exports = router; // Export the router for use in server.js
