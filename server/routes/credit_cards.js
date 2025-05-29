const express = require('express');
const db = require('../db');
const router = express.Router();

const formatCardResponse = (dbRow) => {
    if (!dbRow) return null;
    const response = {
        id: dbRow.id,
        name: dbRow.name,
        balance: parseFloat(dbRow.balance),
        includeInDueBalance: dbRow.include_in_due_balance,
        createdAt: dbRow.created_at,
        updatedAt: dbRow.updated_at
    };
    if (dbRow.hasOwnProperty('sort_order')) {
      response.sortOrder = dbRow.sort_order;
    }
    return response;
};

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM credit_cards ORDER BY sort_order ASC');
    const formattedCards = result.rows.map(formatCardResponse);
    res.json(formattedCards);
  } catch (err) {
    if (err.code === '42703') {
       return res.status(500).json({ error: "Database error: Sort order column missing." });
    }
    res.status(500).json({ error: 'Internal server error while fetching credit cards.' });
  }
});

router.post('/', async (req, res) => {
  const { name, balance, includeInDueBalance } = req.body;

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
  const newIncludeInDueBalance = includeInDueBalance === undefined ? true : Boolean(includeInDueBalance);

  try {
    const maxOrderResult = await db.query('SELECT MAX(sort_order) as max_order FROM credit_cards');
    const nextSortOrder = (maxOrderResult.rows[0].max_order === null) ? 0 : maxOrderResult.rows[0].max_order + 1;
    
    const result = await db.query(
      `INSERT INTO credit_cards (name, balance, sort_order, include_in_due_balance) VALUES ($1, $2, $3, $4) RETURNING *`,
      [name.trim(), initialBalance.toFixed(2), nextSortOrder, newIncludeInDueBalance]
    );
    
    res.status(201).json(formatCardResponse(result.rows[0]));

  } catch (err) {
    if (err.code === '23505' && err.constraint && err.constraint.includes('name')) {
        return res.status(400).json({ error: 'A credit card with this name already exists.' });
    }
    if (err.code === '23505' && err.constraint && err.constraint.includes('sort_order')) {
        return res.status(500).json({ error: 'Error assigning sort order. Please try again.' });
    }
    res.status(500).json({ error: 'Internal server error while adding credit card.' });
  }
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, balance, includeInDueBalance } = req.body;

  const cardId = parseInt(id, 10);
  if (isNaN(cardId)) {
    return res.status(400).json({ error: 'Invalid credit card ID.' });
  }

  const updateFields = [];
  const values = [];
  let valueIndex = 1;

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'Credit card name cannot be empty.' });
    }
    updateFields.push(`name = $${valueIndex}`);
    values.push(name.trim());
    valueIndex++;
  }

  if (balance !== undefined) {
    const newBalance = parseFloat(balance);
    if (isNaN(newBalance)) {
      return res.status(400).json({ error: 'Invalid balance value provided. Must be a number.' });
    }
    updateFields.push(`balance = $${valueIndex}`);
    values.push(newBalance.toFixed(2));
    valueIndex++;
  }

  if (includeInDueBalance !== undefined) {
    updateFields.push(`include_in_due_balance = $${valueIndex}`);
    values.push(Boolean(includeInDueBalance));
    valueIndex++;
  }

  if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update (provide name and/or balance).' });
  }

  const updateQuery = `
    UPDATE credit_cards
    SET ${updateFields.join(', ')}
    WHERE id = $${valueIndex}
    RETURNING *`;

  const queryParams = [...values, cardId];

  try {
    const result = await db.query(updateQuery, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Credit card not found.' });
    }
    
    res.json(formatCardResponse(result.rows[0]));

  } catch (err) {
     if (err.code === '23505' && err.constraint && err.constraint.includes('name')) {
        return res.status(400).json({ error: 'A credit card with this name already exists.' });
    }
    res.status(500).json({ error: 'Internal server error while updating credit card.' });
  }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const cardId = parseInt(id, 10);
    if (isNaN(cardId)) { return res.status(400).json({ error: 'Invalid credit card ID.' }); }
    try {
        const result = await db.query('DELETE FROM credit_cards WHERE id = $1 RETURNING id', [cardId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Credit card not found.' });
        }
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: 'Internal server error while deleting credit card.' });
    }
});

router.patch('/reorder', async (req, res) => {
  const { cards } = req.body;

  if (!Array.isArray(cards)) {
    return res.status(400).json({ error: 'Invalid payload: cards must be an array.' });
  }

  try {
    await db.query('BEGIN');

    for (const card of cards) {
      if (typeof card.id !== 'number' || typeof card.sort_order !== 'number') {
        await db.query('ROLLBACK');
        return res.status(400).json({ error: 'Invalid card data in payload.' });
      }

      await db.query(
        'UPDATE credit_cards SET sort_order = $1 WHERE id = $2',
        [card.sort_order, card.id]
      );
    }

    await db.query('COMMIT');
    res.status(200).json({ success: true });
  } catch (err) {
    await db.query('ROLLBACK');
    res.status(500).json({ error: 'Internal server error while reordering cards.' });
  }
});

module.exports = router;
