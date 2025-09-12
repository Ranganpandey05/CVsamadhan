-- CVSamadhan Database Schema with Kolkata Sample Data
-- Execute this in your Supabase SQL Editor to set up the complete database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles table (already exists, but ensure it has correct structure)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Common fields
  full_name TEXT,
  username TEXT UNIQUE,
  phone_number TEXT,
  role TEXT CHECK (role IN ('citizen', 'worker', 'admin')) DEFAULT 'citizen',
  
  -- Worker specific fields
  department TEXT,
  speciality TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'suspended')) DEFAULT 'pending',
  id_card_url TEXT,
  
  -- Location for workers
  current_latitude DECIMAL(10, 8),
  current_longitude DECIMAL(11, 8),
  
  -- Metadata
  avatar_url TEXT,
  device_info JSONB
);

-- 2. Tasks table (compatible with mobile app)
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
  citizen_phone TEXT NOT NULL,
  assigned_worker_id uuid REFERENCES profiles(id),
  
  -- Timeline
  assigned_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Completion data
  completion_photo TEXT,
  completion_notes TEXT,
  
  -- Metadata
  estimated_hours INTEGER,
  actual_hours INTEGER,
  photos TEXT[],
  device_info JSONB
);

-- 3. Citizens table (for additional citizen data)
CREATE TABLE IF NOT EXISTS public.citizens (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Additional citizen fields
  address TEXT,
  area TEXT,
  preferred_language TEXT DEFAULT 'en',
  notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}'
);

