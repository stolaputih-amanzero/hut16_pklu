-- Migration: Add commitment_pdf_url column to proposals table
ALTER TABLE proposals ADD COLUMN commitment_pdf_url TEXT;
