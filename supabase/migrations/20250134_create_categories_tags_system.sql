-- Create categories and tags system
-- This migration creates tables for category management, tags, and auto-categorization rules

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Categories Table
-- =====================================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Category Information
  name TEXT NOT NULL,
  description TEXT,
  emoji TEXT,
  color TEXT DEFAULT '#EC4899',
  
  -- Category Type
  type TEXT NOT NULL, -- 'income', 'expense', 'both'
  
  -- Hierarchy (for subcategories)
  parent_category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  
  -- System vs Custom
  is_system BOOLEAN DEFAULT false, -- System categories can't be deleted
  is_custom BOOLEAN DEFAULT true,
  
  -- Display Settings
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_hidden BOOLEAN DEFAULT false,
  
  -- Budget Integration
  default_budget_amount DECIMAL(12, 2),
  budget_period TEXT, -- 'weekly', 'monthly', 'yearly'
  
  -- Usage Statistics
  transaction_count INTEGER DEFAULT 0,
  total_amount DECIMAL(12, 2) DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, name),
  CHECK (type IN ('income', 'expense', 'both'))
);

-- =====================================================
-- Tags Table
-- =====================================================
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tag Information
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#EC4899',
  
  -- Usage Statistics
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  
  -- Display Settings
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, name)
);

-- =====================================================
-- Transaction Tags Junction Table
-- =====================================================
CREATE TABLE transaction_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(transaction_id, tag_id)
);

-- =====================================================
-- Category Rules Table (Auto-categorization)
-- =====================================================
CREATE TABLE category_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  
  -- Rule Information
  name TEXT NOT NULL,
  description TEXT,
  
  -- Rule Conditions (all must match)
  match_type TEXT DEFAULT 'keyword', -- 'keyword', 'amount', 'merchant', 'combined'
  
  -- Keyword Matching
  keywords TEXT[], -- Array of keywords to match in description
  match_case_sensitive BOOLEAN DEFAULT false,
  match_whole_word BOOLEAN DEFAULT false,
  
  -- Amount Matching
  amount_min DECIMAL(12, 2),
  amount_max DECIMAL(12, 2),
  
  -- Merchant Matching
  merchant_names TEXT[], -- Array of merchant names
  
  -- Transaction Type
  transaction_type TEXT, -- 'income', 'expense', null for any
  
  -- Priority & Status
  priority INTEGER DEFAULT 0, -- Higher priority rules run first
  is_active BOOLEAN DEFAULT true,
  
  -- Auto-apply Settings
  auto_apply BOOLEAN DEFAULT true,
  apply_to_existing BOOLEAN DEFAULT false, -- Apply to existing transactions
  
  -- Usage Statistics
  match_count INTEGER DEFAULT 0,
  last_matched_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Category Icons Table (Icon Library)
-- =====================================================
CREATE TABLE category_icons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Icon Information
  emoji TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  keywords TEXT[], -- For search
  category_type TEXT, -- 'income', 'expense', 'both', null for general
  
  -- Display
  is_popular BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Categories indexes
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_categories_parent ON categories(parent_category_id);
CREATE INDEX idx_categories_active ON categories(is_active);
CREATE INDEX idx_categories_custom ON categories(is_custom);
CREATE INDEX idx_categories_system ON categories(is_system);
CREATE INDEX idx_categories_display_order ON categories(display_order);

-- Tags indexes
CREATE INDEX idx_tags_user_id ON tags(user_id);
CREATE INDEX idx_tags_active ON tags(is_active);
CREATE INDEX idx_tags_usage ON tags(usage_count DESC);

-- Transaction tags indexes
CREATE INDEX idx_transaction_tags_transaction ON transaction_tags(transaction_id);
CREATE INDEX idx_transaction_tags_tag ON transaction_tags(tag_id);

