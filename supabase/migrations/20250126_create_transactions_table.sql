-- Create transactions table
-- This table stores all financial transactions (expenses and income)

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    date DATE NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_user_category_date ON public.transactions(user_id, category, date);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for transactions table
-- Users can only see their own transactions
CREATE POLICY "Users can view their own transactions"
    ON public.transactions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own transactions
CREATE POLICY "Users can insert their own transactions"
    ON public.transactions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own transactions
CREATE POLICY "Users can update their own transactions"
    ON public.transactions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own transactions
CREATE POLICY "Users can delete their own transactions"
    ON public.transactions
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
CREATE TRIGGER set_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_transactions_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.transactions IS 'Stores all financial transactions (expenses and income) for users';
COMMENT ON COLUMN public.transactions.id IS 'Unique identifier for the transaction';
COMMENT ON COLUMN public.transactions.user_id IS 'Reference to the user who owns this transaction';
COMMENT ON COLUMN public.transactions.category IS 'Category of the transaction (e.g., Groceries, Dining, Entertainment)';
COMMENT ON COLUMN public.transactions.amount IS 'Transaction amount (always positive, type determines if expense or income)';
COMMENT ON COLUMN public.transactions.date IS 'Date when the transaction occurred';
COMMENT ON COLUMN public.transactions.description IS 'Optional description or note about the transaction';
COMMENT ON COLUMN public.transactions.type IS 'Type of transaction: expense or income';
COMMENT ON COLUMN public.transactions.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN public.transactions.updated_at IS 'Timestamp when the record was last updated';

