-- ============================================
-- SMART ENTRIES TABLE
-- ============================================
-- This table stores smart entry processing history and results

CREATE TABLE IF NOT EXISTS public.smart_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entry_type TEXT NOT NULL CHECK (entry_type IN ('receipt_scan', 'voice_entry', 'bulk_import', 'screenshot')),
    status TEXT NOT NULL CHECK (status IN ('processing', 'completed', 'failed', 'pending_review')) DEFAULT 'processing',
    original_data JSONB,
    processed_data JSONB,
    extracted_transactions JSONB,
    error_message TEXT,
    confidence_score DECIMAL(3,2),
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_smart_entries_user_id ON public.smart_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_smart_entries_entry_type ON public.smart_entries(entry_type);
CREATE INDEX IF NOT EXISTS idx_smart_entries_status ON public.smart_entries(status);
CREATE INDEX IF NOT EXISTS idx_smart_entries_created_at ON public.smart_entries(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.smart_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own smart entries
CREATE POLICY "Users can view their own smart entries"
    ON public.smart_entries
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own smart entries
CREATE POLICY "Users can insert their own smart entries"
    ON public.smart_entries
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own smart entries
CREATE POLICY "Users can update their own smart entries"
    ON public.smart_entries
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own smart entries
CREATE POLICY "Users can delete their own smart entries"
    ON public.smart_entries
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_smart_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_smart_entries_updated_at
    BEFORE UPDATE ON public.smart_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.update_smart_entries_updated_at();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.smart_entries IS 'Stores smart entry processing history and results';
COMMENT ON COLUMN public.smart_entries.id IS 'Unique identifier for the smart entry';
COMMENT ON COLUMN public.smart_entries.user_id IS 'Foreign key to auth.users';
COMMENT ON COLUMN public.smart_entries.entry_type IS 'Type of smart entry: receipt_scan, voice_entry, bulk_import, or screenshot';
COMMENT ON COLUMN public.smart_entries.status IS 'Processing status: processing, completed, failed, or pending_review';
COMMENT ON COLUMN public.smart_entries.original_data IS 'Original input data (image URL, audio URL, CSV data, etc.)';
COMMENT ON COLUMN public.smart_entries.processed_data IS 'Processed/parsed data from the entry';
COMMENT ON COLUMN public.smart_entries.extracted_transactions IS 'Array of extracted transactions ready to be saved';
COMMENT ON COLUMN public.smart_entries.error_message IS 'Error message if processing failed';
COMMENT ON COLUMN public.smart_entries.confidence_score IS 'AI confidence score (0.00 to 1.00)';
COMMENT ON COLUMN public.smart_entries.processing_time_ms IS 'Time taken to process in milliseconds';
COMMENT ON COLUMN public.smart_entries.created_at IS 'Timestamp when entry was created';
COMMENT ON COLUMN public.smart_entries.updated_at IS 'Timestamp when entry was last updated';
COMMENT ON COLUMN public.smart_entries.processed_at IS 'Timestamp when processing completed';

