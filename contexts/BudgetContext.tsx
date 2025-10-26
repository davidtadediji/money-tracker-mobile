import { supabase } from '@/lib/supabase';
import {
    createBudget as createBudgetService,
    deleteBudget as deleteBudgetService,
    getUserBudgets,
    updateBudget as updateBudgetService,
} from '@/services/budgetService';
import { Budget } from '@/types/database';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

/**
 * Budget Context
 * Manages budget state and operations across the app
 */

interface BudgetContextType {
  budgets: Budget[];
  loading: boolean;
  error: string | null;
  createBudget: (
    category: string,
    limitAmount: number,
    period: 'weekly' | 'monthly' | 'yearly',
    startDate: string
  ) => Promise<{ success: boolean; budget?: Budget; error?: string }>;
  updateBudget: (
    budgetId: string,
    updates: {
      category?: string;
      limit_amount?: number;
      period?: 'weekly' | 'monthly' | 'yearly';
    }
  ) => Promise<{ success: boolean; budget?: Budget; error?: string }>;
  deleteBudget: (budgetId: string) => Promise<{ success: boolean; error?: string }>;
  refreshBudgets: () => Promise<void>;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

/**
 * Budget Provider Component
 * Wraps the app to provide budget state and operations
 */
export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Get user ID from Supabase auth
  const getUserId = useCallback(async (): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('User not authenticated');
        return null;
      }
      
      return user.id;
    } catch (err) {
      console.error('Error getting user:', err);
      setError('Failed to authenticate user');
      return null;
    }
  }, []);

  // Fetch budgets from the service
  const fetchBudgets = useCallback(async (uid: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await getUserBudgets(uid);

      if (fetchError) {
        setError(fetchError.message);
        console.error('Error fetching budgets:', fetchError);
      } else {
        setBudgets(data || []);
      }
    } catch (err) {
      console.error('Unexpected error fetching budgets:', err);
      setError('An unexpected error occurred while fetching budgets');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh budgets (public API)
  const refreshBudgets = useCallback(async () => {
    const uid = userId || await getUserId();
    if (!uid) return;
    
    await fetchBudgets(uid);
  }, [userId, getUserId, fetchBudgets]);

  // Initialize: get user and fetch budgets on mount
  useEffect(() => {
    const initialize = async () => {
      const uid = await getUserId();
      if (uid) {
        setUserId(uid);
        await fetchBudgets(uid);
      } else {
        setLoading(false);
      }
    };

    initialize();
  }, [getUserId, fetchBudgets]);

  // Subscribe to auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUserId(session.user.id);
          await fetchBudgets(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUserId(null);
          setBudgets([]);
          setError(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchBudgets]);

  // Create budget
  const createBudget = useCallback(
    async (
      category: string,
      limitAmount: number,
      period: 'weekly' | 'monthly' | 'yearly',
      startDate: string
    ): Promise<{ success: boolean; budget?: Budget; error?: string }> => {
      try {
        const uid = userId || await getUserId();
        
        if (!uid) {
          return { success: false, error: 'User not authenticated' };
        }

        const { data, error: createError } = await createBudgetService(
          uid,
          category,
          limitAmount,
          period,
          startDate
        );

        if (createError) {
          return { success: false, error: createError.message };
        }

        if (data) {
          // Add to local state
          setBudgets((prev) => [data, ...prev]);
          return { success: true, budget: data };
        }

        return { success: false, error: 'No data returned' };
      } catch (err) {
        console.error('Unexpected error creating budget:', err);
        return { success: false, error: 'An unexpected error occurred' };
      }
    },
    [userId, getUserId]
  );

  // Update budget
  const updateBudget = useCallback(
    async (
      budgetId: string,
      updates: {
        category?: string;
        limit_amount?: number;
        period?: 'weekly' | 'monthly' | 'yearly';
      }
    ): Promise<{ success: boolean; budget?: Budget; error?: string }> => {
      try {
        const { data, error: updateError } = await updateBudgetService(budgetId, updates);

        if (updateError) {
          return { success: false, error: updateError.message };
        }

        if (data) {
          // Update in local state
          setBudgets((prev) =>
            prev.map((budget) => (budget.id === budgetId ? data : budget))
          );
          return { success: true, budget: data };
        }

        return { success: false, error: 'No data returned' };
      } catch (err) {
        console.error('Unexpected error updating budget:', err);
        return { success: false, error: 'An unexpected error occurred' };
      }
    },
    []
  );

  // Delete budget
  const deleteBudget = useCallback(
    async (budgetId: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const { data, error: deleteError } = await deleteBudgetService(budgetId);

        if (deleteError) {
          return { success: false, error: deleteError.message };
        }

        if (data?.success) {
          // Remove from local state
          setBudgets((prev) => prev.filter((budget) => budget.id !== budgetId));
          return { success: true };
        }

        return { success: false, error: 'Failed to delete budget' };
      } catch (err) {
        console.error('Unexpected error deleting budget:', err);
        return { success: false, error: 'An unexpected error occurred' };
      }
    },
    []
  );

  const value: BudgetContextType = {
    budgets,
    loading,
    error,
    createBudget,
    updateBudget,
    deleteBudget,
    refreshBudgets,
  };

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
}

/**
 * useBudget Hook
 * Easy access to budget context from any component
 * 
 * @example
 * const { budgets, loading, createBudget } = useBudget();
 */
export function useBudget() {
  const context = useContext(BudgetContext);
  
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  
  return context;
}

