-- CVSamadhan Database Setup with Kolkata Demo Data (Matching Dashboard Mock Data)
-- Execute this in your Supabase SQL Editor to set up the complete database

-- First, let's ensure the tasks table exists with proper structure
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Task details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'Street Lighting', 'Water Supply', 'Sanitation', 'Drainage', 
    'Waste Management', 'Road Maintenance', 'Electrical', 'Other'
  )),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'assigned', 'in_progress', 'completed', 'verified'
  )),
  
  -- Location
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT NOT NULL,
  
  -- People involved
  citizen_id uuid REFERENCES profiles(id),
  citizen_name TEXT NOT NULL,
  citizen_phone TEXT,
  assigned_worker_id uuid REFERENCES profiles(id),
  
  -- Timeline
  assigned_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Completion data
  completion_photo TEXT,
  completion_notes TEXT,
  
  -- Additional metadata
  urgency_score INTEGER DEFAULT 1 CHECK (urgency_score BETWEEN 1 AND 10),
  estimated_duration INTEGER, -- in minutes
  actual_duration INTEGER -- in minutes
);

-- Clear existing data and insert demo tasks with exact UUIDs from dashboard
-- Safe approach: Use UPSERT instead of TRUNCATE to avoid foreign key issues
-- TRUNCATE TABLE public.tasks CASCADE;

-- Alternative safer approach - Delete specific demo tasks if they exist
DELETE FROM public.tasks WHERE id IN (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
  '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
  '6ba7b813-9dad-11d1-80b4-00c04fd430c8',
  '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
  '6ba7b815-9dad-11d1-80b4-00c04fd430c8',
  '6ba7b816-9dad-11d1-80b4-00c04fd430c8'
);

-- Insert Kolkata demo tasks with UUIDs matching the dashboard mock data
-- Using UPSERT to safely handle existing data
INSERT INTO public.tasks (
  id, title, description, category, priority, status, latitude, longitude, address,
  citizen_name, citizen_phone, assigned_at, created_at
) VALUES 
(
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'Fix Street Light near DLF IT Park',
  'Street light pole #45 on Action Area II is not working. IT employees facing difficulty during late night return.',
  'Street Lighting',
  'high',
  'pending',
  22.5760,
  88.4348,
  'Action Area II, Salt Lake Sector V, Kolkata',
  'Arjun Mukherjee',
  '+91-9830123456',
  NOW(),
  NOW()
),
(
  '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  'Water Pipeline Leakage near ISKCON',
  'Major water leakage near ISKCON Temple causing waterlogging. Devotees and residents facing issues.',
  'Water Supply',
  'urgent',
  'pending',
  22.5720,
  88.4370,
  'Near ISKCON Temple, Sector V, Kolkata',
  'Sita Devi',
  '+91-9830123457',
  NOW(),
  NOW()
),
(
  '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
  'Garbage Collection Issue at TCS Campus',
  'Garbage has not been collected for 3 days near TCS office complex. Bad smell affecting office environment.',
  'Waste Management',
  'medium',
  'pending',
  22.5695,
  88.4280,
  'TCS Campus, Action Area III, Sector V',
  'Rajesh Agarwal',
  '+91-9830123458',
  NOW(),
  NOW()
),
(
  '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
  'Central Park Maintenance',
  'Regular maintenance and cleaning of the Central Park area near City Centre Mall.',
  'Sanitation',
  'low',
  'in_progress',
  22.5785,
  88.4320,
  'Central Park, Action Area I, Sector V',
  'KMC Office Sector V',
  '+91-9830123459',
  NOW(),
  NOW()
),
(
  '6ba7b813-9dad-11d1-80b4-00c04fd430c8',
  'Drainage Cleaning near Webel Bhawan',
  'Blocked drainage causing waterlogging during monsoon. Needs immediate attention.',
  'Drainage',
  'high',
  'completed',
  22.5745,
  88.4365,
  'Webel Bhawan Area, Salt Lake Sector V',
  'Mohan Sharma',
  '+91-9830123460',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
),
(
  '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
  'Road Repair near City Centre',
  'Potholes on the main road causing traffic issues and vehicle damage.',
  'Road Maintenance',
  'medium',
  'assigned',
  22.5780,
  88.4325,
  'Main Road near City Centre Mall, Sector V',
  'Kamal Das',
  '+91-9830123461',
  NOW(),
  NOW()
),
(
  '6ba7b815-9dad-11d1-80b4-00c04fd430c8',
  'Electrical Work at Bus Stand',
  'Electrical wiring issues at Sector V bus stand. Street lights not working.',
  'Electrical',
  'high',
  'pending',
  22.5730,
  88.4350,
  'Sector V Bus Stand, Kolkata',
  'Rita Sen',
  '+91-9830123462',
  NOW(),
  NOW()
),
(
  '6ba7b816-9dad-11d1-80b4-00c04fd430c8',
  'Park Cleaning at Eco Park',
  'Regular maintenance and waste collection at Eco Park near New Town.',
  'Sanitation',
  'low',
  'pending',
  22.5850,
  88.4450,
  'Eco Park, New Town, Kolkata',
  'Green Kolkata Initiative',
  '+91-9830123463',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  priority = EXCLUDED.priority,
  status = EXCLUDED.status,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  address = EXCLUDED.address,
  citizen_name = EXCLUDED.citizen_name,
  citizen_phone = EXCLUDED.citizen_phone,
  updated_at = NOW();

-- Enable RLS (Row Level Security) for the tasks table
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for tasks table
CREATE POLICY "Public tasks are viewable by everyone" ON public.tasks
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = citizen_id);

CREATE POLICY "Workers can update assigned tasks" ON public.tasks
  FOR UPDATE USING (auth.uid() = assigned_worker_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_location ON public.tasks(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_worker ON public.tasks(assigned_worker_id);
CREATE INDEX IF NOT EXISTS idx_tasks_citizen ON public.tasks(citizen_id);

-- Function to calculate distance between two points (for nearby task searches)
CREATE OR REPLACE FUNCTION calculate_distance(lat1 DECIMAL, lon1 DECIMAL, lat2 DECIMAL, lon2 DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
  RETURN (
    6371 * acos(
      cos(radians(lat1)) * cos(radians(lat2)) * cos(radians(lon2) - radians(lon1)) +
      sin(radians(lat1)) * sin(radians(lat2))
    )
  );
END;
$$ LANGUAGE plpgsql;

-- View for tasks with calculated distances (for dashboard use)
CREATE OR REPLACE VIEW public.tasks_with_distance AS
SELECT 
  t.*,
  calculate_distance(22.5598, 88.4148, t.latitude, t.longitude) as distance_km
FROM public.tasks t;

-- Grant permissions
GRANT ALL ON public.tasks TO authenticated;
GRANT ALL ON public.tasks_with_distance TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_distance TO authenticated;