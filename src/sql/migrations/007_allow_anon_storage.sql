-- Migration: Allow public (anonymous and authenticated) access to the 'proposals' storage bucket in Supabase

-- 1. Policy for INSERT (Upload files)
CREATE POLICY "Allow public upload to proposals bucket"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'proposals');

-- 2. Policy for SELECT (Read files)
CREATE POLICY "Allow public select from proposals bucket"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'proposals');

-- 3. Policy for UPDATE (Modify files)
CREATE POLICY "Allow public update to proposals bucket"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'proposals')
WITH CHECK (bucket_id = 'proposals');

-- 4. Policy for DELETE (Delete files)
CREATE POLICY "Allow public delete from proposals bucket"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'proposals');
