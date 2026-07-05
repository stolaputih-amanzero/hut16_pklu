-- Migration 0005: merch_orders table & RLS policies

CREATE TABLE IF NOT EXISTS public.merch_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_code TEXT NULL,
    buyer_name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    item_type TEXT NOT NULL,
    size TEXT NULL,
    quantity INT NOT NULL DEFAULT 1,
    notes TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.merch_orders ENABLE ROW LEVEL SECURITY;

-- 1. Public can INSERT new merchandise orders
CREATE POLICY "Public can insert merch orders"
    ON public.merch_orders
    FOR INSERT
    TO public
    WITH CHECK (true);

-- 2. Authenticated Admin can SELECT all merchandise orders
CREATE POLICY "Authenticated admin can view merch orders"
    ON public.merch_orders
    FOR SELECT
    TO authenticated
    USING (true);

-- 3. Authenticated Admin can UPDATE merchandise orders
CREATE POLICY "Authenticated admin can update merch orders"
    ON public.merch_orders
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 4. Authenticated Admin can DELETE merchandise orders
CREATE POLICY "Authenticated admin can delete merch orders"
    ON public.merch_orders
    FOR DELETE
    TO authenticated
    USING (true);

-- Index for fast query ordering by created_at DESC
CREATE INDEX IF NOT EXISTS idx_merch_orders_created 
    ON public.merch_orders (created_at DESC);
