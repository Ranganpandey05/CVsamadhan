-- CiviSamadhan Database Setup - Step by Step
-- Run these commands one by one in your Supabase SQL Editor

-- Step 1: Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'citizen',
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Enable RLS and create policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add missing columns to profiles table if they don't exist
DO $$ 
BEGIN 
  -- Add email column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='email') THEN
    ALTER TABLE public.profiles ADD COLUMN email TEXT;
  END IF;
  
  -- Add full_name column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='full_name') THEN
    ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
  END IF;
  
  -- Add avatar_url column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='avatar_url') THEN
    ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
  END IF;
  
  -- Add role column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'citizen';
  END IF;
  
  -- Add phone column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='phone') THEN
    ALTER TABLE public.profiles ADD COLUMN phone TEXT;
  END IF;
  
  -- Add created_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='created_at') THEN
    ALTER TABLE public.profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  
  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='updated_at') THEN
    ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

DROP POLICY IF EXISTS "Users can view and update own profile" ON public.profiles;
CREATE POLICY "Users can view and update own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Step 3: Create issues table (compatible with existing schemas)
CREATE TABLE IF NOT EXISTS public.issues (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_number TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  priority TEXT DEFAULT 'Medium',
  status TEXT DEFAULT 'Reported',
  -- Location columns (supporting multiple naming conventions)
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT,
  citizen_id uuid REFERENCES auth.users(id),
  citizen_name TEXT,
  citizen_phone TEXT,
  assigned_worker_id uuid,
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Add missing columns if they don't exist (for existing tables)
DO $$ 
BEGIN 
  -- Add latitude column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='issues' AND column_name='latitude') THEN
    ALTER TABLE public.issues ADD COLUMN latitude DECIMAL(10, 8);
  END IF;
  
  -- Add longitude column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='issues' AND column_name='longitude') THEN
    ALTER TABLE public.issues ADD COLUMN longitude DECIMAL(11, 8);
  END IF;
  
  -- Add lat column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='issues' AND column_name='lat') THEN
    ALTER TABLE public.issues ADD COLUMN lat DECIMAL(10, 8);
  END IF;
  
  -- Add lng column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='issues' AND column_name='lng') THEN
    ALTER TABLE public.issues ADD COLUMN lng DECIMAL(11, 8);
  END IF;
  
  -- Add other common columns that might be missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='issues' AND column_name='issue_number') THEN
    ALTER TABLE public.issues ADD COLUMN issue_number TEXT UNIQUE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='issues' AND column_name='photos') THEN
    ALTER TABLE public.issues ADD COLUMN photos TEXT[] DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='issues' AND column_name='citizen_id') THEN
    ALTER TABLE public.issues ADD COLUMN citizen_id uuid REFERENCES auth.users(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='issues' AND column_name='citizen_name') THEN
    ALTER TABLE public.issues ADD COLUMN citizen_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='issues' AND column_name='citizen_phone') THEN
    ALTER TABLE public.issues ADD COLUMN citizen_phone TEXT;
  END IF;
END $$;

-- Step 4: Create location sync function
CREATE OR REPLACE FUNCTION sync_location_columns()
RETURNS TRIGGER AS $$
BEGIN
  -- Sync lat/lng to latitude/longitude
  IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
    NEW.latitude = NEW.lat;
    NEW.longitude = NEW.lng;
  END IF;
  
  -- Sync latitude/longitude to lat/lng
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.lat = NEW.latitude;
    NEW.lng = NEW.longitude;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create location sync trigger
DROP TRIGGER IF EXISTS sync_location_trigger ON public.issues;
CREATE TRIGGER sync_location_trigger
  BEFORE INSERT OR UPDATE ON public.issues
  FOR EACH ROW
  EXECUTE FUNCTION sync_location_columns();

-- Step 6: Create issue number generation function
CREATE OR REPLACE FUNCTION generate_issue_number()
RETURNS TRIGGER AS $$
DECLARE
  year_month TEXT;
  counter INTEGER;
BEGIN
  -- Only generate if not provided
  IF NEW.issue_number IS NULL OR NEW.issue_number = '' THEN
    year_month := TO_CHAR(NOW(), 'YYYY-MM');
    
    SELECT COALESCE(MAX(CAST(SPLIT_PART(issue_number, '-', 3) AS INTEGER)), 0) + 1
    INTO counter
    FROM public.issues
    WHERE issue_number LIKE 'CIV-' || year_month || '-%';
    
    NEW.issue_number := 'CIV-' || year_month || '-' || LPAD(counter::TEXT, 3, '0');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create trigger for issue numbers
DROP TRIGGER IF EXISTS generate_issue_number_trigger ON public.issues;
CREATE TRIGGER generate_issue_number_trigger
  BEFORE INSERT ON public.issues
  FOR EACH ROW
  EXECUTE FUNCTION generate_issue_number();

-- Step 8: Enable RLS and create policies for issues
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view issues" ON public.issues;
CREATE POLICY "Anyone can view issues" ON public.issues
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create issues" ON public.issues;
CREATE POLICY "Authenticated users can create issues" ON public.issues
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own issues" ON public.issues;
CREATE POLICY "Users can update their own issues" ON public.issues
  FOR UPDATE USING (auth.uid() = citizen_id);

-- Step 9: Create upvotes table
CREATE TABLE IF NOT EXISTS public.issue_upvotes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id uuid REFERENCES public.issues(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(issue_id, user_id)
);

-- Step 10: Enable RLS and create policies for upvotes
ALTER TABLE public.issue_upvotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own upvotes" ON public.issue_upvotes;
CREATE POLICY "Users can manage their own upvotes" ON public.issue_upvotes
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view upvote counts" ON public.issue_upvotes;
CREATE POLICY "Anyone can view upvote counts" ON public.issue_upvotes
  FOR SELECT USING (true);

-- Step 11: Create workers table
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

-- Step 12: Enable RLS for workers
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workers can view and update their own data" ON public.workers;
CREATE POLICY "Workers can view and update their own data" ON public.workers
  FOR ALL USING (auth.uid() = profile_id);

-- Step 13: Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 14: Create updated_at triggers
DROP TRIGGER IF EXISTS update_issues_updated_at ON public.issues;
CREATE TRIGGER update_issues_updated_at
  BEFORE UPDATE ON public.issues
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 15: Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Step 16: Create indexes
CREATE INDEX IF NOT EXISTS idx_issues_location ON public.issues USING btree (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_issues_status ON public.issues USING btree (status);
CREATE INDEX IF NOT EXISTS idx_issues_category ON public.issues USING btree (category);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON public.issues USING btree (created_at);
CREATE INDEX IF NOT EXISTS idx_upvotes_issue ON public.issue_upvotes USING btree (issue_id);

-- Step 17: Sample data setup (optional)
-- Note: Sample users can only be created through Supabase Auth
-- The profiles will be automatically created when users sign up through your app
-- 
-- To test your app:
-- 1. Use your mobile app to create a new account
-- 2. The profile will be automatically created in the profiles table
-- 3. You can then test issue creation and upvoting features
--
-- If you want to manually create test users, do it through:
-- 1. Supabase Dashboard > Authentication > Add User
-- 2. Then the profile will be created automatically via trigger or app logic

-- Optional: Create a trigger to automatically create profiles when users sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'citizen'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- All done! Your CiviSamadhan database is ready.