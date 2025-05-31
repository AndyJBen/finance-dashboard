// server/routes/bills.js
const express = require('express');
const db = require('../db');
const dayjs = require('dayjs');

const router = express.Router();

const validateBillData = (data) => {
  if (!data || typeof data.name !== 'string' || data.name.trim() === '') return 'Bill name is required.';
  if (typeof data.amount !== 'number' || data.amount < 0) return 'Valid, non-negative amount is required.';
  if (!data.dueDate || !dayjs(data.dueDate).isValid()) return 'Valid due date is required (YYYY-MM-DD).';
  return null;
};

const formatBillResponse = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    masterId: row.master_id,
    name: row.name ?? 'Unknown',
    amount: parseFloat(row.amount),
    dueDate: row.due_date ? dayjs(row.due_date).format('YYYY-MM-DD') : null,
    category: row.category ?? null,
    isPaid: Boolean(row.is_paid),
    isRecurring: row.recurrence_pattern ? row.recurrence_pattern !== 'none' : false,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

const deleteFutureRecurringInstances = async (masterId, currentBillDueDate) => {
  const deleteQuery = `DELETE FROM bills WHERE master_id = $1 AND due_date > $2`;
  await db.query(deleteQuery, [masterId, currentBillDueDate]);
};

const createRecurringInstance = async (masterId, baseBill, monthsToAdd) => {
  const targetDueDate = dayjs(baseBill.due_date || baseBill.dueDate).add(monthsToAdd, 'month');
  const targetMonth = targetDueDate.format('YYYY-MM');
  const exists = await db.query(`SELECT 1 FROM bills WHERE master_id = $1 AND TO_CHAR(due_date, 'YYYY-MM') = $2`, [masterId, targetMonth]);
  if (exists.rows.length === 0) {
    await db.query(`INSERT INTO bills (master_id, amount, due_date, is_paid) VALUES ($1, $2, $3, false)`, [masterId, baseBill.amount, targetDueDate.format('YYYY-MM-DD')]);
  }
};

const ensureInstancesUpToMonth = async (month) => {
  const targetDate = dayjs(`${month}-01`).endOf('month');
  const masters = await db.query("SELECT id FROM bill_master WHERE recurrence_pattern = 'monthly'");
  for (const m of masters.rows) {
    const latest = await db.query("SELECT amount, due_date FROM bills WHERE master_id = $1 ORDER BY due_date DESC LIMIT 1", [m.id]);
    if (latest.rows.length === 0) continue;
    let nextDate = dayjs(latest.rows[0].due_date).add(1, 'month');
    const amount = parseFloat(latest.rows[0].amount);
    while (nextDate.isSameOrBefore(targetDate, 'month')) {
      const exists = await db.query("SELECT 1 FROM bills WHERE master_id = $1 AND TO_CHAR(due_date,'YYYY-MM') = $2", [m.id, nextDate.format('YYYY-MM')]);
      if (exists.rows.length === 0) {
        await db.query("INSERT INTO bills (master_id, amount, due_date, is_paid) VALUES ($1, $2, $3, false)", [m.id, amount, nextDate.format('YYYY-MM-DD')]);
      }
      nextDate = nextDate.add(1, 'month');
    }
  }
};

router.get('/', async (req, res) => {
  const month = req.query.month;
  const view = req.query.view;
  if (!month || !/^\d{4}-\d{2}$/.test(month)) return res.status(400).json({ error: 'Invalid or missing month query parameter. Use YYYY-MM format.' });
  try {
    await ensureInstancesUpToMonth(month);
    const start = dayjs(month).startOf('month').format('YYYY-MM-DD');
    const end = dayjs(month).endOf('month').format('YYYY-MM-DD');
    let query, params;
    if (view === 'current_and_overdue') {
      query = `SELECT b.*, m.name, m.category, m.recurrence_pattern FROM bills b JOIN bill_master m ON b.master_id = m.id WHERE (b.due_date BETWEEN $1 AND $2) OR (b.due_date < $1 AND b.is_paid = false) ORDER BY CASE WHEN b.due_date < $1 AND b.is_paid = false THEN 0 ELSE 1 END, b.due_date ASC`;
      params = [start, end];
    } else {
      query = `SELECT b.*, m.name, m.category, m.recurrence_pattern FROM bills b JOIN bill_master m ON b.master_id = m.id WHERE b.due_date BETWEEN $1 AND $2 ORDER BY b.due_date ASC`;
      params = [start, end];
    }
    const result = await db.query(query, params);
    console.log("Bills returned from DB:", result.rows);
    res.json(result.rows.map(formatBillResponse));
  } catch (err) {
    console.error('Error fetching bills:', err);
    res.status(500).json({ error: 'Internal server error while fetching bills.' });
  }
});

module.exports = router;
