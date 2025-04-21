const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query("SELECT value FROM app_settings WHERE key = 'bankBalance'");
    const balance = parseFloat(result.rows[0].value);
    res.json({ balance });
  } catch (err) {
    console.error("Error fetching balance:", err);
    res.status(500).json({ error: "Internal server error while fetching balance." });
  }
});

router.put('/', async (req, res) => {
  const { balance } = req.body;
  if (typeof balance !== 'number') {
    return res.status(400).json({ error: 'Balance must be a valid number.' });
  }

  try {
    await pool.query("UPDATE app_settings SET value = $1 WHERE key = 'bankBalance'", [balance]);
    res.json({ balance });
  } catch (err) {
    console.error("Error updating balance:", err);
    res.status(500).json({ error: "Internal server error while updating balance." });
  }
});

module.exports = router;
