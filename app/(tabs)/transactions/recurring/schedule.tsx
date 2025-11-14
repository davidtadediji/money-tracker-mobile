import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useRecurringTransaction } from '@/contexts/RecurringTransactionContext';
import { Colors } from '@/constants/theme';
import { BorderRadius, Spacing, Typography } from '@/constants/designTokens';
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

const getDaysUntil = (date: string) => {
  const today = new Date();
  const targetDate = new Date(date);
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

interface ScheduleItem {
  recurring: RecurringTransaction;
  daysUntil: number;
}

export default function RecurringSchedule() {
  const router = useRouter();
  const { recurringTransactions, loading } = useRecurringTransaction();
  const [filterPeriod, setFilterPeriod] = useState<'upcoming' | 'thisWeek' | 'thisMonth' | 'all'>('upcoming');

  const scheduleItems = useMemo(() => {
    const items: ScheduleItem[] = recurringTransactions
      .filter(r => r.is_active)
      .map(r => ({
        recurring: r,
        daysUntil: getDaysUntil(r.next_occurrence_date),
      }))
      .sort((a, b) => a.daysUntil - b.daysUntil);

    switch (filterPeriod) {
      case 'upcoming':
        return items.filter(item => item.daysUntil >= 0 && item.daysUntil <= 7);
      case 'thisWeek':
        return items.filter(item => item.daysUntil >= 0 && item.daysUntil <= 7);
      case 'thisMonth':
        return items.filter(item => item.daysUntil >= 0 && item.daysUntil <= 30);
      case 'all':
      default:
        return items;
    }
  }, [recurringTransactions, filterPeriod]);

  const renderScheduleItem = ({ item }: { item: ScheduleItem }) => {
    const { recurring, daysUntil } = item;
    const icon = getCategoryIcon(recurring.category);
    const isIncome = recurring.type === 'income';
    const isPast = daysUntil < 0;
    const isToday = daysUntil === 0;
    const isTomorrow = daysUntil === 1;

    let dayText = '';
    if (isPast) {
      dayText = `Overdue by ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''}`;
    } else if (isToday) {
      dayText = 'Today';
    } else if (isTomorrow) {
      dayText = 'Tomorrow';
    } else {
      dayText = `In ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`;
    }

    return (
      <View style={styles.scheduleCard}>
        <View style={styles.scheduleCardLeft}>
          <Text style={styles.scheduleIcon}>{icon}</Text>
          <View style={styles.scheduleInfo}>
            <Text style={styles.scheduleCategory}>{recurring.category}</Text>
            <Text style={styles.scheduleFrequency}>{formatFrequency(recurring.frequency)}</Text>
            <Text style={styles.scheduleDate}>{formatDate(recurring.next_occurrence_date)}</Text>
          </View>
        </View>
        <View style={styles.scheduleCardRight}>
          <Text style={[styles.scheduleAmount, { color: isIncome ? Colors.light.success : Colors.light.error }]}>
            {isIncome ? '+' : '-'}{formatCurrency(recurring.amount)}
          </Text>
          <View style={[
            styles.scheduleBadge,
            isPast && styles.scheduleBadgeOverdue,
            isToday && styles.scheduleBadgeToday,
          ]}>
            <Text style={[
              styles.scheduleBadgeText,
              isPast && styles.scheduleBadgeTextOverdue,
              isToday && styles.scheduleBadgeTextToday,
            ]}>
              {dayText}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading schedule...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{'<'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Recurring Schedule</Text>
        <Text style={styles.subtitle}>Upcoming transactions</Text>
      </View>

      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterChip, filterPeriod === 'upcoming' && styles.filterChipActive]}
          onPress={() => setFilterPeriod('upcoming')}
        >
          <Text style={[styles.filterChipText, filterPeriod === 'upcoming' && styles.filterChipTextActive]}>
            Next 7 Days
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterPeriod === 'thisMonth' && styles.filterChipActive]}
          onPress={() => setFilterPeriod('thisMonth')}
        >
          <Text style={[styles.filterChipText, filterPeriod === 'thisMonth' && styles.filterChipTextActive]}>
            This Month
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filterPeriod === 'all' && styles.filterChipActive]}
          onPress={() => setFilterPeriod('all')}
        >
          <Text style={[styles.filterChipText, filterPeriod === 'all' && styles.filterChipTextActive]}>
            All
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={scheduleItems}
        keyExtractor={(item) => item.recurring.id}
        renderItem={renderScheduleItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No upcoming recurring transactions</Text>
            <Text style={styles.emptySubtext}>Create active recurring transactions to see their schedule</Text>
          </View>
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
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.md,
    color: Colors.light.textSecondary,
  },
  header: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    marginBottom: Spacing.sm,
  },
  backText: {
    fontSize: Typography.fontSize.md,
    color: Colors.light.primary,
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.xxs,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  filtersContainer: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  filterChip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterChipText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.text,
  },
  filterChipTextActive: {
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  scheduleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  scheduleCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  scheduleIcon: {
    fontSize: 24,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleCategory: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  scheduleFrequency: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xxs,
  },
  scheduleDate: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xxs,
  },
  scheduleCardRight: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  scheduleAmount: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  scheduleBadge: {
    paddingVertical: Spacing.xxs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.light.primaryBackground,
  },
  scheduleBadgeToday: {
    backgroundColor: Colors.light.successBackground,
  },
  scheduleBadgeOverdue: {
    backgroundColor: Colors.light.errorBackground,
  },
  scheduleBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.primary,
  },
  scheduleBadgeTextToday: {
    color: Colors.light.success,
  },
  scheduleBadgeTextOverdue: {
    color: Colors.light.error,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
});

