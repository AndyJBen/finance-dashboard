const express = require('express');
const dayjs = require('dayjs');
const db = require('../db');

const router = express.Router();

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
