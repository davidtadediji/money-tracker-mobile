/**
 * Goals Service
 * 
 * Handles financial goals, progress tracking, contributions, and savings calculations
 */

import { supabase } from '@/lib/supabase';

// =====================================================
// Types
// =====================================================

export interface FinancialGoal {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  emoji?: string;
  color: string;
  target_amount: number;
  current_amount: number;
  currency: string;
  start_date: string;
  target_date?: string;
  goal_type: 'savings' | 'debt_payoff' | 'investment' | 'purchase' | 'emergency_fund' | 'other';
  category?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'active' | 'paused' | 'completed' | 'cancelled' | 'failed';
  progress_percentage: number;
  auto_contribute: boolean;
  contribution_amount?: number;
  contribution_frequency?: string;
  next_contribution_date?: string;
  milestones?: Milestone[];
  linked_account_id?: string;
  linked_budget_id?: string;
  motivation?: string;
  notes?: string;
  completed_at?: string;
  completion_notes?: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  amount: number;
  description: string;
  achieved: boolean;
  achieved_date?: string;
}

export interface GoalContribution {
  id: string;
  goal_id: string;
  user_id: string;
  amount: number;
  contribution_type: 'manual' | 'automatic' | 'withdrawal' | 'adjustment';
  description?: string;
  notes?: string;
  linked_transaction_id?: string;
  contribution_date: string;
  created_at: string;
}

export interface GoalTemplate {
  id: string;
  name: string;
  description?: string;
  emoji?: string;
  color: string;
  suggested_target_amount?: number;
  suggested_timeframe_months?: number;
  goal_type?: string;
  category?: string;
  motivation_template?: string;
  tips?: string[];
  is_popular: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavingsCalculation {
  monthlyContribution: number;
  totalMonths: number;
  targetAmount: number;
  currentAmount: number;
  projectedCompletionDate: Date;
  interestEarned?: number;
}

// =====================================================
// Custom Error Class
// =====================================================

class GoalsServiceError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'GoalsServiceError';
  }
}

// =====================================================
// Financial Goals CRUD
// =====================================================

/**
 * Get all goals for the authenticated user
 */
export async function getAllGoals(includeArchived = false): Promise<FinancialGoal[]> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new GoalsServiceError('User not authenticated');
    }

    let query = supabase
      .from('financial_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!includeArchived) {
      query = query.eq('is_archived', false);
    }

    const { data, error } = await query;

    if (error) throw new GoalsServiceError(error.message, error.code);
    return data || [];
  } catch (error) {
    console.error('Error fetching goals:', error);
    throw error;
  }
}

/**
 * Get active goals only
 */
export async function getActiveGoals(): Promise<FinancialGoal[]> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new GoalsServiceError('User not authenticated');
    }

    const { data, error } = await supabase
      .from('financial_goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .eq('is_archived', false)
      .order('priority', { ascending: false })
      .order('target_date', { ascending: true });

    if (error) throw new GoalsServiceError(error.message, error.code);
    return data || [];
  } catch (error) {
    console.error('Error fetching active goals:', error);
    throw error;
  }
}

/**
 * Get a specific goal by ID
 */
export async function getGoalById(goalId: string): Promise<FinancialGoal> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new GoalsServiceError('User not authenticated');
    }

    const { data, error } = await supabase
      .from('financial_goals')
      .select('*')
      .eq('id', goalId)
      .eq('user_id', user.id)
      .single();

    if (error) throw new GoalsServiceError(error.message, error.code);
    return data;
  } catch (error) {
    console.error('Error fetching goal:', error);
    throw error;
  }
}

/**
 * Create a new financial goal
 */
export async function createGoal(
  goalData: Omit<FinancialGoal, 'id' | 'user_id' | 'progress_percentage' | 'created_at' | 'updated_at'>
): Promise<FinancialGoal> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new GoalsServiceError('User not authenticated');
    }

    const { data, error } = await supabase
      .from('financial_goals')
      .insert({
        ...goalData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw new GoalsServiceError(error.message, error.code);
    return data;
  } catch (error) {
    console.error('Error creating goal:', error);
    throw error;
  }
}

/**
 * Update an existing goal
 */
export async function updateGoal(
  goalId: string,
  updates: Partial<Omit<FinancialGoal, 'id' | 'user_id' | 'progress_percentage' | 'created_at' | 'updated_at'>>
): Promise<FinancialGoal> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new GoalsServiceError('User not authenticated');
    }

    const { data, error } = await supabase
      .from('financial_goals')
      .update(updates)
      .eq('id', goalId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw new GoalsServiceError(error.message, error.code);
    return data;
  } catch (error) {
    console.error('Error updating goal:', error);
    throw error;
  }
}

/**
 * Delete a goal
 */
