-- Fix RLS Policies for Skills Table
-- Run this in Supabase SQL Editor

-- 1. Enable RLS on skills table (if not already enabled)
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own skills" ON skills;
DROP POLICY IF EXISTS "Users can insert own skills" ON skills;
DROP POLICY IF EXISTS "Users can update own skills" ON skills;
DROP POLICY IF EXISTS "Users can delete own skills" ON skills;

-- 3. Create comprehensive RLS policies

-- Allow users to SELECT their own skills
CREATE POLICY "Users can view own skills" ON skills
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to INSERT new skills (THIS WAS MISSING!)
CREATE POLICY "Users can insert own skills" ON skills
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to UPDATE their own skills
CREATE POLICY "Users can update own skills" ON skills
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Allow users to DELETE their own skills
CREATE POLICY "Users can delete own skills" ON skills
    FOR DELETE USING (auth.uid() = user_id);

-- 4. Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'skills';