import { BudgetInsert, BudgetUpdate } from '@/types/database';
import { supabase } from './supabase';

/**
 * Budget service functions for interacting with the budgets table
 */

/**
 * Get all budgets for the current user
 */
export async function getAllBudgets() {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching budgets:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Get budgets filtered by period
 */
export async function getBudgetsByPeriod(period: 'weekly' | 'monthly' | 'yearly') {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('period', period)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching budgets by period:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Get a single budget by ID
 */
export async function getBudgetById(id: string) {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching budget:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Get budget for a specific category
 */
export async function getBudgetByCategory(category: string) {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching budget by category:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Create a new budget
 */
export async function createBudget(budget: Omit<BudgetInsert, 'user_id'>) {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: null, error: new Error('User not authenticated') };
  }

  const { data, error } = await supabase
    .from('budgets')
    .insert({
      ...budget,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating budget:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Update an existing budget
 */
export async function updateBudget(id: string, updates: BudgetUpdate) {
  const { data, error } = await supabase
    .from('budgets')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating budget:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Delete a budget
 */
export async function deleteBudget(id: string) {
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting budget:', error);
    return { success: false, error };
  }

  return { success: true, error: null };
}

/**
 * Check if a budget exists for a category and period
 */
export async function budgetExists(category: string, period: 'weekly' | 'monthly' | 'yearly') {
  const { data, error } = await supabase
    .from('budgets')
    .select('id')
    .eq('category', category)
    .eq('period', period)
    .limit(1);

  if (error) {
    console.error('Error checking budget existence:', error);
    return false;
  }

  return data && data.length > 0;
}

/**
 * Get active budgets (budgets that include today's date)
 */
export async function getActiveBudgets() {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .lte('start_date', today)
    .order('start_date', { ascending: false });

  if (error) {
    console.error('Error fetching active budgets:', error);
    return { data: null, error };
  }

  // Filter budgets that are still active based on period
  const activeBudgets = data?.filter((budget) => {
    const startDate = new Date(budget.start_date);
    const currentDate = new Date();
    
    switch (budget.period) {
      case 'weekly': {
        const weekInMs = 7 * 24 * 60 * 60 * 1000;
        const endDate = new Date(startDate.getTime() + weekInMs);
        return currentDate >= startDate && currentDate <= endDate;
      }
      case 'monthly': {
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        return currentDate >= startDate && currentDate <= endDate;
      }
      case 'yearly': {
        const endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + 1);
        return currentDate >= startDate && currentDate <= endDate;
      }
      default:
        return false;
    }
  });

  return { data: activeBudgets, error: null };
}

