-- ============================================
-- WatchLog Phase 1: Friends System Migration
-- ============================================
-- Run this in Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Paste & Run

-- ============================================
-- Step 1: Update Profiles Table
-- ============================================

-- Add display_name and avatar_url to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Make username unique (for friend search)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'profiles_username_key'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
    END IF;
END $$;

-- Index for faster username search
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Update policy to allow searching for users
DROP POLICY IF EXISTS "Users can search profiles" ON profiles;
CREATE POLICY "Users can search profiles" ON profiles
  FOR SELECT USING (true);  -- Allow all authenticated users to search

-- ============================================
-- Step 2: Create Friends Table
-- ============================================

CREATE TABLE IF NOT EXISTS friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Enable RLS
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- Policies for friends table
DROP POLICY IF EXISTS "Users can view own friendships" ON friends;
CREATE POLICY "Users can view own friendships" ON friends
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

DROP POLICY IF EXISTS "Users can send friend requests" ON friends;
CREATE POLICY "Users can send friend requests" ON friends
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can respond to friend requests" ON friends;
CREATE POLICY "Users can respond to friend requests" ON friends
  FOR UPDATE USING (auth.uid() = friend_id OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove friendships" ON friends;
CREATE POLICY "Users can remove friendships" ON friends
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);

-- ============================================
-- Step 3: Update Entries Policy for Friends
-- ============================================

-- Drop existing select policy and create new one that includes friends
DROP POLICY IF EXISTS "Users can view own entries" ON entries;
DROP POLICY IF EXISTS "Users and friends can view entries" ON entries;

CREATE POLICY "Users and friends can view entries" ON entries
  FOR SELECT USING (
    auth.uid() = user_id  -- Owner can see their own
    OR EXISTS (
      SELECT 1 FROM friends 
      WHERE status = 'accepted' 
      AND (
        (friends.user_id = auth.uid() AND friends.friend_id = entries.user_id)
        OR (friends.friend_id = auth.uid() AND friends.user_id = entries.user_id)
      )
    )
  );

-- ============================================
-- Step 4: Helper Function to Get User by Email
-- ============================================

-- Function to search users by username or email
CREATE OR REPLACE FUNCTION search_users(search_query TEXT)
RETURNS TABLE (
  id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.display_name,
    p.avatar_url
  FROM profiles p
  JOIN auth.users u ON p.id = u.id
  WHERE 
    p.username ILIKE '%' || search_query || '%'
    OR u.email ILIKE '%' || search_query || '%'
    OR p.display_name ILIKE '%' || search_query || '%'
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- DONE! Verify by running:
-- ============================================
-- SELECT * FROM profiles LIMIT 5;
-- SELECT * FROM friends LIMIT 5;
