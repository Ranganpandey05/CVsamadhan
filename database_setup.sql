-- Complete database setup for CiviSamadhan mobile app
-- Run these commands in your Supabase SQL Editor

-- 1. Issues table (matching web dashboard)
CREATE TABLE IF NOT EXISTS public.issues (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_number VARCHAR UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR NOT NULL CHECK (category IN (
    'Road Maintenance', 'Water Supply', 'Sanitation', 
    'Electrical', 'Parks & Recreation', 'Infrastructure'
  )),
  priority VARCHAR NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
  status VARCHAR NOT NULL DEFAULT 'Reported' CHECK (status IN (
    'Reported', 'Acknowledged', 'Assigned', 'In Progress', 'Completed', 'Verified'
  )),
  
  -- Location data
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT NOT NULL,
  gps_accuracy DECIMAL,
  
  -- Citizen information
  citizen_id UUID REFERENCES profiles(id),
  citizen_name TEXT NOT NULL,
  citizen_phone TEXT NOT NULL,
  
  -- Worker assignment
  assigned_worker_id UUID REFERENCES profiles(id),
  assigned_at TIMESTAMP WITH TIME ZONE,
  
  -- Media attachments
  photos TEXT[],
  videos TEXT[],
  
  -- Timeline tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Device metadata
  device_info JSONB
);

-- 2. Workers table
CREATE TABLE IF NOT EXISTS public.workers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id VARCHAR UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  
  -- Work details
  department VARCHAR NOT NULL,
  skills TEXT[],
  status VARCHAR DEFAULT 'offline' CHECK (status IN ('available', 'busy', 'offline')),
  
  -- Location tracking
  current_latitude DECIMAL(10, 8),
  current_longitude DECIMAL(11, 8),
  location_updated_at TIMESTAMP WITH TIME ZONE,
  
  -- Performance metrics
  total_assignments INTEGER DEFAULT 0,
  completed_assignments INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.0,
  
  -- Account details
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE,
  profile_id UUID REFERENCES profiles(id)
);

-- 3. Issue upvotes table
CREATE TABLE IF NOT EXISTS public.issue_upvotes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id uuid REFERENCES public.issues(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(issue_id, user_id)
);

-- 4. Assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id uuid REFERENCES public.issues(id),
  worker_id uuid REFERENCES public.workers(id),
  assigned_by uuid REFERENCES public.profiles(id),
  assigned_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  status VARCHAR DEFAULT 'assigned' CHECK (status IN (
    'assigned', 'accepted', 'started', 'completed', 'verified'
  )),
  estimated_completion timestamp with time zone,
  actual_completion timestamp with time zone,
  notes TEXT
);

