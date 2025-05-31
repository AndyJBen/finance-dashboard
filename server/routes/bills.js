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
    console.error('GET /api/bills error:', err.stack || err);
    res.status(500).json({ error: 'Internal server error while fetching bills.' });
  }
});

router.post('/', async (req, res) => {
  const billData = req.body;
  console.log('POST /api/bills payload:', billData);

  const validationError = validateBillData(billData);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { name, amount, dueDate } = billData;
  const category = billData.hasOwnProperty('category') ? billData.category : null;
  const isPaid = Boolean(billData.isPaid);
  const isRecurring = Boolean(billData.isRecurring);
  const recurrence = isRecurring ? 'monthly' : 'none';

  try {
    let masterId;
    const existingMaster = await db.query(
      `SELECT id, recurrence_pattern FROM bill_master WHERE name = $1 AND (category IS NOT DISTINCT FROM $2) LIMIT 1`,
      [name.trim(), category]
    );

    if (existingMaster.rows.length === 0) {
      const masterRes = await db.query(
        `INSERT INTO bill_master (name, category, recurrence_pattern)
         VALUES ($1, $2, $3) RETURNING id`,
        [name.trim(), category, recurrence]
      );
      masterId = masterRes.rows[0].id;
    } else {
      masterId = existingMaster.rows[0].id;
      if (existingMaster.rows[0].recurrence_pattern !== recurrence) {
        await db.query(
          'UPDATE bill_master SET recurrence_pattern = $1 WHERE id = $2',
          [recurrence, masterId]
        );
      }
    }

    const result = await db.query(
      `INSERT INTO bills (master_id, amount, due_date, is_paid)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [masterId, amount, dueDate, isPaid]
    );

    const createdBill = result.rows[0];

    if (isRecurring) {
      await createRecurringInstance(masterId, createdBill, 1);
    }

    const joined = await db.query(
      `SELECT b.*, m.name, m.category, m.recurrence_pattern
       FROM bills b
       JOIN bill_master m ON b.master_id = m.id
       WHERE b.id = $1`,
      [createdBill.id]
    );

    res.status(201).json(formatBillResponse(joined.rows[0]));

  } catch (err) {
    console.error('POST /api/bills error:', err.stack || err);
    res.status(500).json({ error: 'Internal server error while creating bill.' });
  }
});

module.exports = router;
