/**
 * Support Service
 * 
 * Handles FAQ, support tickets, onboarding, and app info functionality
 */

import { supabase } from '@/lib/supabase';

// =====================================================
// Types
// =====================================================

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'transactions' | 'budgets' | 'analytics' | 'technical';
  display_order: number;
  is_featured: boolean;
  view_count: number;
  helpful_count: number;
  not_helpful_count: number;
  keywords: string[];
  tags: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  category: 'bug' | 'feature_request' | 'help' | 'feedback' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  contact_email?: string;
  contact_phone?: string;
  preferred_contact_method: 'email' | 'phone' | 'app';
  app_version?: string;
  device_info?: any;
  screenshot_urls?: string[];
  admin_response?: string;
  resolved_at?: string;
  resolution_notes?: string;
  satisfaction_rating?: number;
  feedback?: string;
  created_at: string;
  updated_at: string;
}

export interface OnboardingStep {
  id: string;
  step_number: number;
  title: string;
  description: string;
  icon_name?: string;
  image_url?: string;
  video_url?: string;
  action_button_text?: string;
  action_button_route?: string;
  content_type: 'info' | 'tutorial' | 'permission_request' | 'setup';
  is_required: boolean;
  can_skip: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserOnboardingProgress {
  id: string;
  user_id: string;
  current_step: number;
  completed_steps: number[];
  skipped_steps: number[];
  is_completed: boolean;
  completed_at?: string;
  show_tips: boolean;
  show_tutorials: boolean;
  started_at: string;
  updated_at: string;
}

export interface AppInfo {
  id: string;
  app_version: string;
  build_number?: string;
  release_date?: string;
  whats_new: string[];
  bug_fixes: string[];
  improvements: string[];
  terms_of_service_url?: string;
  privacy_policy_url?: string;
  licenses_text?: string;
  support_email?: string;
  support_phone?: string;
  website_url?: string;
  social_links?: any;
  developer_name?: string;
  developer_website?: string;
  copyright_text?: string;
  is_current_version: boolean;
  created_at: string;
  updated_at: string;
}

// =====================================================
// Custom Error Class
// =====================================================

class SupportServiceError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'SupportServiceError';
  }
}

// =====================================================
// FAQ Functions
// =====================================================

/**
 * Get all published FAQs
 */
export async function getAllFAQs(category?: string): Promise<FAQ[]> {
  try {
    let query = supabase
      .from('faqs')
      .select('*')
      .eq('is_published', true)
      .order('display_order', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw new SupportServiceError(error.message, error.code);
    return data || [];
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    throw error;
  }
}

/**
 * Get featured FAQs
 */
export async function getFeaturedFAQs(): Promise<FAQ[]> {
  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('is_published', true)
      .eq('is_featured', true)
      .order('display_order', { ascending: true })
      .limit(5);

    if (error) throw new SupportServiceError(error.message, error.code);
    return data || [];
  } catch (error) {
    console.error('Error fetching featured FAQs:', error);
    throw error;
  }
}

/**
 * Search FAQs by keyword
 */
export async function searchFAQs(searchTerm: string): Promise<FAQ[]> {
  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('is_published', true)
      .or(`question.ilike.%${searchTerm}%,answer.ilike.%${searchTerm}%`)
      .order('display_order', { ascending: true });

    if (error) throw new SupportServiceError(error.message, error.code);
    return data || [];
  } catch (error) {
    console.error('Error searching FAQs:', error);
    throw error;
  }
}

/**
 * Increment FAQ view count
 */
export async function incrementFAQViewCount(faqId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('increment_faq_views', { faq_id: faqId });
    if (error) throw new SupportServiceError(error.message, error.code);
  } catch (error) {
    console.error('Error incrementing FAQ view count:', error);
    // Don't throw - this is a non-critical operation
  }
}

/**
 * Mark FAQ as helpful/not helpful
 */
