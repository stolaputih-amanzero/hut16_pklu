-- Migration: Add payment_proof_url column to proposals table
ALTER TABLE proposals ADD COLUMN payment_proof_url TEXT;
