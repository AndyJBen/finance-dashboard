-- Migration: add is_deleted to bills and is_active to bill_master
BEGIN;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE bill_master ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
COMMIT;
