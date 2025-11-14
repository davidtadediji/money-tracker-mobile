import { supabase } from '@/lib/supabase';

export class AnalyticsServiceError extends Error {
  public code: string;
  public originalError?: any;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', originalError?: any) {
    super(message);
    this.name = 'AnalyticsServiceError';
    this.code = code;
    this.originalError = originalError;
  }
}

export interface ServiceResponse<T> {
  data: T | null;
  error: AnalyticsServiceError | null;
}

// ========================================
// TYPES
// ========================================

export interface IncomeVsExpense {
  income: number;
  expense: number;
  net: number;
  incomeCount: number;
  expenseCount: number;
}

export interface CategoryAnalysis {
  category: string;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
  type: 'income' | 'expense' | 'mixed';
  incomeAmount: number;
  expenseAmount: number;
}

export interface TimeTrend {
  date: string;
  income: number;
  expense: number;
  net: number;
  transactionCount: number;
}

export interface BudgetPerformance {
  budgetId: string;
  category: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  status: 'under' | 'near' | 'over';
  period: string;
}

export interface CustomReportConfig {
  id?: string;
  user_id?: string;
  name: string;
  description?: string;
  report_type: 'income_expense' | 'category' | 'trend' | 'budget' | 'custom';
  date_range: {
    start: string;
    end: string;
  };
  filters?: {
    categories?: string[];
    types?: ('income' | 'expense')[];
    minAmount?: number;
    maxAmount?: number;
  };
  grouping?: 'day' | 'week' | 'month' | 'year' | 'category';
  created_at?: string;
  updated_at?: string;
}