export async function markFAQHelpful(faqId: string, isHelpful: boolean): Promise<void> {
  try {
    const field = isHelpful ? 'helpful_count' : 'not_helpful_count';
    
    const { data: faq, error: fetchError } = await supabase
      .from('faqs')
      .select(field)
      .eq('id', faqId)
      .single();

    if (fetchError) throw new SupportServiceError(fetchError.message, fetchError.code);

    const { error: updateError } = await supabase
      .from('faqs')
      .update({ [field]: (faq[field] || 0) + 1 })
      .eq('id', faqId);

    if (updateError) throw new SupportServiceError(updateError.message, updateError.code);
  } catch (error) {
    console.error('Error marking FAQ helpful:', error);
    throw error;
  }
}

// =====================================================
// Support Ticket Functions
// =====================================================

/**
 * Create a new support ticket
 */
export async function createSupportTicket(
  ticketData: Omit<SupportTicket, 'id' | 'created_at' | 'updated_at' | 'user_id'>
): Promise<SupportTicket> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new SupportServiceError('User not authenticated');
    }

    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        ...ticketData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw new SupportServiceError(error.message, error.code);
    return data;
  } catch (error) {
    console.error('Error creating support ticket:', error);
    throw error;
  }
}

/**
 * Get user's support tickets
 */
export async function getUserSupportTickets(): Promise<SupportTicket[]> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new SupportServiceError('User not authenticated');
    }

    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw new SupportServiceError(error.message, error.code);
    return data || [];
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    throw error;
  }
}

/**
 * Get a specific support ticket
 */
export async function getSupportTicket(ticketId: string): Promise<SupportTicket> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new SupportServiceError('User not authenticated');
    }

    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', ticketId)
      .eq('user_id', user.id)
      .single();

    if (error) throw new SupportServiceError(error.message, error.code);
    return data;
  } catch (error) {
    console.error('Error fetching support ticket:', error);
    throw error;
  }
}

/**
 * Update a support ticket
 */
export async function updateSupportTicket(
  ticketId: string,
  updates: Partial<Omit<SupportTicket, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<SupportTicket> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new SupportServiceError('User not authenticated');
    }

    const { data, error } = await supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', ticketId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw new SupportServiceError(error.message, error.code);
    return data;
  } catch (error) {
    console.error('Error updating support ticket:', error);
    throw error;
  }
}

/**
 * Rate a resolved support ticket
 */
export async function rateSupportTicket(
  ticketId: string,
  rating: number,
  feedback?: string
): Promise<void> {
  try {
    if (rating < 1 || rating > 5) {
      throw new SupportServiceError('Rating must be between 1 and 5');
    }

    await updateSupportTicket(ticketId, {
      satisfaction_rating: rating,
      feedback,
    });
  } catch (error) {
    console.error('Error rating support ticket:', error);
    throw error;
  }
}

// =====================================================
// Onboarding Functions
// =====================================================

/**
 * Get all active onboarding steps
 */
export async function getOnboardingSteps(): Promise<OnboardingStep[]> {
  try {
    const { data, error } = await supabase
      .from('onboarding_steps')
      .select('*')
      .eq('is_active', true)
      .order('step_number', { ascending: true });

    if (error) throw new SupportServiceError(error.message, error.code);
    return data || [];
  } catch (error) {
    console.error('Error fetching onboarding steps:', error);
    throw error;
  }
}

/**
 * Get user's onboarding progress
 */
export async function getUserOnboardingProgress(): Promise<UserOnboardingProgress | null> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new SupportServiceError('User not authenticated');
    }

    const { data, error } = await supabase
      .from('user_onboarding_progress')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new SupportServiceError(error.message, error.code);
    }

    return data;
  } catch (error) {
    console.error('Error fetching onboarding progress:', error);
    throw error;
  }
}

/**
 * Initialize onboarding progress for user
 */
