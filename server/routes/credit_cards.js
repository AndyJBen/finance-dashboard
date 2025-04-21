// server/routes/credit_cards.js
const express = require('express');
const db = require('../db'); // Import the database query function

const router = express.Router();

// Helper to convert DB rows to camelCase JSON
const formatCardResponse = (dbRow) => {
  if (!dbRow) return null;
  const response = {
    id: dbRow.id,
    name: dbRow.name,
    balance: parseFloat(dbRow.balance),
    createdAt: dbRow.created_at,
    updatedAt: dbRow.updated_at
  };
  if (dbRow.hasOwnProperty('sort_order')) {
    response.sortOrder = dbRow.sort_order;
  }
  return response;
};

// GET /api/credit_cards
router.get('/', async (req, res) => {
  console.log('GET /api/credit_cards - Fetching all cards ordered by sort_order');
  try {
    const result = await db.query('SELECT * FROM credit_cards ORDER BY sort_order ASC');
    res.json(result.rows.map(formatCardResponse));
  } catch (err) {
    console.error('Error fetching credit cards:', err);
    if (err.code === '42703') {
      return res.status(500).json({ error: "Database error: Sort order column missing." });
    }
    res.status(500).json({ error: 'Internal server error while fetching credit cards.' });
  }
});

// POST /api/credit_cards
router.post('/', async (req, res) => {
  const { name, balance } = req.body;
  console.log('POST /api/credit_cards - Received body:', req.body);

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Credit card name is required.' });
  }

  let initialBalance = 0;
  if (balance !== undefined) {
    initialBalance = parseFloat(balance);
    if (isNaN(initialBalance)) {
      return res.status(400).json({ error: 'Initial balance must be a valid number.' });
    }
  }

  try {
    const maxOrderResult = await db.query('SELECT MAX(sort_order) as max_order FROM credit_cards');
    const nextSortOrder = (maxOrderResult.rows[0].max_order === null)
      ? 0
      : maxOrderResult.rows[0].max_order + 1;

    const result = await db.query(
      `INSERT INTO credit_cards (name, balance, sort_order)
       VALUES ($1, $2, $3) RETURNING *`,
      [name.trim(), initialBalance.toFixed(2), nextSortOrder]
    );

    res.status(201).json(formatCardResponse(result.rows[0]));
  } catch (err) {
    console.error('Error adding credit card:', err);
    if (err.code === '23505' && err.constraint && err.constraint.includes('name')) {
      return res.status(400).json({ error: 'A credit card with this name already exists.' });
    }
    if (err.code === '23505' && err.constraint && err.constraint.includes('sort_order')) {
      return res.status(500).json({ error: 'Error assigning sort order. Please try again.' });
    }
    res.status(500).json({ error: 'Internal server error while adding credit card.' });
  }
});

// PATCH /api/credit_cards/:id
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, balance } = req.body;
  console.log(`PATCH /api/credit_cards/${id} - Received body:`, req.body);

  const cardId = parseInt(id, 10);
  if (isNaN(cardId)) {
    return res.status(400).json({ error: 'Invalid credit card ID.' });
  }

  const updateFields = [];
  const values = [];
  let idx = 1;

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Credit card name cannot be empty.' });
    }
    updateFields.push(`name = $${idx++}`);
    values.push(name.trim());
  }

  if (balance !== undefined) {
    const newBal = parseFloat(balance);
    if (isNaN(newBal)) {
      return res.status(400).json({ error: 'Invalid balance value provided. Must be a number.' });
    }
    updateFields.push(`balance = $${idx++}`);
    values.push(newBal.toFixed(2));
  }

  if (updateFields.length === 0) {
    return res.status(400).json({ error: 'No valid fields provided for update.' });
  }

  const query = `
    UPDATE credit_cards
    SET ${updateFields.join(', ')}
    WHERE id = $${idx}
    RETURNING *
  `;
  values.push(cardId);

  try {
    const result = await db.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Credit card not found.' });
    }
    res.json(formatCardResponse(result.rows[0]));
  } catch (err) {
    console.error(`Error updating credit card ID ${id}:`, err);
    if (err.code === '23505' && err.constraint && err.constraint.includes('name')) {
      return res.status(400).json({ error: 'A credit card with this name already exists.' });
    }
    res.status(500).json({ error: 'Internal server error while updating credit card.' });
  }
});

// DELETE /api/credit_cards/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`DELETE /api/credit_cards/${id}`);
  const cardId = parseInt(id, 10);
  if (isNaN(cardId)) {
    return res.status(400).json({ error: 'Invalid credit card ID.' });
  }

  try {
    const result = await db.query('DELETE FROM credit_cards WHERE id = $1 RETURNING id', [cardId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Credit card not found.' });
    }
    res.status(204).send();
  } catch (err) {
    console.error(`Error deleting credit card ID ${id}:`, err);
    res.status(500).json({ error: 'Internal server error while deleting credit card.' });
  }
});

module.exports = router;
