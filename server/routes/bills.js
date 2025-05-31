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
    return {
        id: row.id,
        masterId: row.master_id,
        name: row.name,
        amount: parseFloat(row.amount),
        dueDate: row.due_date ? dayjs(row.due_date).format('YYYY-MM-DD') : null,
        category: row.category,
        isPaid: Boolean(row.is_paid),
        isRecurring: row.recurrence_pattern !== 'none',
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
};

// Helper function to delete future recurring instances
const deleteFutureRecurringInstances = async (masterId, currentBillDueDate) => {
    console.log(`[Helper] Deleting future instances for master ${masterId} after ${currentBillDueDate}`);
    try {
        const deleteFutureQuery = `
            DELETE FROM bills
            WHERE master_id = $1
              AND due_date > $2`;
        const deleteParams = [masterId, currentBillDueDate];
        const deleteResult = await db.query(deleteFutureQuery, deleteParams);
        console.log(`[Helper] Deleted ${deleteResult.rowCount} future instance(s) for master ${masterId}.`);
        return deleteResult.rowCount;
    } catch (err) {
        console.error(`[Helper] Error deleting future instances for master ${masterId}:`, err);
        throw err;
    }
};

// Helper function to create the next recurring instance
// Used by POST (for N+1) and PATCH (for N+2 or N+1 if newly recurring)
const createRecurringInstance = async (masterId, baseBill, monthsToAdd) => {
    const targetDueDate = dayjs(baseBill.due_date || baseBill.dueDate).add(monthsToAdd, 'month');
    const targetMonthString = targetDueDate.format('YYYY-MM');

    console.log(`[Helper] Checking/creating recurring instance for master ${masterId} for ${targetMonthString}`);

    try {
        const checkExistingQuery = `
            SELECT id FROM bills
            WHERE master_id = $1
              AND TO_CHAR(due_date, 'YYYY-MM') = $2`;
        const checkResult = await db.query(checkExistingQuery, [masterId, targetMonthString]);

        if (checkResult.rows.length === 0) {
            await db.query(
                `INSERT INTO bills (master_id, amount, due_date, is_paid)
                 VALUES ($1, $2, $3, $4)`,
                [masterId, baseBill.amount, targetDueDate.format('YYYY-MM-DD'), false]
            );
            return true;
        } else {
            console.log(`[Helper] Instance for master ${masterId} in ${targetMonthString} already exists.`);
            return false;
        }
    } catch (err) {
        console.error(`[Helper] Error creating instance for master ${masterId}:`, err);
        return false;
    }
};


