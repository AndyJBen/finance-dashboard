// server/routes/bills.js
const express = require('express');
const db = require('../db');
const dayjs = require('dayjs');
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore');
dayjs.extend(isSameOrBefore);

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
  console.log('deleteFutureRecurringInstances query:', deleteQuery, [masterId, currentBillDueDate]);
  await db.query(deleteQuery, [masterId, currentBillDueDate]);
};

const createRecurringInstance = async (masterId, baseBill, monthsToAdd) => {
  const targetDueDate = dayjs(baseBill.due_date || baseBill.dueDate).add(monthsToAdd, 'month');
  const targetMonth = targetDueDate.format('YYYY-MM');
  const existsQuery = `SELECT 1 FROM bills WHERE master_id = $1 AND TO_CHAR(due_date, 'YYYY-MM') = $2`;
  console.log('createRecurringInstance existsQuery:', existsQuery, [masterId, targetMonth]);
  const exists = await db.query(existsQuery, [masterId, targetMonth]);
  if (exists.rows.length === 0) {
    const insertQuery = `INSERT INTO bills (master_id, amount, due_date, is_paid) VALUES ($1, $2, $3, false)`;
    const params = [masterId, baseBill.amount, targetDueDate.format('YYYY-MM-DD')];
    console.log('createRecurringInstance insertQuery:', insertQuery, params);
    await db.query(insertQuery, params);
  }
};

