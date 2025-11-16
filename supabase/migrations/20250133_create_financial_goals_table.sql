-- Create financial_goals table
-- This migration creates the financial goals table for tracking savings goals and progress

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Financial Goals Table
-- =====================================================
CREATE TABLE financial_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Goal Information
  name TEXT NOT NULL,
  description TEXT,
  emoji TEXT, -- Optional emoji/icon identifier
  color TEXT DEFAULT '#EC4899', -- Default pink color
  
  -- Financial Details
  target_amount DECIMAL(12, 2) NOT NULL CHECK (target_amount > 0),
  current_amount DECIMAL(12, 2) DEFAULT 0 CHECK (current_amount >= 0),
  currency TEXT DEFAULT 'USD',
  
  -- Timeline
  start_date DATE DEFAULT CURRENT_DATE,
  target_date DATE,
  
  -- Goal Type and Category
  goal_type TEXT DEFAULT 'savings', -- 'savings', 'debt_payoff', 'investment', 'purchase', 'emergency_fund', 'other'
  category TEXT, -- 'home', 'car', 'vacation', 'education', 'retirement', 'emergency', 'other'
  
  -- Priority and Status
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status TEXT DEFAULT 'active', -- 'active', 'paused', 'completed', 'cancelled', 'failed'
  
  -- Progress Tracking
  progress_percentage DECIMAL(5, 2) GENERATED ALWAYS AS (
    CASE 
      WHEN target_amount > 0 THEN LEAST((current_amount / target_amount * 100), 100)
      ELSE 0 
    END
  ) STORED,
  
  -- Contribution Settings
  auto_contribute BOOLEAN DEFAULT false,
  contribution_amount DECIMAL(12, 2),
  contribution_frequency TEXT, -- 'daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'
  next_contribution_date DATE,
  
  -- Milestones (stored as JSONB array)
  milestones JSONB DEFAULT '[]', 
  -- Format: [{ "amount": 1000, "description": "25% milestone", "achieved": false, "achieved_date": null }]
  
  -- Linked Accounts (for automated tracking)
  linked_account_id UUID, -- Could reference an assets table
  linked_budget_id UUID, -- Could reference budgets table
  
  -- Motivation and Notes
  motivation TEXT, -- Why this goal is important
  notes TEXT,
  
  -- Completion Details
  completed_at TIMESTAMP WITH TIME ZONE,
  completion_notes TEXT,
  
  -- Metadata
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Goal Contributions Table (Transaction History)
-- =====================================================
CREATE TABLE goal_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES financial_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Contribution Details
  amount DECIMAL(12, 2) NOT NULL,
  contribution_type TEXT DEFAULT 'manual', -- 'manual', 'automatic', 'withdrawal', 'adjustment'
  
  -- Description and Notes
  description TEXT,
  notes TEXT,
  
  -- Linked Transaction
  linked_transaction_id UUID, -- Could reference transactions table
  
  -- Metadata
  contribution_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Goal Templates Table (Pre-defined goal suggestions)
-- =====================================================
CREATE TABLE goal_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Template Information
  name TEXT NOT NULL,
  description TEXT,
  emoji TEXT,
  color TEXT DEFAULT '#EC4899',
  
  -- Default Values
  suggested_target_amount DECIMAL(12, 2),
  suggested_timeframe_months INTEGER,
  goal_type TEXT,
  category TEXT,
  
  -- Template Content
  motivation_template TEXT,
  tips TEXT[],
  
  -- Display Settings
  is_popular BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Financial goals indexes
CREATE INDEX idx_financial_goals_user_id ON financial_goals(user_id);
CREATE INDEX idx_financial_goals_status ON financial_goals(status);
CREATE INDEX idx_financial_goals_goal_type ON financial_goals(goal_type);
CREATE INDEX idx_financial_goals_priority ON financial_goals(priority);
CREATE INDEX idx_financial_goals_target_date ON financial_goals(target_date);
CREATE INDEX idx_financial_goals_progress ON financial_goals(progress_percentage);
CREATE INDEX idx_financial_goals_archived ON financial_goals(is_archived);

-- Goal contributions indexes
CREATE INDEX idx_goal_contributions_goal_id ON goal_contributions(goal_id);
CREATE INDEX idx_goal_contributions_user_id ON goal_contributions(user_id);
CREATE INDEX idx_goal_contributions_date ON goal_contributions(contribution_date DESC);

-- Goal templates indexes
CREATE INDEX idx_goal_templates_active ON goal_templates(is_active);
CREATE INDEX idx_goal_templates_popular ON goal_templates(is_popular);
CREATE INDEX idx_goal_templates_display_order ON goal_templates(display_order);

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_templates ENABLE ROW LEVEL SECURITY;

-- Financial Goals Policies
CREATE POLICY "Users can view their own goals"
  ON financial_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals"
  ON financial_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
  ON financial_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
  ON financial_goals FOR DELETE
  USING (auth.uid() = user_id);

-- Goal Contributions Policies
CREATE POLICY "Users can view contributions to their goals"
  ON goal_contributions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create contributions to their goals"
  ON goal_contributions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contributions"
  ON goal_contributions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contributions"
  ON goal_contributions FOR DELETE
  USING (auth.uid() = user_id);

-- Goal Templates Policies (Public read)
CREATE POLICY "Anyone can view active goal templates"
  ON goal_templates FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage goal templates"
  ON goal_templates FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- =====================================================
-- Triggers for updated_at
-- =====================================================

-- Financial goals trigger
CREATE OR REPLACE FUNCTION update_financial_goal_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_financial_goal_updated_at
  BEFORE UPDATE ON financial_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_financial_goal_updated_at();