const ensureInstancesUpToMonth = async (targetMonth) => {
    const targetDate = dayjs(targetMonth + '-01').endOf('month');
    const mastersRes = await db.query("SELECT id FROM bill_master WHERE recurrence_pattern = 'monthly'");
    for (const m of mastersRes.rows) {
        const latestRes = await db.query("SELECT amount, due_date FROM bills WHERE master_id = $1 ORDER BY due_date DESC LIMIT 1", [m.id]);
        if (latestRes.rows.length === 0) continue;
        let nextDate = dayjs(latestRes.rows[0].due_date).add(1, 'month');
        const amount = parseFloat(latestRes.rows[0].amount);
        while (nextDate.isSameOrBefore(targetDate, 'month')) {
            const exist = await db.query("SELECT 1 FROM bills WHERE master_id=$1 AND TO_CHAR(due_date,'YYYY-MM')=$2", [m.id, nextDate.format('YYYY-MM')]);
            if (exist.rows.length === 0) {
                await db.query("INSERT INTO bills (master_id, amount, due_date, is_paid) VALUES ($1,$2,$3,false)", [m.id, amount, nextDate.format('YYYY-MM-DD')]);
            }
            nextDate = nextDate.add(1, 'month');
        }
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
    await ensureInstancesUpToMonth(monthString);
    const startDate = dayjs(monthString).startOf('month').format('YYYY-MM-DD');
    const endDate = dayjs(monthString).endOf('month').format('YYYY-MM-DD');
    let queryText;
    let queryParams;

    // Determine query based on viewType
    if (viewType === 'current_and_overdue') {
        // Fetch bills due in the specified month OR overdue bills from before this month
        console.log(`Backend fetching bills for month ${monthString} AND all prior overdue bills.`);
        queryText = `
            SELECT b.*, m.name, m.category, m.recurrence_pattern
            FROM bills b
            JOIN bill_master m ON b.master_id = m.id
            WHERE
                (b.due_date >= $1 AND b.due_date <= $2)
                OR
                (b.due_date < $1 AND b.is_paid = false)
            ORDER BY
                CASE WHEN b.due_date < $1 AND b.is_paid = false THEN 0 ELSE 1 END,
                b.due_date ASC;
        `;
        queryParams = [startDate, endDate];
    } else {
        // Default: Fetch only bills due within the specified month
        console.log(`Backend fetching bills for month ${monthString} only.`);
        queryText = `
            SELECT b.*, m.name, m.category, m.recurrence_pattern
            FROM bills b
            JOIN bill_master m ON b.master_id = m.id
            WHERE b.due_date >= $1 AND b.due_date <= $2
            ORDER BY b.due_date ASC;
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
    // Find or create master record
    const recurrence = isRecurring ? 'monthly' : 'none';
    let masterId;
    const existingMaster = await db.query(
      `SELECT id, recurrence_pattern FROM bill_master WHERE name = $1 AND (
          (category IS NULL AND $2 IS NULL) OR category = $2
       ) LIMIT 1`,
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

    // >> START: Create N+1 recurring instance if needed <<
    if (isRecurring) {
      await createRecurringInstance(masterId, createdBill, 1);
    }
    // >> END: Create N+1 recurring instance <<

    const joined = await db.query(
      `SELECT b.*, m.name, m.category, m.recurrence_pattern
       FROM bills b
       JOIN bill_master m ON b.master_id = m.id
       WHERE b.id = $1`,
      [createdBill.id]
    );
    res.status(201).json(formatBillResponse(joined.rows[0]));

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
      const originalResult = await db.query(
        `SELECT b.*, m.name, m.category, m.recurrence_pattern
         FROM bills b
         JOIN bill_master m ON b.master_id = m.id
         WHERE b.id = $1`,
        [billIdInt]
      );
      if (originalResult.rows.length === 0) {
          return res.status(404).json({ error: 'Bill not found.' });
      }
      originalBill = formatBillResponse(originalResult.rows[0]);
      console.log(`Original bill data (formatted) for ID ${id}:`, originalBill);
  } catch(err) {
       console.error(`Error fetching original bill (ID: ${id}) for update:`, err);
       return res.status(500).json({ error: 'Internal server error fetching original bill.' });
  }

  // Build Update Query Dynamically
  const billFieldMap = { dueDate: 'due_date', isPaid: 'is_paid', amount: 'amount' };
  const masterFieldMap = { name: 'name', category: 'category', isRecurring: 'recurrence_pattern' };
  const allowedUpdates = Object.keys(updates).filter(key => key !== 'id' && key !== 'createdAt' && key !== 'updatedAt');
  if (allowedUpdates.length === 0) {
      return res.status(400).json({ error: 'No update data provided.' });
  }

  const billSet = [];
  const billValues = [];
  const masterSet = [];
  const masterValues = [];
  let valueIndex = 1;

  allowedUpdates.forEach(key => {
      let value = updates[key];

      if (billFieldMap[key]) {
          if (key === 'isPaid') {
              value = Boolean(value);
          } else if (key === 'amount') {
              value = Number(value);
              if (isNaN(value) || value < 0) return;
          } else if (key === 'dueDate') {
              if (value !== null && !dayjs(value).isValid()) return;
              value = value ? dayjs(value).format('YYYY-MM-DD') : null;
          }
          billSet.push(`${billFieldMap[key]} = $${valueIndex}`);
          billValues.push(value);
          valueIndex++;
      } else if (masterFieldMap[key]) {
          if (key === 'name') {
              value = String(value).trim();
              if (value === '') return;
          } else if (key === 'isRecurring') {
              value = value ? 'monthly' : 'none';
          }
          masterSet.push(`${masterFieldMap[key]} = $${valueIndex}`);
          masterValues.push(value);
          valueIndex++;
      }
  });

  if (billSet.length === 0 && masterSet.length === 0) {
      return res.status(400).json({ error: 'Invalid update data provided (after validation).' });
  }

  let updatedRow;
  if (billSet.length > 0) {
      const updateQuery = `UPDATE bills SET ${billSet.join(', ')} WHERE id = $${valueIndex} RETURNING *`;
      const queryParams = [...billValues, billIdInt];
      console.log(`Executing update for bill ID ${id}:`, updateQuery, queryParams);
      const result = await db.query(updateQuery, queryParams);
      if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Bill not found during update.' });
      }
      updatedRow = result.rows[0];
  } else {
      const resFetch = await db.query('SELECT * FROM bills WHERE id = $1', [billIdInt]);
      updatedRow = resFetch.rows[0];
  }

  if (masterSet.length > 0) {
      const masterQuery = `UPDATE bill_master SET ${masterSet.join(', ')} WHERE id = $${masterValues.length + 1}`;
      const masterParams = [...masterValues, originalBill.masterId];
      await db.query(masterQuery, masterParams);
  }

  try {
    // Fetch the joined record after updates
    const joinedUpdated = await db.query(
      `SELECT b.*, m.name, m.category, m.recurrence_pattern
       FROM bills b
       JOIN bill_master m ON b.master_id = m.id
       WHERE b.id = $1`,
      [billIdInt]
    );
    const updatedBillFromDb = formatBillResponse(joinedUpdated.rows[0]);
    console.log(`Successfully updated bill ID ${id}. New data (formatted):`, updatedBillFromDb);

    // --- >> START: Modified Recurring Bill Logic << ---
    const wasRecurring = originalBill.isRecurring; // Boolean from formatted original
    const isNowRecurring = updatedBillFromDb.isRecurring; // Boolean from formatted update
    const justMarkedPaid = updatedBillFromDb.isPaid && !originalBill.isPaid;
    const justUnmarkedRecurring = wasRecurring && !isNowRecurring;
    const justMarkedRecurring = !wasRecurring && isNowRecurring;

    // 1. Create future instance?
    if (justMarkedPaid && isNowRecurring) {
        await createRecurringInstance(updatedBillFromDb.masterId, updatedBillFromDb, 2);
    } else if (justMarkedRecurring) {
        await createRecurringInstance(updatedBillFromDb.masterId, updatedBillFromDb, 1);
    } else if (justMarkedPaid && !isNowRecurring) {
        console.log(`Bill ID ${id} marked paid but IS NOT recurring. Skipping next instance creation.`);
    }

    // 2. Delete future instances?
    if (justUnmarkedRecurring) {
        // If unmarked as recurring, delete all future instances
        await deleteFutureRecurringInstances(originalBill.masterId, originalBill.dueDate);
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
      `SELECT b.master_id, b.amount, b.due_date, m.recurrence_pattern
       FROM bills b
       JOIN bill_master m ON b.master_id = m.id
       WHERE b.id = $1`,
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
    if (billToDelete.recurrence_pattern !== 'none') {
      console.log(`Bill ID ${id} was recurring. Deleting future instances before final delete.`);
      try {
        await deleteFutureRecurringInstances(billToDelete.master_id, billToDelete.due_date);
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
    const deletePrimaryResult = await db.query('DELETE FROM bills WHERE id = $1 RETURNING id', [billIdInt]);

    // Check if the primary delete was successful (should be, as we found it earlier)
    if (deletePrimaryResult.rowCount === 0) {
         console.error(`Backend: Failed to delete primary bill ID ${id} even after finding it.`);
         // This indicates a potential race condition or unexpected issue
         return res.status(500).json({ error: 'Internal server error during final deletion step.' });
    }

    console.log(`Backend: Successfully deleted bill ID: ${id}`);
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