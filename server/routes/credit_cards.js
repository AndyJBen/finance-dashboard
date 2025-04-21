// server/routes/credit_cards.js
const express = require('express');
const db = require('../db'); // Import the database query function

const router = express.Router();

// Helper: format DB row to camelCase JSON
const formatCard = (row) => ({
  id: row.id,
  name: row.name,
  balance: parseFloat(row.balance),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  ...(row.sort_order != null ? { sortOrder: row.sort_order } : {})
});

/**
 * GET /api/credit_cards
 * Fetches all credit cards, ordered by sort_order.
 */
router.get('/', async (req, res) => {
  console.log('GET /api/credit_cards');
  try {
    const result = await db.query('SELECT * FROM credit_cards ORDER BY sort_order ASC');
    res.json(result.rows.map(formatCard));
  } catch (err) {
    console.error('Error fetching credit cards:', err);
    res.status(500).json({ error: 'Internal server error while fetching credit cards.' });
  }
});

/**
 * POST /api/credit_cards
 * Adds a new credit card. Expects { name: string, balance?: number }.
 * Automatically assigns the next sort_order.
 */
router.post('/', async (req, res) => {
  const { name, balance } = req.body;
  console.log('POST /api/credit_cards', req.body);

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Credit card name is required.' });
  }
  const initialBalance = balance !== undefined ? parseFloat(balance) : 0;
  if (isNaN(initialBalance)) {
    return res.status(400).json({ error: 'Invalid balance value.' });
  }

  try {
    const maxRes = await db.query('SELECT MAX(sort_order) AS max_order FROM credit_cards');
    const nextOrder = maxRes.rows[0].max_order != null ? maxRes.rows[0].max_order + 1 : 0;

    const insertRes = await db.query(
      `INSERT INTO credit_cards (name, balance, sort_order)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name.trim(), initialBalance.toFixed(2), nextOrder]
    );

    res.status(201).json(formatCard(insertRes.rows[0]));
  } catch (err) {
    console.error('Error adding credit card:', err);
    res.status(500).json({ error: 'Internal server error while adding credit card.' });
  }
});

/**
 * PATCH /api/credit_cards/:id
 * Updates name and/or balance of an existing credit card.
 */
router.patch('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name, balance } = req.body;
  console.log(`PATCH /api/credit_cards/${id}`, req.body);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid credit card ID.' });
  }

  const fields = [];
  const values = [];
  let idx = 1;

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Name cannot be empty.' });
    }
    fields.push(`name = $${idx++}`);
    values.push(name.trim());
  }

  if (balance !== undefined) {
    const b = parseFloat(balance);
    if (isNaN(b)) {
      return res.status(400).json({ error: 'Invalid balance value.' });
    }
    fields.push(`balance = $${idx++}`);
    values.push(b.toFixed(2));
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: 'No valid fields provided for update.' });
  }

  const query = `
    UPDATE credit_cards
    SET ${fields.join(', ')}
    WHERE id = $${idx}
    RETURNING *
  `;
  values.push(id);

  try {
    const result = await db.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Credit card not found.' });
    }
    res.json(formatCard(result.rows[0]));
  } catch (err) {
    console.error(`Error updating credit card ${id}:`, err);
    res.status(500).json({ error: 'Internal server error while updating credit card.' });
  }
});

/**
 * DELETE /api/credit_cards/:id
 * Deletes a credit card by ID.
 */
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
    console.error(`Error deleting credit card ${id}:`, err);
    res.status(500).json({ error: 'Internal server error while deleting credit card.' });
  }
});

module.exports = router;
