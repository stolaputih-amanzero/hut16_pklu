-- Menambahkan kolom bahasa dokumen (lang) ke tabel proposals
-- agar preferensi ID/EN bisa disimpan ke database

ALTER TABLE proposals ADD COLUMN IF NOT EXISTS lang TEXT DEFAULT 'id';
