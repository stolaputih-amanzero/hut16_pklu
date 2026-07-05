-- Migration 0008: Add stock column to merch_products

ALTER TABLE public.merch_products 
ADD COLUMN IF NOT EXISTS stock INT NOT NULL DEFAULT 100;
