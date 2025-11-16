-- Create support system tables
-- This migration creates tables for FAQ, support tickets, onboarding, and app info

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- FAQ Table
-- =====================================================
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- FAQ Content
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL, -- 'general', 'transactions', 'budgets', 'analytics', 'technical'
  
  -- Ordering and Display
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  
  -- Usage Statistics
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  
  -- SEO and Search
  keywords TEXT[], -- Array of search keywords
  tags TEXT[], -- Array of tags for filtering
  
  -- Status
  is_published BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Support Tickets Table
-- =====================================================
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Ticket Information
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'bug', 'feature_request', 'help', 'feedback', 'other'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
  
  -- Contact Information
  contact_email TEXT,
  contact_phone TEXT,
  preferred_contact_method TEXT DEFAULT 'email', -- 'email', 'phone', 'app'
  
  -- Additional Context
  app_version TEXT,
  device_info JSONB, -- Device details, OS version, etc.
  screenshot_urls TEXT[], -- Array of screenshot URLs
  
  -- Response and Resolution
  admin_response TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  
  -- Ratings (after resolution)
  satisfaction_rating INTEGER, -- 1-5 stars
  feedback TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Onboarding Steps Table
-- =====================================================
CREATE TABLE onboarding_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Step Information
  step_number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Visual Content
  icon_name TEXT, -- Icon identifier
  image_url TEXT, -- Optional illustration
  video_url TEXT, -- Optional tutorial video
  
  -- Interactive Elements
  action_button_text TEXT,
  action_button_route TEXT, -- Deep link to feature
  
  -- Content Variations
  content_type TEXT DEFAULT 'info', -- 'info', 'tutorial', 'permission_request', 'setup'
  
  -- Requirements
  is_required BOOLEAN DEFAULT false,
  can_skip BOOLEAN DEFAULT true,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- User Onboarding Progress Table
-- =====================================================
CREATE TABLE user_onboarding_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Progress Tracking
  current_step INTEGER DEFAULT 1,
  completed_steps INTEGER[] DEFAULT '{}', -- Array of completed step numbers
  skipped_steps INTEGER[] DEFAULT '{}', -- Array of skipped step numbers
  
  -- Status
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- User Preferences
  show_tips BOOLEAN DEFAULT true,
  show_tutorials BOOLEAN DEFAULT true,
  
  -- Metadata
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- =====================================================
-- App Information Table
-- =====================================================
CREATE TABLE app_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Version Information
  app_version TEXT NOT NULL UNIQUE,
  build_number TEXT,
  release_date DATE,
  
  -- Release Notes
  whats_new TEXT[],
  bug_fixes TEXT[],
  improvements TEXT[],
  
  -- Legal and Links
  terms_of_service_url TEXT,
  privacy_policy_url TEXT,
  licenses_text TEXT,
  
  -- Contact Information
  support_email TEXT,
  support_phone TEXT,
  website_url TEXT,
  social_links JSONB, -- { twitter, facebook, instagram, etc. }
  
  -- App Details
  developer_name TEXT,
  developer_website TEXT,
  copyright_text TEXT,
  
  -- Status
  is_current_version BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- FAQ indexes
CREATE INDEX idx_faqs_category ON faqs(category);
CREATE INDEX idx_faqs_is_published ON faqs(is_published);
CREATE INDEX idx_faqs_is_featured ON faqs(is_featured);
CREATE INDEX idx_faqs_display_order ON faqs(display_order);

-- Support tickets indexes
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_category ON support_tickets(category);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at DESC);

-- Onboarding indexes
CREATE INDEX idx_onboarding_steps_step_number ON onboarding_steps(step_number);
CREATE INDEX idx_onboarding_steps_is_active ON onboarding_steps(is_active);
CREATE INDEX idx_user_onboarding_progress_user_id ON user_onboarding_progress(user_id);

-- App info indexes
CREATE INDEX idx_app_info_version ON app_info(app_version);
CREATE INDEX idx_app_info_current ON app_info(is_current_version);

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_info ENABLE ROW LEVEL SECURITY;

-- FAQ Policies (Public read for published FAQs)
CREATE POLICY "Anyone can view published FAQs"
  ON faqs FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage FAQs"
  ON faqs FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Support Tickets Policies (Users can only see their own tickets)
CREATE POLICY "Users can view their own tickets"
  ON support_tickets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tickets"
  ON support_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets"
  ON support_tickets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all tickets"
  ON support_tickets FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can update all tickets"
  ON support_tickets FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Onboarding Steps Policies (Public read for active steps)
CREATE POLICY "Anyone can view active onboarding steps"
  ON onboarding_steps FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage onboarding steps"
  ON onboarding_steps FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- User Onboarding Progress Policies (Users can only manage their own progress)
CREATE POLICY "Users can view their own progress"
  ON user_onboarding_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON user_onboarding_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON user_onboarding_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- App Info Policies (Public read)
CREATE POLICY "Anyone can view app info"
  ON app_info FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage app info"
  ON app_info FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- =====================================================
