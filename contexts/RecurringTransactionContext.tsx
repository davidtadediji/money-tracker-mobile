import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  createRecurringTransaction as createRecurringTransactionService,
  deleteRecurringTransaction as deleteRecurringTransactionService,
  getUserRecurringTransactions,
  getRecurringTransactionById as getRecurringTransactionByIdService,
  updateRecurringTransaction as updateRecurringTransactionService,
  toggleRecurringTransactionStatus as toggleRecurringTransactionStatusService,
  getDueRecurringTransactions as getDueRecurringTransactionsService,
  processRecurringTransaction as processRecurringTransactionService,
} from '@/services/recurringTransactionService';
import { RecurringTransaction, RecurringTransactionUpdate } from '@/types/database';

/**
 * Recurring Transaction Context
 * Manages recurring transaction state and operations across the app
 */

interface RecurringTransactionContextType {
  recurringTransactions: RecurringTransaction[];
  loading: boolean;
  error: string | null;
  createRecurringTransaction: (
    type: 'income' | 'expense',
    category: string,
    amount: number,
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly',
    startDate: string,
    description?: string,
    endDate?: string | null,
    notificationEnabled?: boolean,
    notificationDaysBefore?: number
  ) => Promise<{ success: boolean; recurring?: RecurringTransaction; error?: string }>;
  updateRecurringTransaction: (
    recurringId: string,
    updates: RecurringTransactionUpdate
  ) => Promise<{ success: boolean; recurring?: RecurringTransaction; error?: string }>;
  deleteRecurringTransaction: (recurringId: string) => Promise<{ success: boolean; error?: string }>;
  toggleStatus: (recurringId: string, isActive: boolean) => Promise<{ success: boolean; error?: string }>;
  getRecurringTransactionById: (recurringId: string) => Promise<{ success: boolean; recurring?: RecurringTransaction; error?: string }>;
  getDueTransactions: () => Promise<{ success: boolean; transactions?: RecurringTransaction[]; error?: string }>;
  processRecurring: (recurring: RecurringTransaction) => Promise<{ success: boolean; error?: string }>;
  refreshRecurringTransactions: () => Promise<void>;
}

const RecurringTransactionContext = createContext<RecurringTransactionContextType | undefined>(undefined);

