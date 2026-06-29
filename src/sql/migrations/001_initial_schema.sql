-- Enum types
CREATE TYPE proposal_type AS ENUM ('donatur', 'sponsorship');
CREATE TYPE donatur_category AS ENUM (
  'sahabat_bakti', 'sahabat_teladan', 'sahabat_pelayanan',
  'sahabat_berkat', 'sahabat_kasih', 'anonim'
);
CREATE TYPE sponsor_package AS ENUM (
  'platinum', 'gold', 'silver', 'bronze', 'in_kind', 'donatur'
);
CREATE TYPE payment_status AS ENUM (
  'pending', 'confirmed', 'cancelled'
);
CREATE TYPE lang AS ENUM ('id', 'en');

-- Sequence table untuk penomoran atomic (race-condition safe)
CREATE TABLE numbering_sequences (
  id SERIAL PRIMARY KEY,
  prefix TEXT NOT NULL UNIQUE,         -- 'DON' atau 'SPN'
  year INT NOT NULL,
  last_number INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(prefix, year)
);

-- Seed awal
INSERT INTO numbering_sequences (prefix, year, last_number)
VALUES ('DON', 2026, 0), ('SPN', 2026, 0);

-- Tabel Proposal (menyimpan data donatur & sponsorship)
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type proposal_type NOT NULL,
  number TEXT NOT NULL UNIQUE,         -- e.g. 'DON-001/2026'
  year INT NOT NULL DEFAULT 2026,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Data umum
  name TEXT NOT NULL,
  phone TEXT NOT NULL,                 -- format: 628xxx (tanpa +, tanpa 0)
  email TEXT,
  address TEXT,
  congregation TEXT,                   -- jemaat GPIB

  -- Data donatur
  display_name TEXT,                   -- nama yang dicantumkan
  contribution_value BIGINT,           -- dalam rupiah
  contribution_form TEXT,              -- 'dana' | 'barang' | 'jasa'
  donatur_category donatur_category,
  specific_support TEXT,               -- konsumsi_lansia, hadiah_lomba, dll
  message TEXT,                        -- ucapan 25-40 kata untuk buku acara

  -- Data sponsorship
  company_name TEXT,
  pic_name TEXT,
  pic_position TEXT,
  sponsor_package sponsor_package,

  -- Status & file
  payment_status payment_status DEFAULT 'pending',
  confirmed_at TIMESTAMPTZ,
  proposal_pdf_url TEXT,
  token_pdf_url TEXT,

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk performa
CREATE INDEX idx_proposals_type ON proposals(type);
CREATE INDEX idx_proposals_number ON proposals(number);
CREATE INDEX idx_proposals_payment ON proposals(payment_status);
CREATE INDEX idx_proposals_phone ON proposals(phone);

-- RLS Policies
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage proposals"
  ON proposals FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Function atomic numbering dengan advisory lock
CREATE OR REPLACE FUNCTION get_next_number(
  p_prefix TEXT,
  p_year INT
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_next INT;
  v_number TEXT;
BEGIN
  -- Advisory lock per prefix+year (mencegah race condition)
  PERFORM pg_advisory_xact_lock(
    hashtext(p_prefix || '_' || p_year::TEXT)
  );

  SELECT last_number + 1 INTO v_next
  FROM numbering_sequences
  WHERE prefix = p_prefix AND year = p_year
  FOR UPDATE;

  UPDATE numbering_sequences
  SET last_number = v_next, updated_at = NOW()
  WHERE prefix = p_prefix AND year = p_year;

  v_number := p_prefix || '-' || LPAD(v_next::TEXT, 3, '0') || '/' || p_year::TEXT;
  RETURN v_number;
END;
$$;