-- Migration 0013: Add payment_status to registrations table
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending';

-- Enable index for faster queries on payment status
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON public.registrations (payment_status);
