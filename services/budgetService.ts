import { supabase } from '@/lib/supabase';
import { Budget, BudgetInsert, BudgetUpdate } from '@/types/database';

/**
 * Budget Service Layer
 * Handles all budget-related operations with Supabase
 */

// Custom error class for budget operations
export class BudgetServiceError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'BudgetServiceError';
  }
}

// Service response type
export interface ServiceResponse<T> {
  data: T | null;
  error: BudgetServiceError | null;
}

/**
 * Create a new budget
 * @param userId - User ID (from auth.users)
 * @param category - Expense category name
 * @param limitAmount - Budget limit amount
 * @param period - Budget period ('weekly', 'monthly', or 'yearly')
 * @param startDate - Budget start date (YYYY-MM-DD format)
 * @returns Created budget object or error
 */
export async function createBudget(
  userId: string,
  category: string,
  limitAmount: number,
  period: 'weekly' | 'monthly' | 'yearly',
  startDate: string
): Promise<ServiceResponse<Budget>> {
  try {
    // Validate inputs
    if (!userId) {
      throw new BudgetServiceError('User ID is required', 'INVALID_USER_ID');
    }
    
    if (!category || category.trim().length === 0) {
      throw new BudgetServiceError('Category is required', 'INVALID_CATEGORY');
    }
    
    if (limitAmount <= 0) {
      throw new BudgetServiceError('Limit amount must be greater than 0', 'INVALID_AMOUNT');
    }
    
    if (!['weekly', 'monthly', 'yearly'].includes(period)) {
      throw new BudgetServiceError('Period must be weekly, monthly, or yearly', 'INVALID_PERIOD');
    }
    
    if (!startDate || !isValidDate(startDate)) {
      throw new BudgetServiceError('Valid start date is required (YYYY-MM-DD)', 'INVALID_DATE');
    }

    const budgetData: BudgetInsert = {
      user_id: userId,
      category: category.trim(),
      limit_amount: limitAmount,
      period,
      start_date: startDate,
    };

    const { data, error } = await supabase
      .from('budgets')
      .insert(budgetData)
      .select()
      .single();

    if (error) {
      throw new BudgetServiceError(
        `Failed to create budget: ${error.message}`,
        error.code,
        error
      );
    }

    return { data, error: null };
  } catch (error) {
    if (error instanceof BudgetServiceError) {
      return { data: null, error };
    }
    
    return {
      data: null,
      error: new BudgetServiceError(
        'An unexpected error occurred while creating budget',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

/**
 * Get all budgets for a specific user
 * @param userId - User ID to fetch budgets for
 * @returns Array of budgets sorted by creation date (newest first) or error
 */
export async function getUserBudgets(
  userId: string
): Promise<ServiceResponse<Budget[]>> {
  try {
    if (!userId) {
      throw new BudgetServiceError('User ID is required', 'INVALID_USER_ID');
    }

    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new BudgetServiceError(
        `Failed to fetch user budgets: ${error.message}`,
        error.code,
        error
      );
    }

    return { data: data || [], error: null };
  } catch (error) {
    if (error instanceof BudgetServiceError) {
      return { data: null, error };
    }
    
    return {
      data: null,
      error: new BudgetServiceError(
        'An unexpected error occurred while fetching budgets',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

/**
 * Update an existing budget
 * Only allows updating: category, limit_amount, and period
 * @param budgetId - Budget ID to update
 * @param updates - Object containing fields to update
 * @returns Updated budget object or error
 */
export async function updateBudget(
  budgetId: string,
  updates: {
    category?: string;
    limit_amount?: number;
    period?: 'weekly' | 'monthly' | 'yearly';
  }
): Promise<ServiceResponse<Budget>> {
  try {
    if (!budgetId) {
      throw new BudgetServiceError('Budget ID is required', 'INVALID_BUDGET_ID');
    }

    // Validate updates
    const allowedUpdates: BudgetUpdate = {};
    
    if (updates.category !== undefined) {
      if (updates.category.trim().length === 0) {
        throw new BudgetServiceError('Category cannot be empty', 'INVALID_CATEGORY');
      }
      allowedUpdates.category = updates.category.trim();
    }
    
    if (updates.limit_amount !== undefined) {
      if (updates.limit_amount <= 0) {
        throw new BudgetServiceError('Limit amount must be greater than 0', 'INVALID_AMOUNT');
      }
      allowedUpdates.limit_amount = updates.limit_amount;
    }
    
    if (updates.period !== undefined) {
      if (!['weekly', 'monthly', 'yearly'].includes(updates.period)) {
        throw new BudgetServiceError('Period must be weekly, monthly, or yearly', 'INVALID_PERIOD');
      }
      allowedUpdates.period = updates.period;
    }

    // Check if there are any valid updates
    if (Object.keys(allowedUpdates).length === 0) {
      throw new BudgetServiceError('No valid updates provided', 'NO_UPDATES');
    }

    const { data, error } = await supabase
      .from('budgets')
      .update(allowedUpdates)
      .eq('id', budgetId)
      .select()
      .single();

    if (error) {
      throw new BudgetServiceError(
        `Failed to update budget: ${error.message}`,
        error.code,
        error
      );
    }

    if (!data) {
      throw new BudgetServiceError('Budget not found or access denied', 'NOT_FOUND');
    }

    return { data, error: null };
  } catch (error) {
    if (error instanceof BudgetServiceError) {
      return { data: null, error };
    }
    
    return {
      data: null,
      error: new BudgetServiceError(
        'An unexpected error occurred while updating budget',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

/**
 * Delete a budget (hard delete)
 * @param budgetId - Budget ID to delete
 * @returns Success status or error
 */
export async function deleteBudget(
  budgetId: string
): Promise<ServiceResponse<{ success: true }>> {
  try {
    if (!budgetId) {
      throw new BudgetServiceError('Budget ID is required', 'INVALID_BUDGET_ID');
    }

    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', budgetId);

    if (error) {
      throw new BudgetServiceError(
        `Failed to delete budget: ${error.message}`,
        error.code,
        error
      );
    }

    return { data: { success: true }, error: null };
  } catch (error) {
    if (error instanceof BudgetServiceError) {
      return { data: null, error };
    }
    
    return {
      data: null,
      error: new BudgetServiceError(
        'An unexpected error occurred while deleting budget',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

/**
 * Get a single budget by ID
 * @param budgetId - Budget ID to fetch
 * @returns Budget object or error
 */
export async function getBudgetById(
  budgetId: string
): Promise<ServiceResponse<Budget>> {
  try {
    if (!budgetId) {
      throw new BudgetServiceError('Budget ID is required', 'INVALID_BUDGET_ID');
    }

    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('id', budgetId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new BudgetServiceError('Budget not found', 'NOT_FOUND', error);
      }
      throw new BudgetServiceError(
        `Failed to fetch budget: ${error.message}`,
        error.code,
        error
      );
    }

    return { data, error: null };
  } catch (error) {
    if (error instanceof BudgetServiceError) {
      return { data: null, error };
    }
    
    return {
      data: null,
      error: new BudgetServiceError(
        'An unexpected error occurred while fetching budget',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

// Helper function to validate date format (YYYY-MM-DD)
function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false;
  }
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Additional helper function: Get budgets by period
 * @param userId - User ID
 * @param period - Period to filter by
 * @returns Filtered budgets or error
 */
export async function getBudgetsByPeriod(
  userId: string,
  period: 'weekly' | 'monthly' | 'yearly'
): Promise<ServiceResponse<Budget[]>> {
  try {
    if (!userId) {
      throw new BudgetServiceError('User ID is required', 'INVALID_USER_ID');
    }

    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('period', period)
      .order('created_at', { ascending: false });

    if (error) {
      throw new BudgetServiceError(
        `Failed to fetch budgets by period: ${error.message}`,
        error.code,
        error
      );
    }

    return { data: data || [], error: null };
  } catch (error) {
    if (error instanceof BudgetServiceError) {
      return { data: null, error };
    }
    
    return {
      data: null,
      error: new BudgetServiceError(
        'An unexpected error occurred while fetching budgets by period',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

/**
 * Additional helper function: Check if budget exists for category and period
 * @param userId - User ID
 * @param category - Category name
 * @param period - Period type
 * @returns Whether budget exists or error
 */
export async function budgetExistsForCategory(
  userId: string,
  category: string,
  period: 'weekly' | 'monthly' | 'yearly'
): Promise<ServiceResponse<boolean>> {
  try {
    if (!userId) {
      throw new BudgetServiceError('User ID is required', 'INVALID_USER_ID');
    }

    const { data, error } = await supabase
      .from('budgets')
      .select('id')
      .eq('user_id', userId)
      .eq('category', category.trim())
      .eq('period', period)
      .limit(1);

    if (error) {
      throw new BudgetServiceError(
        `Failed to check budget existence: ${error.message}`,
        error.code,
        error
      );
    }

    return { data: (data && data.length > 0) || false, error: null };
  } catch (error) {
    if (error instanceof BudgetServiceError) {
      return { data: null, error };
    }
    
    return {
      data: null,
      error: new BudgetServiceError(
        'An unexpected error occurred while checking budget existence',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

