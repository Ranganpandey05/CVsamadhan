-- FIX PROFILES TABLE - Add missing location columns
-- Execute this in Supabase SQL Editor to fix profile location tracking

-- Add missing location columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_latitude DECIMAL(10, 8);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_longitude DECIMAL(11, 8);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_location_update TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for location-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles(current_latitude, current_longitude);

-- Update RLS policies for profiles if needed
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can update their own location" ON public.profiles;
DROP POLICY IF EXISTS "Worker locations are publicly viewable" ON public.profiles;

-- Allow authenticated users to update their own location
CREATE POLICY "Users can update their own location" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow public read access to worker locations (for citizen tracking)
CREATE POLICY "Worker locations are publicly viewable" ON public.profiles
  FOR SELECT USING (role = 'worker');

-- Grant permissions
GRANT ALL ON public.profiles TO authenticated;

-- Verification query - check if columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public' 
  AND column_name IN ('current_latitude', 'current_longitude', 'last_location_update');