-- Category rules indexes
CREATE INDEX idx_category_rules_user_id ON category_rules(user_id);
CREATE INDEX idx_category_rules_category ON category_rules(category_id);
CREATE INDEX idx_category_rules_active ON category_rules(is_active);
CREATE INDEX idx_category_rules_priority ON category_rules(priority DESC);
CREATE INDEX idx_category_rules_keywords ON category_rules USING GIN(keywords);

-- Category icons indexes
CREATE INDEX idx_category_icons_type ON category_icons(category_type);
CREATE INDEX idx_category_icons_popular ON category_icons(is_popular);

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_icons ENABLE ROW LEVEL SECURITY;

-- Categories Policies
CREATE POLICY "Users can view their own categories and system categories"
  ON categories FOR SELECT
  USING (user_id = auth.uid() OR is_system = true);

CREATE POLICY "Users can create their own categories"
  ON categories FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own non-system categories"
  ON categories FOR UPDATE
  USING (user_id = auth.uid() AND is_system = false);

CREATE POLICY "Users can delete their own non-system categories"
  ON categories FOR DELETE
  USING (user_id = auth.uid() AND is_system = false);

-- Tags Policies
CREATE POLICY "Users can view their own tags"
  ON tags FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own tags"
  ON tags FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tags"
  ON tags FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own tags"
  ON tags FOR DELETE
  USING (user_id = auth.uid());

-- Transaction Tags Policies
CREATE POLICY "Users can view tags on their transactions"
  ON transaction_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM transactions
      WHERE transactions.id = transaction_tags.transaction_id
      AND transactions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can tag their own transactions"
  ON transaction_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM transactions
      WHERE transactions.id = transaction_tags.transaction_id
      AND transactions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove tags from their transactions"
  ON transaction_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM transactions
      WHERE transactions.id = transaction_tags.transaction_id
      AND transactions.user_id = auth.uid()
    )
  );

-- Category Rules Policies
CREATE POLICY "Users can view their own rules"
  ON category_rules FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own rules"
  ON category_rules FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own rules"
  ON category_rules FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own rules"
  ON category_rules FOR DELETE
  USING (user_id = auth.uid());

-- Category Icons Policies (Public read)
CREATE POLICY "Anyone can view category icons"
  ON category_icons FOR SELECT
  USING (true);

-- =====================================================
-- Triggers for updated_at
-- =====================================================

-- Categories trigger
CREATE OR REPLACE FUNCTION update_category_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_category_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_category_updated_at();

-- Tags trigger
CREATE OR REPLACE FUNCTION update_tag_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tag_updated_at
  BEFORE UPDATE ON tags
  FOR EACH ROW
  EXECUTE FUNCTION update_tag_updated_at();

-- Category rules trigger
CREATE OR REPLACE FUNCTION update_category_rule_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_category_rule_updated_at
  BEFORE UPDATE ON category_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_category_rule_updated_at();

-- =====================================================
-- Trigger to Update Category Usage Statistics
-- =====================================================

CREATE OR REPLACE FUNCTION update_category_usage_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE categories
    SET 
      transaction_count = transaction_count + 1,
      total_amount = total_amount + NEW.amount,
      last_used_at = NOW()
    WHERE id = NEW.category;
  ELSIF TG_OP = 'UPDATE' AND OLD.category IS DISTINCT FROM NEW.category THEN
    -- Decrement old category
    UPDATE categories
    SET 
      transaction_count = transaction_count - 1,
      total_amount = total_amount - OLD.amount
    WHERE id = OLD.category;
    
    -- Increment new category
    UPDATE categories
    SET 
      transaction_count = transaction_count + 1,
      total_amount = total_amount + NEW.amount,
      last_used_at = NOW()
    WHERE id = NEW.category;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE categories
    SET 
      transaction_count = transaction_count - 1,
      total_amount = total_amount - OLD.amount
    WHERE id = OLD.category;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_category_usage_stats
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_category_usage_stats();

-- =====================================================
-- Trigger to Update Tag Usage Statistics
-- =====================================================

