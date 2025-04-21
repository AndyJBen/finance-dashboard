const express = require('express');
const db      = require('../db');
const router  = express.Router();

// helper to snake_case → camelCase + parse numbers
const formatCard = row => ({
  id:        row.id,
  name:      row.name,
  balance:   parseFloat(row.balance),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  ...(row.sort_order != null ? { sortOrder: row.sort_order } : {})
});

// GET /api/credit_cards
router.get('/', async (req, res) => {
  console.log('GET /api/credit_cards');
  try {
    const { rows } = await db.query('SELECT * FROM credit_cards ORDER BY sort_order ASC');
    res.json(rows.map(formatCard));
  } catch (err) {
    console.error('Error fetching credit cards ▶', err);
    res.status(500).json({ error: 'Internal server error while fetching credit cards.' });
  }
});

// POST /api/credit_cards
router.post('/', async (req, res) => {
  const { name, balance } = req.body;
  console.log('POST /api/credit_cards ▶', req.body);
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Credit card name is required.' });
  }
  const initial = balance !== undefined ? parseFloat(balance) : 0;
  if (isNaN(initial)) {
    return res.status(400).json({ error: 'Balance must be a valid number.' });
  }

  try {
    const maxRes = await db.query('SELECT MAX(sort_order) AS max_order FROM credit_cards');
    const nextOrder = maxRes.rows[0].max_order != null ? maxRes.rows[0].max_order + 1 : 0;

    const insertRes = await db.query(
      `INSERT INTO credit_cards (name, balance, sort_order)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name.trim(), initial.toFixed(2), nextOrder]
    );
    res.status(201).json(formatCard(insertRes.rows[0]));
  } catch (err) {
    console.error('Error adding credit card ▶', err);
    res.status(500).json({ error: 'Internal server error while adding credit card.' });
  }
});

// PATCH /api/credit_cards/:id
router.patch('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name, balance } = req.body;
  console.log(`PATCH /api/credit_cards/${id} ▶`, req.body);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid credit card ID.' });
  }

  const fields = [];
  const vals   = [];
  let idx = 1;

  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Name cannot be empty.' });
    }
    fields.push(`name = $${idx++}`);
    vals.push(name.trim());
  }
  if (balance !== undefined) {
    const b = parseFloat(balance);
    if (isNaN(b)) {
      return res.status(400).json({ error: 'Balance must be a valid number.' });
    }
    fields.push(`balance = $${idx++}`);
    vals.push(b.toFixed(2));
  }
  if (!fields.length) {
    return res.status(400).json({ error: 'No fields provided for update.' });
  }

  const sql = `
    UPDATE credit_cards
    SET ${fields.join(', ')}
    WHERE id = $${idx}
    RETURNING *
  `;
  vals.push(id);

  try {
    const result = await db.query(sql, vals);
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Credit card not found.' });
    }
    res.json(formatCard(result.rows[0]));
  } catch (err) {
    console.error(`Error updating card ${id} ▶`, err);
    res.status(500).json({ error: 'Internal server error while updating credit card.' });
  }
});

// DELETE /api/credit_cards/:id
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  console.log(`DELETE /api/credit_cards/${id}`);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid credit card ID.' });
  }
  try {
    const result = await db.query('DELETE FROM credit_cards WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Credit card not found.' });
    }
    res.status(204).send();
  } catch (err) {
    console.error(`Error deleting card ${id} ▶`, err);
    res.status(500).json({ error: 'Internal server error while deleting credit card.' });
  }
});

module.exports = router;
