// server/routes/bills.js
// COMPLETE FILE CODE - Includes "Lookahead" Recurring Bill Logic

const express = require('express');
const db = require('../db'); // Ensure this path is correct
const dayjs = require('dayjs');

const router = express.Router();

// --- Helper Functions ---
const validateBillData = (data) => {
  if (!data || typeof data.name !== 'string' || data.name.trim() === '') return 'Bill name is required.';
  if (typeof data.amount !== 'number' || data.amount < 0) return 'Valid, non-negative amount is required.';
  if (!data.dueDate || !dayjs(data.dueDate).isValid()) return 'Valid due date is required (YYYY-MM-DD).';
  return null; // No error
};

const formatBillResponse = (row) => {
    if (!row) return null;
    // Ensure boolean values are returned correctly
    return {
        id: row.id,
        name: row.name,
        amount: parseFloat(row.amount),
        dueDate: row.due_date ? dayjs(row.due_date).format('YYYY-MM-DD') : null,
        category: row.category,
        isPaid: Boolean(row.is_paid), // Explicitly cast to boolean
        isRecurring: Boolean(row.is_recurring), // Explicitly cast to boolean
        createdAt: row.created_at,
        updatedAt: row.updated_at
        // Note: We are not adding 'source: projected' here as this backend
        // logic creates *actual* records for the next month.
    };
};

// Helper function to delete future recurring instances
const deleteFutureRecurringInstances = async (billName, billAmount, currentBillDueDate) => {
    console.log(`[Helper] Deleting future recurring instances for "${billName}" after ${currentBillDueDate}`);
    try {
        const deleteFutureQuery = `
            DELETE FROM bills
            WHERE name = $1
              AND amount = $2
              AND is_recurring = true
              AND due_date > $3`;
        const deleteParams = [billName, billAmount, currentBillDueDate];
        const deleteResult = await db.query(deleteFutureQuery, deleteParams);
        console.log(`[Helper] Deleted ${deleteResult.rowCount} future recurring instance(s) for "${billName}".`);
        return deleteResult.rowCount; // Return count of deleted items
    } catch (deleteError) {
        console.error(`[Helper] Error deleting future recurring instances for "${billName}":`, deleteError);
        throw deleteError; // Re-throw the error to be caught by the caller
    }
};

