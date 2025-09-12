-- Worker Applications Setup for Admin Portal
-- This creates the system for admin approval of worker applications

-- 1. Worker Applications Table (for pending approvals)
CREATE TABLE IF NOT EXISTS public.worker_applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Basic Information
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  phone TEXT,
  
  -- Work Details
  department TEXT NOT NULL,
  speciality TEXT NOT NULL,
  experience_years INTEGER DEFAULT 0,
  education TEXT,
  previous_work TEXT,
  
  -- Document Verification
  id_card_url TEXT, -- Path to uploaded ID card image
  id_card_type TEXT, -- Type of ID (Aadhaar, Voter ID, etc.)
  id_card_number TEXT,
  
  -- Application Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
  application_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by uuid REFERENCES auth.users(id),
  rejection_reason TEXT,
  admin_notes TEXT,
  
  -- Contact & Emergency Info
  address TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  
  -- Skills and Qualifications
  skills TEXT[], -- Array of skills
  certifications TEXT[], -- Array of certifications
  
  -- Auth Integration
  auth_user_id uuid REFERENCES auth.users(id), -- Link to Supabase auth user
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Update existing profiles table to handle worker approval workflow
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS application_id uuid REFERENCES public.worker_applications(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id);

-- 3. Create admin_actions table for audit trail
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid REFERENCES auth.users(id) NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('approve_worker', 'reject_worker', 'assign_task', 'update_worker')),
  target_id uuid NOT NULL, -- Could be worker_application_id or worker_id
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS for new tables
ALTER TABLE public.worker_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for worker_applications
-- Applicants can view their own applications
CREATE POLICY "Users can view their own applications" ON public.worker_applications 
  FOR SELECT USING (auth.uid() = auth_user_id);

-- Applicants can insert their own applications
CREATE POLICY "Users can create their own applications" ON public.worker_applications 
  FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- Applicants can update their pending applications
CREATE POLICY "Users can update their pending applications" ON public.worker_applications 
  FOR UPDATE USING (auth.uid() = auth_user_id AND status = 'pending');

-- Admin can view all applications (for web portal)
CREATE POLICY "Admins can view all applications" ON public.worker_applications 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can update applications (for approval/rejection)
CREATE POLICY "Admins can update applications" ON public.worker_applications 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 6. RLS Policies for admin_actions
CREATE POLICY "Admins can view admin actions" ON public.admin_actions 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert admin actions" ON public.admin_actions 
  FOR INSERT WITH CHECK (
    auth.uid() = admin_id AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_worker_applications_status ON public.worker_applications (status);
CREATE INDEX IF NOT EXISTS idx_worker_applications_email ON public.worker_applications (email);
CREATE INDEX IF NOT EXISTS idx_worker_applications_auth_user ON public.worker_applications (auth_user_id);
CREATE INDEX IF NOT EXISTS idx_worker_applications_date ON public.worker_applications (application_date);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin ON public.admin_actions (admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_type ON public.admin_actions (action_type);

-- 8. Create updated_at trigger for worker_applications
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_worker_applications_updated_at 
  BEFORE UPDATE ON public.worker_applications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Create storage bucket for worker documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('worker-documents', 'worker-documents', true)
ON CONFLICT (id) DO NOTHING;

-- 10. Storage policies for worker documents
CREATE POLICY "Worker documents are publicly viewable" ON storage.objects 
  FOR SELECT USING (bucket_id = 'worker-documents');

CREATE POLICY "Users can upload their own documents" ON storage.objects 
  FOR INSERT WITH CHECK (
    bucket_id = 'worker-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 11. Create view for admin dashboard
CREATE OR REPLACE VIEW public.worker_applications_with_auth AS
SELECT 
  wa.*,
  au.email as auth_email,
  au.created_at as auth_created_at,
  p.id as profile_id,
  p.approval_status as profile_approval_status
FROM public.worker_applications wa
LEFT JOIN auth.users au ON wa.auth_user_id = au.id
LEFT JOIN public.profiles p ON p.id = au.id;

-- Grant permissions for the view
GRANT SELECT ON public.worker_applications_with_auth TO authenticated;

-- 12. Function to approve worker application
CREATE OR REPLACE FUNCTION approve_worker_application(
  application_id uuid,
  admin_user_id uuid
) RETURNS json AS $$
DECLARE
  app_record public.worker_applications%ROWTYPE;
  result json;
BEGIN
  -- Get the application
  SELECT * INTO app_record FROM public.worker_applications WHERE id = application_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Application not found');
  END IF;
  
  -- Update application status
  UPDATE public.worker_applications 
  SET 
    status = 'approved',
    reviewed_at = NOW(),
    reviewed_by = admin_user_id
  WHERE id = application_id;
  
  -- Update or create profile
  INSERT INTO public.profiles (
    id, full_name, username, email, role, department, speciality,
    approval_status, approved_at, approved_by, application_id,
    created_at, updated_at
  ) VALUES (
    app_record.auth_user_id,
    app_record.full_name,
    app_record.username,
    app_record.email,
    'worker',
    app_record.department,
    app_record.speciality,
    'approved',
    NOW(),
    admin_user_id,
    application_id,
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    approval_status = 'approved',
    approved_at = NOW(),
    approved_by = admin_user_id,
    application_id = application_id,
    updated_at = NOW();
  
  -- Log admin action
  INSERT INTO public.admin_actions (admin_id, action_type, target_id, details)
  VALUES (admin_user_id, 'approve_worker', application_id, 
          json_build_object('worker_name', app_record.full_name, 'department', app_record.department));
  
  RETURN json_build_object('success', true, 'message', 'Worker approved successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Function to reject worker application
CREATE OR REPLACE FUNCTION reject_worker_application(
  application_id uuid,
  admin_user_id uuid,
  reason text
) RETURNS json AS $$
DECLARE
  app_record public.worker_applications%ROWTYPE;
BEGIN
  -- Get the application
  SELECT * INTO app_record FROM public.worker_applications WHERE id = application_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Application not found');
  END IF;
  
  -- Update application status
  UPDATE public.worker_applications 
  SET 
    status = 'rejected',
    reviewed_at = NOW(),
    reviewed_by = admin_user_id,
    rejection_reason = reason
  WHERE id = application_id;
  
  -- Update profile if exists
  UPDATE public.profiles 
  SET 
    approval_status = 'rejected',
    updated_at = NOW()
  WHERE id = app_record.auth_user_id;
  
  -- Log admin action
  INSERT INTO public.admin_actions (admin_id, action_type, target_id, details)
  VALUES (admin_user_id, 'reject_worker', application_id, 
          json_build_object('worker_name', app_record.full_name, 'reason', reason));
  
  RETURN json_build_object('success', true, 'message', 'Worker application rejected');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;