-- 4. Task history for tracking changes
CREATE TABLE IF NOT EXISTS public.task_history (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  changed_by uuid REFERENCES profiles(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  old_status TEXT,
  new_status TEXT,
  notes TEXT
);

-- 5. Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE citizens ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_history ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Tasks policies
CREATE POLICY "Workers can view assigned tasks" ON tasks
  FOR SELECT USING (
    auth.uid() = assigned_worker_id 
    OR auth.uid() = citizen_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Workers can update assigned tasks" ON tasks
  FOR UPDATE USING (auth.uid() = assigned_worker_id);

CREATE POLICY "Citizens can create tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = citizen_id);

-- 6. Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Insert sample data for Kolkata Sector V area
INSERT INTO tasks (id, title, description, category, priority, status, latitude, longitude, address, citizen_name, citizen_phone, created_at) VALUES 
-- Task 1: Street Light near DLF IT Park
('1', 'Fix Street Light near DLF IT Park', 'Street light pole #45 on Action Area II is not working. IT employees facing difficulty during late night return.', 'Street Lighting', 'high', 'pending', 22.5760, 88.4348, 'Action Area II, Salt Lake Sector V, Kolkata', 'Arjun Mukherjee', '+91 9876543210', NOW()),

-- Task 2: Water leakage near ISKCON
('2', 'Water Pipeline Leakage near ISKCON', 'Major water leakage near ISKCON Temple causing waterlogging. Devotees and residents facing issues.', 'Water Supply', 'urgent', 'pending', 22.5720, 88.4370, 'Near ISKCON Temple, Sector V, Kolkata', 'Sita Devi', '+91 9876543211', NOW()),

-- Task 3: Garbage at TCS Campus
('3', 'Garbage Collection Issue at TCS Campus', 'Garbage has not been collected for 3 days near TCS office complex. Bad smell affecting office environment.', 'Waste Management', 'medium', 'pending', 22.5695, 88.4280, 'TCS Campus, Action Area III, Sector V', 'Rajesh Agarwal', '+91 9876543212', NOW()),

-- Task 4: Central Park Maintenance
('4', 'Central Park Maintenance', 'Regular maintenance and cleaning of the Central Park area near City Centre Mall.', 'Sanitation', 'low', 'in_progress', 22.5785, 88.4320, 'Central Park, Action Area I, Sector V', 'KMC Office Sector V', '+91 9876543213', NOW()),

-- Task 5: Drainage near Webel Bhawan
('5', 'Drainage Cleaning near Webel Bhawan', 'Blocked drainage causing waterlogging during monsoon. Needs immediate attention.', 'Drainage', 'high', 'completed', 22.5740, 88.4310, 'Webel Bhawan, Sector V, Kolkata', 'Deepak Chatterjee', '+91 9876543214', NOW() - INTERVAL '1 day'),

-- Additional Kolkata tasks
-- Task 6: Traffic Signal at Science City
('6', 'Traffic Signal Malfunction at Science City', 'Traffic light at Science City crossing is not working properly, causing traffic congestion during peak hours.', 'Electrical', 'high', 'pending', 22.5390, 88.3995, 'Science City Crossing, EM Bypass, Kolkata', 'Ravi Kumar', '+91 9876543215', NOW()),

-- Task 7: Pothole on VIP Road
('7', 'Large Pothole on VIP Road', 'Dangerous pothole near Kestopur causing accidents. Multiple complaints from commuters and cab drivers.', 'Road Maintenance', 'urgent', 'pending', 22.5950, 88.4450, 'VIP Road, Near Kestopur, Kolkata', 'Priya Sharma', '+91 9876543216', NOW()),

-- Task 8: Water logging at Dumdum
('8', 'Water Logging at Dumdum Station', 'Severe waterlogging during rain near Dumdum Metro Station. Commuters unable to access metro.', 'Drainage', 'urgent', 'pending', 22.6280, 88.4140, 'Dumdum Metro Station, Kolkata', 'Ankit Das', '+91 9876543217', NOW()),

-- Task 9: Park Cleaning at Rabindra Sarobar
('9', 'Lake Cleaning at Rabindra Sarobar', 'Regular cleaning and maintenance of Rabindra Sarobar lake area. Remove plastic waste and maintain gardens.', 'Sanitation', 'medium', 'pending', 22.5135, 88.3580, 'Rabindra Sarobar, Southern Avenue, Kolkata', 'Green Committee Kolkata', '+91 9876543218', NOW()),

-- Task 10: Street vendor cleanup at Gariahat
('10', 'Street Vendor Area Cleanup at Gariahat', 'Organize and clean street vendor area at Gariahat market. Improve hygiene and accessibility.', 'Sanitation', 'medium', 'pending', 22.5180, 88.3620, 'Gariahat Market, Ballygunge, Kolkata', 'Market Association', '+91 9876543219', NOW()),

-- Task 11: Bus stop repair at Shyambazar
('11', 'Bus Stop Shelter Repair at Shyambazar', 'Bus stop shelter damaged and needs repair. Commuters facing difficulty during rain.', 'Infrastructure', 'medium', 'pending', 22.6015, 88.3735, 'Shyambazar Bus Stop, Kolkata', 'Commuter Group', '+91 9876543220', NOW()),

-- Task 12: Kalighat temple area cleaning
('12', 'Kalighat Temple Area Sanitation', 'Clean and maintain sanitation facilities around Kalighat Temple. High footfall area needs regular maintenance.', 'Sanitation', 'high', 'pending', 22.5200, 88.3425, 'Kalighat Temple Area, Kolkata', 'Temple Committee', '+91 9876543221', NOW()),

-- Task 13: Victoria Memorial garden maintenance
('13', 'Victoria Memorial Garden Maintenance', 'Maintain gardens and pathways around Victoria Memorial. Tourist area requiring high standards.', 'Parks & Recreation', 'low', 'pending', 22.5448, 88.3426, 'Victoria Memorial, Maidan, Kolkata', 'Tourism Board', '+91 9876543222', NOW()),

-- Task 14: Howrah Bridge area cleaning
('14', 'Howrah Bridge Approach Road Cleaning', 'Clean and maintain approach roads to Howrah Bridge. Remove encroachments and improve traffic flow.', 'Road Maintenance', 'medium', 'pending', 22.5858, 88.3468, 'Howrah Bridge Approach, Kolkata', 'Traffic Police', '+91 9876543223', NOW()),

-- Task 15: College Street book market
('15', 'College Street Book Market Organization', 'Organize and improve infrastructure at College Street book market. Preserve heritage while improving facilities.', 'Infrastructure', 'low', 'pending', 22.5731, 88.3617, 'College Street, Kolkata', 'Book Sellers Association', '+91 9876543224', NOW());

-- 8. Create some sample worker profiles
INSERT INTO profiles (id, full_name, username, phone_number, role, department, speciality, status) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Ravi Electrician', 'ravi_electric', '+91 9876543301', 'worker', 'Electrical', 'Street Light Repair', 'approved'),
('550e8400-e29b-41d4-a716-446655440002', 'Suman Plumber', 'suman_water', '+91 9876543302', 'worker', 'Water Supply', 'Pipeline Repair', 'approved'),
('550e8400-e29b-41d4-a716-446655440003', 'Kiran Cleaner', 'kiran_sanitation', '+91 9876543303', 'worker', 'Sanitation', 'Waste Management', 'approved'),
('550e8400-e29b-41d4-a716-446655440004', 'Amit Engineer', 'amit_drainage', '+91 9876543304', 'worker', 'Public Works', 'Drainage System', 'approved'),
('550e8400-e29b-41d4-a716-446655440005', 'Priya Supervisor', 'priya_roads', '+91 9876543305', 'worker', 'Roads', 'Road Maintenance', 'approved');

-- Assign some tasks to workers
UPDATE tasks SET assigned_worker_id = '550e8400-e29b-41d4-a716-446655440001', assigned_at = NOW() WHERE id = '1';
UPDATE tasks SET assigned_worker_id = '550e8400-e29b-41d4-a716-446655440002', assigned_at = NOW() WHERE id = '2';
UPDATE tasks SET assigned_worker_id = '550e8400-e29b-41d4-a716-446655440003', assigned_at = NOW() WHERE id = '3';
UPDATE tasks SET assigned_worker_id = '550e8400-e29b-41d4-a716-446655440004', assigned_at = NOW() WHERE id = '5';
UPDATE tasks SET assigned_worker_id = '550e8400-e29b-41d4-a716-446655440005', assigned_at = NOW() WHERE id = '7';

-- 9. Create a view for worker dashboard
CREATE OR REPLACE VIEW worker_task_view AS
SELECT 
  t.*,
  p.full_name as worker_name,
  p.department,
  p.speciality
FROM tasks t
LEFT JOIN profiles p ON t.assigned_worker_id = p.id;

-- 10. Create function to get nearby tasks
CREATE OR REPLACE FUNCTION get_nearby_tasks(
  worker_lat DECIMAL(10, 8),
  worker_lng DECIMAL(11, 8),
  radius_km INTEGER DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  title TEXT,
  description TEXT,
  category TEXT,
  priority TEXT,
  status TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT,
  citizen_name TEXT,
  citizen_phone TEXT,
  distance_km DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.title,
    t.description,
    t.category,
    t.priority,
    t.status,
    t.latitude,
    t.longitude,
    t.address,
    t.citizen_name,
    t.citizen_phone,
    ROUND(
      CAST(
        6371 * acos(
          cos(radians(worker_lat)) 
          * cos(radians(t.latitude)) 
          * cos(radians(t.longitude) - radians(worker_lng)) 
          + sin(radians(worker_lat)) 
          * sin(radians(t.latitude))
        ) AS DECIMAL
      ), 2
    ) AS distance_km
  FROM tasks t
  WHERE 
    6371 * acos(
      cos(radians(worker_lat)) 
      * cos(radians(t.latitude)) 
      * cos(radians(t.longitude) - radians(worker_lng)) 
      + sin(radians(worker_lat)) 
      * sin(radians(t.latitude))
    ) <= radius_km
  ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Create Storage bucket for task completion photos
INSERT INTO storage.buckets (id, name, public) VALUES ('task-completions', 'task-completions', true);

-- Create storage policy for task completion photos
CREATE POLICY "Anyone can upload task completion photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'task-completions');

CREATE POLICY "Anyone can view task completion photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'task-completions');

-- Final verification queries
SELECT 'Database setup complete!' as status;
SELECT COUNT(*) as total_tasks FROM tasks;
SELECT COUNT(*) as total_workers FROM profiles WHERE role = 'worker';
SELECT category, COUNT(*) as count FROM tasks GROUP BY category ORDER BY count DESC;