const ensureInstancesUpToMonth = async (month) => {
  const targetDate = dayjs(`${month}-01`).endOf('month');
  const mastersQuery = "SELECT id FROM bill_master WHERE recurrence_pattern = 'monthly' AND is_active = TRUE";
  console.log('ensureInstancesUpToMonth mastersQuery:', mastersQuery);
  const masters = await db.query(mastersQuery);
  for (const m of masters.rows) {
    const latestQuery = "SELECT amount, due_date FROM bills WHERE master_id = $1 ORDER BY due_date DESC LIMIT 1";
    console.log('ensureInstancesUpToMonth latestQuery:', latestQuery, [m.id]);
    const latest = await db.query(latestQuery, [m.id]);
    if (latest.rows.length === 0) continue;
    let nextDate = dayjs(latest.rows[0].due_date).add(1, 'month');
    const amount = parseFloat(latest.rows[0].amount);
    while (nextDate.isSameOrBefore(targetDate, 'month')) {
      const existsQuery = "SELECT 1 FROM bills WHERE master_id = $1 AND TO_CHAR(due_date,'YYYY-MM') = $2";
      console.log('ensureInstancesUpToMonth existsQuery:', existsQuery, [m.id, nextDate.format('YYYY-MM')]);
      const exists = await db.query(existsQuery, [m.id, nextDate.format('YYYY-MM')]);
      if (exists.rows.length === 0) {
        const insertQuery = "INSERT INTO bills (master_id, amount, due_date, is_paid) VALUES ($1, $2, $3, false)";
        const params = [m.id, amount, nextDate.format('YYYY-MM-DD')];
        console.log('ensureInstancesUpToMonth insertQuery:', insertQuery, params);
        await db.query(insertQuery, params);
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
    console.log('GET /api/bills params:', { month, view });
    await ensureInstancesUpToMonth(month);
    const start = dayjs(month).startOf('month').format('YYYY-MM-DD');
    const end = dayjs(month).endOf('month').format('YYYY-MM-DD');
    let query, params;
    if (view === 'current_and_overdue') {
      query = `SELECT b.*, m.name, m.category, m.recurrence_pattern FROM bills b JOIN bill_master m ON b.master_id = m.id WHERE b.is_deleted = false AND ((b.due_date BETWEEN $1 AND $2) OR (b.due_date < $1 AND b.is_paid = false)) ORDER BY CASE WHEN b.due_date < $1 AND b.is_paid = false THEN 0 ELSE 1 END, b.due_date ASC`;
      params = [start, end];
    } else {
      query = `SELECT b.*, m.name, m.category, m.recurrence_pattern FROM bills b JOIN bill_master m ON b.master_id = m.id WHERE b.is_deleted = false AND b.due_date BETWEEN $1 AND $2 ORDER BY b.due_date ASC`;
      params = [start, end];
    }
    console.log('GET /api/bills query:', query, params);
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
  let category = billData.category ?? null;
  if (typeof category === 'string' && category.trim() === '') {
    category = null;
  }
  const isPaid = Boolean(billData.isPaid);
  const isRecurring = Boolean(billData.isRecurring);
  const recurrence = isRecurring ? 'monthly' : 'none';

  try {
    let masterId;
    const existingMasterQuery =
      `SELECT id, recurrence_pattern FROM bill_master WHERE name = $1 AND (category IS NOT DISTINCT FROM $2) LIMIT 1`;
    const existingParams = [name.trim(), category];
    console.log('POST /api/bills existingMasterQuery:', existingMasterQuery, existingParams);
    const existingMaster = await db.query(existingMasterQuery, existingParams);

    if (existingMaster.rows.length === 0) {
      const insertMasterQuery =
        `INSERT INTO bill_master (name, category, recurrence_pattern) VALUES ($1, $2, $3) RETURNING id`;
      const insertMasterParams = [name.trim(), category, recurrence];
      console.log('POST /api/bills insertMasterQuery:', insertMasterQuery, insertMasterParams);
      const masterRes = await db.query(insertMasterQuery, insertMasterParams);
      masterId = masterRes.rows[0].id;
    } else {
      masterId = existingMaster.rows[0].id;
      if (existingMaster.rows[0].recurrence_pattern !== recurrence) {
        const updateMasterQuery = 'UPDATE bill_master SET recurrence_pattern = $1 WHERE id = $2';
        const updateParams = [recurrence, masterId];
        console.log('POST /api/bills updateMasterQuery:', updateMasterQuery, updateParams);
        await db.query(updateMasterQuery, updateParams);
      }
    }

    const insertBillQuery =
      `INSERT INTO bills (master_id, amount, due_date, is_paid) VALUES ($1, $2, $3, $4) RETURNING *`;
    const insertBillParams = [masterId, amount, dueDate, isPaid];
    console.log('POST /api/bills insertBillQuery:', insertBillQuery, insertBillParams);
    const result = await db.query(insertBillQuery, insertBillParams);

    const createdBill = result.rows[0];

    if (isRecurring) {
      await createRecurringInstance(masterId, createdBill, 1);
    }

    const joinedQuery =
      `SELECT b.*, m.name, m.category, m.recurrence_pattern
       FROM bills b
       JOIN bill_master m ON b.master_id = m.id
       WHERE b.id = $1`;
    const joinedParams = [createdBill.id];
    console.log('POST /api/bills joinedQuery:', joinedQuery, joinedParams);
    const joined = await db.query(joinedQuery, joinedParams);

    res.status(201).json(formatBillResponse(joined.rows[0]));

  } catch (err) {
    console.error('POST /api/bills error:', err.stack || err);
    res.status(500).json({ error: 'Internal server error while creating bill.' });
  }
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const billId = parseInt(id, 10);
  if (isNaN(billId)) {
    return res.status(400).json({ error: 'Invalid bill ID.' });
  }

  const { amount, dueDate, isPaid, name, category } = req.body;

  const billUpdates = [];
  const billValues = [];
  let idx = 1;

  if (amount !== undefined) {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return res.status(400).json({ error: 'Amount must be a valid number.' });
    }
    billUpdates.push(`amount = $${idx}`);
    billValues.push(amount);
    idx++;
  }

  if (dueDate !== undefined) {
    if (!dayjs(dueDate).isValid()) {
      return res.status(400).json({ error: 'Invalid due date provided.' });
    }
    billUpdates.push(`due_date = $${idx}`);
    billValues.push(dayjs(dueDate).format('YYYY-MM-DD'));
    idx++;
  }

  if (isPaid !== undefined) {
    billUpdates.push(`is_paid = $${idx}`);
    billValues.push(Boolean(isPaid));
    idx++;
  }

  const masterUpdates = [];
  const masterValues = [];
  let mIdx = 1;

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Bill name cannot be empty.' });
    }
    masterUpdates.push(`name = $${mIdx}`);
    masterValues.push(name.trim());
    mIdx++;
  }

  if (category !== undefined) {
    masterUpdates.push(`category = $${mIdx}`);
    masterValues.push(category && category !== '' ? category : null);
    mIdx++;
  }

  if (billUpdates.length === 0 && masterUpdates.length === 0) {
    return res.status(400).json({ error: 'No valid fields provided for update.' });
  }

  try {
    if (billUpdates.length > 0) {
      const billQuery = `UPDATE bills SET ${billUpdates.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`;
      const result = await db.query(billQuery, [...billValues, billId]);
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Bill not found.' });
      }
    }

    if (masterUpdates.length > 0) {
      const masterQuery = `UPDATE bill_master SET ${masterUpdates.join(', ')}, updated_at = NOW() WHERE id = (SELECT master_id FROM bills WHERE id = $${mIdx})`;
      await db.query(masterQuery, [...masterValues, billId]);
    }

    const joined = await db.query(
      `SELECT b.*, m.name, m.category, m.recurrence_pattern
       FROM bills b JOIN bill_master m ON b.master_id = m.id
       WHERE b.id = $1`,
      [billId]
    );

    if (joined.rows.length === 0) {
      return res.status(404).json({ error: 'Bill not found.' });
    }

    res.json(formatBillResponse(joined.rows[0]));
  } catch (err) {
    console.error('PATCH /api/bills/:id error:', err.stack || err);
    res.status(500).json({ error: 'Internal server error while updating bill.' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const mode = req.query.mode;
  const billId = parseInt(id, 10);
  if (isNaN(billId)) {
    return res.status(400).json({ error: 'Invalid bill ID.' });
  }

  try {
    if (mode === 'instance') {
      const result = await db.query(
        'UPDATE bills SET is_deleted = true WHERE id = $1 RETURNING *',
        [billId]
      );
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Bill not found.' });
      }
      return res.json(formatBillResponse(result.rows[0]));
    }

    const result = await db.query('DELETE FROM bills WHERE id = $1 RETURNING id', [billId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Bill not found.' });
    }
    return res.status(204).send();
  } catch (err) {
    console.error('DELETE /api/bills/:id error:', err.stack || err);
    res.status(500).json({ error: 'Internal server error while deleting bill.' });
  }
});

module.exports = router;
