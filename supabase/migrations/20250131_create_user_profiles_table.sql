-- Create user_profiles table
-- This migration creates the user_profiles table for storing additional user information

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Profile Information
  full_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  
  -- Contact Information
  phone_number TEXT,
  
  -- Onboarding Status
  onboarding_completed BOOLEAN DEFAULT false,
  profile_setup_completed BOOLEAN DEFAULT false,
  
  -- Account Status
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  
  -- Preferences (basic, more in user_settings)
  preferred_language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  
  -- Metadata
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own profile
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own profile
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policy for users to delete their own profile
CREATE POLICY "Users can delete their own profile" ON user_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles (user_id);
CREATE INDEX idx_user_profiles_display_name ON user_profiles (display_name);
CREATE INDEX idx_user_profiles_email_verified ON user_profiles (email_verified);

-- Add a trigger to update the updated_at column automatically
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at_trigger
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- Function to auto-create profile on user signup (trigger on auth.users)
-- This will be called automatically when a new user is created
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email_verified)
  VALUES (
    NEW.id,
    NEW.email_confirmed_at IS NOT NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile when user signs up
-- Note: This trigger is on auth.users which requires SECURITY DEFINER
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Add comments for documentation
COMMENT ON TABLE user_profiles IS 'Stores additional user profile information beyond auth data';
COMMENT ON COLUMN user_profiles.id IS 'Unique identifier for the profile record';
COMMENT ON COLUMN user_profiles.user_id IS 'Reference to the user (one-to-one relationship)';
COMMENT ON COLUMN user_profiles.full_name IS 'User full name';
COMMENT ON COLUMN user_profiles.display_name IS 'Display name shown in the app';
COMMENT ON COLUMN user_profiles.avatar_url IS 'URL to user avatar image';
COMMENT ON COLUMN user_profiles.onboarding_completed IS 'Whether user has completed onboarding flow';
COMMENT ON COLUMN user_profiles.profile_setup_completed IS 'Whether user has completed profile setup';
COMMENT ON COLUMN user_profiles.is_active IS 'Whether the user account is active';
COMMENT ON COLUMN user_profiles.email_verified IS 'Whether the user email is verified';
COMMENT ON COLUMN user_profiles.last_login_at IS 'Timestamp of last login';
COMMENT ON COLUMN user_profiles.created_at IS 'Timestamp when profile was created';
COMMENT ON COLUMN user_profiles.updated_at IS 'Timestamp when profile was last updated';

