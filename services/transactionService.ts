/**
 * Transaction Service
 * 
 * Handles all transaction-related database operations with Supabase.
 * Provides CRUD operations and filtering capabilities.
 */

import { supabase } from '@/lib/supabase';
import { Transaction, TransactionInsert, TransactionUpdate } from '@/types/database';

// ============================================================================
// Error Handling
// ============================================================================

export class TransactionServiceError extends Error {
  code: string;
  originalError?: any;

  constructor(message: string, code: string, originalError?: any) {
    super(message);
    this.name = 'TransactionServiceError';
    this.code = code;
    this.originalError = originalError;
  }
}

export interface ServiceResponse<T> {
  data: T | null;
  error: TransactionServiceError | null;
}

// ============================================================================
// Create Transaction
// ============================================================================

export async function createTransaction(
  transactionData: Omit<TransactionInsert, 'user_id'>,
  userId: string
): Promise<ServiceResponse<Transaction>> {
  try {
    if (!userId) {
      throw new TransactionServiceError('User ID is required', 'AUTH_ERROR');
    }

    if (!transactionData.category || !transactionData.amount || !transactionData.date) {
      throw new TransactionServiceError(
        'Category, amount, and date are required',
        'VALIDATION_ERROR'
      );
    }

    if (transactionData.amount <= 0) {
      throw new TransactionServiceError('Amount must be greater than 0', 'VALIDATION_ERROR');
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        ...transactionData,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      throw new TransactionServiceError(
        `Failed to create transaction: ${error.message}`,
        error.code,
        error
      );
    }

    return { data, error: null };
  } catch (error) {
    if (error instanceof TransactionServiceError) {
      return { data: null, error };
    }
    return {
      data: null,
      error: new TransactionServiceError(
        'An unexpected error occurred while creating transaction',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

// ============================================================================
// Get User Transactions
// ============================================================================

export interface GetTransactionsOptions {
  startDate?: string;
  endDate?: string;
  category?: string;
  type?: 'income' | 'expense';
  limit?: number;
  offset?: number;
}

export async function getUserTransactions(
  userId: string,
  options?: GetTransactionsOptions
): Promise<ServiceResponse<Transaction[]>> {
  try {
    if (!userId) {
      throw new TransactionServiceError('User ID is required', 'AUTH_ERROR');
    }

    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    // Apply filters
    if (options?.startDate) {
      query = query.gte('date', options.startDate);
    }
    if (options?.endDate) {
      query = query.lte('date', options.endDate);
    }
    if (options?.category) {
      query = query.eq('category', options.category);
    }
    if (options?.type) {
      query = query.eq('type', options.type);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new TransactionServiceError(
        `Failed to fetch transactions: ${error.message}`,
        error.code,
        error
      );
    }

    return { data: data || [], error: null };
  } catch (error) {
    if (error instanceof TransactionServiceError) {
      return { data: null, error };
    }
    return {
      data: null,
      error: new TransactionServiceError(
        'An unexpected error occurred while fetching transactions',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

// ============================================================================
// Get Transaction by ID
// ============================================================================

export async function getTransactionById(
  transactionId: string
): Promise<ServiceResponse<Transaction>> {
  try {
    if (!transactionId) {
      throw new TransactionServiceError('Transaction ID is required', 'INVALID_ID');
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new TransactionServiceError('Transaction not found', 'NOT_FOUND', error);
      }
      throw new TransactionServiceError(
        `Failed to fetch transaction: ${error.message}`,
        error.code,
        error
      );
    }

    return { data, error: null };
  } catch (error) {
    if (error instanceof TransactionServiceError) {
      return { data: null, error };
    }
    return {
      data: null,
      error: new TransactionServiceError(
        'An unexpected error occurred while fetching transaction',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

// ============================================================================
// Update Transaction
// ============================================================================

export async function updateTransaction(
  transactionId: string,
  updates: TransactionUpdate
): Promise<ServiceResponse<Transaction>> {
  try {
    if (!transactionId) {
      throw new TransactionServiceError('Transaction ID is required', 'INVALID_ID');
    }

    if (updates.amount !== undefined && updates.amount <= 0) {
      throw new TransactionServiceError('Amount must be greater than 0', 'VALIDATION_ERROR');
    }

    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', transactionId)
      .select()
      .single();

    if (error) {
      throw new TransactionServiceError(
        `Failed to update transaction: ${error.message}`,
        error.code,
        error
      );
    }

    return { data, error: null };
  } catch (error) {
    if (error instanceof TransactionServiceError) {
      return { data: null, error };
    }
    return {
      data: null,
      error: new TransactionServiceError(
        'An unexpected error occurred while updating transaction',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

// ============================================================================
// Delete Transaction
// ============================================================================

export async function deleteTransaction(
  transactionId: string
): Promise<ServiceResponse<null>> {
  try {
    if (!transactionId) {
      throw new TransactionServiceError('Transaction ID is required', 'INVALID_ID');
    }

    const { error } = await supabase.from('transactions').delete().eq('id', transactionId);

    if (error) {
      throw new TransactionServiceError(
        `Failed to delete transaction: ${error.message}`,
        error.code,
        error
      );
    }

    return { data: null, error: null };
  } catch (error) {
    if (error instanceof TransactionServiceError) {
      return { data: null, error };
    }
    return {
      data: null,
      error: new TransactionServiceError(
        'An unexpected error occurred while deleting transaction',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

// ============================================================================
// Get Transaction Categories
// ============================================================================

export async function getUserTransactionCategories(
  userId: string
): Promise<ServiceResponse<string[]>> {
  try {
    if (!userId) {
      throw new TransactionServiceError('User ID is required', 'AUTH_ERROR');
    }

    // Get distinct categories
    const { data, error } = await supabase
      .from('transactions')
      .select('category')
      .eq('user_id', userId)
      .order('category');

    if (error) {
      throw new TransactionServiceError(
        `Failed to fetch categories: ${error.message}`,
        error.code,
        error
      );
    }

    // Extract unique categories
    const categories = Array.from(
      new Set((data || []).map((item) => item.category).filter(Boolean))
    );

    return { data: categories, error: null };
  } catch (error) {
    if (error instanceof TransactionServiceError) {
      return { data: null, error };
    }
    return {
      data: null,
      error: new TransactionServiceError(
        'An unexpected error occurred while fetching categories',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

// ============================================================================
// Get Transaction Stats
// ============================================================================

export interface TransactionStats {
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  transactionCount: number;
}

export async function getTransactionStats(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<ServiceResponse<TransactionStats>> {
  try {
    if (!userId) {
      throw new TransactionServiceError('User ID is required', 'AUTH_ERROR');
    }

    let query = supabase
      .from('transactions')
      .select('amount, type')
      .eq('user_id', userId);

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw new TransactionServiceError(
        `Failed to fetch transaction stats: ${error.message}`,
        error.code,
        error
      );
    }

    const stats: TransactionStats = {
      totalIncome: 0,
      totalExpense: 0,
      netAmount: 0,
      transactionCount: data?.length || 0,
    };

    (data || []).forEach((txn) => {
      if (txn.type === 'income') {
        stats.totalIncome += txn.amount;
      } else {
        stats.totalExpense += txn.amount;
      }
    });

    stats.netAmount = stats.totalIncome - stats.totalExpense;

    return { data: stats, error: null };
  } catch (error) {
    if (error instanceof TransactionServiceError) {
      return { data: null, error };
    }
    return {
      data: null,
      error: new TransactionServiceError(
        'An unexpected error occurred while calculating stats',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