export function RecurringTransactionProvider({ children }: { children: React.ReactNode }) {
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Get user ID from auth session
  const getUserId = useCallback(async (): Promise<string | null> => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        return null;
      }
      
      return session?.user?.id || null;
    } catch (error) {
      console.error('Error in getUserId:', error);
      return null;
    }
  }, []);

  // Fetch recurring transactions
  const fetchRecurringTransactions = useCallback(async (uid: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await getUserRecurringTransactions(uid);
      
      if (fetchError) {
        setError(fetchError.message);
        setRecurringTransactions([]);
      } else {
        setRecurringTransactions(data || []);
      }
    } catch (err) {
      setError('Failed to fetch recurring transactions');
      console.error(err);
      setRecurringTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize: Get user ID and fetch recurring transactions
  useEffect(() => {
    let isMounted = true;

    const initializeRecurringTransactions = async () => {
      const uid = await getUserId();
      
      if (isMounted && uid) {
        setUserId(uid);
        await fetchRecurringTransactions(uid);
      } else {
        if (isMounted) {
          setLoading(false);
          setError('User not authenticated');
        }
      }
    };

    initializeRecurringTransactions();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isMounted) {
        const newUserId = session?.user?.id || null;
        setUserId(newUserId);

        if (newUserId) {
          await fetchRecurringTransactions(newUserId);
        } else {
          setRecurringTransactions([]);
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [getUserId, fetchRecurringTransactions]);

  // Refresh recurring transactions
  const refreshRecurringTransactions = useCallback(async () => {
    const uid = userId || await getUserId();
    if (uid) {
      await fetchRecurringTransactions(uid);
    }
  }, [userId, getUserId, fetchRecurringTransactions]);

  // Create recurring transaction
  const createRecurringTransaction = useCallback(async (
    type: 'income' | 'expense',
    category: string,
    amount: number,
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly',
    startDate: string,
    description?: string,
    endDate?: string | null,
    notificationEnabled?: boolean,
    notificationDaysBefore?: number
  ) => {
    try {
      const uid = userId || await getUserId();
      if (!uid) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error: createError } = await createRecurringTransactionService(
        uid,
        type,
        category,
        amount,
        frequency,
        startDate,
        description,
        endDate,
        notificationEnabled,
        notificationDaysBefore
      );

      if (createError) {
        return { success: false, error: createError.message };
      }

      // Refresh the list
      await refreshRecurringTransactions();

      return { success: true, recurring: data || undefined };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to create recurring transaction' };
    }
  }, [userId, getUserId, refreshRecurringTransactions]);

  // Update recurring transaction
  const updateRecurringTransaction = useCallback(async (
    recurringId: string,
    updates: RecurringTransactionUpdate
  ) => {
    try {
      const { data, error: updateError } = await updateRecurringTransactionService(recurringId, updates);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      // Refresh the list
      await refreshRecurringTransactions();

      return { success: true, recurring: data || undefined };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update recurring transaction' };
    }
  }, [refreshRecurringTransactions]);

  // Delete recurring transaction
  const deleteRecurringTransaction = useCallback(async (recurringId: string) => {
    try {
      const { error: deleteError } = await deleteRecurringTransactionService(recurringId);

      if (deleteError) {
        return { success: false, error: deleteError.message };
      }

      // Refresh the list
      await refreshRecurringTransactions();

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to delete recurring transaction' };
    }
  }, [refreshRecurringTransactions]);

  // Toggle recurring transaction status
  const toggleStatus = useCallback(async (recurringId: string, isActive: boolean) => {
    try {
      const { error: toggleError } = await toggleRecurringTransactionStatusService(recurringId, isActive);

      if (toggleError) {
        return { success: false, error: toggleError.message };
      }

      // Refresh the list
      await refreshRecurringTransactions();

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to toggle recurring transaction status' };
    }
  }, [refreshRecurringTransactions]);

  // Get recurring transaction by ID
  const getRecurringTransactionById = useCallback(async (recurringId: string) => {
    try {
      const { data, error: fetchError } = await getRecurringTransactionByIdService(recurringId);

      if (fetchError) {
        return { success: false, error: fetchError.message };
      }

      return { success: true, recurring: data || undefined };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to fetch recurring transaction' };
    }
  }, []);

  // Get due transactions
  const getDueTransactions = useCallback(async () => {
    try {
      const uid = userId || await getUserId();
      if (!uid) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error: fetchError } = await getDueRecurringTransactionsService(uid);

      if (fetchError) {
        return { success: false, error: fetchError.message };
      }

      return { success: true, transactions: data || [] };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to fetch due transactions' };
    }
  }, [userId, getUserId]);

  // Process recurring transaction (create actual transaction)
  const processRecurring = useCallback(async (recurring: RecurringTransaction) => {
    try {
      const { error: processError } = await processRecurringTransactionService(recurring);

      if (processError) {
        return { success: false, error: processError.message };
      }

      // Refresh the list
      await refreshRecurringTransactions();

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to process recurring transaction' };
    }
  }, [refreshRecurringTransactions]);

  const value = useMemo(() => ({
    recurringTransactions,
    loading,
    error,
    createRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    toggleStatus,
    getRecurringTransactionById,
    getDueTransactions,
    processRecurring,
    refreshRecurringTransactions,
  }), [
    recurringTransactions,
    loading,
    error,
    createRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    toggleStatus,
    getRecurringTransactionById,
    getDueTransactions,
    processRecurring,
    refreshRecurringTransactions,
  ]);

  return (
    <RecurringTransactionContext.Provider value={value}>
      {children}
    </RecurringTransactionContext.Provider>
  );
}

export function useRecurringTransaction() {
  const context = useContext(RecurringTransactionContext);
  if (context === undefined) {
    throw new Error('useRecurringTransaction must be used within a RecurringTransactionProvider');
  }
  return context;
}

