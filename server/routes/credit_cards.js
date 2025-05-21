// server/routes/credit_cards.js
// COMPLETE FILE - Includes sort_order handling for GET and POST

const express = require('express');
const db = require('../db'); // Import the database query function

// --- Router Definition (Ensure this is present!) ---
const router = express.Router();
// ---------------------------------------------------

// Helper function for consistent response format (camelCase)
// Converts database snake_case columns to camelCase JSON keys
// Includes sortOrder if the column exists in the database row
const formatCardResponse = (dbRow) => {
    if (!dbRow) return null;
    // Base response object
    const response = {
        id: dbRow.id,
        name: dbRow.name,
        balance: parseFloat(dbRow.balance), // Ensure balance is a number
        createdAt: dbRow.created_at,
        updatedAt: dbRow.updated_at
    };
    // Conditionally add sortOrder if the sort_order column exists
    if (dbRow.hasOwnProperty('sort_order')) {
      // Convert snake_case 'sort_order' to camelCase 'sortOrder'
      response.sortOrder = dbRow.sort_order;
    }
    return response;
};

// GET /api/credit_cards - Fetch all credit cards (ORDER BY new sort_order)
router.get('/', async (req, res) => {
  console.log('GET /api/credit_cards - Fetching all cards ordered by sort_order');
  try {
    // --- Fetch ordered by sort_order ---
    // Ensure the 'sort_order' column exists in your table before running this
    const result = await db.query('SELECT * FROM credit_cards ORDER BY sort_order ASC');
    // -----------------------------------
    const formattedCards = result.rows.map(formatCardResponse);
    res.json(formattedCards);
  } catch (err) {
    console.error('Error fetching credit cards:', err);
    // Check if the error is because the sort_order column doesn't exist yet
    if (err.code === '42703') { // PostgreSQL error code for undefined column
       console.error("Error: 'sort_order' column not found. Make sure you ran the ALTER TABLE command.");
       return res.status(500).json({ error: "Database error: Sort order column missing." });
    }
    res.status(500).json({ error: 'Internal server error while fetching credit cards.' });
  }
});

// POST /api/credit_cards - Add a new credit card (Includes sort_order logic)
router.post('/', async (req, res) => {
  const { name, balance } = req.body;
  console.log('POST /api/credit_cards - Received body:', req.body);

  // --- START: Input Validation ---
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Credit card name is required.' });
  }
  let initialBalance = 0;
  if (balance !== undefined) {
      initialBalance = parseFloat(balance);
      if (isNaN(initialBalance)) {
          return res.status(400).json({ error: 'Initial balance must be a valid number.' });
      }
  } // Allow creation with default 0 balance if not provided
  // --- END: Input Validation ---

  try {
    // --- START: Calculate next sort_order ---
    // Find the current maximum sort_order value in the table
    const maxOrderResult = await db.query('SELECT MAX(sort_order) as max_order FROM credit_cards');
    // If the table is empty, max_order will be null, so start at 0. Otherwise, add 1.
    const nextSortOrder = (maxOrderResult.rows[0].max_order === null) ? 0 : maxOrderResult.rows[0].max_order + 1;
    console.log(`Calculated next sort_order: ${nextSortOrder}`);
    // --- END: Calculate next sort_order ---

    // --- START: Modify INSERT query ---
    // Add sort_order to the INSERT statement and use $3 for its value
    const result = await db.query(
      `INSERT INTO credit_cards (name, balance, sort_order) VALUES ($1, $2, $3) RETURNING *`,
      // Add the calculated nextSortOrder to the parameters array
      [name.trim(), initialBalance.toFixed(2), nextSortOrder]
    );
    // --- END: Modify INSERT query ---

    // Format and return the created card
    res.status(201).json(formatCardResponse(result.rows[0]));

  } catch (err) {
    console.error('Error adding credit card:', err);
    // Handle unique name constraint if exists (check constraint name if needed)
    if (err.code === '23505' && err.constraint && err.constraint.includes('name')) {
        return res.status(400).json({ error: 'A credit card with this name already exists.' });
    }
    // Handle potential unique sort_order constraint error if you added one
    if (err.code === '23505' && err.constraint && err.constraint.includes('sort_order')) {
        console.error("Error: Duplicate sort_order detected during insert.", err);
        // This might indicate a race condition. You could potentially retry.
        return res.status(500).json({ error: 'Error assigning sort order. Please try again.' });
    }
    // Generic fallback error
    res.status(500).json({ error: 'Internal server error while adding credit card.' });
  }
});