export interface SavedReport extends CustomReportConfig {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// ========================================
// INCOME VS EXPENSE ANALYTICS
// ========================================

export async function getIncomeVsExpense(
  userId: string,
  startDate: string,
  endDate: string
): Promise<ServiceResponse<IncomeVsExpense>> {
  try {
    if (!userId) {
      throw new AnalyticsServiceError('User ID is required', 'AUTH_ERROR');
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('type, amount')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) {
      throw new AnalyticsServiceError(
        `Failed to fetch income vs expense: ${error.message}`,
        error.code,
        error
      );
    }

    const result: IncomeVsExpense = {
      income: 0,
      expense: 0,
      net: 0,
      incomeCount: 0,
      expenseCount: 0,
    };

    data.forEach((transaction) => {
      if (transaction.type === 'income') {
        result.income += transaction.amount;
        result.incomeCount++;
      } else {
        result.expense += transaction.amount;
        result.expenseCount++;
      }
    });

    result.net = result.income - result.expense;

    return { data: result, error: null };
  } catch (error) {
    if (error instanceof AnalyticsServiceError) {
      return { data: null, error };
    }
    return {
      data: null,
      error: new AnalyticsServiceError(
        'An unexpected error occurred while fetching income vs expense',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

// ========================================
// CATEGORY-WISE ANALYSIS
// ========================================

export async function getCategoryAnalysis(
  userId: string,
  startDate: string,
  endDate: string,
  type?: 'income' | 'expense'
): Promise<ServiceResponse<CategoryAnalysis[]>> {
  try {
    if (!userId) {
      throw new AnalyticsServiceError('User ID is required', 'AUTH_ERROR');
    }

    let query = supabase
      .from('transactions')
      .select('category, type, amount')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      throw new AnalyticsServiceError(
        `Failed to fetch category analysis: ${error.message}`,
        error.code,
        error
      );
    }

    // Group by category
    const categoryMap = new Map<string, {
      incomeAmount: number;
      expenseAmount: number;
      count: number;
    }>();

    let totalAmount = 0;

    data.forEach((transaction) => {
      const category = transaction.category;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { incomeAmount: 0, expenseAmount: 0, count: 0 });
      }

      const categoryData = categoryMap.get(category)!;
      categoryData.count++;

      if (transaction.type === 'income') {
        categoryData.incomeAmount += transaction.amount;
        totalAmount += transaction.amount;
      } else {
        categoryData.expenseAmount += transaction.amount;
        totalAmount += transaction.amount;
      }
    });

    // Convert to array and calculate percentages
    const result: CategoryAnalysis[] = Array.from(categoryMap.entries()).map(
      ([category, data]) => {
        const totalCategoryAmount = data.incomeAmount + data.expenseAmount;
        let categoryType: 'income' | 'expense' | 'mixed' = 'mixed';

        if (data.incomeAmount > 0 && data.expenseAmount === 0) {
          categoryType = 'income';
        } else if (data.expenseAmount > 0 && data.incomeAmount === 0) {
          categoryType = 'expense';
        }

        return {
          category,
          totalAmount: totalCategoryAmount,
          transactionCount: data.count,
          percentage: totalAmount > 0 ? (totalCategoryAmount / totalAmount) * 100 : 0,
          type: categoryType,
          incomeAmount: data.incomeAmount,
          expenseAmount: data.expenseAmount,
        };
      }
    );

    // Sort by total amount descending
    result.sort((a, b) => b.totalAmount - a.totalAmount);

    return { data: result, error: null };
  } catch (error) {
    if (error instanceof AnalyticsServiceError) {
      return { data: null, error };
    }
    return {
      data: null,
      error: new AnalyticsServiceError(
        'An unexpected error occurred while fetching category analysis',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

// ========================================
// TIME-BASED TRENDS
// ========================================

export async function getTimeTrends(
  userId: string,
  startDate: string,
  endDate: string,
  groupBy: 'day' | 'week' | 'month' = 'day'
): Promise<ServiceResponse<TimeTrend[]>> {
  try {
    if (!userId) {
      throw new AnalyticsServiceError('User ID is required', 'AUTH_ERROR');
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('date, type, amount')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) {
      throw new AnalyticsServiceError(
        `Failed to fetch time trends: ${error.message}`,
        error.code,
        error
      );
    }

    // Group by time period
    const trendMap = new Map<string, {
      income: number;
      expense: number;
      count: number;
    }>();

    data.forEach((transaction) => {
      const date = new Date(transaction.date);
      let key: string;

      if (groupBy === 'day') {
        key = transaction.date;
      } else if (groupBy === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        // month
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
      }

      if (!trendMap.has(key)) {
        trendMap.set(key, { income: 0, expense: 0, count: 0 });
      }

      const trendData = trendMap.get(key)!;
      trendData.count++;

      if (transaction.type === 'income') {
        trendData.income += transaction.amount;
      } else {
        trendData.expense += transaction.amount;
      }
    });

    // Convert to array
    const result: TimeTrend[] = Array.from(trendMap.entries()).map(
      ([date, data]) => ({
        date,
        income: data.income,
        expense: data.expense,
        net: data.income - data.expense,
        transactionCount: data.count,
      })
    );

    // Sort by date
    result.sort((a, b) => a.date.localeCompare(b.date));

    return { data: result, error: null };
  } catch (error) {
    if (error instanceof AnalyticsServiceError) {
      return { data: null, error };
    }
    return {
      data: null,
      error: new AnalyticsServiceError(
        'An unexpected error occurred while fetching time trends',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

// ========================================
// BUDGET PERFORMANCE
// ========================================

export async function getBudgetPerformance(
  userId: string,
  currentPeriod?: string
): Promise<ServiceResponse<BudgetPerformance[]>> {
  try {
    if (!userId) {
      throw new AnalyticsServiceError('User ID is required', 'AUTH_ERROR');
    }

    // Fetch budgets
    let budgetQuery = supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId);

    if (currentPeriod) {
      budgetQuery = budgetQuery.eq('period', currentPeriod);
    }

    const { data: budgets, error: budgetError } = await budgetQuery;

    if (budgetError) {
      throw new AnalyticsServiceError(
        `Failed to fetch budgets: ${budgetError.message}`,
        budgetError.code,
        budgetError
      );
    }

    // Calculate spent amount for each budget
    const result: BudgetPerformance[] = [];

    for (const budget of budgets) {
      // Calculate date range based on period
      const now = new Date();
      let startDate: Date;
      let endDate: Date = now;

      if (budget.period === 'weekly') {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
      } else if (budget.period === 'monthly') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else {
        // yearly
        startDate = new Date(now.getFullYear(), 0, 1);
      }

      // Fetch transactions for this budget's category and period
      const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('category', budget.category)
        .eq('type', 'expense')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);

      if (txError) {
        console.error(`Error fetching transactions for budget ${budget.id}:`, txError);
        continue;
      }

      const spentAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
      const remainingAmount = budget.limit - spentAmount;
      const percentageUsed = budget.limit > 0 ? (spentAmount / budget.limit) * 100 : 0;

      let status: 'under' | 'near' | 'over' = 'under';
      if (percentageUsed >= 100) {
        status = 'over';
      } else if (percentageUsed >= 80) {
        status = 'near';
      }

      result.push({
        budgetId: budget.id,
        category: budget.category,
        budgetAmount: budget.limit,
        spentAmount,
        remainingAmount,
        percentageUsed,
        status,
        period: budget.period,
      });
    }

    // Sort by percentage used descending
    result.sort((a, b) => b.percentageUsed - a.percentageUsed);

    return { data: result, error: null };
  } catch (error) {
    if (error instanceof AnalyticsServiceError) {
      return { data: null, error };
    }
    return {
      data: null,
      error: new AnalyticsServiceError(
        'An unexpected error occurred while fetching budget performance',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

// ========================================
// CUSTOM REPORTS
// ========================================

export async function createCustomReport(
  userId: string,
  reportConfig: Omit<CustomReportConfig, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<ServiceResponse<SavedReport>> {
  try {
    if (!userId) {
      throw new AnalyticsServiceError('User ID is required', 'AUTH_ERROR');
    }

    const { data, error } = await supabase
      .from('reports')
      .insert({
        user_id: userId,
        name: reportConfig.name,
        description: reportConfig.description,
        report_type: reportConfig.report_type,
        date_range: reportConfig.date_range,
        filters: reportConfig.filters,
        grouping: reportConfig.grouping,
      })
      .select()
      .single();

    if (error) {
      throw new AnalyticsServiceError(
        `Failed to create report: ${error.message}`,
        error.code,
        error
      );
    }

    return { data, error: null };
  } catch (error) {
    if (error instanceof AnalyticsServiceError) {
      return { data: null, error };
    }
    return {
      data: null,
      error: new AnalyticsServiceError(
        'An unexpected error occurred while creating report',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

export async function getUserReports(userId: string): Promise<ServiceResponse<SavedReport[]>> {
  try {
    if (!userId) {
      throw new AnalyticsServiceError('User ID is required', 'AUTH_ERROR');
    }

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AnalyticsServiceError(
        `Failed to fetch reports: ${error.message}`,
        error.code,
        error
      );
    }

    return { data: data || [], error: null };
  } catch (error) {
    if (error instanceof AnalyticsServiceError) {
      return { data: null, error };
    }
    return {
      data: null,
      error: new AnalyticsServiceError(
        'An unexpected error occurred while fetching reports',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

export async function deleteReport(reportId: string): Promise<ServiceResponse<boolean>> {
  try {
    if (!reportId) {
      throw new AnalyticsServiceError('Report ID is required', 'VALIDATION_ERROR');
    }

    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId);

    if (error) {
      throw new AnalyticsServiceError(
        `Failed to delete report: ${error.message}`,
        error.code,
        error
      );
    }

    return { data: true, error: null };
  } catch (error) {
    if (error instanceof AnalyticsServiceError) {
      return { data: null, error };
    }
    return {
      data: null,
      error: new AnalyticsServiceError(
        'An unexpected error occurred while deleting report',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

export async function executeReport(
  reportConfig: CustomReportConfig,
  userId: string
): Promise<ServiceResponse<any>> {
  try {
    if (!userId) {
      throw new AnalyticsServiceError('User ID is required', 'AUTH_ERROR');
    }

    const { start, end } = reportConfig.date_range;

    switch (reportConfig.report_type) {
      case 'income_expense':
        return await getIncomeVsExpense(userId, start, end);

      case 'category':
        return await getCategoryAnalysis(userId, start, end);

      case 'trend':
        return await getTimeTrends(userId, start, end, reportConfig.grouping as any);

      case 'budget':
        return await getBudgetPerformance(userId);

      default:
        throw new AnalyticsServiceError('Invalid report type', 'VALIDATION_ERROR');
    }
  } catch (error) {
    if (error instanceof AnalyticsServiceError) {
      return { data: null, error };
    }
    return {
      data: null,
      error: new AnalyticsServiceError(
        'An unexpected error occurred while executing report',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

