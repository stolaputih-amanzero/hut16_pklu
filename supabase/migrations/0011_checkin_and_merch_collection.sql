-- Migration 0011: Add check-in fields to registrations and merchandise collection fields to merch_orders

-- 1. Add fields to registrations table
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ NULL,
ADD COLUMN IF NOT EXISTS checked_in_participants INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS checked_in_companions INTEGER DEFAULT 0;

-- 2. Add fields to merch_orders table
ALTER TABLE public.merch_orders 
ADD COLUMN IF NOT EXISTS merch_collected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS collected_at TIMESTAMPTZ NULL;

-- Enable index for faster queries on check-in and collected statuses
CREATE INDEX IF NOT EXISTS idx_registrations_check_in ON public.registrations (checked_in, checked_in_at DESC);
CREATE INDEX IF NOT EXISTS idx_merch_orders_collected ON public.merch_orders (merch_collected, collected_at DESC);
