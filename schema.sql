-- Run this in your Supabase project: Dashboard → SQL Editor → New Query

-- 1. Create the threads table
CREATE TABLE threads (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  folder_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (users can only see their own threads)
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own threads"
  ON threads FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Index for faster queries per user
CREATE INDEX threads_user_id_idx ON threads(user_id);
