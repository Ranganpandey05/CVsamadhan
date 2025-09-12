-- EMERGENCY WORKER APPROVAL FIX
-- Run this FIRST if you're having approval issues

-- 1. Ensure approval_status column exists with proper constraints
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'approved';

-- 2. Add constraint if it doesn't exist (ignore error if it already exists)
DO $$
BEGIN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_approval_status_check 
    CHECK (approval_status IN ('pending', 'approved', 'rejected'));
EXCEPTION WHEN duplicate_object THEN
    -- Constraint already exists, ignore
    NULL;
END $$;

-- 3. FORCE approve ALL existing workers
UPDATE public.profiles 
SET approval_status = 'approved', updated_at = NOW()
WHERE role = 'worker';

-- 4. Verify all workers are now approved
SELECT 
  COUNT(*) as total_workers,
  COUNT(CASE WHEN approval_status = 'approved' THEN 1 END) as approved_workers,
  COUNT(CASE WHEN approval_status = 'pending' THEN 1 END) as pending_workers,
  COUNT(CASE WHEN approval_status = 'rejected' THEN 1 END) as rejected_workers
FROM public.profiles 
WHERE role = 'worker';

-- 5. Show specific worker details for verification
SELECT 
  id,
  full_name,
  email,
  role,
  approval_status,
  updated_at
FROM public.profiles 
WHERE role = 'worker'
ORDER BY updated_at DESC;

-- 6. If you still have issues, run this to clear any cached profile data
-- This will force refresh the profile from database
UPDATE public.profiles 
SET updated_at = NOW()
WHERE role = 'worker';