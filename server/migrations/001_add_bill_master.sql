-- Migration: add master-detail structure for bills
BEGIN;

-- Create bill_master table
CREATE TABLE IF NOT EXISTS bill_master (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    recurrence_pattern TEXT DEFAULT 'none',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add master_id column to bills if it does not exist
ALTER TABLE bills
    ADD COLUMN IF NOT EXISTS master_id INT;

-- Insert master records based on existing bills
WITH distinct_bills AS (
    SELECT DISTINCT name, category, CASE WHEN is_recurring THEN 'monthly' ELSE 'none' END AS recurrence_pattern
    FROM bills
)
INSERT INTO bill_master (name, category, recurrence_pattern)
SELECT name, category, recurrence_pattern FROM distinct_bills
ON CONFLICT DO NOTHING;

-- Update bills with corresponding master_id
UPDATE bills b
SET master_id = m.id
FROM bill_master m
WHERE b.master_id IS NULL
  AND b.name = m.name
  AND ((b.category IS NULL AND m.category IS NULL) OR b.category = m.category)
  AND (CASE WHEN b.is_recurring THEN 'monthly' ELSE 'none' END) = m.recurrence_pattern;

-- Make master_id mandatory
ALTER TABLE bills ALTER COLUMN master_id SET NOT NULL;

-- Drop old columns now stored in master table
ALTER TABLE bills
    DROP COLUMN IF EXISTS name,
    DROP COLUMN IF EXISTS category,
    DROP COLUMN IF EXISTS is_recurring;

-- Add foreign key constraint
ALTER TABLE bills
    ADD CONSTRAINT IF NOT EXISTS bills_master_fk FOREIGN KEY (master_id) REFERENCES bill_master(id) ON DELETE CASCADE;

COMMIT;
