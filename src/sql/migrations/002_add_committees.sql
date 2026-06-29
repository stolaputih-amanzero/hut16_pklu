-- 1. Membuat tabel committees
CREATE TABLE IF NOT EXISTS committees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  phone TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Memasukkan data panitia awal (seed)
INSERT INTO committees (name, role) VALUES
('Vrilly Rondonuwu', 'Ketua Panitia'),
('Roby Sely', 'Wakil Ketua Panitia'),
('Vevi Mayo', 'Sekretaris Panitia'),
('Anastasia Christine Dolo', 'Wakil Sekretaris Panitia'),
('Paul Simanjuntak', 'Bendahara Panitia'),
('Agung Ratri Wahono', 'Wakil Bendahara Panitia'),
('Pdt. Daniel J C Lumentut', 'Ketua BP Mupel Bekasi (Penasihat)'),

-- Seksi Acara/Ibadah/Penerima Tamu
('Pdt. Maureen S. Rumeser-Thomas', 'Koordinator Seksi Acara/Ibadah/Penerima Tamu'),
('Pdt. Yan Tacazily', 'Anggota Seksi Acara/Ibadah/Penerima Tamu'),
('Pdt. Meilanny Peranginangin-Risamasu', 'Anggota Seksi Acara/Ibadah/Penerima Tamu'),
('Rinta Lumowa-Sitompul', 'Anggota Seksi Acara/Ibadah/Penerima Tamu'),
('Angelia W Latuheru-Rikumahuwa', 'Anggota Seksi Acara/Ibadah/Penerima Tamu'),
('Tiurma Nainggolan', 'Anggota Seksi Acara/Ibadah/Penerima Tamu'),
('Tohap Hutasoit', 'Anggota Seksi Acara/Ibadah/Penerima Tamu'),
('Richard Titahelu', 'Anggota Seksi Acara/Ibadah/Penerima Tamu'),
('Rasiman Sitorus', 'Anggota Seksi Acara/Ibadah/Penerima Tamu'),
('Max Benny Rampengan', 'Anggota Seksi Acara/Ibadah/Penerima Tamu'),
('Arthur Andries', 'Anggota Seksi Acara/Ibadah/Penerima Tamu'),
('Dini Widodo', 'Anggota Seksi Acara/Ibadah/Penerima Tamu'),
('Marni Soetidjab', 'Anggota Seksi Acara/Ibadah/Penerima Tamu'),
('Yopie Saiya', 'Anggota Seksi Acara/Ibadah/Penerima Tamu'),
('Ambar Purnama', 'Anggota Seksi Acara/Ibadah/Penerima Tamu'),
('Beatrix Luhulima', 'Anggota Seksi Acara/Ibadah/Penerima Tamu'),
('Yoan Uneputty', 'Anggota Seksi Acara/Ibadah/Penerima Tamu'),
('Eunike Batama', 'Anggota Seksi Acara/Ibadah/Penerima Tamu'),
('William Sohilait', 'Anggota Seksi Acara/Ibadah/Penerima Tamu'),

-- Seksi Konsumsi
('dr. Yudi Tumengkol', 'Koordinator Seksi Konsumsi'),
('Pdt. Sandra Sormin', 'Anggota Seksi Konsumsi'),
('Ngatiarmi', 'Anggota Seksi Konsumsi'),
('Budi Indrayati Rompas', 'Anggota Seksi Konsumsi'),
('Maria Petronella Waas', 'Anggota Seksi Konsumsi'),
('Wienarni Sihombing', 'Anggota Seksi Konsumsi'),
('Frieda Latubessy', 'Anggota Seksi Konsumsi'),
('Jane Titahelu', 'Anggota Seksi Konsumsi'),
('Nini Daandel', 'Anggota Seksi Konsumsi'),
('Roes Ndun', 'Anggota Seksi Konsumsi'),
('Eunike Tasliman - Sidabutar', 'Anggota Seksi Konsumsi'),
('Gutina Indriati Manurung - Napitupulu', 'Anggota Seksi Konsumsi'),
('Renita Medianti', 'Anggota Seksi Konsumsi'),
('Meithy Pattiasina', 'Anggota Seksi Konsumsi'),

