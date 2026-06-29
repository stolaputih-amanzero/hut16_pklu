-- Mengizinkan akses publik (anon) ke tabel committees dan proposals
-- karena sistem login saat ini sedang di-bypass.

-- 1. Pastikan tabel committees memiliki RLS aktif
ALTER TABLE committees ENABLE ROW LEVEL SECURITY;

-- 2. Buat policy agar anon (publik) bisa membaca (SELECT) tabel committees
CREATE POLICY "Anon users can read committees"
  ON committees FOR SELECT
  USING (true);

-- 3. Tambahkan policy agar anon (publik) bisa mengelola (CRUD) tabel proposals
-- Karena di initial_schema hanya authenticated yang diizinkan
CREATE POLICY "Anon users can manage proposals"
  ON proposals FOR ALL
  USING (auth.role() = 'anon' OR auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'anon' OR auth.role() = 'authenticated');
