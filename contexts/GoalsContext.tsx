/**
 * Goals Context
 * 
 * Manages global state for financial goals, progress tracking, and savings calculations
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import * as GoalsService from '@/services/goalsService';
import type {
  FinancialGoal,
  GoalContribution,
  GoalTemplate,
  SavingsCalculation,
} from '@/services/goalsService';

// =====================================================
// Context Types
// =====================================================

interface GoalsContextValue {
  // Goals State
  goals: FinancialGoal[];
  activeGoals: FinancialGoal[];
  completedGoals: FinancialGoal[];
  
  // Templates State
  templates: GoalTemplate[];
  popularTemplates: GoalTemplate[];
  
  // Stats
  stats: {
    totalGoals: number;
    activeGoals: number;
    completedGoals: number;
    totalTargetAmount: number;
    totalCurrentAmount: number;
    overallProgress: number;
  } | null;
  
  // Loading States
  isLoadingGoals: boolean;
  isLoadingTemplates: boolean;
  isLoadingStats: boolean;
  
  // Error State
  error: string | null;
  
  // Goal Actions
  loadGoals: (includeArchived?: boolean) => Promise<void>;
  loadActiveGoals: () => Promise<void>;
  getGoal: (goalId: string) => Promise<FinancialGoal>;
  createGoal: (goalData: Omit<FinancialGoal, 'id' | 'user_id' | 'progress_percentage' | 'created_at' | 'updated_at'>) => Promise<FinancialGoal>;
  updateGoal: (goalId: string, updates: Partial<FinancialGoal>) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  archiveGoal: (goalId: string) => Promise<void>;
  unarchiveGoal: (goalId: string) => Promise<void>;
  
  // Contribution Actions
  addContribution: (goalId: string, amount: number, description?: string) => Promise<void>;
  getContributions: (goalId: string) => Promise<GoalContribution[]>;
  updateGoalAmount: (goalId: string, newAmount: number) => Promise<void>;
  
  // Template Actions
  loadTemplates: () => Promise<void>;
  createFromTemplate: (templateId: string, customizations?: Partial<FinancialGoal>) => Promise<FinancialGoal>;
  
  // Progress Tracking
  loadStats: () => Promise<void>;
  checkMilestones: (goalId: string) => Promise<void>;
  
  // Savings Calculator
  calculateMonthlyContribution: (
    targetAmount: number,
    currentAmount: number,
    targetDate: Date,
    interestRate?: number
  ) => Promise<SavingsCalculation>;
  calculateCompletionDate: (
    targetAmount: number,
    currentAmount: number,
    monthlyContribution: number,
    interestRate?: number
  ) => Date;
  getSavingsScenarios: (
    targetAmount: number,
    currentAmount: number,
    targetDate: Date
  ) => Promise<SavingsCalculation[]>;
  
  // Utility Actions
  refresh: () => Promise<void>;
  clearError: () => void;
}

// =====================================================
// Create Context
// =====================================================

const GoalsContext = createContext<GoalsContextValue | undefined>(undefined);

// =====================================================
// Provider Component
// =====================================================

export function GoalsProvider({ children }: { children: React.ReactNode }) {
  // Goals State
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [isLoadingGoals, setIsLoadingGoals] = useState(false);
  
  // Templates State
  const [templates, setTemplates] = useState<GoalTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  
  // Stats State
  const [stats, setStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  
  // Error State
  const [error, setError] = useState<string | null>(null);

  // =====================================================
  // Computed Values
  // =====================================================

  const activeGoals = useMemo(() => {
    return goals.filter(g => g.status === 'active' && !g.is_archived);
  }, [goals]);

  const completedGoals = useMemo(() => {
    return goals.filter(g => g.status === 'completed');
  }, [goals]);

  const popularTemplates = useMemo(() => {
    return templates.filter(t => t.is_popular);
  }, [templates]);

  // =====================================================
  // Goal Actions
  // =====================================================

  const loadGoals = useCallback(async (includeArchived = false) => {
    try {
      setIsLoadingGoals(true);
      setError(null);

      const data = await GoalsService.getAllGoals(includeArchived);
      setGoals(data);
    } catch (err: any) {
      console.error('Error loading goals:', err);
      setError(err.message || 'Failed to load goals');
    } finally {
      setIsLoadingGoals(false);
    }
  }, []);

  const loadActiveGoals = useCallback(async () => {
    try {
      setIsLoadingGoals(true);
      setError(null);

      const data = await GoalsService.getActiveGoals();
      setGoals(data);
    } catch (err: any) {
      console.error('Error loading active goals:', err);
      setError(err.message || 'Failed to load active goals');
    } finally {
      setIsLoadingGoals(false);
    }
  }, []);

  const getGoal = useCallback(async (goalId: string): Promise<FinancialGoal> => {
    try {
      setError(null);
      return await GoalsService.getGoalById(goalId);
    } catch (err: any) {
      console.error('Error getting goal:', err);
      setError(err.message || 'Failed to get goal');
      throw err;
    }
  }, []);

  const createGoal = useCallback(async (
    goalData: Omit<FinancialGoal, 'id' | 'user_id' | 'progress_percentage' | 'created_at' | 'updated_at'>
  ): Promise<FinancialGoal> => {
    try {
      setError(null);
      const newGoal = await GoalsService.createGoal(goalData);
      
      // Add to local state
      setGoals(prev => [newGoal, ...prev]);
      
      // Reload stats
      await loadStats();
      
      return newGoal;
    } catch (err: any) {
      console.error('Error creating goal:', err);
      setError(err.message || 'Failed to create goal');
      throw err;
    }
  }, []);

  const updateGoal = useCallback(async (
    goalId: string,
    updates: Partial<FinancialGoal>
  ) => {
    try {
      setError(null);
      const updatedGoal = await GoalsService.updateGoal(goalId, updates);
      
      // Update in local state
      setGoals(prev => prev.map(g => g.id === goalId ? updatedGoal : g));
      
      // Reload stats
      await loadStats();
    } catch (err: any) {
      console.error('Error updating goal:', err);
      setError(err.message || 'Failed to update goal');
      throw err;
    }
  }, []);

  const deleteGoal = useCallback(async (goalId: string) => {
    try {
      setError(null);
      await GoalsService.deleteGoal(goalId);
      
      // Remove from local state
      setGoals(prev => prev.filter(g => g.id !== goalId));
      
      // Reload stats
      await loadStats();
    } catch (err: any) {
      console.error('Error deleting goal:', err);
      setError(err.message || 'Failed to delete goal');
      throw err;
    }
  }, []);

  const archiveGoal = useCallback(async (goalId: string) => {
    try {
      setError(null);
      const updatedGoal = await GoalsService.archiveGoal(goalId);
      
      // Update in local state
      setGoals(prev => prev.map(g => g.id === goalId ? updatedGoal : g));
    } catch (err: any) {
      console.error('Error archiving goal:', err);
      setError(err.message || 'Failed to archive goal');
      throw err;
    }
  }, []);

  const unarchiveGoal = useCallback(async (goalId: string) => {
    try {
      setError(null);
      const updatedGoal = await GoalsService.unarchiveGoal(goalId);
      
      // Update in local state
      setGoals(prev => prev.map(g => g.id === goalId ? updatedGoal : g));
    } catch (err: any) {
      console.error('Error unarchiving goal:', err);
      setError(err.message || 'Failed to unarchive goal');
      throw err;
    }
  }, []);

  // =====================================================
  // Contribution Actions
  // =====================================================

  const addContribution = useCallback(async (
    goalId: string,
    amount: number,
    description?: string
  ) => {
    try {
      setError(null);
      await GoalsService.addContribution(goalId, amount, description);
      
      // Reload the specific goal to get updated amount
      const updatedGoal = await GoalsService.getGoalById(goalId);
      setGoals(prev => prev.map(g => g.id === goalId ? updatedGoal : g));
      
      // Check milestones
      await checkMilestones(goalId);
      
      // Reload stats
      await loadStats();
    } catch (err: any) {
      console.error('Error adding contribution:', err);
      setError(err.message || 'Failed to add contribution');
      throw err;
    }
  }, []);

  const getContributions = useCallback(async (goalId: string): Promise<GoalContribution[]> => {
    try {
      setError(null);
      return await GoalsService.getGoalContributions(goalId);
    } catch (err: any) {
      console.error('Error getting contributions:', err);
      setError(err.message || 'Failed to get contributions');
      throw err;
    }
  }, []);

  const updateGoalAmount = useCallback(async (
    goalId: string,
    newAmount: number
  ) => {
    try {
      setError(null);
      const updatedGoal = await GoalsService.updateGoalAmount(goalId, newAmount);
      
      // Update in local state
      setGoals(prev => prev.map(g => g.id === goalId ? updatedGoal : g));
      
      // Check milestones
      await checkMilestones(goalId);
      
      // Reload stats
      await loadStats();
    } catch (err: any) {
      console.error('Error updating goal amount:', err);
      setError(err.message || 'Failed to update goal amount');
      throw err;
    }
  }, []);

  // =====================================================
  // Template Actions
  // =====================================================

  const loadTemplates = useCallback(async () => {
    try {
      setIsLoadingTemplates(true);
      setError(null);

      const data = await GoalsService.getGoalTemplates();
      setTemplates(data);
    } catch (err: any) {
      console.error('Error loading templates:', err);
      setError(err.message || 'Failed to load templates');
    } finally {
      setIsLoadingTemplates(false);
    }
  }, []);

  const createFromTemplate = useCallback(async (
    templateId: string,
    customizations?: Partial<FinancialGoal>
  ): Promise<FinancialGoal> => {
    try {
      setError(null);
      const newGoal = await GoalsService.createGoalFromTemplate(templateId, customizations);
      
      // Add to local state
      setGoals(prev => [newGoal, ...prev]);
      
      // Reload stats
      await loadStats();
      
      return newGoal;
    } catch (err: any) {
      console.error('Error creating from template:', err);
      setError(err.message || 'Failed to create goal from template');
      throw err;
    }
  }, []);

  // =====================================================
  // Progress Tracking
  // =====================================================

  const loadStats = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      setError(null);

      const data = await GoalsService.getGoalStats();
      setStats(data);
    } catch (err: any) {
      console.error('Error loading stats:', err);
      setError(err.message || 'Failed to load stats');
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  const checkMilestones = useCallback(async (goalId: string) => {
    try {
      setError(null);
      const updatedGoal = await GoalsService.checkMilestones(goalId);
      
      // Update in local state
      setGoals(prev => prev.map(g => g.id === goalId ? updatedGoal : g));
    } catch (err: any) {
      console.error('Error checking milestones:', err);
      // Don't throw - this is a non-critical operation
    }
  }, []);

  // =====================================================
  // Savings Calculator
  // =====================================================

  const calculateMonthlyContribution = useCallback(async (
    targetAmount: number,
    currentAmount: number,
    targetDate: Date,
    interestRate = 0
  ): Promise<SavingsCalculation> => {
    try {
      setError(null);
      return await GoalsService.calculateMonthlyContribution(
        targetAmount,
        currentAmount,
        targetDate,
        interestRate
      );
    } catch (err: any) {
      console.error('Error calculating monthly contribution:', err);
      setError(err.message || 'Failed to calculate');
      throw err;
    }
  }, []);

  const calculateCompletionDate = useCallback((
    targetAmount: number,
    currentAmount: number,
    monthlyContribution: number,
    interestRate = 0
  ): Date => {
    try {
      setError(null);
      return GoalsService.calculateCompletionDate(
        targetAmount,
        currentAmount,
        monthlyContribution,
        interestRate
      );
    } catch (err: any) {
      console.error('Error calculating completion date:', err);
      setError(err.message || 'Failed to calculate');
      throw err;
    }
  }, []);

  const getSavingsScenarios = useCallback(async (
    targetAmount: number,
    currentAmount: number,
    targetDate: Date
  ): Promise<SavingsCalculation[]> => {
    try {
      setError(null);
      return await GoalsService.getSavingsScenarios(
        targetAmount,
        currentAmount,
        targetDate
      );
    } catch (err: any) {
      console.error('Error getting savings scenarios:', err);
      setError(err.message || 'Failed to get scenarios');
      throw err;
    }
  }, []);

  // =====================================================
  // Utility Actions
  // =====================================================

  const refresh = useCallback(async () => {
    await Promise.all([
      loadGoals(),
      loadTemplates(),
      loadStats(),
    ]);
  }, [loadGoals, loadTemplates, loadStats]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // =====================================================
  // Initial Load
  // =====================================================

  useEffect(() => {
    loadGoals();
    loadTemplates();
    loadStats();
  }, [loadGoals, loadTemplates, loadStats]);

  // =====================================================
  // Context Value
  // =====================================================

  const value: GoalsContextValue = {
    // Goals State
    goals,
    activeGoals,
    completedGoals,
    
    // Templates State
    templates,
    popularTemplates,
    
    // Stats
    stats,
    
    // Loading States
    isLoadingGoals,
    isLoadingTemplates,
    isLoadingStats,
    
    // Error State
    error,
    
    // Goal Actions
    loadGoals,
    loadActiveGoals,
    getGoal,
    createGoal,
    updateGoal,
    deleteGoal,
    archiveGoal,
    unarchiveGoal,
    
    // Contribution Actions
    addContribution,
    getContributions,
    updateGoalAmount,
    
    // Template Actions
    loadTemplates,
    createFromTemplate,
    
    // Progress Tracking
    loadStats,
    checkMilestones,
    
    // Savings Calculator
    calculateMonthlyContribution,
    calculateCompletionDate,
    getSavingsScenarios,
    
    // Utility Actions
    refresh,
    clearError,
  };

  return (
    <GoalsContext.Provider value={value}>
      {children}
    </GoalsContext.Provider>
  );
}

// =====================================================
// Hook to use context
// =====================================================

export function useGoals() {
  const context = useContext(GoalsContext);
  
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalsProvider');
  }
  
  return context;
}