-- Triggers for updated_at
-- =====================================================

-- FAQ trigger
CREATE OR REPLACE FUNCTION update_faq_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_faq_updated_at
  BEFORE UPDATE ON faqs
  FOR EACH ROW
  EXECUTE FUNCTION update_faq_updated_at();

-- Support tickets trigger
CREATE OR REPLACE FUNCTION update_support_ticket_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_support_ticket_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_support_ticket_updated_at();

-- Onboarding steps trigger
CREATE OR REPLACE FUNCTION update_onboarding_step_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_onboarding_step_updated_at
  BEFORE UPDATE ON onboarding_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_onboarding_step_updated_at();

-- User onboarding progress trigger
CREATE OR REPLACE FUNCTION update_user_onboarding_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_onboarding_progress_updated_at
  BEFORE UPDATE ON user_onboarding_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_user_onboarding_progress_updated_at();

-- App info trigger
CREATE OR REPLACE FUNCTION update_app_info_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_app_info_updated_at
  BEFORE UPDATE ON app_info
  FOR EACH ROW
  EXECUTE FUNCTION update_app_info_updated_at();

-- =====================================================
-- Seed Data - Default FAQs
-- =====================================================

INSERT INTO faqs (question, answer, category, display_order, is_featured) VALUES
('How do I add a transaction?', 'Go to the Transactions tab and tap the "Add" button. Fill in the amount, category, and description, then save.', 'transactions', 1, true),
('How do I create a budget?', 'Navigate to the Budget tab, tap "Create Budget", select a category, set your limit, and choose a time period.', 'budgets', 2, true),
('Can I import transactions from a bank?', 'Currently, you need to add transactions manually. Bulk import via CSV is available in the Smart Entry tools.', 'transactions', 3, false),
('How do I view analytics?', 'Go to the Analytics tab to see your income vs expenses, category breakdowns, and trends over time.', 'analytics', 4, true),
('Is my data secure?', 'Yes! All data is encrypted and stored securely in Supabase with industry-standard security practices.', 'general', 5, true),
('How do I change my currency?', 'Go to Settings → Preferences → Currency Settings to change your preferred currency.', 'general', 6, false),
('Can I export my data?', 'Yes, you can export your transactions and reports from the Analytics tab.', 'technical', 7, false),
('How do recurring transactions work?', 'Set up recurring transactions to automatically create transactions on a schedule (daily, weekly, monthly).', 'transactions', 8, false);

-- =====================================================
-- Seed Data - Default Onboarding Steps
-- =====================================================

INSERT INTO onboarding_steps (step_number, title, description, icon_name, action_button_text, action_button_route, content_type, is_required) VALUES
(1, 'Welcome to Money Tracker', 'Track your income, expenses, and budgets all in one beautiful app.', 'wave', 'Get Started', null, 'info', true),
(2, 'Add Your First Transaction', 'Start by adding an income or expense transaction to see how easy it is.', 'plus-circle', 'Add Transaction', '/(tabs)/transactions/add', 'tutorial', false),
(3, 'Create a Budget', 'Set spending limits for different categories to stay on track with your financial goals.', 'target', 'Create Budget', '/(tabs)/budget/create', 'tutorial', false),
(4, 'View Analytics', 'Get insights into your spending patterns with beautiful charts and reports.', 'bar-chart', 'See Analytics', '/(tabs)/analytics', 'tutorial', false),
(5, 'Enable Notifications', 'Stay informed about budget alerts and upcoming recurring transactions.', 'bell', 'Enable Notifications', '/(tabs)/settings/preferences', 'permission_request', false);

-- =====================================================
-- Seed Data - Current App Info
-- =====================================================

INSERT INTO app_info (
  app_version, 
  build_number, 
  release_date,
  whats_new,
  bug_fixes,
  improvements,
  support_email,
  website_url,
  developer_name,
  copyright_text,
  is_current_version
) VALUES (
  '1.0.0',
  '1',
  CURRENT_DATE,
  ARRAY[
    'Complete transaction management',
    'Budget tracking and alerts',
    'Analytics and reports',
    'Smart entry tools (OCR, voice)',
    'Recurring transactions',
    'Beautiful pink theme design'
  ],
  ARRAY[
    'Initial release - no bugs yet!'
  ],
  ARRAY[
    'Modern glassmorphism UI',
    'Smooth animations',
    'Offline support'
  ],
  'support@moneytracker.app',
  'https://moneytracker.app',
  'Money Tracker Team',
  '© 2025 Money Tracker. All rights reserved.',
  true
);

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE faqs IS 'Stores frequently asked questions and answers';
COMMENT ON TABLE support_tickets IS 'Stores user support tickets and feedback';
COMMENT ON TABLE onboarding_steps IS 'Defines the onboarding flow steps';
COMMENT ON TABLE user_onboarding_progress IS 'Tracks individual user progress through onboarding';
COMMENT ON TABLE app_info IS 'Stores app version information and about content';

