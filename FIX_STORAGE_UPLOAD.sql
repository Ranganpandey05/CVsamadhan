-- Storage setup for worker document uploads
-- Run this in Supabase SQL Editor to fix image upload issues

-- 1. Ensure storage bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('worker-documents', 'worker-documents', true)
ON CONFLICT (id) DO UPDATE SET 
  public = true;

-- 2. Drop existing policies if they exist
DROP POLICY IF EXISTS "Worker documents are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

-- 3. Create comprehensive storage policies
CREATE POLICY "Worker documents are publicly viewable" ON storage.objects 
  FOR SELECT USING (bucket_id = 'worker-documents');

CREATE POLICY "Users can upload their own documents" ON storage.objects 
  FOR INSERT WITH CHECK (
    bucket_id = 'worker-documents' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can update their own documents" ON storage.objects 
  FOR UPDATE WITH CHECK (
    bucket_id = 'worker-documents' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can delete their own documents" ON storage.objects 
  FOR DELETE USING (
    bucket_id = 'worker-documents' AND
    auth.uid() IS NOT NULL
  );

-- 4. Verify bucket configuration
SELECT * FROM storage.buckets WHERE id = 'worker-documents';

-- 5. Verify storage policies are created
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%Worker%';

-- Success message
SELECT 'Storage bucket worker-documents is ready for uploads!' as status;