import { supabase } from '@/lib/supabase';
import { RecurringTransaction, RecurringTransactionInsert, RecurringTransactionUpdate, TransactionInsert } from '@/types/database';

/**
 * Recurring Transaction Service Layer
 * Handles all recurring transaction-related operations with Supabase
 */

// Custom error class
export class RecurringTransactionServiceError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'RecurringTransactionServiceError';
  }
}

// Service response type
export interface ServiceResponse<T> {
  data: T | null;
  error: RecurringTransactionServiceError | null;
}

/**
 * Create a new recurring transaction
 */
export async function createRecurringTransaction(
  userId: string,
  type: 'income' | 'expense',
  category: string,
  amount: number,
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly',
  startDate: string,
  description?: string,
  endDate?: string | null,
  notificationEnabled?: boolean,
  notificationDaysBefore?: number
): Promise<ServiceResponse<RecurringTransaction>> {
  try {
    // Validate inputs
    if (!userId) {
      throw new RecurringTransactionServiceError('User ID is required', 'INVALID_USER_ID');
    }
    
    if (!category || category.trim().length === 0) {
      throw new RecurringTransactionServiceError('Category is required', 'INVALID_CATEGORY');
    }
    
    if (amount <= 0) {
      throw new RecurringTransactionServiceError('Amount must be greater than 0', 'INVALID_AMOUNT');
    }
    
    if (!['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'].includes(frequency)) {
      throw new RecurringTransactionServiceError('Invalid frequency', 'INVALID_FREQUENCY');
    }
    
    if (!startDate || !isValidDate(startDate)) {
      throw new RecurringTransactionServiceError('Valid start date is required (YYYY-MM-DD)', 'INVALID_DATE');
    }

    // Calculate next occurrence date
    const nextOccurrenceDate = calculateNextOccurrence(startDate, frequency);

    const recurringData: RecurringTransactionInsert = {
      user_id: userId,
      type,
      category: category.trim(),
      amount,
      description: description || null,
      frequency,
      start_date: startDate,
      end_date: endDate || null,
      next_occurrence_date: nextOccurrenceDate,
      is_active: true,
      notification_enabled: notificationEnabled ?? true,
      notification_days_before: notificationDaysBefore ?? 1,
    };

    const { data, error } = await supabase
      .from('recurring_transactions')
      .insert(recurringData)
      .select()
      .single();

    if (error) {
      throw new RecurringTransactionServiceError(
        `Failed to create recurring transaction: ${error.message}`,
        error.code,
        error
      );
    }

    return { data, error: null };
  } catch (error) {
    if (error instanceof RecurringTransactionServiceError) {
      return { data: null, error };
    }
    
    return {
      data: null,
      error: new RecurringTransactionServiceError(
        'An unexpected error occurred while creating recurring transaction',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

/**
 * Get all recurring transactions for a specific user
 */
export async function getUserRecurringTransactions(
  userId: string
): Promise<ServiceResponse<RecurringTransaction[]>> {
  try {
    if (!userId) {
      throw new RecurringTransactionServiceError('User ID is required', 'INVALID_USER_ID');
    }

    const { data, error } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new RecurringTransactionServiceError(
        `Failed to fetch recurring transactions: ${error.message}`,
        error.code,
        error
      );
    }

    return { data: data || [], error: null };
  } catch (error) {
    if (error instanceof RecurringTransactionServiceError) {
      return { data: null, error };
    }
    
    return {
      data: null,
      error: new RecurringTransactionServiceError(
        'An unexpected error occurred while fetching recurring transactions',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

/**
 * Get a single recurring transaction by ID
 */
export async function getRecurringTransactionById(
  recurringId: string
): Promise<ServiceResponse<RecurringTransaction>> {
  try {
    if (!recurringId) {
      throw new RecurringTransactionServiceError('Recurring transaction ID is required', 'INVALID_ID');
    }

    const { data, error } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('id', recurringId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new RecurringTransactionServiceError('Recurring transaction not found', 'NOT_FOUND', error);
      }
      throw new RecurringTransactionServiceError(
        `Failed to fetch recurring transaction: ${error.message}`,
        error.code,
        error
      );
    }

    return { data, error: null };
  } catch (error) {
    if (error instanceof RecurringTransactionServiceError) {
      return { data: null, error };
    }
    
    return {
      data: null,
      error: new RecurringTransactionServiceError(
        'An unexpected error occurred while fetching recurring transaction',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

/**
 * Update a recurring transaction
 */
export async function updateRecurringTransaction(
  recurringId: string,
  updates: RecurringTransactionUpdate
): Promise<ServiceResponse<RecurringTransaction>> {
  try {
    if (!recurringId) {
      throw new RecurringTransactionServiceError('Recurring transaction ID is required', 'INVALID_ID');
    }

    // Validate updates if provided
    if (updates.amount !== undefined && updates.amount <= 0) {
      throw new RecurringTransactionServiceError('Amount must be greater than 0', 'INVALID_AMOUNT');
    }
    
    if (updates.category !== undefined && updates.category.trim().length === 0) {
      throw new RecurringTransactionServiceError('Category cannot be empty', 'INVALID_CATEGORY');
    }

    const { data, error } = await supabase
      .from('recurring_transactions')
      .update(updates)
      .eq('id', recurringId)
      .select()
      .single();

    if (error) {
      throw new RecurringTransactionServiceError(
        `Failed to update recurring transaction: ${error.message}`,
        error.code,
        error
      );
    }

    if (!data) {
      throw new RecurringTransactionServiceError('Recurring transaction not found or access denied', 'NOT_FOUND');
    }

    return { data, error: null };
  } catch (error) {
    if (error instanceof RecurringTransactionServiceError) {
      return { data: null, error };
    }
    
    return {
      data: null,
      error: new RecurringTransactionServiceError(
        'An unexpected error occurred while updating recurring transaction',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

/**
 * Delete a recurring transaction
 */
export async function deleteRecurringTransaction(
  recurringId: string
): Promise<ServiceResponse<{ success: true }>> {
  try {
    if (!recurringId) {
      throw new RecurringTransactionServiceError('Recurring transaction ID is required', 'INVALID_ID');
    }

    const { error } = await supabase
      .from('recurring_transactions')
      .delete()
      .eq('id', recurringId);

    if (error) {
      throw new RecurringTransactionServiceError(
        `Failed to delete recurring transaction: ${error.message}`,
        error.code,
        error
      );
    }

    return { data: { success: true }, error: null };
  } catch (error) {
    if (error instanceof RecurringTransactionServiceError) {
      return { data: null, error };
    }
    
    return {
      data: null,
      error: new RecurringTransactionServiceError(
        'An unexpected error occurred while deleting recurring transaction',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

/**
 * Toggle active status of a recurring transaction
 */
export async function toggleRecurringTransactionStatus(
  recurringId: string,
  isActive: boolean
): Promise<ServiceResponse<RecurringTransaction>> {
  return updateRecurringTransaction(recurringId, { is_active: isActive });
}

/**
 * Get active recurring transactions that are due (next_occurrence_date <= today)
 */
export async function getDueRecurringTransactions(
  userId: string
): Promise<ServiceResponse<RecurringTransaction[]>> {
  try {
    if (!userId) {
      throw new RecurringTransactionServiceError('User ID is required', 'INVALID_USER_ID');
    }

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .lte('next_occurrence_date', today);

    if (error) {
      throw new RecurringTransactionServiceError(
        `Failed to fetch due recurring transactions: ${error.message}`,
        error.code,
        error
      );
    }

    return { data: data || [], error: null };
  } catch (error) {
    if (error instanceof RecurringTransactionServiceError) {
      return { data: null, error };
    }
    
    return {
      data: null,
      error: new RecurringTransactionServiceError(
        'An unexpected error occurred while fetching due recurring transactions',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

/**
 * Process a recurring transaction (create actual transaction and update next occurrence)
 */
export async function processRecurringTransaction(
  recurring: RecurringTransaction
): Promise<ServiceResponse<{ transaction: TransactionInsert; updatedRecurring: RecurringTransaction }>> {
  try {
    // Create the actual transaction
    const transactionData: TransactionInsert = {
      user_id: recurring.user_id,
      type: recurring.type,
      category: recurring.category,
      amount: recurring.amount,
      description: recurring.description || `Recurring: ${recurring.category}`,
      date: recurring.next_occurrence_date,
    };

    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select()
      .single();

    if (transactionError) {
      throw new RecurringTransactionServiceError(
        `Failed to create transaction from recurring: ${transactionError.message}`,
        transactionError.code,
        transactionError
      );
    }

    // Calculate next occurrence
    const nextOccurrence = calculateNextOccurrence(recurring.next_occurrence_date, recurring.frequency);
    
    // Check if end_date is reached
    const shouldDeactivate = recurring.end_date && nextOccurrence > recurring.end_date;

    // Update recurring transaction
    const { data: updatedRecurring, error: updateError } = await supabase
      .from('recurring_transactions')
      .update({
        next_occurrence_date: nextOccurrence,
        last_processed_date: recurring.next_occurrence_date,
        is_active: shouldDeactivate ? false : recurring.is_active,
      })
      .eq('id', recurring.id)
      .select()
      .single();

    if (updateError) {
      throw new RecurringTransactionServiceError(
        `Failed to update recurring transaction after processing: ${updateError.message}`,
        updateError.code,
        updateError
      );
    }

    return { data: { transaction, updatedRecurring }, error: null };
  } catch (error) {
    if (error instanceof RecurringTransactionServiceError) {
      return { data: null, error };
    }
    
    return {
      data: null,
      error: new RecurringTransactionServiceError(
        'An unexpected error occurred while processing recurring transaction',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

// Helper function: Validate date format (YYYY-MM-DD)
function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false;
  }
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

// Helper function: Calculate next occurrence date based on frequency
export function calculateNextOccurrence(
  currentDate: string,
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'
): string {
  const date = new Date(currentDate);
  
  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'biweekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  
  return date.toISOString().split('T')[0];
}

// Helper function: Format frequency for display
export function formatFrequency(frequency: string): string {
  const frequencyMap: Record<string, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    biweekly: 'Bi-weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Yearly',
  };
  
  return frequencyMap[frequency] || frequency;
}

