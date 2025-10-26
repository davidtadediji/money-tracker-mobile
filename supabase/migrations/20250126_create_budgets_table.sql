-- Create budgets table
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    limit_amount DECIMAL(12, 2) NOT NULL CHECK (limit_amount >= 0),
    period TEXT NOT NULL CHECK (period IN ('weekly', 'monthly', 'yearly')),
    start_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_period ON public.budgets(period);
CREATE INDEX IF NOT EXISTS idx_budgets_user_period ON public.budgets(user_id, period);
CREATE INDEX IF NOT EXISTS idx_budgets_start_date ON public.budgets(start_date);

-- Enable Row Level Security (RLS)
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can insert their own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can update their own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can delete their own budgets" ON public.budgets;

-- RLS Policies: Users can only read/write their own budgets
-- Policy for SELECT (read)
CREATE POLICY "Users can view their own budgets"
    ON public.budgets
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy for INSERT (create)
CREATE POLICY "Users can insert their own budgets"
    ON public.budgets
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy for UPDATE (modify)
CREATE POLICY "Users can update their own budgets"
    ON public.budgets
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy for DELETE (remove)
CREATE POLICY "Users can delete their own budgets"
    ON public.budgets
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function before any UPDATE
DROP TRIGGER IF EXISTS update_budgets_updated_at ON public.budgets;
CREATE TRIGGER update_budgets_updated_at
    BEFORE UPDATE ON public.budgets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE public.budgets IS 'Stores user budget limits for different expense categories';
COMMENT ON COLUMN public.budgets.id IS 'Unique identifier for the budget';
COMMENT ON COLUMN public.budgets.user_id IS 'Reference to the user who owns this budget';
COMMENT ON COLUMN public.budgets.category IS 'Expense category name (e.g., Groceries, Transport, Entertainment)';
COMMENT ON COLUMN public.budgets.limit_amount IS 'Maximum amount allowed for this budget period';
COMMENT ON COLUMN public.budgets.period IS 'Time period for the budget: weekly, monthly, or yearly';
COMMENT ON COLUMN public.budgets.start_date IS 'Date when this budget period starts';
COMMENT ON COLUMN public.budgets.created_at IS 'Timestamp when the budget was created';
COMMENT ON COLUMN public.budgets.updated_at IS 'Timestamp when the budget was last updated';

