-- Migration 0003: guestbook_messages table & RLS policies

CREATE TABLE IF NOT EXISTS public.guestbook_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    church_city TEXT NOT NULL,
    message TEXT NOT NULL,
    is_approved BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.guestbook_messages ENABLE ROW LEVEL SECURITY;

-- 1. Public can SELECT only approved messages
CREATE POLICY "Public can view approved guestbook messages"
    ON public.guestbook_messages
    FOR SELECT
    TO public
    USING (is_approved = true);

-- 2. Public can INSERT new messages (is_approved defaults to false)
CREATE POLICY "Public can submit guestbook messages"
    ON public.guestbook_messages
    FOR INSERT
    TO public
    WITH CHECK (true);

-- 3. Authenticated Admin can SELECT all messages
CREATE POLICY "Authenticated admin can view all guestbook messages"
    ON public.guestbook_messages
    FOR SELECT
    TO authenticated
    USING (true);

-- 4. Authenticated Admin can UPDATE / DELETE guestbook messages
CREATE POLICY "Authenticated admin can update guestbook messages"
    ON public.guestbook_messages
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated admin can delete guestbook messages"
    ON public.guestbook_messages
    FOR DELETE
    TO authenticated
    USING (true);

-- Index for fast querying of approved messages
CREATE INDEX IF NOT EXISTS idx_guestbook_approved_created 
    ON public.guestbook_messages (is_approved, created_at DESC);
