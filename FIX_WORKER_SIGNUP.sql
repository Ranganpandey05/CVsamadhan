-- Fix worker signup RLS policy issues
-- Run this in Supabase SQL Editor to allow worker signups

-- 1. Drop existing restrictive policies for worker_applications
DROP POLICY IF EXISTS "Users can create their own applications" ON public.worker_applications;
DROP POLICY IF EXISTS "Users can view their own applications" ON public.worker_applications;
DROP POLICY IF EXISTS "Users can update their pending applications" ON public.worker_applications;
DROP POLICY IF EXISTS "Authenticated users can create applications" ON public.worker_applications;
DROP POLICY IF EXISTS "Users can view own applications" ON public.worker_applications;
DROP POLICY IF EXISTS "Users can update pending applications" ON public.worker_applications;

-- 2. Create more permissive policies for worker applications
-- Allow any authenticated user to insert their application
CREATE POLICY "Authenticated users can create applications" ON public.worker_applications 
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = auth_user_id
  );

-- Allow users to view their own applications
CREATE POLICY "Users can view own applications" ON public.worker_applications 
  FOR SELECT USING (
    auth.uid() = auth_user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow users to update their pending applications
CREATE POLICY "Users can update pending applications" ON public.worker_applications 
  FOR UPDATE USING (
    (auth.uid() = auth_user_id AND status = 'pending') OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 3. Ensure profiles table has proper trigger for new users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, approval_status)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'citizen'),
    CASE 
      WHEN COALESCE(new.raw_user_meta_data->>'role', 'citizen') = 'worker' THEN 'pending'
      ELSE 'approved'
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Fix storage policies completely
-- Drop ALL existing storage policies for worker-documents
DROP POLICY IF EXISTS "Worker documents are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view worker documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload worker documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update worker documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete worker documents" ON storage.objects;

-- Ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES ('worker-documents', 'worker-documents', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

-- Create simple, permissive storage policies
CREATE POLICY "Anyone can view worker documents" ON storage.objects 
  FOR SELECT USING (bucket_id = 'worker-documents');

CREATE POLICY "Authenticated users can upload worker documents" ON storage.objects 
  FOR INSERT WITH CHECK (
    bucket_id = 'worker-documents' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can update worker documents" ON storage.objects 
  FOR UPDATE USING (
    bucket_id = 'worker-documents' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete worker documents" ON storage.objects 
  FOR DELETE USING (
    bucket_id = 'worker-documents' AND
    auth.role() = 'authenticated'
  );

-- 6. Create a function to handle worker application completion
CREATE OR REPLACE FUNCTION public.complete_worker_application()
RETURNS trigger AS $$
BEGIN
  -- Update the user's profile with application info
  UPDATE public.profiles 
  SET 
    application_id = NEW.id,
    approval_status = 'pending'
  WHERE id = NEW.auth_user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create trigger for worker application completion
DROP TRIGGER IF EXISTS on_worker_application_created ON public.worker_applications;
CREATE TRIGGER on_worker_application_created
  AFTER INSERT ON public.worker_applications
  FOR EACH ROW EXECUTE FUNCTION public.complete_worker_application();

-- 8. Verify the setup
SELECT 'Worker signup RLS policies updated successfully!' as status;

-- Check that the policies exist
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'worker_applications'
ORDER BY policyname;