// Helper function to create the next recurring instance
// Used by POST (for N+1) and PATCH (for N+2 or N+1 if newly recurring)
const createRecurringInstance = async (baseBill, monthsToAdd) => {
    const targetDueDate = dayjs(baseBill.due_date || baseBill.dueDate).add(monthsToAdd, 'month');
    const targetMonthString = targetDueDate.format('YYYY-MM');
    const billName = baseBill.name;
    const billAmount = baseBill.amount;
    const billCategory = baseBill.category;

    console.log(`[Helper] Checking/creating recurring instance for "${billName}" for ${targetMonthString} (+${monthsToAdd} months)`);

    try {
        // Check if an instance already exists for the target month
        const checkExistingQuery = `
            SELECT id FROM bills
            WHERE name = $1
              AND amount = $2
              AND is_recurring = true
              AND TO_CHAR(due_date, 'YYYY-MM') = $3`;
        const checkResult = await db.query(checkExistingQuery, [billName, billAmount, targetMonthString]);

        if (checkResult.rows.length === 0) {
            console.log(`[Helper] Creating +${monthsToAdd} month recurring instance for "${billName}" for ${targetMonthString}`);
            await db.query(
                `INSERT INTO bills (name, amount, due_date, category, is_paid, is_recurring)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [billName, billAmount, targetDueDate.format('YYYY-MM-DD'), billCategory, false, true]
            );
            return true; // Indicate creation happened
        } else {
            console.log(`[Helper] +${monthsToAdd} month recurring instance for "${billName}" for ${targetMonthString} already exists. Skipping creation.`);
            return false; // Indicate creation was skipped
        }
    } catch (recurringError) {
        console.error(`[Helper] Error creating +${monthsToAdd} month recurring instance for "${billName}":`, recurringError);
        // Log the error but don't necessarily fail the primary operation (POST/PATCH)
        return false;
    }
};


// --- End Helper Functions ---

// --- API Endpoints ---

// GET /api/bills - Fetches bills for the specified month (and potentially overdue)
// No changes needed here for the "Lookahead" strategy, as future bills are actual records.
router.get('/', async (req, res) => {
  const monthString = req.query.month;
  const viewType = req.query.view; // e.g., 'current_and_overdue'
  if (!monthString || !/^\d{4}-\d{2}$/.test(monthString)) {
    return res.status(400).json({ error: 'Invalid or missing month query parameter. Use YYYY-MM format.' });
  }
  try {
    const startDate = dayjs(monthString).startOf('month').format('YYYY-MM-DD');
    const endDate = dayjs(monthString).endOf('month').format('YYYY-MM-DD');
    let queryText;
    let queryParams;

    // Determine query based on viewType
    if (viewType === 'current_and_overdue') {
        // Fetch bills due in the specified month OR overdue bills from before this month
        console.log(`Backend fetching bills for month ${monthString} AND all prior overdue bills.`);
        queryText = `
            SELECT * FROM bills
            WHERE
                (due_date >= $1 AND due_date <= $2) -- Bills due in the month
                OR
                (due_date < $1 AND is_paid = false) -- Overdue bills
            ORDER BY
                -- Prioritize overdue bills first, then sort by due date
                CASE WHEN due_date < $1 AND is_paid = false THEN 0 ELSE 1 END,
                due_date ASC;
        `;
        queryParams = [startDate, endDate];
    } else {
        // Default: Fetch only bills due within the specified month
        console.log(`Backend fetching bills for month ${monthString} only.`);
        queryText = `
            SELECT * FROM bills
            WHERE due_date >= $1 AND due_date <= $2
            ORDER BY due_date ASC;
        `;
        queryParams = [startDate, endDate];
    }

    // Execute the query
    const result = await db.query(queryText, queryParams);
    // Format results before sending
    res.json(result.rows.map(formatBillResponse));

  } catch (err) {
    console.error(`Error fetching bills for month ${monthString} (view: ${viewType || 'default'}):`, err);
    res.status(500).json({ error: 'Internal server error while fetching bills.' });
  }
});

// POST /api/bills - Add a new bill
router.post('/', async (req, res) => {
  console.log('Received POST request body:', req.body);
  const billData = req.body;

  // Validate incoming data
  const validationError = validateBillData(billData);
  if (validationError) {
    console.error('Validation failed:', validationError);
    return res.status(400).json({ error: validationError });
  }

  // Destructure and ensure boolean conversion for isPaid/isRecurring
  const { name, amount, dueDate, category = null } = billData;
  const isPaid = Boolean(billData.isPaid); // Default to false if not provided
  const isRecurring = Boolean(billData.isRecurring); // Default to false if not provided

  try {
    // Insert the primary bill record
    const result = await db.query(
      `INSERT INTO bills (name, amount, due_date, category, is_paid, is_recurring)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name.trim(), amount, dueDate, category, isPaid, isRecurring]
    );
    const createdBill = result.rows[0]; // Get the newly created bill details

    // >> START: Create N+1 recurring instance if needed <<
    if (createdBill.is_recurring) {
      // Use the helper function to create the next month's instance
      await createRecurringInstance(createdBill, 1); // Add 1 month
    }
    // >> END: Create N+1 recurring instance <<

    // Send response with the initially created bill
    res.status(201).json(formatBillResponse(createdBill));

  } catch (err) {
    console.error('Error adding bill to DB:', err);
    // Handle potential unique constraint errors etc.
    if (err.code === '23505') { // Example: PostgreSQL unique violation
        return res.status(400).json({ error: 'A bill with similar details might already exist.' });
    }
    res.status(500).json({ error: 'Internal server error while adding bill.' });
  }
});


