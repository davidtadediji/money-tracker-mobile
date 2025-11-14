import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useBalanceSheet } from '@/contexts/BalanceSheetContext';
import { Colors } from '@/constants/theme';
import { BorderRadius, Spacing, Typography } from '@/constants/designTokens';

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

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number): string => {
    return `$${Math.abs(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getNetWorthColor = (): string => {
    return netWorth >= 0 ? Colors.light.success : Colors.light.error;
  };

  // Calculate percentage change (placeholder - would need historical data)
  const percentageChange = 5.2; // Mock data

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
          <View>
            <Text style={styles.title}>Balance Sheet</Text>
            <Text style={styles.subtitle}>Your financial position</Text>
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
          <View style={styles.changeContainer}>
            <Text
              style={[
                styles.changeText,
                { color: percentageChange >= 0 ? Colors.light.success : Colors.light.error },
              ]}
            >
              {percentageChange >= 0 ? '↗' : '↘'} {Math.abs(percentageChange)}%
            </Text>
            <Text style={styles.changeLabel}>vs last {timePeriod}</Text>
          </View>
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
              onPress={() => router.push('/(tabs)/balance-sheet/add-asset')}
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
                  onPress={() => router.push(`/(tabs)/balance-sheet/asset/${asset.id}`)}
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
              onPress={() => router.push('/(tabs)/balance-sheet/add-liability')}
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
                  onPress={() => router.push(`/(tabs)/balance-sheet/liability/${liability.id}`)}
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
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
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

