-- Create budgets table
-- This migration creates the budgets table for tracking user budgets by category and period

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create budgets table
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- Category name (e.g., "Groceries", "Transportation", "Entertainment")
  limit_amount NUMERIC NOT NULL CHECK (limit_amount > 0), -- Budget limit amount
  period TEXT NOT NULL CHECK (period IN ('weekly', 'monthly', 'yearly')), -- Budget period
  start_date DATE NOT NULL DEFAULT CURRENT_DATE, -- Budget start date
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  -- Ensure unique budget per user, category, and period combination
  UNIQUE(user_id, category, period)
);

-- Enable Row Level Security
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own budgets
CREATE POLICY "Users can view their own budgets" ON budgets
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to create their own budgets
CREATE POLICY "Users can create their own budgets" ON budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own budgets
CREATE POLICY "Users can update their own budgets" ON budgets
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policy for users to delete their own budgets
CREATE POLICY "Users can delete their own budgets" ON budgets
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_budgets_user_id ON budgets (user_id);
CREATE INDEX idx_budgets_category ON budgets (category);
CREATE INDEX idx_budgets_period ON budgets (period);
CREATE INDEX idx_budgets_start_date ON budgets (start_date);
CREATE INDEX idx_budgets_user_category_period ON budgets (user_id, category, period);

-- Add a trigger to update the updated_at column automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE budgets IS 'Stores user budgets organized by category and period';
COMMENT ON COLUMN budgets.id IS 'Unique identifier for the budget';
COMMENT ON COLUMN budgets.user_id IS 'Reference to the user who owns this budget';
COMMENT ON COLUMN budgets.category IS 'Category name (e.g., Groceries, Transportation, Entertainment)';
COMMENT ON COLUMN budgets.limit_amount IS 'Budget limit amount in the default currency';
COMMENT ON COLUMN budgets.period IS 'Budget period (weekly, monthly, or yearly)';
COMMENT ON COLUMN budgets.start_date IS 'Budget start date';
COMMENT ON COLUMN budgets.created_at IS 'Timestamp when the budget was created';
COMMENT ON COLUMN budgets.updated_at IS 'Timestamp when the budget was last updated';