CREATE OR REPLACE FUNCTION update_tag_usage_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tags
    SET 
      usage_count = usage_count + 1,
      last_used_at = NOW()
    WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tags
    SET usage_count = usage_count - 1
    WHERE id = OLD.tag_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tag_usage_stats
  AFTER INSERT OR DELETE ON transaction_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_tag_usage_stats();

-- =====================================================
-- Function to Auto-Categorize Transaction
-- =====================================================

CREATE OR REPLACE FUNCTION auto_categorize_transaction(
  p_transaction_id UUID,
  p_description TEXT,
  p_amount DECIMAL,
  p_type TEXT
)
RETURNS UUID AS $$
DECLARE
  v_rule RECORD;
  v_matched BOOLEAN;
  v_keyword TEXT;
BEGIN
  -- Get active rules ordered by priority
  FOR v_rule IN
    SELECT * FROM category_rules
    WHERE user_id = (SELECT user_id FROM transactions WHERE id = p_transaction_id)
      AND is_active = true
      AND auto_apply = true
      AND (transaction_type IS NULL OR transaction_type = p_type)
    ORDER BY priority DESC, created_at ASC
  LOOP
    v_matched := false;
    
    -- Check match type
    IF v_rule.match_type = 'keyword' AND v_rule.keywords IS NOT NULL THEN
      -- Check if any keyword matches
      FOREACH v_keyword IN ARRAY v_rule.keywords
      LOOP
        IF v_rule.match_case_sensitive THEN
          IF p_description LIKE '%' || v_keyword || '%' THEN
            v_matched := true;
            EXIT;
          END IF;
        ELSE
          IF LOWER(p_description) LIKE '%' || LOWER(v_keyword) || '%' THEN
            v_matched := true;
            EXIT;
          END IF;
        END IF;
      END LOOP;
    END IF;
    
    IF v_rule.match_type = 'amount' THEN
      IF (v_rule.amount_min IS NULL OR p_amount >= v_rule.amount_min)
         AND (v_rule.amount_max IS NULL OR p_amount <= v_rule.amount_max) THEN
        v_matched := true;
      END IF;
    END IF;
    
    -- If matched, update transaction and rule stats
    IF v_matched THEN
      UPDATE transactions
      SET category = (SELECT name FROM categories WHERE id = v_rule.category_id)
      WHERE id = p_transaction_id;
      
      UPDATE category_rules
      SET 
        match_count = match_count + 1,
        last_matched_at = NOW()
      WHERE id = v_rule.id;
      
      RETURN v_rule.category_id;
    END IF;
  END LOOP;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Seed Data - System Categories
-- =====================================================

INSERT INTO categories (name, description, emoji, color, type, is_system, is_custom, display_order) VALUES
-- Income Categories
('Salary', 'Regular employment income', '💼', '#10B981', 'income', true, false, 1),
('Freelance', 'Freelance and contract work', '💻', '#3B82F6', 'income', true, false, 2),
('Business', 'Business revenue', '🏢', '#8B5CF6', 'income', true, false, 3),
('Investment', 'Investment returns and dividends', '📈', '#F59E0B', 'income', true, false, 4),
('Gift', 'Monetary gifts received', '🎁', '#EC4899', 'income', true, false, 5),
('Refund', 'Refunds and reimbursements', '↩️', '#6366F1', 'income', true, false, 6),
('Other Income', 'Other sources of income', '💰', '#14B8A6', 'income', true, false, 7),

