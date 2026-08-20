-- Migration 0014: Add size_stocks column to merch_products
ALTER TABLE public.merch_products 
ADD COLUMN IF NOT EXISTS size_stocks JSONB DEFAULT '{}'::jsonb;
