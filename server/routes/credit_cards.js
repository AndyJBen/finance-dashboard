const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM credit_cards ORDER BY sort_order ASC');
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching credit cards:", err);
    res.status(500).json({ error: "Internal server error while fetching credit cards." });
  }
});

module.exports = router;