-- Expense Categories
('Food & Dining', 'Restaurants, groceries, and food delivery', '🍔', '#EF4444', 'expense', true, false, 10),
('Transportation', 'Gas, public transit, rideshare', '🚗', '#F59E0B', 'expense', true, false, 11),
('Shopping', 'Clothing, electronics, and general shopping', '🛍️', '#EC4899', 'expense', true, false, 12),
('Entertainment', 'Movies, concerts, hobbies', '🎬', '#8B5CF6', 'expense', true, false, 13),
('Bills & Utilities', 'Electricity, water, internet, phone', '📱', '#3B82F6', 'expense', true, false, 14),
('Housing', 'Rent, mortgage, home maintenance', '🏠', '#10B981', 'expense', true, false, 15),
('Healthcare', 'Medical, dental, pharmacy', '⚕️', '#EF4444', 'expense', true, false, 16),
('Education', 'Tuition, books, courses', '🎓', '#6366F1', 'expense', true, false, 17),
('Insurance', 'Health, auto, life insurance', '🛡️', '#8B5CF6', 'expense', true, false, 18),
('Travel', 'Flights, hotels, vacation expenses', '✈️', '#3B82F6', 'expense', true, false, 19),
('Fitness', 'Gym, sports, health activities', '💪', '#10B981', 'expense', true, false, 20),
('Personal Care', 'Haircuts, spa, beauty products', '💅', '#EC4899', 'expense', true, false, 21),
('Pet Care', 'Pet food, vet, supplies', '🐾', '#F59E0B', 'expense', true, false, 22),
('Gifts & Donations', 'Gifts given, charitable donations', '🎁', '#EC4899', 'expense', true, false, 23),
('Other Expense', 'Miscellaneous expenses', '💸', '#6B7280', 'expense', true, false, 24);

-- =====================================================
-- Seed Data - Popular Category Icons
-- =====================================================

INSERT INTO category_icons (emoji, name, keywords, category_type, is_popular, display_order) VALUES
-- Income icons
('💼', 'Briefcase', ARRAY['work', 'job', 'salary', 'office'], 'income', true, 1),
('💰', 'Money Bag', ARRAY['money', 'income', 'cash'], 'income', true, 2),
('📈', 'Chart Up', ARRAY['investment', 'growth', 'profit'], 'income', true, 3),
('🎁', 'Gift', ARRAY['gift', 'present', 'bonus'], 'both', true, 4),

-- Expense icons
('🍔', 'Food', ARRAY['food', 'restaurant', 'dining', 'eat'], 'expense', true, 5),
('🚗', 'Car', ARRAY['transport', 'car', 'vehicle', 'gas'], 'expense', true, 6),
('🏠', 'House', ARRAY['home', 'rent', 'housing', 'mortgage'], 'expense', true, 7),
('🛍️', 'Shopping', ARRAY['shop', 'shopping', 'buy', 'purchase'], 'expense', true, 8),
('⚕️', 'Medical', ARRAY['health', 'medical', 'doctor', 'medicine'], 'expense', true, 9),
('🎬', 'Entertainment', ARRAY['fun', 'movie', 'entertainment', 'hobby'], 'expense', true, 10),
('📱', 'Phone', ARRAY['phone', 'mobile', 'tech', 'utility'], 'expense', true, 11),
('✈️', 'Travel', ARRAY['travel', 'flight', 'vacation', 'trip'], 'expense', true, 12),
('🎓', 'Education', ARRAY['education', 'school', 'learning', 'course'], 'expense', true, 13),
('💪', 'Fitness', ARRAY['gym', 'fitness', 'exercise', 'health'], 'expense', true, 14),
('🐾', 'Pet', ARRAY['pet', 'animal', 'dog', 'cat'], 'expense', true, 15);

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE categories IS 'User and system-defined transaction categories';
COMMENT ON TABLE tags IS 'User-defined tags for transactions';
COMMENT ON TABLE transaction_tags IS 'Many-to-many relationship between transactions and tags';
COMMENT ON TABLE category_rules IS 'Auto-categorization rules based on keywords, amounts, and patterns';
COMMENT ON TABLE category_icons IS 'Library of available icons for categories';

COMMENT ON COLUMN categories.is_system IS 'System categories cannot be deleted or renamed';
COMMENT ON COLUMN category_rules.priority IS 'Higher priority rules are evaluated first';
COMMENT ON COLUMN category_rules.keywords IS 'Array of keywords to match (case-insensitive by default)';