export async function initializeOnboardingProgress(): Promise<UserOnboardingProgress> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new SupportServiceError('User not authenticated');
    }

    const { data, error } = await supabase
      .from('user_onboarding_progress')
      .insert({
        user_id: user.id,
        current_step: 1,
        completed_steps: [],
        skipped_steps: [],
        is_completed: false,
      })
      .select()
      .single();

    if (error) throw new SupportServiceError(error.message, error.code);
    return data;
  } catch (error) {
    console.error('Error initializing onboarding progress:', error);
    throw error;
  }
}

/**
 * Update onboarding progress
 */
export async function updateOnboardingProgress(
  updates: Partial<Omit<UserOnboardingProgress, 'id' | 'user_id' | 'started_at' | 'updated_at'>>
): Promise<UserOnboardingProgress> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new SupportServiceError('User not authenticated');
    }

    const { data, error } = await supabase
      .from('user_onboarding_progress')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw new SupportServiceError(error.message, error.code);
    return data;
  } catch (error) {
    console.error('Error updating onboarding progress:', error);
    throw error;
  }
}

/**
 * Mark onboarding step as completed
 */
export async function completeOnboardingStep(stepNumber: number): Promise<void> {
  try {
    const progress = await getUserOnboardingProgress();
    
    if (!progress) {
      await initializeOnboardingProgress();
      return completeOnboardingStep(stepNumber);
    }

    const completedSteps = [...(progress.completed_steps || [])];
    if (!completedSteps.includes(stepNumber)) {
      completedSteps.push(stepNumber);
    }

    const allSteps = await getOnboardingSteps();
    const isCompleted = completedSteps.length >= allSteps.length;

    await updateOnboardingProgress({
      completed_steps: completedSteps,
      current_step: stepNumber + 1,
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : undefined,
    });
  } catch (error) {
    console.error('Error completing onboarding step:', error);
    throw error;
  }
}

/**
 * Skip onboarding step
 */
export async function skipOnboardingStep(stepNumber: number): Promise<void> {
  try {
    const progress = await getUserOnboardingProgress();
    
    if (!progress) {
      await initializeOnboardingProgress();
      return skipOnboardingStep(stepNumber);
    }

    const skippedSteps = [...(progress.skipped_steps || [])];
    if (!skippedSteps.includes(stepNumber)) {
      skippedSteps.push(stepNumber);
    }

    await updateOnboardingProgress({
      skipped_steps: skippedSteps,
      current_step: stepNumber + 1,
    });
  } catch (error) {
    console.error('Error skipping onboarding step:', error);
    throw error;
  }
}

/**
 * Reset onboarding progress
 */
export async function resetOnboardingProgress(): Promise<void> {
  try {
    await updateOnboardingProgress({
      current_step: 1,
      completed_steps: [],
      skipped_steps: [],
      is_completed: false,
      completed_at: undefined,
    });
  } catch (error) {
    console.error('Error resetting onboarding progress:', error);
    throw error;
  }
}

// =====================================================
// App Info Functions
// =====================================================

/**
 * Get current app information
 */
export async function getCurrentAppInfo(): Promise<AppInfo | null> {
  try {
    const { data, error } = await supabase
      .from('app_info')
      .select('*')
      .eq('is_current_version', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new SupportServiceError(error.message, error.code);
    }

    return data;
  } catch (error) {
    console.error('Error fetching app info:', error);
    throw error;
  }
}

/**
 * Get app info by version
 */
export async function getAppInfoByVersion(version: string): Promise<AppInfo | null> {
  try {
    const { data, error } = await supabase
      .from('app_info')
      .select('*')
      .eq('app_version', version)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new SupportServiceError(error.message, error.code);
    }

    return data;
  } catch (error) {
    console.error('Error fetching app info by version:', error);
    throw error;
  }
}

/**
 * Get all app versions (for version history)
 */
export async function getAllAppVersions(): Promise<AppInfo[]> {
  try {
    const { data, error } = await supabase
      .from('app_info')
      .select('*')
      .order('release_date', { ascending: false });

    if (error) throw new SupportServiceError(error.message, error.code);
    return data || [];
  } catch (error) {
    console.error('Error fetching app versions:', error);
    throw error;
  }
}

