-- Migration 0010: Add payment proof, status, date and admin notes to merch_orders
ALTER TABLE public.merch_orders 
ADD COLUMN IF NOT EXISTS payment_proof_url TEXT NULL,
ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMPTZ NULL,
ADD COLUMN IF NOT EXISTS admin_notes TEXT NULL;

-- Enable public update if needed, but wait: public only needs to upload receipt, which is part of submit.
-- Let's make sure authenticated admin can perform updates which is already covered by Policy 3.
