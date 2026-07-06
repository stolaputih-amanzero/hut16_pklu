-- Create admin_profiles table
CREATE TABLE public.admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'super_user')) DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the current user is a super user (runs with SECURITY DEFINER to bypass recursion)
CREATE OR REPLACE FUNCTION public.is_super_user()
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid() AND role = 'super_user'
  );
END;
$$ LANGUAGE plpgsql;

-- Setup RLS Policies
CREATE POLICY "Admin can read own profile" 
ON public.admin_profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Super user can manage all profiles" 
ON public.admin_profiles 
FOR ALL 
USING (public.is_super_user())
WITH CHECK (public.is_super_user());

-- Seed Super User Profile using the known UUID (with ON CONFLICT check)
INSERT INTO public.admin_profiles (id, full_name, role)
VALUES ('9d5f0da7-b5c3-4c96-810c-704ec57a7839', 'aman', 'super_user')
ON CONFLICT (id) DO UPDATE 
SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;
