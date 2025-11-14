import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  getIncomeVsExpense,
  getCategoryAnalysis,
  getTimeTrends,
  getBudgetPerformance,
  getUserReports,
  createCustomReport,
  deleteReport,
  executeReport,
  type IncomeVsExpense,
  type CategoryAnalysis,
  type TimeTrend,
  type BudgetPerformance,
  type SavedReport,
  type CustomReportConfig,
} from '@/services/analyticsService';

interface AnalyticsContextType {
  // Data
  incomeVsExpense: IncomeVsExpense | null;
  categoryAnalysis: CategoryAnalysis[];
  timeTrends: TimeTrend[];
  budgetPerformance: BudgetPerformance[];
  savedReports: SavedReport[];

  // Loading states
  loading: boolean;
  loadingIncomeVsExpense: boolean;
  loadingCategoryAnalysis: boolean;
  loadingTimeTrends: boolean;
  loadingBudgetPerformance: boolean;
  loadingSavedReports: boolean;

  // Error states
  error: string | null;

  // Date range
  dateRange: { start: string; end: string };
  setDateRange: (start: string, end: string) => void;

  // Time period
  timePeriod: 'day' | 'week' | 'month' | 'year';
  setTimePeriod: (period: 'day' | 'week' | 'month' | 'year') => void;

  // Refresh functions
  refreshAll: () => Promise<void>;
  refreshIncomeVsExpense: () => Promise<void>;
  refreshCategoryAnalysis: () => Promise<void>;
  refreshTimeTrends: () => Promise<void>;
  refreshBudgetPerformance: () => Promise<void>;
  refreshSavedReports: () => Promise<void>;

  // Report management
  createReport: (config: Omit<CustomReportConfig, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<{
    success: boolean;
    report?: SavedReport;
    error?: string;
  }>;
  deleteReportById: (reportId: string) => Promise<{ success: boolean; error?: string }>;
  executeReportById: (reportId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);

  // Data states
  const [incomeVsExpense, setIncomeVsExpense] = useState<IncomeVsExpense | null>(null);
  const [categoryAnalysis, setCategoryAnalysis] = useState<CategoryAnalysis[]>([]);
  const [timeTrends, setTimeTrends] = useState<TimeTrend[]>([]);
  const [budgetPerformance, setBudgetPerformance] = useState<BudgetPerformance[]>([]);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);