// PATCH /api/bills/:id - Update an existing bill
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Validate ID
  const billIdInt = parseInt(id, 10);
  if (isNaN(billIdInt)) {
    return res.status(400).json({ error: 'Invalid bill ID.' });
  }

  // Fetch original bill data to compare changes
  let originalBill;
  try {
      const originalResult = await db.query('SELECT * FROM bills WHERE id = $1', [billIdInt]);
      if (originalResult.rows.length === 0) {
          return res.status(404).json({ error: 'Bill not found.' });
      }
      // Use formatter to ensure consistent boolean types for comparison
      originalBill = formatBillResponse(originalResult.rows[0]);
      console.log(`Original bill data (formatted) for ID ${id}:`, originalBill);
  } catch(err) {
       console.error(`Error fetching original bill (ID: ${id}) for update:`, err);
       return res.status(500).json({ error: 'Internal server error fetching original bill.' });
  }

  // Build Update Query Dynamically
  const keyMapping = { dueDate: 'due_date', isPaid: 'is_paid', isRecurring: 'is_recurring' };
  const allowedUpdates = Object.keys(updates).filter(key => key !== 'id' && key !== 'createdAt' && key !== 'updatedAt');
  if (allowedUpdates.length === 0) {
      return res.status(400).json({ error: 'No update data provided.' });
  }

  const setClauses = [];
  const values = [];
  let valueIndex = 1;

  // Iterate through provided updates, validate, and build query parts
  allowedUpdates.forEach(key => {
      const dbKey = keyMapping[key] || key; // Map camelCase to snake_case if needed
      let value = updates[key];

      // --- Type validation/conversion ---
      if (key === 'isPaid' || key === 'isRecurring') {
          value = Boolean(value); // Ensure boolean
          console.log(`Processing update for key: ${key}, raw value: ${updates[key]}, converted value: ${value}`);
      } else if (key === 'amount') {
          value = Number(value);
          if (isNaN(value) || value < 0) {
              console.warn(`Skipping invalid amount update for ID ${id}`);
              return; // Skip this field if invalid
          }
      } else if (key === 'dueDate') {
          if (value !== null && !dayjs(value).isValid()) {
              console.warn(`Skipping invalid dueDate update for ID ${id}`);
              return; // Skip this field if invalid
          }
          value = value ? dayjs(value).format('YYYY-MM-DD') : null;
      } else if (key === 'name') {
          value = String(value).trim();
          if (value === '') {
              console.warn(`Skipping empty name update for ID ${id}`);
              return; // Skip this field if invalid
          }
      }
      // Add other type checks as needed (e.g., category)

      setClauses.push(`${dbKey} = $${valueIndex}`);
      values.push(value); // Add the potentially converted value
      valueIndex++;
  });

  // If no valid fields remain after validation
  if (setClauses.length === 0) {
      return res.status(400).json({ error: 'Invalid update data provided (after validation).' });
  }

  // Construct the final UPDATE query
  const updateQuery = `UPDATE bills SET ${setClauses.join(', ')} WHERE id = $${valueIndex} RETURNING *`;
  const queryParams = [...values, billIdInt]; // Add bill ID for the WHERE clause

  try {
    // Execute the main update query
    console.log(`Executing update for bill ID ${id}:`, updateQuery, queryParams);
    const result = await db.query(updateQuery, queryParams);

    // Check if the update affected any row (should affect 1)
    if (result.rows.length === 0) {
        // This case might happen if the ID was valid initially but deleted concurrently
        return res.status(404).json({ error: 'Bill not found during update.' });
    }

    // Get the fully updated bill data from the RETURNING clause
    const updatedBillFromDb = formatBillResponse(result.rows[0]);
    console.log(`Successfully updated bill ID ${id}. New data (formatted):`, updatedBillFromDb);

    // --- >> START: Modified Recurring Bill Logic << ---
    const wasRecurring = originalBill.isRecurring; // Boolean from formatted original
    const isNowRecurring = updatedBillFromDb.isRecurring; // Boolean from formatted update
    const justMarkedPaid = updatedBillFromDb.isPaid && !originalBill.isPaid;
    const justUnmarkedRecurring = wasRecurring && !isNowRecurring;
    const justMarkedRecurring = !wasRecurring && isNowRecurring;

    // 1. Create future instance?
    if (justMarkedPaid && isNowRecurring) {
        // If paid and still recurring, create the N+2 instance
        await createRecurringInstance(updatedBillFromDb, 2); // Add 2 months
    } else if (justMarkedRecurring) {
        // If newly marked as recurring, create the N+1 instance
        await createRecurringInstance(updatedBillFromDb, 1); // Add 1 month
    } else if (justMarkedPaid && !isNowRecurring) {
        console.log(`Bill ID ${id} marked paid but IS NOT recurring. Skipping next instance creation.`);
    }

    // 2. Delete future instances?
    if (justUnmarkedRecurring) {
        // If unmarked as recurring, delete all future instances
        await deleteFutureRecurringInstances(originalBill.name, originalBill.amount, originalBill.dueDate);
    }
    // --- << END: Modified Recurring Bill Logic << ---

    // Send the updated bill data back to the client
    res.json(updatedBillFromDb);

  } catch (err) {
    console.error(`Error processing PATCH for bill ID ${id}:`, err);
    res.status(500).json({ error: 'Internal server error while updating bill.' });
  }
});


