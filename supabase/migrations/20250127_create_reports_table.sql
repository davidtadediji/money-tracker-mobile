-- ============================================
-- REPORTS TABLE
-- ============================================
-- This table stores custom reports created by users

CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    report_type TEXT NOT NULL CHECK (report_type IN ('income_expense', 'category', 'trend', 'budget', 'custom')),
    date_range JSONB NOT NULL,
    filters JSONB,
    grouping TEXT CHECK (grouping IN ('day', 'week', 'month', 'year', 'category')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_report_type ON public.reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own reports
CREATE POLICY "Users can view their own reports"
    ON public.reports
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own reports
CREATE POLICY "Users can insert their own reports"
    ON public.reports
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own reports
CREATE POLICY "Users can update their own reports"
    ON public.reports
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own reports
CREATE POLICY "Users can delete their own reports"
    ON public.reports
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON public.reports
    FOR EACH ROW
    EXECUTE FUNCTION public.update_reports_updated_at();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.reports IS 'Stores custom analytics reports created by users';
COMMENT ON COLUMN public.reports.id IS 'Unique identifier for the report';
COMMENT ON COLUMN public.reports.user_id IS 'Foreign key to auth.users';
COMMENT ON COLUMN public.reports.name IS 'Name of the report';
COMMENT ON COLUMN public.reports.description IS 'Optional description of the report';
COMMENT ON COLUMN public.reports.report_type IS 'Type of report: income_expense, category, trend, budget, or custom';
COMMENT ON COLUMN public.reports.date_range IS 'JSON object containing start and end dates';
COMMENT ON COLUMN public.reports.filters IS 'JSON object containing filter criteria';
COMMENT ON COLUMN public.reports.grouping IS 'How data should be grouped: day, week, month, year, or category';
COMMENT ON COLUMN public.reports.created_at IS 'Timestamp when report was created';
COMMENT ON COLUMN public.reports.updated_at IS 'Timestamp when report was last updated';

