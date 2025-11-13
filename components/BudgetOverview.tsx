import { getCategoryColor, getCategoryIcon } from '@/constants/categories';
import { Budget } from '@/types/database';
import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

/**
 * BudgetOverview Component
 * Displays summary statistics, charts, and insights about budgets
 */

interface BudgetOverviewProps {
  budgets: Budget[];
}

interface CategorySummary {
  category: string;
  budget: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  icon: string;
  color: string;
}

export default function BudgetOverview({ budgets }: BudgetOverviewProps) {
  const screenWidth = Dimensions.get('window').width;

  // Calculate summary statistics
  const summary = useMemo(() => {
    const totalBudgets = budgets.length;
    const totalBudgetAmount = budgets.reduce((sum, b) => sum + b.limit_amount, 0);
    
    // TODO: Replace with actual spending data from transactions
    const totalSpent = 0; // Placeholder
    const totalRemaining = totalBudgetAmount - totalSpent;
    const overallPercentUsed = totalBudgetAmount > 0 ? (totalSpent / totalBudgetAmount) * 100 : 0;

    return {
      totalBudgets,
      totalBudgetAmount,
      totalSpent,
      totalRemaining,
      overallPercentUsed,
    };
  }, [budgets]);

  // Calculate per-category summaries
  const categorySummaries = useMemo((): CategorySummary[] => {
    return budgets.map((budget) => {
      // TODO: Replace with actual spending data
      const spent = 0; // Placeholder
      const remaining = budget.limit_amount - spent;
      const percentUsed = budget.limit_amount > 0 ? (spent / budget.limit_amount) * 100 : 0;

      return {
        category: budget.category,
        budget: budget.limit_amount,
        spent,
        remaining,
        percentUsed,
        icon: getCategoryIcon(budget.category),
        color: getCategoryColor(budget.category),
      };
    });
  }, [budgets]);

  // Insights
  const insights = useMemo(() => {
    const overBudget = categorySummaries.filter((c) => c.percentUsed > 100);
    const mostRemaining = categorySummaries
      .filter((c) => c.remaining > 0)
      .sort((a, b) => b.remaining - a.remaining)
      .slice(0, 3);
    const highestUsage = categorySummaries
      .sort((a, b) => b.percentUsed - a.percentUsed)
      .slice(0, 3);

    return {
      overBudget,
      mostRemaining,
      highestUsage,
    };
  }, [categorySummaries]);

  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  if (budgets.length === 0) {
    return null; // Don't show overview if no budgets
  }

  return (
    <View style={styles.container}>
      {/* Summary Cards */}
      <View style={styles.summarySection}>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, styles.summaryCardPrimary]}>
            <Text style={styles.summaryLabel}>Total Budgets</Text>
            <Text style={styles.summaryValue}>{summary.totalBudgets}</Text>
          </View>

          <View style={[styles.summaryCard, styles.summaryCardSecondary]}>
            <Text style={styles.summaryLabel}>Total Budget</Text>
            <Text style={styles.summaryValueSmall}>{formatCurrency(summary.totalBudgetAmount)}</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, styles.summaryCardWarning]}>
            <Text style={styles.summaryLabel}>Total Spent</Text>
            <Text style={styles.summaryValueSmall}>{formatCurrency(summary.totalSpent)}</Text>
            <Text style={styles.summarySubtext}>
              {summary.overallPercentUsed.toFixed(0)}% used
            </Text>
          </View>

          <View style={[styles.summaryCard, styles.summaryCardSuccess]}>
            <Text style={styles.summaryLabel}>Remaining</Text>
            <Text style={styles.summaryValueSmall}>{formatCurrency(summary.totalRemaining)}</Text>
            <Text style={styles.summarySubtext}>
              {(100 - summary.overallPercentUsed).toFixed(0)}% left
            </Text>
          </View>
        </View>
      </View>

      {/* Budget Distribution */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Budget Distribution</Text>
        <View style={styles.distributionContainer}>
          {categorySummaries.slice(0, 5).map((cat, index) => {
            const percentage = summary.totalBudgetAmount > 0 
              ? (cat.budget / summary.totalBudgetAmount) * 100 
              : 0;
            
            return (
              <View key={index} style={styles.distributionItem}>
                <View style={styles.distributionHeader}>
                  <View style={styles.distributionCategory}>
                    <Text style={styles.distributionIcon}>{cat.icon}</Text>
                    <Text style={styles.distributionLabel}>{cat.category}</Text>
                  </View>
                  <Text style={styles.distributionAmount}>{formatCurrency(cat.budget)}</Text>
                </View>
                <View style={styles.distributionBarContainer}>
                  <View 
                    style={[
                      styles.distributionBar, 
                      { width: `${percentage}%`, backgroundColor: cat.color }
                    ]} 
                  />
                </View>
                <Text style={styles.distributionPercentage}>{percentage.toFixed(1)}% of total</Text>
              </View>
            );
          })}
          {categorySummaries.length > 5 && (
            <Text style={styles.moreCategories}>
              +{categorySummaries.length - 5} more categories
            </Text>
          )}
        </View>
      </View>

      {/* Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Insights</Text>

        {/* Over Budget */}
        {insights.overBudget.length > 0 && (
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Text style={styles.insightIcon}>🚨</Text>
              <Text style={styles.insightTitle}>Over Budget</Text>
            </View>
            {insights.overBudget.map((cat, index) => (
              <View key={index} style={styles.insightItem}>
                <Text style={styles.insightCategoryIcon}>{cat.icon}</Text>
                <Text style={styles.insightCategoryName}>{cat.category}</Text>
                <Text style={styles.insightCategoryValue}>
                  {formatCurrency(Math.abs(cat.remaining))} over
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Highest Usage */}
        {insights.highestUsage.length > 0 && insights.highestUsage[0].percentUsed > 0 && (
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Text style={styles.insightIcon}>📊</Text>
              <Text style={styles.insightTitle}>Highest Usage</Text>
            </View>
            {insights.highestUsage.slice(0, 3).map((cat, index) => (
              cat.percentUsed > 0 && (
                <View key={index} style={styles.insightItem}>
                  <Text style={styles.insightCategoryIcon}>{cat.icon}</Text>
                  <Text style={styles.insightCategoryName}>{cat.category}</Text>
                  <Text style={[
                    styles.insightCategoryValue,
                    cat.percentUsed > 90 && styles.insightCategoryValueWarning
                  ]}>
                    {cat.percentUsed.toFixed(0)}% used
                  </Text>
                </View>
              )
            ))}
          </View>
        )}

        {/* Most Remaining */}
        {insights.mostRemaining.length > 0 && (
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Text style={styles.insightIcon}>✅</Text>
              <Text style={styles.insightTitle}>Most Budget Left</Text>
            </View>
            {insights.mostRemaining.map((cat, index) => (
              <View key={index} style={styles.insightItem}>
                <Text style={styles.insightCategoryIcon}>{cat.icon}</Text>
                <Text style={styles.insightCategoryName}>{cat.category}</Text>
                <Text style={styles.insightCategoryValueSuccess}>
                  {formatCurrency(cat.remaining)} left
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* No spending yet */}
        {summary.totalSpent === 0 && (
          <View style={[styles.insightCard, styles.insightCardInfo]}>
            <View style={styles.insightHeader}>
              <Text style={styles.insightIcon}>💡</Text>
              <Text style={styles.insightTitle}>Getting Started</Text>
            </View>
            <Text style={styles.insightText}>
              You haven't tracked any expenses yet. Start adding transactions to see spending insights!
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginBottom: 16,
  },

  // Summary Section
  summarySection: {
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  summaryCardPrimary: {
    backgroundColor: '#111',
  },
  summaryCardSecondary: {
    backgroundColor: '#fff',
  },
  summaryCardWarning: {
    backgroundColor: '#FFF3E0',
  },
  summaryCardSuccess: {
    backgroundColor: '#E8F5E9',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
  },
  summaryValueSmall: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111',
  },
  summarySubtext: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },

  // Section
  section: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 16,
  },

  // Distribution
  distributionContainer: {
    gap: 16,
  },
  distributionItem: {
    marginBottom: 8,
  },
  distributionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  distributionCategory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distributionIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  distributionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  distributionAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
  },
  distributionBarContainer: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  distributionBar: {
    height: '100%',
    borderRadius: 4,
  },
  distributionPercentage: {
    fontSize: 11,
    color: '#999',
  },
  moreCategories: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },

  // Insights
  insightCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  insightCardInfo: {
    backgroundColor: '#E3F2FD',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  insightCategoryIcon: {
    fontSize: 18,
    marginRight: 8,
    width: 24,
  },
  insightCategoryName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  insightCategoryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
  },
  insightCategoryValueWarning: {
    color: '#ff3b30',
  },
  insightCategoryValueSuccess: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4cd964',
  },
  insightText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

