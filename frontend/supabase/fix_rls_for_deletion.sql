-- ============================================
-- FIX RLS POLICIES FOR AD SPACES DELETION
-- ============================================
-- This script creates RLS policies to allow deletion of ad spaces
-- Run this in your Supabase SQL Editor if deletion is failing

-- Option 1: Allow all authenticated users to delete (for admin dashboard)
-- This is useful if your admin dashboard uses authenticated users
CREATE POLICY IF NOT EXISTS "Allow authenticated users to delete ad spaces"
ON ad_spaces
FOR DELETE
TO authenticated
USING (true);

-- Option 2: Allow service role to delete (for API routes using service role key)
-- This is useful if your API uses the service role key
CREATE POLICY IF NOT EXISTS "Allow service role to delete ad spaces"
ON ad_spaces
FOR DELETE
TO service_role
USING (true);

-- Option 3: Allow anon role to delete (if your API uses anon key)
-- WARNING: This allows anyone to delete. Use with caution!
-- Only use this if you have other security measures in place
-- CREATE POLICY IF NOT EXISTS "Allow anon to delete ad spaces"
-- ON ad_spaces
-- FOR DELETE
-- TO anon
-- USING (true);

-- Option 4: Disable RLS temporarily for testing (NOT RECOMMENDED FOR PRODUCTION)
-- ALTER TABLE ad_spaces DISABLE ROW LEVEL SECURITY;

-- ============================================
-- VERIFY POLICIES
-- ============================================
-- Check existing policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'ad_spaces'
ORDER BY policyname;

-- Check if RLS is enabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'ad_spaces';

-- ============================================
-- NOTES
-- ============================================
-- 1. If you're using the service role key in your API, Option 2 is recommended
-- 2. If you're using authenticated users, Option 1 is recommended
-- 3. Option 3 should only be used if you have other security measures
-- 4. You can also create more restrictive policies based on user roles
-- 5. After creating policies, test deletion from your admin dashboard

