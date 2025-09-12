-- Test and Fix Existing Worker Profiles
-- Run this in Supabase SQL Editor to check and fix worker approval statuses

-- STEP 1: Check if approval_status column exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'approval_status';

-- STEP 2: Add approval_status column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- STEP 3: Check current worker profiles and their approval status
SELECT 
  id,
  full_name,
  email,
  role,
  approval_status,
  created_at
FROM profiles 
WHERE role = 'worker'
ORDER BY created_at DESC;

-- STEP 4: FORCE UPDATE all existing workers to 'approved' status
UPDATE profiles 
SET approval_status = 'approved', updated_at = NOW()
WHERE role = 'worker';

-- STEP 5: Verify the update worked
SELECT 
  id,
  full_name,
  email,
  role,
  approval_status,
  updated_at
FROM profiles 
WHERE role = 'worker'
ORDER BY created_at DESC;

-- STEP 6: Check if there are any constraints or triggers preventing the update
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass;

-- STEP 7: For debugging - show the exact profile data for your user
-- Replace 'your-email@example.com' with your actual email
SELECT 
  p.*,
  au.email as auth_email,
  au.raw_user_meta_data
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE au.email = 'your-email@example.com' OR p.email = 'your-email@example.com';

-- STEP 8: Check worker_applications table (if you want to test the new signup flow)
SELECT 
  id,
  full_name,
  email,
  department,
  speciality,
  status,
  application_date
FROM worker_applications 
ORDER BY application_date DESC
LIMIT 5;

-- STEP 9: Emergency fix - if the above doesn't work, run this to force approval
-- This will update ALL worker profiles to approved status
DO $$
BEGIN
  UPDATE profiles 
  SET approval_status = 'approved', updated_at = NOW()
  WHERE role = 'worker';
  
  RAISE NOTICE 'Updated % worker profiles to approved status', (SELECT COUNT(*) FROM profiles WHERE role = 'worker');
END $$;