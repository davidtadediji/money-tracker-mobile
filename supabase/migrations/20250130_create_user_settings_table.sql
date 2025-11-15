-- Create user_settings table
-- This migration creates the user_settings table for storing user preferences and configurations

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_settings table
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Account Settings
  display_name TEXT,
  email_notifications BOOLEAN DEFAULT true,
  
  -- Notification Preferences
  push_notifications BOOLEAN DEFAULT true,
  transaction_reminders BOOLEAN DEFAULT true,
  budget_alerts BOOLEAN DEFAULT true,
  recurring_reminders BOOLEAN DEFAULT true,
  reminder_time TEXT DEFAULT '09:00', -- HH:MM format
  
  -- Currency Settings
  currency_code TEXT DEFAULT 'KES',
  currency_symbol TEXT DEFAULT 'KES',
  decimal_places INTEGER DEFAULT 2,
  
  -- Theme Customization
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  accent_color TEXT DEFAULT '#F5569B',
  
  -- Data Backup/Sync
  auto_backup BOOLEAN DEFAULT false,
  backup_frequency TEXT DEFAULT 'weekly' CHECK (backup_frequency IN ('daily', 'weekly', 'monthly')),
  last_backup_date TIMESTAMP WITH TIME ZONE,
  
  -- App Preferences
  default_view TEXT DEFAULT 'dashboard' CHECK (default_view IN ('dashboard', 'transactions', 'budget', 'analytics', 'balance', 'settings')),
  default_transaction_type TEXT DEFAULT 'expense' CHECK (default_transaction_type IN ('income', 'expense')),
  
  -- Privacy & Security
  biometric_enabled BOOLEAN DEFAULT false,
  passcode_enabled BOOLEAN DEFAULT false,
  
  -- Display Settings
  show_balance BOOLEAN DEFAULT true,
  compact_view BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own settings
CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to insert their own settings
CREATE POLICY "Users can insert their own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own settings
CREATE POLICY "Users can update their own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policy for users to delete their own settings
CREATE POLICY "Users can delete their own settings" ON user_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_user_settings_user_id ON user_settings (user_id);

-- Add a trigger to update the updated_at column automatically
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_settings_updated_at_trigger
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_settings_updated_at();

-- Add comments for documentation
COMMENT ON TABLE user_settings IS 'Stores user preferences and application settings';
COMMENT ON COLUMN user_settings.id IS 'Unique identifier for the settings record';
COMMENT ON COLUMN user_settings.user_id IS 'Reference to the user (one-to-one relationship)';
COMMENT ON COLUMN user_settings.display_name IS 'User display name';
COMMENT ON COLUMN user_settings.currency_code IS 'ISO currency code (e.g., KES, USD, EUR)';
COMMENT ON COLUMN user_settings.theme IS 'App theme preference (light, dark, or auto)';
COMMENT ON COLUMN user_settings.auto_backup IS 'Whether automatic backups are enabled';
COMMENT ON COLUMN user_settings.biometric_enabled IS 'Whether biometric authentication is enabled';
COMMENT ON COLUMN user_settings.created_at IS 'Timestamp when settings were created';
COMMENT ON COLUMN user_settings.updated_at IS 'Timestamp when settings were last updated';

