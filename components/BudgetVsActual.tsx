import { getCategoryIcon } from '@/constants/categories';
import { supabase } from '@/lib/supabase';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, View } from 'react-native';

/**
 * BudgetVsActual Component
 * Displays budget vs actual spending with visual progress bar
 */

interface BudgetVsActualProps {
  budgetId: string;
  category: string;
  limitAmount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: string;
}

interface BudgetStats {
  spent: number;
  remaining: number;
  percentUsed: number;
}

export default function BudgetVsActual({
  budgetId,
  category,
  limitAmount,
  period,
  startDate,
}: BudgetVsActualProps) {
  const [stats, setStats] = useState<BudgetStats>({
    spent: 0,
    remaining: limitAmount,
    percentUsed: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Animated value for progress bar
  const progressAnimation = useState(new Animated.Value(0))[0];

  /**
   * Calculate date range based on budget period and start date
   */
  const getDateRange = (): { startDate: string; endDate: string } => {
    const start = new Date(startDate);
    const now = new Date();
    let rangeStart: Date;
    let rangeEnd: Date;

    switch (period) {
      case 'weekly':
        // Find the most recent period start
        const daysSinceStart = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const weeksSinceStart = Math.floor(daysSinceStart / 7);
        rangeStart = new Date(start);
        rangeStart.setDate(start.getDate() + (weeksSinceStart * 7));
        rangeEnd = new Date(rangeStart);
        rangeEnd.setDate(rangeStart.getDate() + 7);
        break;

      case 'monthly':
        // Current month from start date perspective
        rangeStart = new Date(now.getFullYear(), now.getMonth(), start.getDate());
        if (rangeStart > now) {
          rangeStart.setMonth(rangeStart.getMonth() - 1);
        }
        rangeEnd = new Date(rangeStart);
        rangeEnd.setMonth(rangeStart.getMonth() + 1);
        break;

      case 'yearly':
        // Current year from start date perspective
        rangeStart = new Date(now.getFullYear(), start.getMonth(), start.getDate());
        if (rangeStart > now) {
          rangeStart.setFullYear(rangeStart.getFullYear() - 1);
        }
        rangeEnd = new Date(rangeStart);
        rangeEnd.setFullYear(rangeStart.getFullYear() + 1);
        break;
    }

    return {
      startDate: rangeStart.toISOString().split('T')[0],
      endDate: rangeEnd.toISOString().split('T')[0],
    };
  };

  /**
   * Fetch transactions and calculate spending
   */
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const { startDate: rangeStart, endDate: rangeEnd } = getDateRange();

      // Get user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Fetch transactions for this category and period
      const { data: transactions, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', category)
        .eq('type', 'expense') // Only count expenses
        .gte('date', rangeStart)
        .lt('date', rangeEnd);

      if (fetchError) {
        throw fetchError;
      }

      // Calculate total spent
      const totalSpent = transactions?.reduce((sum, transaction) => {
        return sum + transaction.amount;
      }, 0) || 0;

      // Calculate stats
      const remaining = limitAmount - totalSpent;
      const percentUsed = limitAmount > 0 ? (totalSpent / limitAmount) * 100 : 0;

      setStats({
        spent: totalSpent,
        remaining,
        percentUsed,
      });

      // Animate progress bar
      Animated.timing(progressAnimation, {
        toValue: Math.min(percentUsed, 100),
        duration: 800,
        useNativeDriver: false,
      }).start();

    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load spending data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [budgetId, category, limitAmount, period, startDate]);

  /**
   * Format currency
   */
  const formatCurrency = (amount: number): string => {
    return `$${Math.abs(amount).toFixed(2)}`;
  };

  /**
   * Get progress bar color based on percent used
   */
  const getProgressColor = (): string => {
    if (stats.percentUsed < 70) return '#4cd964'; // Green
    if (stats.percentUsed < 90) return '#ffcc00'; // Yellow
    return '#ff3b30'; // Red
  };

  /**
   * Get remaining amount color
   */
  const getRemainingColor = (): string => {
    return stats.remaining >= 0 ? '#4cd964' : '#ff3b30';
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#666" />
          <Text style={styles.loadingText}>Loading spending data...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  // Animated width for progress bar
  const animatedWidth = progressAnimation.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  const categoryIcon = getCategoryIcon(category);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryIcon}>{categoryIcon}</Text>
          <Text style={styles.categoryText}>{category}</Text>
        </View>
        <Text style={styles.limitText}>{formatCurrency(limitAmount)} limit</Text>
      </View>

      {/* Spending Summary */}
      <View style={styles.spendingSummary}>
        <View style={styles.spendingItem}>
          <Text style={styles.spendingLabel}>Spent</Text>
          <Text style={styles.spentAmount}>{formatCurrency(stats.spent)}</Text>
        </View>

        <View style={styles.spendingItem}>
          <Text style={styles.spendingLabel}>Remaining</Text>
          <Text style={[styles.remainingAmount, { color: getRemainingColor() }]}>
            {stats.remaining >= 0 ? formatCurrency(stats.remaining) : `-${formatCurrency(stats.remaining)}`}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressBarBackground}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: animatedWidth,
                backgroundColor: getProgressColor(),
              },
            ]}
          />
        </View>
        <Text style={styles.percentText}>{stats.percentUsed.toFixed(0)}%</Text>
      </View>

      {/* Status Messages */}
      {stats.percentUsed >= 100 && (
        <View style={styles.alertContainer}>
          <Text style={styles.alertIcon}>🚨</Text>
          <Text style={styles.alertText}>
            Budget exceeded by {formatCurrency(Math.abs(stats.remaining))}!
          </Text>
        </View>
      )}

      {stats.percentUsed >= 90 && stats.percentUsed < 100 && (
        <View style={[styles.alertContainer, styles.warningContainer]}>
          <Text style={styles.alertIcon}>⚠️</Text>
          <Text style={styles.warningText}>
            Only {formatCurrency(stats.remaining)} left in this budget
          </Text>
        </View>
      )}

      {stats.spent === 0 && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            No expenses recorded for this category yet
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  
  // Loading state
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },

  // Error state
  errorContainer: {
    alignItems: 'center',
    padding: 16,
  },
  errorIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    textAlign: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 22,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  limitText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  // Spending summary
  spendingSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  spendingItem: {
    flex: 1,
  },
  spendingLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    fontWeight: '600',
  },
  spentAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111',
  },
  remainingAmount: {
    fontSize: 24,
    fontWeight: '800',
  },

  // Progress bar
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBarBackground: {
    flex: 1,
    height: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  percentText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    minWidth: 45,
    textAlign: 'right',
  },

  // Alert messages
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  warningContainer: {
    backgroundColor: '#fff8e1',
  },
  alertIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  alertText: {
    flex: 1,
    color: '#d32f2f',
    fontSize: 13,
    fontWeight: '600',
  },
  warningText: {
    flex: 1,
    color: '#f57c00',
    fontSize: 13,
    fontWeight: '600',
  },

  // Info message
  infoContainer: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    color: '#666',
    fontSize: 13,
    textAlign: 'center',
  },
});

