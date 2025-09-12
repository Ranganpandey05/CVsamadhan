-- SAFE CVSamadhan Database Setup - Execute this in Supabase SQL Editor
-- This script safely adds demo data without truncating existing tables

-- Step 1: Check existing table structure first
-- Run this query to see what columns exist:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'tasks' AND table_schema = 'public';

-- Step 2: Add missing columns to existing tasks table (safe approach)
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS citizen_name TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS citizen_phone TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS assigned_worker_id uuid;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS completion_photo TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS completion_notes TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS priority TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS address TEXT;

-- Step 3: Ensure tasks table exists with all required columns
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  priority TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT,
  citizen_name TEXT,
  citizen_phone TEXT,
  assigned_worker_id uuid,
  assigned_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  completion_photo TEXT,
  completion_notes TEXT
);

-- Step 4: Insert demo tasks (safe UPSERT approach)
-- Using only essential columns that should exist
INSERT INTO public.tasks (
  id, title, description, status, latitude, longitude
) VALUES 
(
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'Fix Street Light near DLF IT Park',
  'Street light pole #45 on Action Area II is not working. IT employees facing difficulty during late night return.',
  'pending',
  22.5760,
  88.4348
),
(
  '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  'Water Pipeline Leakage near ISKCON',
  'Major water leakage near ISKCON Temple causing waterlogging. Devotees and residents facing issues.',
  'pending',
  22.5720,
  88.4370
),
(
  '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
  'Garbage Collection Issue at TCS Campus',
  'Garbage has not been collected for 3 days near TCS office complex. Bad smell affecting office environment.',
  'pending',
  22.5695,
  88.4280
),
(
  '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
  'Central Park Maintenance',
  'Regular maintenance and cleaning of the Central Park area near City Centre Mall.',
  'in_progress',
  22.5785,
  88.4320
),
(
  '6ba7b813-9dad-11d1-80b4-00c04fd430c8',
  'Drainage Cleaning near Webel Bhawan',
  'Blocked drainage causing waterlogging during monsoon. Needs immediate attention.',
  'completed',
  22.5745,
  88.4365
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  updated_at = NOW();

-- Step 5: Update with additional details if columns exist
UPDATE public.tasks SET 
  category = CASE id
    WHEN 'f47ac10b-58cc-4372-a567-0e02b2c3d479' THEN 'Street Lighting'
    WHEN '6ba7b810-9dad-11d1-80b4-00c04fd430c8' THEN 'Water Supply'
    WHEN '6ba7b811-9dad-11d1-80b4-00c04fd430c8' THEN 'Waste Management'
    WHEN '6ba7b812-9dad-11d1-80b4-00c04fd430c8' THEN 'Sanitation'
    WHEN '6ba7b813-9dad-11d1-80b4-00c04fd430c8' THEN 'Drainage'
  END,
  priority = CASE id
    WHEN 'f47ac10b-58cc-4372-a567-0e02b2c3d479' THEN 'high'
    WHEN '6ba7b810-9dad-11d1-80b4-00c04fd430c8' THEN 'urgent'
    WHEN '6ba7b811-9dad-11d1-80b4-00c04fd430c8' THEN 'medium'
    WHEN '6ba7b812-9dad-11d1-80b4-00c04fd430c8' THEN 'low'
    WHEN '6ba7b813-9dad-11d1-80b4-00c04fd430c8' THEN 'high'
  END,
  address = CASE id
    WHEN 'f47ac10b-58cc-4372-a567-0e02b2c3d479' THEN 'Action Area II, Salt Lake Sector V, Kolkata'
    WHEN '6ba7b810-9dad-11d1-80b4-00c04fd430c8' THEN 'Near ISKCON Temple, Sector V, Kolkata'
    WHEN '6ba7b811-9dad-11d1-80b4-00c04fd430c8' THEN 'TCS Campus, Action Area III, Sector V'
    WHEN '6ba7b812-9dad-11d1-80b4-00c04fd430c8' THEN 'Central Park, Action Area I, Sector V'
    WHEN '6ba7b813-9dad-11d1-80b4-00c04fd430c8' THEN 'Webel Bhawan Area, Salt Lake Sector V'
  END,
  citizen_name = CASE id
    WHEN 'f47ac10b-58cc-4372-a567-0e02b2c3d479' THEN 'Arjun Mukherjee'
    WHEN '6ba7b810-9dad-11d1-80b4-00c04fd430c8' THEN 'Sita Devi'
    WHEN '6ba7b811-9dad-11d1-80b4-00c04fd430c8' THEN 'Rajesh Agarwal'
    WHEN '6ba7b812-9dad-11d1-80b4-00c04fd430c8' THEN 'KMC Office Sector V'
    WHEN '6ba7b813-9dad-11d1-80b4-00c04fd430c8' THEN 'Mohan Sharma'
  END,
  citizen_phone = CASE id
    WHEN 'f47ac10b-58cc-4372-a567-0e02b2c3d479' THEN '+91-9830123456'
    WHEN '6ba7b810-9dad-11d1-80b4-00c04fd430c8' THEN '+91-9830123457'
    WHEN '6ba7b811-9dad-11d1-80b4-00c04fd430c8' THEN '+91-9830123458'
    WHEN '6ba7b812-9dad-11d1-80b4-00c04fd430c8' THEN '+91-9830123459'
    WHEN '6ba7b813-9dad-11d1-80b4-00c04fd430c8' THEN '+91-9830123460'
  END
WHERE id IN (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
  '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
  '6ba7b813-9dad-11d1-80b4-00c04fd430c8'
);

-- Step 6: Enable RLS and create policies (run only if needed)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Public tasks are viewable by everyone" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Workers can update assigned tasks" ON public.tasks;

-- Create new policies
CREATE POLICY "Public tasks are viewable by everyone" ON public.tasks
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own tasks" ON public.tasks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Workers can update assigned tasks" ON public.tasks
  FOR UPDATE USING (true);

-- Step 7: Grant permissions
GRANT ALL ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO anon;

-- Step 8: Verification query (run this to check if data was inserted)
SELECT id, title, status, latitude, longitude FROM public.tasks 
WHERE id IN (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
  '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
  '6ba7b813-9dad-11d1-80b4-00c04fd430c8'
);