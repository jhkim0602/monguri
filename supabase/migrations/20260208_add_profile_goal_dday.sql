-- Migration: Add goal, target_exam, target_date, grade fields to profiles table
-- Purpose: Enable mentees to set their learning goals and D-Day

-- Add new columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS goal TEXT,
ADD COLUMN IF NOT EXISTS target_exam TEXT,
ADD COLUMN IF NOT EXISTS target_date DATE,
ADD COLUMN IF NOT EXISTS grade TEXT;

-- Add comments for documentation
COMMENT ON COLUMN profiles.goal IS 'Learning goal (e.g., "서울대 경영학과")';
COMMENT ON COLUMN profiles.target_exam IS 'Target exam name (e.g., "2026 수능", "6월 모의고사")';
COMMENT ON COLUMN profiles.target_date IS 'D-Day target date';
COMMENT ON COLUMN profiles.grade IS 'Student grade (e.g., "고3", "N수")';

-- Create index for efficient D-Day queries (mentor dashboard)
CREATE INDEX IF NOT EXISTS idx_profiles_target_date ON profiles(target_date) WHERE target_date IS NOT NULL;
