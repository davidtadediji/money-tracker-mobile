import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { Colors } from '@/constants/theme';
import { BorderRadius, Spacing, Typography } from '@/constants/designTokens';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

type DatePreset = '7d' | '30d' | '90d' | '1y' | 'custom';

export default function AnalyticsIndex() {
  const router = useRouter();
  const {
    incomeVsExpense,
    categoryAnalysis,
    timeTrends,
    budgetPerformance,
    loading,
    error,
    setDateRange,
    timePeriod,
    setTimePeriod,
    refreshAll,
  } = useAnalytics();

  const [datePreset, setDatePreset] = useState<DatePreset>('30d');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  const handleDatePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    
    const end = new Date();
    let start = new Date();

    switch (preset) {
      case '7d':
        start.setDate(end.getDate() - 7);
        setTimePeriod('day');
        break;
      case '30d':
        start.setDate(end.getDate() - 30);
        setTimePeriod('day');
        break;
      case '90d':
        start.setDate(end.getDate() - 90);
        setTimePeriod('week');
        break;
      case '1y':
        start.setFullYear(end.getFullYear() - 1);
        setTimePeriod('month');
        break;
      default:
        return;
    }

    setDateRange(start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
  };

  const formatCurrency = (amount: number): string => {
    return `$${Math.abs(amount).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  // Prepare chart data for time trends
  const trendChartData = useMemo(() => {
    if (timeTrends.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [
          { data: [0], color: () => Colors.light.success },
          { data: [0], color: () => Colors.light.error },
        ],
      };
    }

    const labels = timeTrends.map((trend) => {
      const date = new Date(trend.date);
      if (timePeriod === 'day') {
        return `${date.getMonth() + 1}/${date.getDate()}`;
      } else if (timePeriod === 'week') {
        return `W${Math.ceil(date.getDate() / 7)}`;
      } else {
        return `${date.getMonth() + 1}/${date.getFullYear().toString().slice(2)}`;
      }
    });

    return {
      labels: labels.length > 10 ? labels.filter((_, i) => i % Math.ceil(labels.length / 10) === 0) : labels,
      datasets: [
        {
          data: timeTrends.length > 10 
            ? timeTrends.filter((_, i) => i % Math.ceil(timeTrends.length / 10) === 0).map((t) => t.income)
            : timeTrends.map((t) => t.income),
          color: (opacity = 1) => Colors.light.success,
          strokeWidth: 2,
        },
        {
          data: timeTrends.length > 10
            ? timeTrends.filter((_, i) => i % Math.ceil(timeTrends.length / 10) === 0).map((t) => t.expense)
            : timeTrends.map((t) => t.expense),
          color: (opacity = 1) => Colors.light.error,
          strokeWidth: 2,
        },
      ],
      legend: ['Income', 'Expense'],
    };
  }, [timeTrends, timePeriod]);

  // Prepare pie chart data for category analysis
  const categoryChartData = useMemo(() => {
    if (categoryAnalysis.length === 0) {
      return [];
    }

    const colors = [
      Colors.light.primary,
      Colors.light.accent,
      '#FF6384',
      '#36A2EB',
      '#FFCE56',
      '#4BC0C0',
      '#9966FF',
      '#FF9F40',
    ];

    return categoryAnalysis.slice(0, 8).map((cat, index) => ({
      name: cat.category.length > 15 ? cat.category.substring(0, 15) + '...' : cat.category,
      amount: cat.expenseAmount,
      color: colors[index % colors.length],
      legendFontColor: Colors.light.text,
      legendFontSize: 12,
    }));
  }, [categoryAnalysis]);

  if (loading && !incomeVsExpense) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Error Loading Analytics</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.light.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <TouchableOpacity
            style={styles.reportsButton}
            onPress={() => router.push('/(tabs)/analytics/reports')}
          >
            <Text style={styles.reportsButtonText}>📊 Reports</Text>
          </TouchableOpacity>
        </View>

        {/* Date Range Selector */}
        <View style={styles.dateRangeContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.dateRangeChips}>
              {(['7d', '30d', '90d', '1y'] as DatePreset[]).map((preset) => (
                <TouchableOpacity
                  key={preset}
                  style={[
                    styles.dateChip,
                    datePreset === preset && styles.dateChipActive,
                  ]}
                  onPress={() => handleDatePresetChange(preset)}
                >
                  <Text
                    style={[
                      styles.dateChipText,
                      datePreset === preset && styles.dateChipTextActive,
                    ]}
                  >
                    {preset === '7d' && 'Last 7 Days'}
                    {preset === '30d' && 'Last 30 Days'}
                    {preset === '90d' && 'Last 90 Days'}
                    {preset === '1y' && 'Last Year'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Income vs Expenses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Income vs Expenses</Text>
          {incomeVsExpense ? (
            <>
              <View style={styles.summaryCards}>
                <View style={[styles.summaryCard, styles.incomeCard]}>
                  <Text style={styles.summaryLabel}>Income</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(incomeVsExpense.income)}
                  </Text>
                  <Text style={styles.summaryCount}>
                    {incomeVsExpense.incomeCount} transactions
                  </Text>
                </View>

                <View style={[styles.summaryCard, styles.expenseCard]}>
                  <Text style={styles.summaryLabel}>Expenses</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(incomeVsExpense.expense)}
                  </Text>
                  <Text style={styles.summaryCount}>
                    {incomeVsExpense.expenseCount} transactions
                  </Text>
                </View>
              </View>

              <View style={[styles.summaryCard, styles.netCard]}>
                <Text style={styles.summaryLabel}>Net Balance</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    styles.netValue,
                    incomeVsExpense.net >= 0 ? styles.positiveNet : styles.negativeNet,
                  ]}
                >
                  {incomeVsExpense.net >= 0 ? '+' : '-'}
                  {formatCurrency(incomeVsExpense.net)}
                </Text>
                <View
                  style={[
                    styles.netBadge,
                    incomeVsExpense.net >= 0 ? styles.positiveBadge : styles.negativeBadge,
                  ]}
                >
                  <Text style={styles.netBadgeText}>
                    {incomeVsExpense.net >= 0 ? '↑ Surplus' : '↓ Deficit'}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <Text style={styles.emptyText}>No income or expense data available</Text>
          )}
        </View>

        {/* Time-based Trends */}
        {timeTrends.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📈 Time-based Trends</Text>
            <View style={styles.chartCard}>
              <LineChart
                data={trendChartData}
                width={screenWidth - Spacing.md * 4}
                height={220}
                chartConfig={{
                  backgroundColor: Colors.light.surface,
                  backgroundGradientFrom: Colors.light.surface,
                  backgroundGradientTo: Colors.light.surface,
                  decimalPlaces: 0,
                  color: (opacity = 1) => Colors.light.primary,
                  labelColor: (opacity = 1) => Colors.light.textSecondary,
                  style: {
                    borderRadius: BorderRadius.lg,
                  },
                  propsForDots: {
                    r: '4',
                    strokeWidth: '2',
                  },
                }}
                bezier
                style={styles.chart}
              />
              <Text style={styles.chartCaption}>
                Income (green) vs Expenses (red) over time
              </Text>
            </View>
          </View>
        )}

        {/* Category-wise Analysis */}
        {categoryAnalysis.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Category-wise Analysis</Text>
            {categoryChartData.length > 0 && (
              <View style={styles.chartCard}>
                <PieChart
                  data={categoryChartData}
                  width={screenWidth - Spacing.md * 4}
                  height={220}
                  chartConfig={{
                    color: (opacity = 1) => Colors.light.primary,
                  }}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
                <Text style={styles.chartCaption}>Top expense categories</Text>
              </View>
            )}

            <View style={styles.categoryList}>
              {categoryAnalysis.slice(0, 5).map((cat, index) => (
                <View key={cat.category} style={styles.categoryItem}>
                  <View style={styles.categoryLeft}>
                    <View
                      style={[
                        styles.categoryDot,
                        { backgroundColor: categoryChartData[index]?.color || Colors.light.primary },
                      ]}
                    />
                    <Text style={styles.categoryName}>{cat.category}</Text>
                  </View>
                  <View style={styles.categoryRight}>
                    <Text style={styles.categoryAmount}>
                      {formatCurrency(cat.totalAmount)}
                    </Text>
                    <Text style={styles.categoryPercent}>
                      {cat.percentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Budget Performance */}
        {budgetPerformance.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Budget Performance</Text>
            {budgetPerformance.slice(0, 5).map((budget) => (
              <View key={budget.budgetId} style={styles.budgetCard}>
                <View style={styles.budgetHeader}>
                  <Text style={styles.budgetCategory}>{budget.category}</Text>
                  <View
                    style={[
                      styles.budgetStatusBadge,
                      budget.status === 'over' && styles.budgetOverBadge,
                      budget.status === 'near' && styles.budgetNearBadge,
                      budget.status === 'under' && styles.budgetUnderBadge,
                    ]}
                  >
                    <Text style={styles.budgetStatusText}>
                      {budget.status === 'over' && '⚠️ Over'}
                      {budget.status === 'near' && '⚡ Near Limit'}
                      {budget.status === 'under' && '✅ On Track'}
                    </Text>
                  </View>
                </View>

                <View style={styles.budgetAmounts}>
                  <Text style={styles.budgetSpent}>
                    Spent: {formatCurrency(budget.spentAmount)}
                  </Text>
                  <Text style={styles.budgetLimit}>
                    / {formatCurrency(budget.budgetAmount)}
                  </Text>
                </View>

                <View style={styles.budgetProgressTrack}>
                  <View
                    style={[
                      styles.budgetProgressFill,
                      {
                        width: `${Math.min(budget.percentageUsed, 100)}%`,
                        backgroundColor:
                          budget.status === 'over'
                            ? Colors.light.error
                            : budget.status === 'near'
                            ? '#FFA500'
                            : Colors.light.success,
                      },
                    ]}
                  />
                </View>

                <Text style={styles.budgetPercent}>
                  {budget.percentageUsed.toFixed(1)}% used • {formatCurrency(budget.remainingAmount)}{' '}
                  remaining
                </Text>
              </View>
            ))}

            {budgetPerformance.length > 5 && (
              <TouchableOpacity
                style={styles.viewMoreButton}
                onPress={() => router.push('/(tabs)/budget')}
              >
                <Text style={styles.viewMoreText}>
                  View all {budgetPerformance.length} budgets →
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Empty State */}
        {!incomeVsExpense &&
          categoryAnalysis.length === 0 &&
          timeTrends.length === 0 &&
          budgetPerformance.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text style={styles.emptyTitle}>No Analytics Data Yet</Text>
              <Text style={styles.emptySubtitle}>
                Start adding transactions and budgets to see your financial analytics here.
              </Text>
              <TouchableOpacity
                style={styles.addTransactionButton}
                onPress={() => router.push('/(tabs)/transactions/add')}
              >
                <Text style={styles.addTransactionText}>+ Add Transaction</Text>
              </TouchableOpacity>
            </View>
          )}

        {/* Custom Reports Button */}
        <TouchableOpacity
          style={styles.customReportsButton}
          onPress={() => router.push('/(tabs)/analytics/reports')}
        >
          <Text style={styles.customReportsText}>🔧 Create Custom Report</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundSecondary,
  },
  loadingText: {
    marginTop: Spacing.md,
    color: Colors.light.textSecondary,
    fontSize: Typography.fontSize.base,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  errorTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  errorMessage: {
    color: Colors.light.error,
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  retryButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  retryButtonText: {
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.base,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
  },
  reportsButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  reportsButtonText: {
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.sm,
  },

  // Date Range Selector
  dateRangeContainer: {
    marginBottom: Spacing.lg,
  },
  dateRangeChips: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dateChip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
  },
  dateChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  dateChipText: {
    color: Colors.light.textSecondary,
    fontWeight: Typography.fontWeight.medium,
    fontSize: Typography.fontSize.sm,
  },
  dateChipTextActive: {
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
  },

  // Section
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },

  // Summary Cards
  summaryCards: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  incomeCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.success,
  },
  expenseCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.error,
  },
  netCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.accent,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
  },
  summaryValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  summaryCount: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
  },
  netValue: {
    fontSize: Typography.fontSize.xxl,
  },
  positiveNet: {
    color: Colors.light.success,
  },
  negativeNet: {
    color: Colors.light.error,
  },
  netBadge: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
  },
  positiveBadge: {
    backgroundColor: Colors.light.success + '20',
  },
  negativeBadge: {
    backgroundColor: Colors.light.error + '20',
  },
  netBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },

  // Charts
  chartCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: Spacing.md,
  },
  chart: {
    borderRadius: BorderRadius.lg,
  },
  chartCaption: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },

  // Category List
  categoryList: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.sm,
  },
  categoryName: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.text,
    flex: 1,
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  categoryPercent: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
  },

  // Budget Performance
  budgetCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  budgetCategory: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  budgetStatusBadge: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  budgetOverBadge: {
    backgroundColor: Colors.light.error + '20',
  },
  budgetNearBadge: {
    backgroundColor: '#FFA50020',
  },
  budgetUnderBadge: {
    backgroundColor: Colors.light.success + '20',
  },
  budgetStatusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  budgetAmounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.sm,
  },
  budgetSpent: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
  },
  budgetLimit: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginLeft: Spacing.xs,
  },
  budgetProgressTrack: {
    height: 8,
    backgroundColor: Colors.light.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  budgetProgressFill: {
    height: 8,
  },
  budgetPercent: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
  },
  viewMoreButton: {
    alignSelf: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  viewMoreText: {
    color: Colors.light.primary,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.sm,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    marginTop: Spacing.xxl,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
    maxWidth: 280,
    marginBottom: Spacing.lg,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  addTransactionButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  addTransactionText: {
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.base,
  },

  // Custom Reports Button
  customReportsButton: {
    backgroundColor: Colors.light.accent,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    shadowColor: Colors.light.accent,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    marginTop: Spacing.md,
  },
  customReportsText: {
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.base,
  },
});
