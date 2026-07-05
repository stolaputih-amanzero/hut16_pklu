const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '../docs/MASTER/Daftar Mupel dan Jemaat.csv');
const sqlPath = path.join(__dirname, '../supabase/migrations/0001_schema.sql');

const csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.split('\n').filter(line => line.trim() !== '');

// Skip header
const dataLines = lines.slice(1);

let sql = `-- Migration: Create churches and registrations tables

-- 1. Create churches table
CREATE TABLE IF NOT EXISTS public.churches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(255),
    mupel VARCHAR(255) NOT NULL
);

-- 2. Create registrations table
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_code VARCHAR(20) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Peserta', 'Pendamping')),
    category VARCHAR(50) NOT NULL CHECK (category IN ('Umum', 'Tuan Rumah')),
    full_name VARCHAR(255) NOT NULL,
    whatsapp_number VARCHAR(50) NOT NULL,
    mupel VARCHAR(255) NOT NULL,
    church_name VARCHAR(255) NOT NULL,
    shirt_size VARCHAR(10) NOT NULL,
    proof_of_transfer_url TEXT NOT NULL,
    
    -- Conditional fields for Peserta
    role VARCHAR(50) CHECK (role IN ('Utusan Mupel', 'Pengurus PKLU', 'Anggota PKLU', null)),
    assignment_letter_url TEXT,
    
    -- Conditional fields for Pendamping
    companion_for VARCHAR(255),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Insert data into churches
INSERT INTO public.churches (mupel, name, city) VALUES
`;

const values = dataLines.map(line => {
    // Handling possible trailing carriage returns
    const cleanLine = line.replace('\r', '');
    const [mupel, name, city] = cleanLine.split(';');
    // Escape single quotes if any
    const escape = str => (str ? str.replace(/'/g, "''") : '');
    return `    ('${escape(mupel)}', '${escape(name)}', '${escape(city)}')`;
});

sql += values.join(',\n') + ';\n';

// Create dir if not exists
const dir = path.dirname(sqlPath);
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(sqlPath, sql);
console.log('SQL generated at:', sqlPath);
