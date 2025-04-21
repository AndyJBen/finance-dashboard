const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  const { month } = req.query;

  try {
    const result = await pool.query(
      `SELECT * FROM bills WHERE TO_CHAR(due_date, 'YYYY-MM') = $1 ORDER BY due_date`,
      [month]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching bills:", err);
    res.status(500).json({ error: "Internal server error while fetching bills." });
  }
});

module.exports = router;