export async function deleteGoal(goalId: string): Promise<void> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new GoalsServiceError('User not authenticated');
    }

    const { error } = await supabase
      .from('financial_goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', user.id);

    if (error) throw new GoalsServiceError(error.message, error.code);
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw error;
  }
}

/**
 * Archive a goal
 */
export async function archiveGoal(goalId: string): Promise<FinancialGoal> {
  return updateGoal(goalId, { is_archived: true });
}

/**
 * Unarchive a goal
 */
export async function unarchiveGoal(goalId: string): Promise<FinancialGoal> {
  return updateGoal(goalId, { is_archived: false });
}

// =====================================================
// Goal Contributions
// =====================================================

/**
 * Add a contribution to a goal
 */
export async function addContribution(
  goalId: string,
  amount: number,
  description?: string,
  contributionType: 'manual' | 'automatic' | 'withdrawal' | 'adjustment' = 'manual'
): Promise<GoalContribution> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new GoalsServiceError('User not authenticated');
    }

    // Use the database function to add contribution and update goal
    const { data, error } = await supabase.rpc('add_goal_contribution', {
      p_goal_id: goalId,
      p_amount: amount,
      p_description: description,
      p_contribution_type: contributionType,
    });

    if (error) throw new GoalsServiceError(error.message, error.code);
    return data;
  } catch (error) {
    console.error('Error adding contribution:', error);
    throw error;
  }
}

/**
 * Get contributions for a specific goal
 */
export async function getGoalContributions(goalId: string): Promise<GoalContribution[]> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new GoalsServiceError('User not authenticated');
    }

    const { data, error } = await supabase
      .from('goal_contributions')
      .select('*')
      .eq('goal_id', goalId)
      .eq('user_id', user.id)
      .order('contribution_date', { ascending: false });

    if (error) throw new GoalsServiceError(error.message, error.code);
    return data || [];
  } catch (error) {
    console.error('Error fetching contributions:', error);
    throw error;
  }
}

/**
 * Update goal current amount directly
 */
export async function updateGoalAmount(
  goalId: string,
  newAmount: number
): Promise<FinancialGoal> {
  return updateGoal(goalId, { current_amount: newAmount });
}

// =====================================================
// Goal Templates
// =====================================================

/**
 * Get all active goal templates
 */
export async function getGoalTemplates(): Promise<GoalTemplate[]> {
  try {
    const { data, error } = await supabase
      .from('goal_templates')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw new GoalsServiceError(error.message, error.code);
    return data || [];
  } catch (error) {
    console.error('Error fetching goal templates:', error);
    throw error;
  }
}

/**
 * Get popular goal templates
 */
export async function getPopularTemplates(): Promise<GoalTemplate[]> {
  try {
    const { data, error } = await supabase
      .from('goal_templates')
      .select('*')
      .eq('is_active', true)
      .eq('is_popular', true)
      .order('display_order', { ascending: true });

    if (error) throw new GoalsServiceError(error.message, error.code);
    return data || [];
  } catch (error) {
    console.error('Error fetching popular templates:', error);
    throw error;
  }
}

/**
 * Create goal from template
 */
export async function createGoalFromTemplate(
  templateId: string,
  customizations?: Partial<FinancialGoal>
): Promise<FinancialGoal> {
  try {
    const { data: template, error: templateError } = await supabase
      .from('goal_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError) throw new GoalsServiceError(templateError.message, templateError.code);

    const goalData: any = {
      name: template.name,
      description: template.description,
      emoji: template.emoji,
      color: template.color,
      target_amount: template.suggested_target_amount || 1000,
      current_amount: 0,
      goal_type: template.goal_type || 'savings',
      category: template.category,
      motivation: template.motivation_template,
      priority: 'medium',
      status: 'active',
      ...customizations,
    };

    // Calculate target date if timeframe is provided
    if (template.suggested_timeframe_months && !customizations?.target_date) {
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() + template.suggested_timeframe_months);
      goalData.target_date = targetDate.toISOString().split('T')[0];
    }

    return createGoal(goalData);
  } catch (error) {
    console.error('Error creating goal from template:', error);
    throw error;
  }
}

// =====================================================
// Progress Tracking
// =====================================================

/**
 * Get goal statistics
 */
export async function getGoalStats(): Promise<{
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  totalTargetAmount: number;
  totalCurrentAmount: number;
  overallProgress: number;
}> {
  try {
    const goals = await getAllGoals(false);

    const stats = {
      totalGoals: goals.length,
      activeGoals: goals.filter(g => g.status === 'active').length,
      completedGoals: goals.filter(g => g.status === 'completed').length,
      totalTargetAmount: goals.reduce((sum, g) => sum + g.target_amount, 0),
      totalCurrentAmount: goals.reduce((sum, g) => sum + g.current_amount, 0),
      overallProgress: 0,
    };

    if (stats.totalTargetAmount > 0) {
      stats.overallProgress = (stats.totalCurrentAmount / stats.totalTargetAmount) * 100;
    }

    return stats;
  } catch (error) {
    console.error('Error calculating goal stats:', error);
    throw error;
  }
}

