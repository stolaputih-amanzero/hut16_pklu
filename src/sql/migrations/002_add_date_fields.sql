-- Migration 002: Add manual date input columns
ALTER TABLE proposals
ADD COLUMN IF NOT EXISTS proposal_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS confirmed_date DATE,
ADD COLUMN IF NOT EXISTS paid_date DATE;

-- Backfill existing proposals
UPDATE proposals 
SET proposal_date = COALESCE(created_at::DATE, CURRENT_DATE)
WHERE proposal_date IS NULL;

-- Backfill confirmed dates for already confirmed proposals
UPDATE proposals 
SET confirmed_date = COALESCE(confirmed_at::DATE, created_at::DATE),
    paid_date = COALESCE(confirmed_at::DATE, created_at::DATE)
WHERE payment_status = 'confirmed' 
  AND (confirmed_date IS NULL OR paid_date IS NULL);
