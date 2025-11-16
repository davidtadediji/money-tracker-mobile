import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTransactions } from '@/contexts/TransactionContext';
import { useBalanceSheet } from '@/contexts/BalanceSheetContext';
import { Colors } from '@/constants/theme';
import { BorderRadius, Spacing, Typography } from '@/constants/designTokens';
import { Transaction } from '@/types/database';

type FilterType = 'all' | 'income' | 'expense';
type SortOption = 'date' | 'amount';

export default function TransactionsIndex() {
  const router = useRouter();
  const { transactions, loading, error, refreshTransactions, deleteTransaction, stats } = useTransactions();
  const {
    assets,
    liabilities,
    totalAssets,
    totalLiabilities,
    netWorth,
    loading: balanceLoading,
    refresh: refreshBalance,
  } = useBalanceSheet();

  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date');

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Apply filter
    if (filterType !== 'all') {
      filtered = filtered.filter((txn) => txn.type === filterType);
    }

    // Apply sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return b.amount - a.amount;
      }
    });

    return filtered;
  }, [transactions, filterType, sortBy]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshTransactions(), refreshBalance()]);
    setRefreshing(false);
  };

  const handleDelete = (transaction: Transaction) => {
    Alert.alert(
      'Delete Transaction',
      `Are you sure you want to delete this ${transaction.category} transaction?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { success, error } = await deleteTransaction(transaction.id);
            if (!success) {
              Alert.alert('Error', error || 'Failed to delete transaction');
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number): string => {
    return `$${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => router.push(`/(tabs)/transactions/${item.id}`)}
      onLongPress={() => handleDelete(item)}
    >
      <View style={styles.itemLeft}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: item.type === 'income' ? Colors.light.successBackground : Colors.light.errorBackground },
          ]}
        >
          <Text style={styles.iconText}>{item.type === 'income' ? '↑' : '↓'}</Text>
        </View>
        <View style={styles.itemTextContainer}>
          <Text style={styles.itemCategory}>{item.category}</Text>
          <Text style={styles.itemDate}>{formatDate(item.date)}</Text>
          {item.description && <Text style={styles.itemDescription} numberOfLines={1}>{item.description}</Text>}
        </View>
      </View>
      <View style={styles.itemRight}>
        <Text
          style={[
            styles.itemAmount,
            { color: item.type === 'income' ? Colors.light.success : Colors.light.error },
          ]}
        >
          {item.type === 'income' ? '+' : '-'}
          {formatCurrency(item.amount)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading && transactions.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Transactions</Text>
          {stats && (
            <Text style={styles.subtitle}>
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.recurringButton}
            onPress={() => router.push('/(tabs)/transactions/recurring')}
          >
            <Text style={styles.recurringButtonText}>🔄</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.smartButton}
            onPress={() => router.push('/(tabs)/transactions/smart-entry')}
          >
            <Text style={styles.smartButtonText}>Smart</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/(tabs)/transactions/add')}
          >
            <Text style={styles.primaryButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Balance Summary Card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceTitle}>Net Worth</Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/transactions/balance')}
            style={styles.viewDetailsButton}
          >
            <Text style={styles.viewDetailsText}>View Details →</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.netWorthValue, { color: netWorth >= 0 ? Colors.light.success : Colors.light.error }]}>
          {netWorth >= 0 ? '' : '-'}{formatCurrency(Math.abs(netWorth))}
        </Text>
        <View style={styles.balanceBreakdown}>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceItemLabel}>Assets</Text>
            <Text style={styles.balanceItemValue}>{formatCurrency(totalAssets)}</Text>
          </View>
          <View style={styles.balanceDivider} />
          <View style={styles.balanceItem}>
            <Text style={styles.balanceItemLabel}>Liabilities</Text>
            <Text style={[styles.balanceItemValue, { color: Colors.light.error }]}>
              {formatCurrency(totalLiabilities)}
            </Text>
          </View>
        </View>
      </View>

      {/* Transaction Stats Cards */}
      {stats && (
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: Colors.light.successBackground }]}>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={[styles.statValue, { color: Colors.light.success }]}>
              {formatCurrency(stats.totalIncome)}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.light.errorBackground }]}>
            <Text style={styles.statLabel}>Expense</Text>
            <Text style={[styles.statValue, { color: Colors.light.error }]}>
              {formatCurrency(stats.totalExpense)}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.light.secondaryLight }]}>
            <Text style={styles.statLabel}>Net</Text>
            <Text
              style={[
                styles.statValue,
                { color: stats.netAmount >= 0 ? Colors.light.success : Colors.light.error },
              ]}
            >
              {formatCurrency(stats.netAmount)}
            </Text>
          </View>
        </View>
      )}

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterChips}>
          {(['all', 'income', 'expense'] as FilterType[]).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, filterType === filter && styles.filterChipActive]}
              onPress={() => setFilterType(filter)}
            >
              <Text
                style={[styles.filterChipText, filterType === filter && styles.filterChipTextActive]}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortBy(sortBy === 'date' ? 'amount' : 'date')}
        >
          <Text style={styles.sortButtonText}>
            {sortBy === 'date' ? '📅' : '💰'} Sort
          </Text>
        </TouchableOpacity>
      </View>

      {/* Transactions List */}
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.light.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💸</Text>
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the "Add" button to create your first transaction
            </Text>
          </View>
        }
      />
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
  },
  subtitle: {
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
    fontSize: Typography.fontSize.xs,
  },
  primaryButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.xl,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: 12,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  recurringButton: {
    backgroundColor: Colors.light.surface,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recurringButtonText: {
    fontSize: 18,
  },
  smartButton: {
    backgroundColor: Colors.light.accent,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.xl,
    shadowColor: Colors.light.accent,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smartButtonText: {
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: 12,
  },

  // Balance Card
  balanceCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.xxl,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  balanceTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.textSecondary,
  },
  viewDetailsButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewDetailsText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  netWorthValue: {
    fontSize: Typography.fontSize.hero,
    fontWeight: Typography.fontWeight.extrabold,
    marginBottom: Spacing.md,
  },
  balanceBreakdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  balanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  balanceItemLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
    marginBottom: 4,
    fontWeight: Typography.fontWeight.medium,
  },
  balanceItemValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
  },
  balanceDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.light.border,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  statValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },

  // Filters
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  filterChips: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flex: 1,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
  },
  filterChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterChipText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.light.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
  },
  sortButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
  },
  sortButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.light.text,
  },

  // List
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  iconText: {
    fontSize: 20,
    fontWeight: Typography.fontWeight.bold,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemCategory: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  itemDate: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  itemDescription: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemAmount: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingTop: Spacing.xxl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
});
