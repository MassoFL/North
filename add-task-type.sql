-- Add "task" type to the skills table constraint
-- Run this in Supabase SQL Editor

-- Drop the existing constraint
ALTER TABLE skills DROP CONSTRAINT IF EXISTS skills_type_check;

-- Add the new constraint with "task" type
ALTER TABLE skills ADD CONSTRAINT skills_type_check 
CHECK (type IN ('continuous', 'task', 'project', 'target'));