-- Seksi Dekorasi/Perlengkapan/Transportasi
('Bambang Sudarmaji', 'Koordinator Seksi Dekorasi/Perlengkapan/Transportasi'),
('Anggono', 'Anggota Seksi Dekorasi/Perlengkapan/Transportasi'),
('Yohanes Shafrizal', 'Anggota Seksi Dekorasi/Perlengkapan/Transportasi'),
('Supracoyo', 'Anggota Seksi Dekorasi/Perlengkapan/Transportasi'),
('Ferry Ferdinand Aponno', 'Anggota Seksi Dekorasi/Perlengkapan/Transportasi'),
('Herling Boyoh', 'Anggota Seksi Dekorasi/Perlengkapan/Transportasi'),

-- Seksi Dokumentasi
('Leonard Luhulima', 'Koordinator Seksi Dokumentasi'),
('Ponirin Nainggolan', 'Anggota Seksi Dokumentasi'),
('Yohanes Alexander Popal', 'Anggota Seksi Dokumentasi'),
('Freddy Tuhumena', 'Anggota Seksi Dokumentasi'),
('Hendrik Detan', 'Anggota Seksi Dokumentasi'),

-- Seksi Humas/Publikasi
('Gladys Martha', 'Koordinator Seksi Humas/Publikasi'),
('Tata Voly Dina Tampubolon', 'Anggota Seksi Humas/Publikasi'),
('David Luohenapessy', 'Anggota Seksi Humas/Publikasi'),
('Sharon Hento', 'Anggota Seksi Humas/Publikasi'),
('Camila Meifa', 'Anggota Seksi Humas/Publikasi'),

-- Seksi Dana
('Vicora van der MUUR - Tulende', 'Koordinator Seksi Dana'),
('Sri Prastiwi Christiningsih Prasodjo Sitompul', 'Anggota Seksi Dana'),
('Florida Laisina', 'Anggota Seksi Dana'),
('Lexie J A Mailangkay', 'Anggota Seksi Dana'),
('Adriaan Vanie Maggy Tomasouw', 'Anggota Seksi Dana'),
('Nanan Kumaat', 'Anggota Seksi Dana'),
('Erick Lumentut', 'Anggota Seksi Dana'),
('Dony Alfons', 'Anggota Seksi Dana'),
('Evelia Marbun-Tobing', 'Anggota Seksi Dana'),
('Rofina Butar-Butar', 'Anggota Seksi Dana'),
('Srisuyati Hutabarat-Sihombing', 'Anggota Seksi Dana'),
('Enny Rora', 'Anggota Seksi Dana'),
('Sri Sundari', 'Anggota Seksi Dana'),
('Tiodinar Samosir Tambunan', 'Anggota Seksi Dana'),
('Marsya Theresia Ayal', 'Anggota Seksi Dana'),
('Marganda Situmeang', 'Anggota Seksi Dana'),
('Nelly Sandehang', 'Anggota Seksi Dana'),
('Ninik M L Tobing', 'Anggota Seksi Dana'),

-- Seksi Kesehatan
('dr. Lavinia Jane Kadjiman-Papilaya', 'Koordinator Seksi Kesehatan'),
('dr. Elisabet Wahyuni Katrianti', 'Anggota Seksi Kesehatan'),
('dr. Kezia Sormin', 'Anggota Seksi Kesehatan'),
('Sarah Monica br Tambunan', 'Anggota Seksi Kesehatan'),
('dr. Cendika Merilly Banowati', 'Anggota Seksi Kesehatan'),
('dr. Luana Nantingkaseh Sp KJ', 'Anggota Seksi Kesehatan'),
('dr. Rosida Sihombing SpA', 'Anggota Seksi Kesehatan'),

-- Seksi Keamanan
('Benny Wesley Marbun', 'Koordinator Seksi Keamanan'),
('Jerry Simon', 'Anggota Seksi Keamanan'),
('Iboy Bangkang', 'Anggota Seksi Keamanan'),
('Richard Kotten', 'Anggota Seksi Keamanan'),
('Walter Sahetapy', 'Anggota Seksi Keamanan')
ON CONFLICT (name) DO NOTHING;

-- 3. Menambahkan kolom relasi panitia ke tabel proposals
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS committee_id UUID REFERENCES committees(id);
