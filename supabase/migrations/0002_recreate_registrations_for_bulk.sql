-- Migration: Recreate registrations table for Bulk & Mandiri mode
-- Drop the existing registrations table (safe since no data has been submitted yet)
DROP TABLE IF EXISTS public.registrations;

CREATE TABLE public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_code VARCHAR(20) UNIQUE NOT NULL,
    
    -- Mode Pendaftaran
    registration_mode VARCHAR(50) NOT NULL CHECK (registration_mode IN ('Mandiri', 'Rombongan')),
    
    -- Kolom Bersama
    category VARCHAR(50) NOT NULL CHECK (category IN ('Umum', 'Tuan Rumah')),
    mupel VARCHAR(255) NOT NULL,
    church_name VARCHAR(255) NOT NULL,
    whatsapp_number VARCHAR(50) NOT NULL,
    proof_of_transfer_url TEXT NOT NULL,
    
    -- Kolom Khusus Mandiri
    type VARCHAR(50) CHECK (type IN ('Peserta', 'Pendamping', null)),
    full_name VARCHAR(255),
    shirt_size VARCHAR(10),
    role VARCHAR(50) CHECK (role IN ('Utusan Mupel', 'Pengurus PKLU', 'Anggota PKLU', null)),
    companion_for VARCHAR(255),
    
    -- Kolom Khusus Rombongan
    pic_name VARCHAR(255),
    participant_count INTEGER,
    companion_count INTEGER,
    shirt_sizes_summary JSONB, -- format: {"S": 0, "M": 0, "L": 0, "XL": 0, "XXL": 0, "XXXL": 0}
    participant_list_url TEXT,
    assignment_letter_url TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
