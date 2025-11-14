import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert, Switch, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useRecurringTransaction } from '@/contexts/RecurringTransactionContext';
import { Colors } from '@/constants/theme';
import { BorderRadius, Spacing, Typography } from '@/constants/designTokens';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { RecurringTransaction } from '@/types/database';
import { formatFrequency } from '@/services/recurringTransactionService';
import { getCategoryIcon } from '@/constants/categories';

const formatCurrency = (amount: number) => {
  return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (date: string) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

interface RecurringCardProps {
  recurring: RecurringTransaction;
  onPress: () => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
}

const RecurringCard: React.FC<RecurringCardProps> = ({ recurring, onPress, onToggleStatus }) => {
  const icon = getCategoryIcon(recurring.category);
  const isIncome = recurring.type === 'income';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.iconText}>{icon}</Text>
          <View style={styles.cardInfo}>
            <Text style={styles.cardCategory}>{recurring.category}</Text>
            <Text style={styles.cardFrequency}>{formatFrequency(recurring.frequency)}</Text>
          </View>
        </View>
        <View style={styles.cardHeaderRight}>
          <Text style={[styles.cardAmount, { color: isIncome ? Colors.light.success : Colors.light.error }]}>
            {isIncome ? '+' : '-'}{formatCurrency(recurring.amount)}
          </Text>
          <Switch
            value={recurring.is_active}
            onValueChange={(value) => onToggleStatus(recurring.id, value)}
            trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
            thumbColor={recurring.is_active ? Colors.light.onPrimary : Colors.light.textSecondary}
          />
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.cardDetailRow}>
          <Text style={styles.cardDetailLabel}>Next:</Text>
          <Text style={styles.cardDetailValue}>{formatDate(recurring.next_occurrence_date)}</Text>
        </View>
        {recurring.end_date && (
          <View style={styles.cardDetailRow}>
            <Text style={styles.cardDetailLabel}>Until:</Text>
            <Text style={styles.cardDetailValue}>{formatDate(recurring.end_date)}</Text>
          </View>
        )}
        {recurring.description && (
          <Text style={styles.cardDescription} numberOfLines={1}>{recurring.description}</Text>
        )}
      </View>

      <View style={styles.cardStatus}>
        <View style={[styles.statusBadge, { backgroundColor: recurring.is_active ? Colors.light.successBackground : Colors.light.border }]}>
          <Text style={[styles.statusText, { color: recurring.is_active ? Colors.light.success : Colors.light.textSecondary }]}>
            {recurring.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
        {recurring.notification_enabled && (
          <View style={styles.notificationBadge}>
            <IconSymbol name="bell.fill" size={12} color={Colors.light.primary} />
            <Text style={styles.notificationText}>{recurring.notification_days_before}d</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function RecurringTransactionsIndex() {
  const router = useRouter();
  const { recurringTransactions, loading, error, toggleStatus, refreshRecurringTransactions, deleteRecurringTransaction } = useRecurringTransaction();
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshRecurringTransactions();
    setRefreshing(false);
  }, [refreshRecurringTransactions]);

  const handleToggleStatus = useCallback(async (id: string, isActive: boolean) => {
    const { success, error: toggleError } = await toggleStatus(id, isActive);
    if (!success) {
      Alert.alert('Error', toggleError || 'Failed to update status');
    }
  }, [toggleStatus]);

  const handleEditRecurring = useCallback((id: string) => {
    router.push(`/(tabs)/transactions/recurring/edit/${id}`);
  }, [router]);

  const filteredRecurringTransactions = useMemo(() => {
    let filtered = recurringTransactions;

    if (filterType !== 'all') {
      filtered = filtered.filter(r => r.type === filterType);
    }

    if (filterStatus !== 'all') {
      const isActive = filterStatus === 'active';
      filtered = filtered.filter(r => r.is_active === isActive);
    }

    return filtered;
  }, [recurringTransactions, filterType, filterStatus]);

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading recurring transactions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.centerContainer}>
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
      <FlatList
        data={filteredRecurringTransactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecurringCard
            recurring={item}
            onPress={() => handleEditRecurring(item.id)}
            onToggleStatus={handleToggleStatus}
          />
        )}
        ListHeaderComponent={
          <>
            <View style={styles.headerRow}>
              <View>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                  <Text style={styles.backText}>{'<'} Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Recurring</Text>
                <Text style={styles.subtitle}>{filteredRecurringTransactions.length} recurring transaction{filteredRecurringTransactions.length !== 1 ? 's' : ''}</Text>
              </View>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push('/(tabs)/transactions/recurring/add')}
              >
                <Text style={styles.primaryButtonText}>+ Add</Text>
              </TouchableOpacity>
            </View>

            {/* Filter Chips */}
            <View style={styles.filtersContainer}>
              <Text style={styles.filterLabel}>Type:</Text>
              <View style={styles.chipGroup}>
                <TouchableOpacity
                  style={[styles.chip, filterType === 'all' && styles.chipActive]}
                  onPress={() => setFilterType('all')}
                >
                  <Text style={[styles.chipText, filterType === 'all' && styles.chipTextActive]}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.chip, filterType === 'income' && styles.chipActive]}
                  onPress={() => setFilterType('income')}
                >
                  <Text style={[styles.chipText, filterType === 'income' && styles.chipTextActive]}>Income</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.chip, filterType === 'expense' && styles.chipActive]}
                  onPress={() => setFilterType('expense')}
                >
                  <Text style={[styles.chipText, filterType === 'expense' && styles.chipTextActive]}>Expense</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.filterLabel}>Status:</Text>
              <View style={styles.chipGroup}>
                <TouchableOpacity
                  style={[styles.chip, filterStatus === 'all' && styles.chipActive]}
                  onPress={() => setFilterStatus('all')}
                >
                  <Text style={[styles.chipText, filterStatus === 'all' && styles.chipTextActive]}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.chip, filterStatus === 'active' && styles.chipActive]}
                  onPress={() => setFilterStatus('active')}
                >
                  <Text style={[styles.chipText, filterStatus === 'active' && styles.chipTextActive]}>Active</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.chip, filterStatus === 'inactive' && styles.chipActive]}
                  onPress={() => setFilterStatus('inactive')}
                >
                  <Text style={[styles.chipText, filterStatus === 'inactive' && styles.chipTextActive]}>Inactive</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.scheduleButton}
              onPress={() => router.push('/(tabs)/transactions/recurring/schedule')}
            >
              <IconSymbol name="calendar" size={20} color={Colors.light.primary} />
              <Text style={styles.scheduleButtonText}>View Schedule</Text>
            </TouchableOpacity>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconSymbol name="repeat" size={60} color={Colors.light.textSecondary} />
            <Text style={styles.emptyText}>No recurring transactions yet</Text>
            <Text style={styles.emptySubtext}>Create one to automate your income and expenses</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/(tabs)/transactions/recurring/add')}
            >
              <Text style={styles.emptyButtonText}>+ Add Recurring Transaction</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={[
          styles.listContent,
          filteredRecurringTransactions.length === 0 && styles.listContentEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.light.primary}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.md,
    color: Colors.light.textSecondary,
  },
  errorMessage: {
    fontSize: Typography.fontSize.md,
    color: Colors.light.error,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
  },
  retryButtonText: {
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.md,
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  backButton: {
    marginBottom: Spacing.xs,
  },
  backText: {
    fontSize: Typography.fontSize.md,
    color: Colors.light.primary,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.xxs,
  },
  subtitle: {
    color: Colors.light.textSecondary,
    fontSize: Typography.fontSize.sm,
  },
  primaryButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xl,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  primaryButtonText: {
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.sm,
  },
  filtersContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  filterLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  chipGroup: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  chip: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  chipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  chipText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.text,
  },
  chipTextActive: {
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.surface,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    gap: Spacing.sm,
  },
  scheduleButtonText: {
    color: Colors.light.primary,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.md,
  },
  card: {
    backgroundColor: Colors.light.surface,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  iconText: {
    fontSize: 24,
  },
  cardInfo: {
    flex: 1,
  },
  cardCategory: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  cardFrequency: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xxs,
  },
  cardHeaderRight: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  cardAmount: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  cardDetails: {
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  cardDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardDetailLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  cardDetailValue: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.text,
    fontWeight: Typography.fontWeight.medium,
  },
  cardDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
  cardStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  statusBadge: {
    paddingVertical: Spacing.xxs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  notificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
    paddingVertical: Spacing.xxs,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.light.primaryBackground,
    borderRadius: BorderRadius.sm,
  },
  notificationText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.md,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  emptyButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  emptyButtonText: {
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.md,
  },
});

