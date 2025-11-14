/**
 * Transaction Context
 * 
 * Provides global state management for transactions.
 * Handles CRUD operations and filtering.
 */

import { supabase } from '@/lib/supabase';
import {
  createTransaction as createTransactionService,
  deleteTransaction as deleteTransactionService,
  getUserTransactions,
  getUserTransactionCategories,
  getTransactionStats,
  updateTransaction as updateTransactionService,
  GetTransactionsOptions,
  TransactionStats,
} from '@/services/transactionService';
import { Transaction, TransactionInsert, TransactionUpdate } from '@/types/database';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

// ============================================================================
// Context Type Definition
// ============================================================================

interface TransactionContextType {
  // State
  transactions: Transaction[];
  categories: string[];
  stats: TransactionStats | null;
  loading: boolean;
  error: string | null;

  // CRUD Operations
  createTransaction: (transactionData: Omit<TransactionInsert, 'user_id'>) => Promise<{
    success: boolean;
    transaction?: Transaction;
    error?: string;
  }>;
  updateTransaction: (transactionId: string, updates: TransactionUpdate) => Promise<{
    success: boolean;
    transaction?: Transaction;
    error?: string;
  }>;
  deleteTransaction: (transactionId: string) => Promise<{
    success: boolean;
    error?: string;
  }>;

  // Utility
  refreshTransactions: (options?: GetTransactionsOptions) => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshStats: (startDate?: string, endDate?: string) => Promise<void>;
}

// ============================================================================
// Context Creation
// ============================================================================

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

// ============================================================================
// Provider Component
// ============================================================================

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  // State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // ============================================================================
  // Get User ID from Supabase Auth
  // ============================================================================

  const getUserId = useCallback(async (): Promise<string | null> => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session?.user?.id || null;
    } catch (err) {
      console.error('Error getting user session:', err);
      return null;
    }
  }, []);

  // ============================================================================
  // Fetch Transactions
  // ============================================================================

  const fetchTransactions = useCallback(
    async (uid: string, options?: GetTransactionsOptions) => {
      setLoading(true);
      setError(null);

      try {
        const response = await getUserTransactions(uid, options);

        if (response.error) {
          throw new Error(response.error.message);
        }

        setTransactions(response.data || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transactions';
        console.error('Error fetching transactions:', err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ============================================================================
  // Fetch Categories
  // ============================================================================

  const fetchCategories = useCallback(async (uid: string) => {
    try {
      const response = await getUserTransactionCategories(uid);

      if (response.error) {
        console.error('Error fetching categories:', response.error.message);
        return;
      }

      setCategories(response.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  // ============================================================================
  // Fetch Stats
  // ============================================================================

  const fetchStats = useCallback(
    async (uid: string, startDate?: string, endDate?: string) => {
      try {
        const response = await getTransactionStats(uid, startDate, endDate);

        if (response.error) {
          console.error('Error fetching stats:', response.error.message);
          return;
        }

        setStats(response.data || null);
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    },
    []
  );

  // ============================================================================
  // Refresh Functions (Manual Reload)
  // ============================================================================

  const refreshTransactions = useCallback(
    async (options?: GetTransactionsOptions) => {
      const uid = userId || (await getUserId());
      if (uid) {
        await fetchTransactions(uid, options);
      }
    },
    [userId, getUserId, fetchTransactions]
  );

  const refreshCategories = useCallback(async () => {
    const uid = userId || (await getUserId());
    if (uid) {
      await fetchCategories(uid);
    }
  }, [userId, getUserId, fetchCategories]);

  const refreshStats = useCallback(
    async (startDate?: string, endDate?: string) => {
      const uid = userId || (await getUserId());
      if (uid) {
        await fetchStats(uid, startDate, endDate);
      }
    },
    [userId, getUserId, fetchStats]
  );

  // ============================================================================
  // Create Transaction
  // ============================================================================

  const createTransaction = useCallback(
    async (transactionData: Omit<TransactionInsert, 'user_id'>): Promise<{
      success: boolean;
      transaction?: Transaction;
      error?: string;
    }> => {
      try {
        const uid = userId || (await getUserId());
        if (!uid) {
          return { success: false, error: 'User not authenticated. Please log in.' };
        }

        const response = await createTransactionService(transactionData, uid);

        if (response.error) {
          return { success: false, error: response.error.message };
        }

        // Refresh transactions and categories
        await Promise.all([
          fetchTransactions(uid),
          fetchCategories(uid),
          fetchStats(uid),
        ]);

        return { success: true, transaction: response.data! };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        return { success: false, error: errorMessage };
      }
    },
    [userId, getUserId, fetchTransactions, fetchCategories, fetchStats]
  );

  // ============================================================================
  // Update Transaction
  // ============================================================================

  const updateTransaction = useCallback(
    async (transactionId: string, updates: TransactionUpdate): Promise<{
      success: boolean;
      transaction?: Transaction;
      error?: string;
    }> => {
      try {
        const response = await updateTransactionService(transactionId, updates);

        if (response.error) {
          return { success: false, error: response.error.message };
        }

        // Update local state
        setTransactions((prev) =>
          prev.map((t) => (t.id === transactionId ? response.data! : t))
        );

        // Refresh stats and categories
        const uid = userId || (await getUserId());
        if (uid) {
          await Promise.all([fetchCategories(uid), fetchStats(uid)]);
        }

        return { success: true, transaction: response.data! };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        return { success: false, error: errorMessage };
      }
    },
    [userId, getUserId, fetchCategories, fetchStats]
  );

  // ============================================================================
  // Delete Transaction
  // ============================================================================

  const deleteTransaction = useCallback(
    async (transactionId: string): Promise<{
      success: boolean;
      error?: string;
    }> => {
      try {
        const response = await deleteTransactionService(transactionId);

        if (response.error) {
          return { success: false, error: response.error.message };
        }

        // Update local state
        setTransactions((prev) => prev.filter((t) => t.id !== transactionId));

        // Refresh stats and categories
        const uid = userId || (await getUserId());
        if (uid) {
          await Promise.all([fetchCategories(uid), fetchStats(uid)]);
        }

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        return { success: false, error: errorMessage };
      }
    },
    [userId, getUserId, fetchCategories, fetchStats]
  );

  // ============================================================================
  // Initialize on Mount (Listen to Auth State)
  // ============================================================================

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: string, session) => {
      const uid = session?.user?.id || null;
      setUserId(uid);

      if (uid) {
        await Promise.all([
          fetchTransactions(uid),
          fetchCategories(uid),
          fetchStats(uid),
        ]);
      } else {
        // User logged out, clear data
        setTransactions([]);
        setCategories([]);
        setStats(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchTransactions, fetchCategories, fetchStats]);

  // ============================================================================
  // Context Value
  // ============================================================================

  const value: TransactionContextType = {
    // State
    transactions,
    categories,
    stats,
    loading,
    error,

    // Operations
    createTransaction,
    updateTransaction,
    deleteTransaction,

    // Utility
    refreshTransactions,
    refreshCategories,
    refreshStats,
  };

  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>;
}

// ============================================================================
// Custom Hook
// ============================================================================

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
}

