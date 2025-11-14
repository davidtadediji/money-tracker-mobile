-- Create recurring_transactions table
-- This migration creates the recurring_transactions table for managing repeating income and expenses

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create recurring_transactions table
CREATE TABLE recurring_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  description TEXT,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE, -- NULL means recurring indefinitely
  next_occurrence_date DATE NOT NULL, -- Next date when transaction should be created
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_processed_date DATE, -- Last date when a transaction was automatically created
  notification_enabled BOOLEAN NOT NULL DEFAULT true,
  notification_days_before INTEGER DEFAULT 1, -- Days before occurrence to send reminder
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own recurring transactions
CREATE POLICY "Users can view their own recurring transactions" ON recurring_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to create their own recurring transactions
CREATE POLICY "Users can create their own recurring transactions" ON recurring_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own recurring transactions
CREATE POLICY "Users can update their own recurring transactions" ON recurring_transactions
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policy for users to delete their own recurring transactions
CREATE POLICY "Users can delete their own recurring transactions" ON recurring_transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_recurring_transactions_user_id ON recurring_transactions (user_id);
CREATE INDEX idx_recurring_transactions_type ON recurring_transactions (type);
CREATE INDEX idx_recurring_transactions_category ON recurring_transactions (category);
CREATE INDEX idx_recurring_transactions_frequency ON recurring_transactions (frequency);
CREATE INDEX idx_recurring_transactions_is_active ON recurring_transactions (is_active);
CREATE INDEX idx_recurring_transactions_next_occurrence ON recurring_transactions (next_occurrence_date);
CREATE INDEX idx_recurring_transactions_active_next ON recurring_transactions (is_active, next_occurrence_date) WHERE is_active = true;

-- Add a trigger to update the updated_at column automatically
CREATE OR REPLACE FUNCTION update_recurring_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_recurring_transactions_updated_at_trigger
  BEFORE UPDATE ON recurring_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_recurring_transactions_updated_at();

-- Add comments for documentation
COMMENT ON TABLE recurring_transactions IS 'Stores recurring transactions that automatically create transactions on schedule';
COMMENT ON COLUMN recurring_transactions.id IS 'Unique identifier for the recurring transaction';
COMMENT ON COLUMN recurring_transactions.user_id IS 'Reference to the user who owns this recurring transaction';
COMMENT ON COLUMN recurring_transactions.type IS 'Transaction type (income or expense)';
COMMENT ON COLUMN recurring_transactions.category IS 'Transaction category';
COMMENT ON COLUMN recurring_transactions.amount IS 'Transaction amount';
COMMENT ON COLUMN recurring_transactions.description IS 'Optional description';
COMMENT ON COLUMN recurring_transactions.frequency IS 'How often the transaction repeats (daily, weekly, biweekly, monthly, quarterly, yearly)';
COMMENT ON COLUMN recurring_transactions.start_date IS 'Date when recurring transactions start';
COMMENT ON COLUMN recurring_transactions.end_date IS 'Date when recurring transactions end (NULL for indefinite)';
COMMENT ON COLUMN recurring_transactions.next_occurrence_date IS 'Next date when transaction should be created';
COMMENT ON COLUMN recurring_transactions.is_active IS 'Whether the recurring transaction is currently active';
COMMENT ON COLUMN recurring_transactions.last_processed_date IS 'Last date when a transaction was automatically created';
COMMENT ON COLUMN recurring_transactions.notification_enabled IS 'Whether to send reminders before occurrence';
COMMENT ON COLUMN recurring_transactions.notification_days_before IS 'Days before occurrence to send reminder';
COMMENT ON COLUMN recurring_transactions.created_at IS 'Timestamp when created';
COMMENT ON COLUMN recurring_transactions.updated_at IS 'Timestamp when last updated';