// PATCH /api/credit_cards/:id - Update an existing credit card (name and/or balance)
// Note: This route does NOT update sort_order. Reordering is handled by a separate endpoint.
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, balance } = req.body;
  console.log(`PATCH /api/credit_cards/${id} - Received body:`, req.body);

  // Validate ID
  const cardId = parseInt(id, 10);
  if (isNaN(cardId)) {
    return res.status(400).json({ error: 'Invalid credit card ID.' });
  }

  // Build update fields and values dynamically
  const updateFields = [];
  const values = [];
  let valueIndex = 1;

  // Validate and add 'name' to the update if provided
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'Credit card name cannot be empty.' });
    }
    updateFields.push(`name = $${valueIndex}`);
    values.push(name.trim());
    valueIndex++;
  }

  // Validate and add 'balance' to the update if provided
  if (balance !== undefined) {
    const newBalance = parseFloat(balance);
    if (isNaN(newBalance)) {
      return res.status(400).json({ error: 'Invalid balance value provided. Must be a number.' });
    }
    updateFields.push(`balance = $${valueIndex}`);
    values.push(newBalance.toFixed(2));
    valueIndex++;
  }

  // Check if at least one valid field was provided for update
  if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update (provide name and/or balance).' });
  }

  // Construct and Execute Update Query
  const updateQuery = `
    UPDATE credit_cards
    SET ${updateFields.join(', ')}
    WHERE id = $${valueIndex}
    RETURNING *`; // Return the updated row

  const queryParams = [...values, cardId]; // Combine values and the cardId for the WHERE clause

  try {
    // Execute the database query
    const result = await db.query(updateQuery, queryParams);

    // Check if a row was actually updated
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Credit card not found.' });
    }

    // Format the result using the helper and send response
    res.json(formatCardResponse(result.rows[0]));

  } catch (err) {
    console.error(`Error updating credit card ID ${id}:`, err);
     // Handle potential unique constraint errors if names must be unique
     if (err.code === '23505' && err.constraint && err.constraint.includes('name')) {
        return res.status(400).json({ error: 'A credit card with this name already exists.' });
    }
    // Handle other database errors
    res.status(500).json({ error: 'Internal server error while updating credit card.' });
  }
});

// DELETE /api/credit_cards/:id - Delete a credit card
// Note: Deleting a card leaves a gap in sort_order. A separate re-sequencing step
// might be desired later if strict sequential order is always needed.
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`DELETE /api/credit_cards/${id}`);
    const cardId = parseInt(id, 10);
    if (isNaN(cardId)) { return res.status(400).json({ error: 'Invalid credit card ID.' }); }
    try {
        // Delete the card
        const result = await db.query('DELETE FROM credit_cards WHERE id = $1 RETURNING id', [cardId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Credit card not found.' });
        }
        // Respond with 204 No Content on successful deletion
        res.status(204).send();
    } catch (err) {
        console.error(`Error deleting credit card ID ${id}:`, err);
        res.status(500).json({ error: 'Internal server error while deleting credit card.' });
    }
});

// PATCH /api/credit_cards/reorder - Update sort order for multiple cards
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
    console.error('Error reordering credit cards:', err);
    res.status(500).json({ error: 'Internal server error while reordering cards.' });
  }
});


// --- Export the router (Ensure this is present!) ---
module.exports = router;
// ----------------------------------------------------
