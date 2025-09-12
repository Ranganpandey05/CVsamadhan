-- Compatible database setup for CiviSamadhan
-- This script ensures compatibility with both mobile app and web dashboard

-- Create profiles table first (for user management)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'citizen' CHECK (role IN ('citizen', 'worker', 'admin')),
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for profiles
CREATE POLICY "Users can view and update own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Create issues table with compatibility for both column naming conventions
CREATE TABLE IF NOT EXISTS public.issues (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_number TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  priority TEXT DEFAULT 'Medium',
  status TEXT DEFAULT 'Reported',
  
  -- Location data (supporting both naming conventions)
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT,
  
  -- Citizen information
  citizen_id uuid REFERENCES auth.users(id),
  citizen_name TEXT,
  citizen_phone TEXT,
  
  -- Worker assignment
  assigned_worker_id uuid,
  
  -- Media attachments
  photos TEXT[] DEFAULT '{}',
  
  -- Timeline tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  -- Ensure at least one location format is provided
  CONSTRAINT location_check CHECK (
    (lat IS NOT NULL AND lng IS NOT NULL) OR 
    (latitude IS NOT NULL AND longitude IS NOT NULL)
  )
);

-- Create triggers to sync lat/lng and latitude/longitude
CREATE OR REPLACE FUNCTION sync_location_columns()
RETURNS TRIGGER AS $$
BEGIN
  -- If lat/lng are provided, copy to latitude/longitude
  IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
    NEW.latitude = NEW.lat;
    NEW.longitude = NEW.lng;
  END IF;
  
  -- If latitude/longitude are provided, copy to lat/lng
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.lat = NEW.latitude;
    NEW.lng = NEW.longitude;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_location_trigger
  BEFORE INSERT OR UPDATE ON public.issues
  FOR EACH ROW
  EXECUTE FUNCTION sync_location_columns();

-- Enable RLS on issues
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

-- Create policy for issues (citizens can create and view, workers can update)
CREATE POLICY "Anyone can view issues" ON public.issues
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create issues" ON public.issues
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own issues" ON public.issues
  FOR UPDATE USING (auth.uid() = citizen_id);

-- Create issue upvotes table
CREATE TABLE IF NOT EXISTS public.issue_upvotes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id uuid REFERENCES public.issues(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(issue_id, user_id)
);

-- Enable RLS on upvotes
ALTER TABLE public.issue_upvotes ENABLE ROW LEVEL SECURITY;

-- Create policy for upvotes
CREATE POLICY "Users can manage their own upvotes" ON public.issue_upvotes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view upvote counts" ON public.issue_upvotes
  FOR SELECT USING (true);

-- Create workers table
CREATE TABLE IF NOT EXISTS public.workers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  department TEXT,
  status TEXT DEFAULT 'offline',
  current_latitude DECIMAL(10, 8),
  current_longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  profile_id uuid REFERENCES public.profiles(id)
);

-- Enable RLS on workers
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;

-- Create policy for workers
CREATE POLICY "Workers can view and update their own data" ON public.workers
  FOR ALL USING (auth.uid() = profile_id);

-- Create assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id uuid REFERENCES public.issues(id) ON DELETE CASCADE,
  worker_id uuid REFERENCES public.workers(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'assigned',
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on assignments
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Create policy for assignments
CREATE POLICY "Workers can view their assignments" ON public.assignments
  FOR SELECT USING (worker_id IN (
    SELECT id FROM public.workers WHERE profile_id = auth.uid()
  ));

-- Create function to automatically set issue number
CREATE OR REPLACE FUNCTION generate_issue_number()
RETURNS TRIGGER AS $$
DECLARE
  year_month TEXT;
  counter INTEGER;
BEGIN
  -- Only generate issue number if it's not already provided
  IF NEW.issue_number IS NULL OR NEW.issue_number = '' THEN
    -- Get current year and month
    year_month := TO_CHAR(NOW(), 'YYYY-MM');
    
    -- Get next counter for this month
    SELECT COALESCE(MAX(CAST(SPLIT_PART(issue_number, '-', 3) AS INTEGER)), 0) + 1
    INTO counter
    FROM public.issues
    WHERE issue_number LIKE 'CIV-' || year_month || '-%';
    
    -- Set the issue number
    NEW.issue_number := 'CIV-' || year_month || '-' || LPAD(counter::TEXT, 3, '0');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating issue numbers
CREATE TRIGGER generate_issue_number_trigger
  BEFORE INSERT ON public.issues
  FOR EACH ROW
  EXECUTE FUNCTION generate_issue_number();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at triggers
CREATE TRIGGER update_issues_updated_at
  BEFORE UPDATE ON public.issues
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
INSERT INTO public.profiles (id, email, full_name, role, phone) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'citizen@example.com', 'राम कुमार', 'citizen', '+91-9876543210'),
  ('550e8400-e29b-41d4-a716-446655440001', 'worker@example.com', 'श्याम वर्कर', 'worker', '+91-9876543211')
ON CONFLICT (id) DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_issues_location ON public.issues USING btree (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_issues_status ON public.issues USING btree (status);
CREATE INDEX IF NOT EXISTS idx_issues_category ON public.issues USING btree (category);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON public.issues USING btree (created_at);
CREATE INDEX IF NOT EXISTS idx_upvotes_issue ON public.issue_upvotes USING btree (issue_id);
CREATE INDEX IF NOT EXISTS idx_workers_location ON public.workers USING btree (current_latitude, current_longitude);