-- Goal templates trigger
CREATE OR REPLACE FUNCTION update_goal_template_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_goal_template_updated_at
  BEFORE UPDATE ON goal_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_goal_template_updated_at();

-- =====================================================
-- Trigger to Update Goal Status on Completion
-- =====================================================

CREATE OR REPLACE FUNCTION check_goal_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- If progress reaches 100%, mark as completed
  IF NEW.progress_percentage >= 100 AND OLD.status != 'completed' THEN
    NEW.status = 'completed';
    NEW.completed_at = NOW();
  END IF;
  
  -- If progress drops below 100%, revert from completed to active
  IF NEW.progress_percentage < 100 AND OLD.status = 'completed' THEN
    NEW.status = 'active';
    NEW.completed_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_goal_completion
  BEFORE UPDATE ON financial_goals
  FOR EACH ROW
  WHEN (NEW.current_amount IS DISTINCT FROM OLD.current_amount)
  EXECUTE FUNCTION check_goal_completion();

-- =====================================================
-- Function to Add Contribution and Update Goal
-- =====================================================

CREATE OR REPLACE FUNCTION add_goal_contribution(
  p_goal_id UUID,
  p_amount DECIMAL(12, 2),
  p_description TEXT DEFAULT NULL,
  p_contribution_type TEXT DEFAULT 'manual'
)
RETURNS goal_contributions AS $$
DECLARE
  v_user_id UUID;
  v_contribution goal_contributions;
BEGIN
  -- Get user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Insert contribution
  INSERT INTO goal_contributions (
    goal_id,
    user_id,
    amount,
    description,
    contribution_type
  ) VALUES (
    p_goal_id,
    v_user_id,
    p_amount,
    p_description,
    p_contribution_type
  ) RETURNING * INTO v_contribution;
  
  -- Update goal current amount
  UPDATE financial_goals
  SET current_amount = current_amount + p_amount
  WHERE id = p_goal_id AND user_id = v_user_id;
  
  RETURN v_contribution;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Seed Data - Goal Templates
-- =====================================================

INSERT INTO goal_templates (name, description, emoji, color, suggested_target_amount, suggested_timeframe_months, goal_type, category, motivation_template, tips, is_popular, display_order) VALUES
('Emergency Fund', 'Build a safety net for unexpected expenses', '🆘', '#EF4444', 5000, 12, 'emergency_fund', 'emergency', 'Having an emergency fund gives me peace of mind and financial security.', ARRAY[
  'Aim for 3-6 months of expenses',
  'Keep in a high-yield savings account',
  'Only use for true emergencies',
  'Replenish immediately after use'
], true, 1),

('Vacation Fund', 'Save for your dream vacation', '✈️', '#3B82F6', 3000, 6, 'savings', 'vacation', 'I deserve a break and want to create amazing memories.', ARRAY[
  'Research destination costs early',
  'Book flights and hotels in advance',
  'Set aside extra for activities',
  'Consider travel insurance'
], true, 2),

('Home Down Payment', 'Save for your first home', '🏠', '#10B981', 50000, 36, 'savings', 'home', 'Owning a home is a key milestone in my financial journey.', ARRAY[
  'Aim for 20% down payment to avoid PMI',
  'Factor in closing costs (2-5%)',
  'Get pre-approved for mortgage',
  'Consider location and future value'
], true, 3),

('New Car', 'Save for your next vehicle', '🚗', '#F59E0B', 25000, 24, 'purchase', 'car', 'A reliable car will improve my quality of life and independence.', ARRAY[
  'Research car values and depreciation',
  'Consider total cost of ownership',
  'Test drive before committing',
  'Negotiate price and financing'
], true, 4),

('Retirement Fund', 'Build your retirement nest egg', '🌅', '#8B5CF6', 100000, 120, 'investment', 'retirement', 'I want to retire comfortably and enjoy my golden years.', ARRAY[
  'Start early to maximize compound interest',
  'Max out employer 401(k) match',
  'Consider Roth vs Traditional IRA',
  'Diversify investments'
], true, 5),

('Education Fund', 'Save for education expenses', '🎓', '#EC4899', 20000, 48, 'savings', 'education', 'Education is an investment in my future success.', ARRAY[
  'Look into 529 plans for tax benefits',
  'Research scholarship opportunities',
  'Consider community college first',
  'Calculate ROI of degree'
], false, 6),

('Debt Payoff', 'Eliminate high-interest debt', '💳', '#EF4444', 10000, 18, 'debt_payoff', 'other', 'Being debt-free will give me financial freedom and reduce stress.', ARRAY[
  'Focus on highest interest debt first',
  'Consider debt consolidation',
  'Stop adding new debt',
  'Celebrate milestones'
], false, 7),

('Wedding Fund', 'Save for your special day', '💍', '#F472B6', 15000, 18, 'savings', 'other', 'I want to celebrate this milestone without going into debt.', ARRAY[
  'Set realistic budget early',
  'Prioritize what matters most',
  'Compare vendor prices',
  'Consider off-season dates'
], false, 8);

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE financial_goals IS 'Stores user financial goals and savings targets';
COMMENT ON TABLE goal_contributions IS 'Tracks contributions and withdrawals from goals';
COMMENT ON TABLE goal_templates IS 'Pre-defined goal templates for quick setup';
COMMENT ON COLUMN financial_goals.progress_percentage IS 'Auto-calculated progress percentage (0-100)';
COMMENT ON COLUMN financial_goals.milestones IS 'JSONB array of milestone objects with amount, description, and achievement status';

