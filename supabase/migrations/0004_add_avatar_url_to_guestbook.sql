-- Migration 0004: Add avatar_url to guestbook_messages

ALTER TABLE public.guestbook_messages 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;