// DELETE /api/bills/:id - Delete a bill and potentially its future recurring instances
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`Backend: Received DELETE request for bill ID: ${id}`);

  // Validate ID
  const billIdInt = parseInt(id, 10);
  if (isNaN(billIdInt)) {
    console.error(`Backend: Invalid bill ID received for DELETE: ${id}`);
    return res.status(400).json({ error: 'Invalid bill ID.' });
  }

  try {
    // --- >> START: Fetch bill details before deleting << ---
    const fetchResult = await db.query(
      'SELECT name, amount, due_date, is_recurring FROM bills WHERE id = $1',
      [billIdInt]
    );

    // Check if the bill exists
    if (fetchResult.rows.length === 0) {
      console.warn(`Backend: Bill ID ${id} not found for DELETE.`);
      return res.status(404).json({ error: 'Bill not found.' });
    }
    const billToDelete = fetchResult.rows[0];
    // --- << END: Fetch bill details << ---

    // --- >> START: Delete future instances if recurring << ---
    if (billToDelete.is_recurring) {
      console.log(`Bill ID ${id} was recurring. Deleting future instances before final delete.`);
      try {
        // Use the helper function to delete future instances
        await deleteFutureRecurringInstances(billToDelete.name, billToDelete.amount, billToDelete.due_date);
      } catch (deleteError) {
        // Log error but proceed with deleting the main bill unless critical
        console.error(`Error during future instance cleanup for bill ID ${id}:`, deleteError);
        // Optionally return an error if cleanup failure should prevent deletion:
        // return res.status(500).json({ error: 'Failed to clean up future recurring bills.' });
      }
    }
    // --- << END: Delete future instances << ---

    // --- >> START: Delete the requested bill itself << ---
    console.log(`Backend: Executing final DELETE query for bill ID: ${id}`);
    const deletePrimaryResult = await db.query('DELETE FROM bills WHERE id = $1 RETURNING id, name', [billIdInt]);

    // Check if the primary delete was successful (should be, as we found it earlier)
    if (deletePrimaryResult.rowCount === 0) {
         console.error(`Backend: Failed to delete primary bill ID ${id} even after finding it.`);
         // This indicates a potential race condition or unexpected issue
         return res.status(500).json({ error: 'Internal server error during final deletion step.' });
    }

    console.log(`Backend: Successfully deleted bill ID: ${id}, Name: ${deletePrimaryResult.rows[0]?.name}`);
    // Respond with 204 No Content on successful deletion
    res.status(204).send();
    // --- << END: Delete the requested bill itself << ---

  } catch (err) {
    // Catch errors from fetching or the final delete query
    console.error(`Backend: Error processing DELETE for bill ID ${id}:`, err);
    res.status(500).json({ error: 'Internal server error while deleting bill.' });
  }
});


module.exports = router; // Export the router