-- 5. Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  type VARCHAR NOT NULL CHECK (type IN (
    'new_issue', 'issue_assigned', 'issue_acknowledged', 
    'work_started', 'work_completed', 'issue_verified', 'review_request'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for issues
CREATE POLICY "Anyone can view issues" ON public.issues 
  FOR SELECT USING (true);

CREATE POLICY "Citizens can insert issues" ON public.issues 
  FOR INSERT WITH CHECK (auth.uid() = citizen_id);

CREATE POLICY "Citizens can update their own issues" ON public.issues 
  FOR UPDATE USING (auth.uid() = citizen_id);

CREATE POLICY "Workers can update assigned issues" ON public.issues 
  FOR UPDATE USING (auth.uid() = assigned_worker_id);

-- RLS Policies for upvotes
CREATE POLICY "Users can view upvotes" ON public.issue_upvotes 
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own upvotes" ON public.issue_upvotes 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own upvotes" ON public.issue_upvotes 
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications 
  FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications 
  FOR UPDATE USING (auth.uid() = recipient_id);

-- RLS Policies for workers
CREATE POLICY "Anyone can view workers" ON public.workers 
  FOR SELECT USING (true);

CREATE POLICY "Workers can update their own data" ON public.workers 
  FOR UPDATE USING (auth.uid() = profile_id);

-- RLS Policies for assignments
CREATE POLICY "Workers can view their assignments" ON public.assignments 
  FOR SELECT USING (
    worker_id IN (SELECT id FROM workers WHERE profile_id = auth.uid())
  );

CREATE POLICY "Citizens can view assignments for their issues" ON public.assignments 
  FOR SELECT USING (
    issue_id IN (SELECT id FROM issues WHERE citizen_id = auth.uid())
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_issues_location ON public.issues (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_issues_status ON public.issues (status);
CREATE INDEX IF NOT EXISTS idx_issues_priority ON public.issues (priority);
CREATE INDEX IF NOT EXISTS idx_issues_citizen ON public.issues (citizen_id);
CREATE INDEX IF NOT EXISTS idx_issues_worker ON public.issues (assigned_worker_id);
CREATE INDEX IF NOT EXISTS idx_issues_created ON public.issues (created_at);

CREATE INDEX IF NOT EXISTS idx_issue_upvotes_issue ON public.issue_upvotes (issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_upvotes_user ON public.issue_upvotes (user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications (recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications (read);

CREATE INDEX IF NOT EXISTS idx_workers_status ON public.workers (status);
CREATE INDEX IF NOT EXISTS idx_workers_department ON public.workers (department);

-- Insert some sample data for testing
INSERT INTO public.workers (worker_id, full_name, phone, department, skills, status, profile_id) VALUES
('ROAD001', 'राम प्रसाद शर्मा', '+91-9876543210', 'Road Maintenance', ARRAY['पोथोल रिपेयर', 'सड़क निर्माण'], 'available', null),
('ELEC001', 'सुनील कुमार', '+91-9876543211', 'Electrical', ARRAY['स्ट्रीट लाइट', 'वायरिंग'], 'available', null),
('SANI001', 'राज कुमार', '+91-9876543212', 'Sanitation', ARRAY['कचरा संग्रह', 'सफाई'], 'available', null),
('WATER001', 'अशोक यादव', '+91-9876543213', 'Water Supply', ARRAY['पाइप लाइन', 'वाटर टैंक'], 'available', null);

-- Add some sample issues for testing
INSERT INTO public.issues (
  issue_number, title, description, category, priority, status,
  latitude, longitude, address, citizen_id, citizen_name, citizen_phone, photos
) VALUES
('CIV-2024-0001', 'सड़क में बड़ा गड्ढा', 'मुख्य सड़क पर बड़ा गड्ढा है जिससे दुर्घटना हो सकती है', 'Road Maintenance', 'High', 'Reported', 
 28.6139, 77.2090, 'Main Street, Delhi', null, 'राम कुमार', '+91-9876543210', ARRAY[]::TEXT[]),
 
('CIV-2024-0002', 'स्ट्रीट लाइट बंद है', 'रात में सड़क पर अंधेरा है, स्ट्रीट लाइट ठीक करवाएं', 'Electrical', 'Medium', 'Acknowledged',
 28.6150, 77.2100, 'Sector 12, Delhi', null, 'सुनीता देवी', '+91-9876543211', ARRAY[]::TEXT[]),
 
('CIV-2024-0003', 'कचरा गाड़ी नहीं आई', '3 दिन से कचरा गाड़ी नहीं आई है, कचरा इकट्ठा हो गया है', 'Sanitation', 'Medium', 'Assigned',
 28.6120, 77.2080, 'Block B, Delhi', null, 'अशोक यादव', '+91-9876543212', ARRAY[]::TEXT[]);

COMMENT ON TABLE public.issues IS 'Civic issues reported by citizens';
COMMENT ON TABLE public.workers IS 'Municipal workers who resolve issues';
COMMENT ON TABLE public.issue_upvotes IS 'Citizen upvotes for issues to show community support';
COMMENT ON TABLE public.assignments IS 'Assignment of issues to workers';
COMMENT ON TABLE public.notifications IS 'Push notifications for users';