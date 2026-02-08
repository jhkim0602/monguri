-- Add mentee_comment and mentor_reply columns to daily_records table
ALTER TABLE daily_records 
ADD COLUMN IF NOT EXISTS mentee_comment TEXT,
ADD COLUMN IF NOT EXISTS mentor_reply TEXT,
ADD COLUMN IF NOT EXISTS mentor_reply_at TIMESTAMPTZ;