/**
 * Check and update milestone achievements
 */
export async function checkMilestones(goalId: string): Promise<FinancialGoal> {
  try {
    const goal = await getGoalById(goalId);
    
    if (!goal.milestones || goal.milestones.length === 0) {
      return goal;
    }

    let updated = false;
    const updatedMilestones = goal.milestones.map(milestone => {
      if (!milestone.achieved && goal.current_amount >= milestone.amount) {
        updated = true;
        return {
          ...milestone,
          achieved: true,
          achieved_date: new Date().toISOString(),
        };
      }
      return milestone;
    });

    if (updated) {
      return updateGoal(goalId, { milestones: updatedMilestones });
    }

    return goal;
  } catch (error) {
    console.error('Error checking milestones:', error);
    throw error;
  }
}

// =====================================================
// Savings Calculator
// =====================================================

/**
 * Calculate monthly contribution needed to reach goal
 */
export async function calculateMonthlyContribution(
  targetAmount: number,
  currentAmount: number,
  targetDate: Date,
  interestRate = 0
): Promise<SavingsCalculation> {
  const today = new Date();
  const months = Math.max(
    1,
    (targetDate.getFullYear() - today.getFullYear()) * 12 +
      (targetDate.getMonth() - today.getMonth())
  );

  const remainingAmount = targetAmount - currentAmount;

  let monthlyContribution: number;
  let interestEarned = 0;

  if (interestRate > 0) {
    // Calculate with compound interest
    const monthlyRate = interestRate / 12 / 100;
    const futureValue = targetAmount;
    const presentValue = currentAmount;

    // FV = PV(1+r)^n + PMT * [((1+r)^n - 1) / r]
    // Solve for PMT
    const compoundedPV = presentValue * Math.pow(1 + monthlyRate, months);
    const numerator = futureValue - compoundedPV;
    const denominator = (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
    
    monthlyContribution = numerator / denominator;
    interestEarned = futureValue - presentValue - (monthlyContribution * months);
  } else {
    // Simple calculation without interest
    monthlyContribution = remainingAmount / months;
  }

  return {
    monthlyContribution: Math.max(0, monthlyContribution),
    totalMonths: months,
    targetAmount,
    currentAmount,
    projectedCompletionDate: targetDate,
    interestEarned: interestRate > 0 ? interestEarned : undefined,
  };
}

/**
 * Calculate projected completion date based on monthly contribution
 */
export function calculateCompletionDate(
  targetAmount: number,
  currentAmount: number,
  monthlyContribution: number,
  interestRate = 0
): Date {
  if (monthlyContribution <= 0) {
    throw new GoalsServiceError('Monthly contribution must be greater than 0');
  }

  const remainingAmount = targetAmount - currentAmount;

  let months: number;

  if (interestRate > 0) {
    // Calculate with compound interest
    const monthlyRate = interestRate / 12 / 100;
    
    // FV = PV(1+r)^n + PMT * [((1+r)^n - 1) / r]
    // Solve for n
    const pv = currentAmount;
    const fv = targetAmount;
    const pmt = monthlyContribution;
    
    // Using logarithms to solve for n
    months = Math.log((fv * monthlyRate + pmt) / (pv * monthlyRate + pmt)) / Math.log(1 + monthlyRate);
  } else {
    // Simple calculation without interest
    months = remainingAmount / monthlyContribution;
  }

  const completionDate = new Date();
  completionDate.setMonth(completionDate.getMonth() + Math.ceil(months));

  return completionDate;
}

/**
 * Get savings scenarios with different contribution amounts
 */
export async function getSavingsScenarios(
  targetAmount: number,
  currentAmount: number,
  targetDate: Date
): Promise<SavingsCalculation[]> {
  const baseCalculation = await calculateMonthlyContribution(
    targetAmount,
    currentAmount,
    targetDate
  );

  const scenarios: SavingsCalculation[] = [
    // 75% of recommended
    await calculateMonthlyContribution(
      targetAmount,
      currentAmount,
      targetDate
    ),
  ];

  // Add additional scenarios with different timelines
  const shortDate = new Date(targetDate);
  shortDate.setMonth(shortDate.getMonth() - 6);
  
  const longDate = new Date(targetDate);
  longDate.setMonth(longDate.getMonth() + 6);

  if (shortDate > new Date()) {
    scenarios.push(
      await calculateMonthlyContribution(targetAmount, currentAmount, shortDate)
    );
  }

  scenarios.push(
    await calculateMonthlyContribution(targetAmount, currentAmount, longDate)
  );

  return scenarios;
}

