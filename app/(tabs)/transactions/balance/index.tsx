import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import { useBalanceSheet } from '@/contexts/BalanceSheetContext';
import { supabase } from '@/lib/supabase';
import { exportToCSV } from '@/utils/exportBalanceSheet';
import { Colors } from '@/constants/theme';
import { BorderRadius, Spacing, Typography } from '@/constants/designTokens';
import { BalanceSnapshot } from '@/types/database';

type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

const ASSET_ICONS: Record<string, string> = {
  cash: '💵',
  bank: '🏦',
  investment: '📈',
  property: '🏠',
  other: '💰',
};

const LIABILITY_ICONS: Record<string, string> = {
  credit_card: '💳',
  loan: '🏦',
  mortgage: '🏠',
  other: '📋',
};

export default function BalanceSheetIndex() {
  const router = useRouter();
  const {
    assets,
    liabilities,
    totalAssets,
    totalLiabilities,
    netWorth,
    loading,
    refresh,
  } = useBalanceSheet();

  const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly');
  const [refreshing, setRefreshing] = useState(false);
  const [snapshots, setSnapshots] = useState<BalanceSnapshot[]>([]);
  const [loadingSnapshots, setLoadingSnapshots] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch snapshots when period changes
  useEffect(() => {
    fetchSnapshots();
  }, [timePeriod]);

  const fetchSnapshots = async () => {
    setLoadingSnapshots(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Calculate date range based on period
      const endDate = new Date();
      const startDate = new Date();

      switch (timePeriod) {
        case 'daily':
          startDate.setDate(endDate.getDate() - 7); // Last 7 days
          break;
        case 'weekly':
          startDate.setDate(endDate.getDate() - 28); // Last 4 weeks
          break;
        case 'monthly':
          startDate.setMonth(endDate.getMonth() - 6); // Last 6 months
          break;
        case 'yearly':
          startDate.setFullYear(endDate.getFullYear() - 3); // Last 3 years
          break;
      }

      const { data, error } = await supabase
        .from('balance_snapshots')
        .select('*')
        .eq('user_id', user.id)
        .gte('snapshot_date', startDate.toISOString().split('T')[0])
        .lte('snapshot_date', endDate.toISOString().split('T')[0])
        .order('snapshot_date', { ascending: true });

      if (error) {
        console.error('Error fetching snapshots:', error);
      } else {
        setSnapshots(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingSnapshots(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    await fetchSnapshots();
    setRefreshing(false);
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const { success, error } = await exportToCSV({
        assets,
        liabilities,
        netWorth,
        totalAssets,
        totalLiabilities,
      });

      if (success) {
        Alert.alert(
          'Export Successful',
          'Your balance sheet has been exported and is ready to share.'
        );
      } else {
        Alert.alert('Export Failed', error || 'Failed to export balance sheet');
      }
    } catch (error) {
      Alert.alert('Export Failed', 'An unexpected error occurred');
    } finally {
      setIsExporting(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return `$${Math.abs(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatCurrencyShort = (amount: number): string => {
    const absAmount = Math.abs(amount);
    if (absAmount >= 1000000) {
      return `$${(absAmount / 1000000).toFixed(1)}M`;
    } else if (absAmount >= 1000) {
      return `$${(absAmount / 1000).toFixed(1)}K`;
    }
    return `$${absAmount.toFixed(0)}`;
  };

  const getNetWorthColor = (): string => {
    return netWorth >= 0 ? Colors.light.success : Colors.light.error;
  };

  // Calculate percentage change from snapshots
  const percentageChange = useMemo(() => {
    if (snapshots.length < 2) return 0;

    const currentValue = snapshots[snapshots.length - 1].net_worth;
    const previousValue = snapshots[0].net_worth;

    if (previousValue === 0) return 0;

    return ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
  }, [snapshots]);

  const getPeriodLabel = (): string => {
    switch (timePeriod) {
      case 'daily':
        return 'last week';
      case 'weekly':
        return 'last month';
      case 'monthly':
        return 'last 6 months';
      case 'yearly':
        return 'last 3 years';
    }
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    if (snapshots.length === 0) {
      // Default empty data
      return {
        labels: ['', '', '', '', ''],
        datasets: [
          {
            data: [0, 0, 0, 0, 0],
            strokeWidth: 2,
          },
        ],
      };
    }

    // Limit to max 10 data points for readability
    const step = Math.max(1, Math.floor(snapshots.length / 10));
    const filteredSnapshots = snapshots.filter((_, index) => index % step === 0);

    return {
      labels: filteredSnapshots.map((s) => {
        const date = new Date(s.snapshot_date);
        if (timePeriod === 'daily') {
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } else if (timePeriod === 'weekly' || timePeriod === 'monthly') {
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } else {
          return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        }
      }),
      datasets: [
        {
          data: filteredSnapshots.map((s) => s.net_worth),
          strokeWidth: 3,
          color: (opacity = 1) => Colors.light.primary,
        },
      ],
    };
  }, [snapshots, timePeriod]);

  const screenWidth = Dimensions.get('window').width;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
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
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Balance Sheet</Text>
            <Text style={styles.subtitle}>Your financial position</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => router.push('/(tabs)/transactions/balance/settings')}
            >
              <Text style={styles.settingsButtonIcon}>⚙️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.exportButton}
              onPress={handleExport}
              disabled={isExporting || (assets.length === 0 && liabilities.length === 0)}
            >
              {isExporting ? (
                <ActivityIndicator size="small" color={Colors.light.primary} />
              ) : (
                <Text style={styles.exportButtonText}>Export</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Time Period Selector */}
        <View style={styles.periodSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.periodChips}>
              {(['daily', 'weekly', 'monthly', 'yearly'] as TimePeriod[]).map((period) => (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.periodChip,
                    timePeriod === period && styles.periodChipActive,
                  ]}
                  onPress={() => setTimePeriod(period)}
                >
                  <Text
                    style={[
                      styles.periodChipText,
                      timePeriod === period && styles.periodChipTextActive,
                    ]}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Net Worth Card */}
        <View style={styles.netWorthCard}>
          <Text style={styles.netWorthLabel}>Net Worth</Text>
          <Text style={[styles.netWorthAmount, { color: getNetWorthColor() }]}>
            {netWorth >= 0 ? '' : '-'}
            {formatCurrency(netWorth)}
          </Text>
          {snapshots.length >= 2 && (
            <View style={styles.changeContainer}>
              <Text
                style={[
                  styles.changeText,
                  { color: percentageChange >= 0 ? Colors.light.success : Colors.light.error },
                ]}
              >
                {percentageChange >= 0 ? '↗' : '↘'} {Math.abs(percentageChange).toFixed(1)}%
              </Text>
              <Text style={styles.changeLabel}>from {getPeriodLabel()}</Text>
            </View>
          )}
        </View>

        {/* Net Worth Trend Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Net Worth Trend</Text>
          {loadingSnapshots ? (
            <View style={styles.chartLoading}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
              <Text style={styles.chartLoadingText}>Loading trend data...</Text>
            </View>
          ) : snapshots.length === 0 ? (
            <View style={styles.chartEmpty}>
              <Text style={styles.chartEmptyIcon}>📊</Text>
              <Text style={styles.chartEmptyText}>No trend data available yet</Text>
              <Text style={styles.chartEmptySubtext}>
                Come back after a few days to see your net worth trend
              </Text>
            </View>
          ) : (
            <LineChart
              data={chartData}
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
                  borderRadius: BorderRadius.xl,
                },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: Colors.light.primary,
                  fill: Colors.light.surface,
                },
                propsForBackgroundLines: {
                  strokeDasharray: '',
                  stroke: Colors.light.border,
                  strokeWidth: 1,
                },
              }}
              bezier
              style={styles.chart}
              formatYLabel={(value) => formatCurrencyShort(parseFloat(value))}
              withInnerLines={true}
              withOuterLines={true}
              withVerticalLines={false}
              withHorizontalLines={true}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              fromZero={false}
            />
          )}
        </View>

        {/* Assets Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Assets</Text>
              <Text style={styles.sectionAmount}>{formatCurrency(totalAssets)}</Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/(tabs)/transactions/balance/add-asset')}
            >
              <Text style={styles.addButtonText}>+ Add Asset</Text>
            </TouchableOpacity>
          </View>

          {assets.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💰</Text>
              <Text style={styles.emptyText}>No assets yet</Text>
              <Text style={styles.emptySubtext}>Add your first asset to track your wealth</Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {assets.map((asset) => (
                <TouchableOpacity
                  key={asset.id}
                  style={styles.itemCard}
                  onPress={() => router.push(`/(tabs)/transactions/balance/asset/${asset.id}`)}
                >
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemIcon}>
                      {ASSET_ICONS[asset.type] || ASSET_ICONS.other}
                    </Text>
                    <View>
                      <Text style={styles.itemName}>{asset.name}</Text>
                      <Text style={styles.itemType}>
                        {asset.type.charAt(0).toUpperCase() + asset.type.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.itemValue}>{formatCurrency(asset.current_value)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Liabilities Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Liabilities</Text>
              <Text style={styles.sectionAmount}>{formatCurrency(totalLiabilities)}</Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/(tabs)/transactions/balance/add-liability')}
            >
              <Text style={styles.addButtonText}>+ Add Liability</Text>
            </TouchableOpacity>
          </View>

          {liabilities.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💳</Text>
              <Text style={styles.emptyText}>No liabilities yet</Text>
              <Text style={styles.emptySubtext}>Add debts or obligations to track</Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {liabilities.map((liability) => (
                <TouchableOpacity
                  key={liability.id}
                  style={styles.itemCard}
                  onPress={() => router.push(`/(tabs)/transactions/balance/liability/${liability.id}`)}
                >
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemIcon}>
                      {LIABILITY_ICONS[liability.type] || LIABILITY_ICONS.other}
                    </Text>
                    <View>
                      <Text style={styles.itemName}>{liability.name}</Text>
                      <Text style={styles.itemType}>
                        {liability.type.charAt(0).toUpperCase() +
                          liability.type.slice(1).replace('_', ' ')}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.itemValue, { color: Colors.light.error }]}>
                    {formatCurrency(liability.current_balance)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Bottom padding */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Summary Bar */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Assets</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalAssets)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Liabilities</Text>
          <Text style={[styles.summaryValue, { color: Colors.light.error }]}>
            {formatCurrency(totalLiabilities)}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabelBold}>Net Worth</Text>
          <Text style={[styles.summaryValueBold, { color: getNetWorthColor() }]}>
            {formatCurrency(netWorth)}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
  },
  subtitle: {
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
    fontSize: Typography.fontSize.base,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  settingsButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsButtonIcon: {
    fontSize: 20,
  },
  exportButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.surface,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportButtonText: {
    color: Colors.light.primary,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.sm,
  },

  // Period Selector
  periodSelector: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  periodChips: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  periodChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
  },
  periodChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  periodChipText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.light.textSecondary,
  },
  periodChipTextActive: {
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
  },

  // Net Worth Card
  netWorthCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    padding: Spacing.xl,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.xxl,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    alignItems: 'center',
  },
  netWorthLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  netWorthAmount: {
    fontSize: Typography.fontSize.hero,
    fontWeight: Typography.fontWeight.extrabold,
    marginBottom: Spacing.sm,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  changeText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  changeLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },

  // Chart
  chartContainer: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.xxl,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  chartTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  chart: {
    borderRadius: BorderRadius.xl,
    marginVertical: Spacing.xs,
  },
  chartLoading: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  chartLoadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  chartEmpty: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  chartEmptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  chartEmptyText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  chartEmptySubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },

  // Section
  section: {
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
  },
  sectionAmount: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
  },
  addButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  addButtonText: {
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.sm,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.xl,
    marginTop: Spacing.sm,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },

  // List
  listContainer: {
    gap: Spacing.sm,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  itemIcon: {
    fontSize: 32,
  },
  itemName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  itemType: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  itemValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
  },

  // Summary Bar
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: Colors.light.border,
    marginHorizontal: Spacing.xs,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
    marginBottom: 4,
    fontWeight: Typography.fontWeight.medium,
  },
  summaryValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  summaryLabelBold: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.text,
    marginBottom: 4,
    fontWeight: Typography.fontWeight.bold,
  },
  summaryValueBold: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.light.text,
  },
});
