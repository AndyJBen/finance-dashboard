const express = require('express');
const dayjs = require('dayjs');
const db = require('../db');

const router = express.Router();

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const from = req.query.from;
  const masterId = parseInt(id, 10);
  if (isNaN(masterId)) {
    return res.status(400).json({ error: 'Invalid master bill ID.' });
  }

  const { amount, category, dueDate } = req.body || {};
  if (amount === undefined && category === undefined && !dueDate) {
    return res.status(400).json({ error: 'No update fields provided.' });
  }

  const fromDate = from && dayjs(from).isValid()
    ? dayjs(from).format('YYYY-MM-DD')
    : dayjs().format('YYYY-MM-DD');

  const updates = [];
  const params = [masterId, fromDate];
  let idx = 3;

  const masterUpdates = [];
  const masterParams = [];
  let mIdx = 1;

  if (amount !== undefined) {
    updates.push(`amount = $${idx}`);
    params.push(amount);
    idx++;
  }

  if (category !== undefined) {
    updates.push(`category = $${idx}`);
    params.push(category && category !== '' ? category : null);
    idx++;

    masterUpdates.push(`category = $${mIdx}`);
    masterParams.push(category && category !== '' ? category : null);
    mIdx++;
  }

  if (dueDate) {
    const dayOfMonth = dayjs(dueDate).date();
    updates.push(
      `due_date = date_trunc('month', due_date) + ($${idx} - 1) * INTERVAL '1 day'`
    );
    params.push(dayOfMonth);
    idx++;
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No valid fields provided for update.' });
  }

  const query = `UPDATE bills
                 SET ${updates.join(', ')}, updated_at = NOW()
                 WHERE master_id = $1 AND due_date > $2 AND is_deleted = FALSE`;

  try {
    const result = await db.query(query, params);

    if (masterUpdates.length > 0) {
      const masterQuery = `UPDATE bill_master
                           SET ${masterUpdates.join(', ')}, updated_at = NOW()
                           WHERE id = $${mIdx}`;
      await db.query(masterQuery, [...masterParams, masterId]);
    }

    res.json({ updated: result.rowCount });
  } catch (err) {
    console.error('PATCH /api/master-bills/:id error:', err.stack || err);
    res.status(500).json({ error: 'Internal server error while updating future bills.' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const from = req.query.from;
  const masterId = parseInt(id, 10);
  if (isNaN(masterId)) {
    return res.status(400).json({ error: 'Invalid master bill ID.' });
  }

  try {
    await db.query('UPDATE bill_master SET is_active = FALSE WHERE id = $1', [masterId]);
    if (from && dayjs(from).isValid()) {
      await db.query('DELETE FROM bills WHERE master_id = $1 AND due_date > $2', [masterId, from]);
    } else {
      await db.query('DELETE FROM bills WHERE master_id = $1', [masterId]);
    }
    res.status(204).send();
  } catch (err) {
    console.error('DELETE /api/master-bills/:id error:', err.stack || err);
    res.status(500).json({ error: 'Internal server error while deleting master bill.' });
  }
});

module.exports = router;