  // Loading states
  const [loadingIncomeVsExpense, setLoadingIncomeVsExpense] = useState(false);
  const [loadingCategoryAnalysis, setLoadingCategoryAnalysis] = useState(false);
  const [loadingTimeTrends, setLoadingTimeTrends] = useState(false);
  const [loadingBudgetPerformance, setLoadingBudgetPerformance] = useState(false);
  const [loadingSavedReports, setLoadingSavedReports] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Date range (default: last 30 days)
  const [dateRange, setDateRangeState] = useState<{ start: string; end: string }>(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  });

  // Time period for grouping
  const [timePeriod, setTimePeriod] = useState<'day' | 'week' | 'month' | 'year'>('day');

  // Overall loading state
  const loading = useMemo(
    () =>
      loadingIncomeVsExpense ||
      loadingCategoryAnalysis ||
      loadingTimeTrends ||
      loadingBudgetPerformance ||
      loadingSavedReports,
    [
      loadingIncomeVsExpense,
      loadingCategoryAnalysis,
      loadingTimeTrends,
      loadingBudgetPerformance,
      loadingSavedReports,
    ]
  );

  // Get user ID
  const getUserId = useCallback(async (): Promise<string | null> => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Error getting session:', sessionError);
        return null;
      }

      return session?.user?.id || null;
    } catch (err) {
      console.error('Error in getUserId:', err);
      return null;
    }
  }, []);

  // Set date range
  const setDateRange = useCallback((start: string, end: string) => {
    setDateRangeState({ start, end });
  }, []);

  // Fetch Income vs Expense
  const refreshIncomeVsExpense = useCallback(async () => {
    if (!userId) return;

    setLoadingIncomeVsExpense(true);
    setError(null);

    try {
      const { data, error: serviceError } = await getIncomeVsExpense(
        userId,
        dateRange.start,
        dateRange.end
      );

      if (serviceError) {
        setError(serviceError.message);
      } else {
        setIncomeVsExpense(data);
      }
    } catch (err) {
      setError('Failed to fetch income vs expense data');
    } finally {
      setLoadingIncomeVsExpense(false);
    }
  }, [userId, dateRange]);

  // Fetch Category Analysis
  const refreshCategoryAnalysis = useCallback(async () => {
    if (!userId) return;

    setLoadingCategoryAnalysis(true);
    setError(null);

    try {
      const { data, error: serviceError } = await getCategoryAnalysis(
        userId,
        dateRange.start,
        dateRange.end
      );

      if (serviceError) {
        setError(serviceError.message);
      } else {
        setCategoryAnalysis(data || []);
      }
    } catch (err) {
      setError('Failed to fetch category analysis');
    } finally {
      setLoadingCategoryAnalysis(false);
    }
  }, [userId, dateRange]);

  // Fetch Time Trends
  const refreshTimeTrends = useCallback(async () => {
    if (!userId) return;

    setLoadingTimeTrends(true);
    setError(null);

    try {
      const { data, error: serviceError } = await getTimeTrends(
        userId,
        dateRange.start,
        dateRange.end,
        timePeriod
      );

      if (serviceError) {
        setError(serviceError.message);
      } else {
        setTimeTrends(data || []);
      }
    } catch (err) {
      setError('Failed to fetch time trends');
    } finally {
      setLoadingTimeTrends(false);
    }
  }, [userId, dateRange, timePeriod]);

  // Fetch Budget Performance
  const refreshBudgetPerformance = useCallback(async () => {
    if (!userId) return;

    setLoadingBudgetPerformance(true);
    setError(null);

    try {
      const { data, error: serviceError } = await getBudgetPerformance(userId);

      if (serviceError) {
        setError(serviceError.message);
      } else {
        setBudgetPerformance(data || []);
      }
    } catch (err) {
      setError('Failed to fetch budget performance');
    } finally {
      setLoadingBudgetPerformance(false);
    }
  }, [userId]);

  // Fetch Saved Reports
  const refreshSavedReports = useCallback(async () => {
    if (!userId) return;

    setLoadingSavedReports(true);
    setError(null);

    try {
      const { data, error: serviceError } = await getUserReports(userId);

      if (serviceError) {
        setError(serviceError.message);
      } else {
        setSavedReports(data || []);
      }
    } catch (err) {
      setError('Failed to fetch saved reports');
    } finally {
      setLoadingSavedReports(false);
    }
  }, [userId]);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    await Promise.all([
      refreshIncomeVsExpense(),
      refreshCategoryAnalysis(),
      refreshTimeTrends(),
      refreshBudgetPerformance(),
      refreshSavedReports(),
    ]);
  }, [
    refreshIncomeVsExpense,
    refreshCategoryAnalysis,
    refreshTimeTrends,
    refreshBudgetPerformance,
    refreshSavedReports,
  ]);

  // Create report
  const createReport = useCallback(
    async (
      config: Omit<CustomReportConfig, 'id' | 'user_id' | 'created_at' | 'updated_at'>
    ): Promise<{ success: boolean; report?: SavedReport; error?: string }> => {
      if (!userId) {
        return { success: false, error: 'User not authenticated' };
      }

      try {
        const { data, error: serviceError } = await createCustomReport(userId, config);

        if (serviceError) {
          return { success: false, error: serviceError.message };
        }

        if (data) {
          await refreshSavedReports();
          return { success: true, report: data };
        }

        return { success: false, error: 'Failed to create report' };
      } catch (err) {
        return { success: false, error: 'An unexpected error occurred' };
      }
    },
    [userId, refreshSavedReports]
  );

  // Delete report
  const deleteReportById = useCallback(
    async (reportId: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const { data, error: serviceError } = await deleteReport(reportId);

        if (serviceError) {
          return { success: false, error: serviceError.message };
        }

        if (data) {
          await refreshSavedReports();
          return { success: true };
        }

        return { success: false, error: 'Failed to delete report' };
      } catch (err) {
        return { success: false, error: 'An unexpected error occurred' };
      }
    },
    [refreshSavedReports]
  );

  // Execute report
  const executeReportById = useCallback(
    async (reportId: string): Promise<{ success: boolean; data?: any; error?: string }> => {
      if (!userId) {
        return { success: false, error: 'User not authenticated' };
      }

      try {
        const report = savedReports.find((r) => r.id === reportId);
        if (!report) {
          return { success: false, error: 'Report not found' };
        }

        const { data, error: serviceError } = await executeReport(report, userId);

        if (serviceError) {
          return { success: false, error: serviceError.message };
        }

        return { success: true, data };
      } catch (err) {
        return { success: false, error: 'An unexpected error occurred' };
      }
    },
    [userId, savedReports]
  );

  // Initialize user and fetch data
  useEffect(() => {
    const initializeUser = async () => {
      const uid = await getUserId();
      setUserId(uid);
    };

    initializeUser();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const uid = session?.user?.id || null;
      setUserId(uid);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [getUserId]);

  // Fetch data when userId or dateRange changes
  useEffect(() => {
    if (userId) {
      refreshAll();
    }
  }, [userId, dateRange, timePeriod, refreshAll]);

  const value = useMemo(
    () => ({
      // Data
      incomeVsExpense,
      categoryAnalysis,
      timeTrends,
      budgetPerformance,
      savedReports,

      // Loading states
      loading,
      loadingIncomeVsExpense,
      loadingCategoryAnalysis,
      loadingTimeTrends,
      loadingBudgetPerformance,
      loadingSavedReports,

      // Error
      error,

      // Date range
      dateRange,
      setDateRange,

      // Time period
      timePeriod,
      setTimePeriod,

      // Refresh functions
      refreshAll,
      refreshIncomeVsExpense,
      refreshCategoryAnalysis,
      refreshTimeTrends,
      refreshBudgetPerformance,
      refreshSavedReports,

      // Report management
      createReport,
      deleteReportById,
      executeReportById,
    }),
    [
      incomeVsExpense,
      categoryAnalysis,
      timeTrends,
      budgetPerformance,
      savedReports,
      loading,
      loadingIncomeVsExpense,
      loadingCategoryAnalysis,
      loadingTimeTrends,
      loadingBudgetPerformance,
      loadingSavedReports,
      error,
      dateRange,
      setDateRange,
      timePeriod,
      setTimePeriod,
      refreshAll,
      refreshIncomeVsExpense,
      refreshCategoryAnalysis,
      refreshTimeTrends,
      refreshBudgetPerformance,
      refreshSavedReports,
      createReport,
      deleteReportById,
      executeReportById,
    ]
  );

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

