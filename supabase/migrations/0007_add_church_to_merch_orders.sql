-- Migration 0007: Add church_city to merch_orders

ALTER TABLE public.merch_orders 
ADD COLUMN IF NOT EXISTS church_city TEXT;
