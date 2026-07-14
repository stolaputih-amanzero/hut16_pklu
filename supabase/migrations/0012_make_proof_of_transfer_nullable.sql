-- Migration: Make proof_of_transfer_url nullable
ALTER TABLE public.registrations ALTER COLUMN proof_of_transfer_url DROP NOT NULL;
