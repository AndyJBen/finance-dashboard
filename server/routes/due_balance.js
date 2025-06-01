const express = require('express');
const db = require('../db');

const router = express.Router();

// GET /api/due-balance - calculate total due balance (bills + credit cards)
router.get('/', async (req, res) => {
  try {
    const billsQuery = `
      SELECT COALESCE(SUM(distinct_bills.amount), 0) AS total_due
      FROM (
        SELECT DISTINCT b.id, b.amount
        FROM bills b
        JOIN bill_master m ON b.master_id = m.id
        WHERE b.is_deleted = FALSE
          AND m.is_active = TRUE
          AND b.is_paid = FALSE
          AND (
            b.due_date < date_trunc('month', CURRENT_DATE)
            OR (
              b.due_date >= date_trunc('month', CURRENT_DATE)
              AND b.due_date < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
            )
            OR LOWER(m.category) = 'bill prep'
          )
      ) AS distinct_bills`;
    const billsResult = await db.query(billsQuery);
    const billsTotal = parseFloat(billsResult.rows[0].total_due) || 0;

    const cardsQuery = `
      SELECT COALESCE(SUM(balance), 0) AS total_cc
      FROM credit_cards
      WHERE include_in_due_balance = TRUE`;
    const cardsResult = await db.query(cardsQuery);
    const cardsTotal = parseFloat(cardsResult.rows[0].total_cc) || 0;

    res.json({
      billTotal: billsTotal,
      creditCardTotal: cardsTotal,
      total: billsTotal + cardsTotal,
    });
  } catch (err) {
    console.error('GET /api/due-balance error:', err.stack || err);
    res.status(500).json({ error: 'Internal server error while calculating due balance.' });
  }
});

module.exports = router;
