import BudgetOverview from '@/components/BudgetOverview';
import BudgetVsActual from '@/components/BudgetVsActual';
import GlassCard from '@/components/ui/GlassCard';
import ModernButton from '@/components/ui/ModernButton';
import { useBudget } from '@/contexts/BudgetContext';
import { Colors } from '@/constants/theme';
import { BorderRadius, Spacing, Typography } from '@/constants/designTokens';
import { Budget } from '@/types/database';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type PeriodFilter = 'all' | 'weekly' | 'monthly' | 'yearly';
type SortOption = 'recent' | 'limit' | 'spent';

export default function BudgetIndex() {
  const router = useRouter();
  const { budgets, loading, error, deleteBudget, refreshBudgets } = useBudget();
  
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('recent');

  // Filter and sort budgets
  const filteredAndSortedBudgets = useMemo(() => {
    let result = [...budgets];

    if (periodFilter !== 'all') {
      result = result.filter((budget) => budget.period === periodFilter);
    }

    switch (sortOption) {
      case 'recent':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'limit':
        result.sort((a, b) => b.limit_amount - a.limit_amount);
        break;
      case 'spent':
        result.sort((a, b) => b.limit_amount - a.limit_amount);
        break;
    }

    return result;
  }, [budgets, periodFilter, sortOption]);

  const handleDeleteBudget = (budgetId: string, category: string) => {
    Alert.alert(
      'Delete Budget',
      `Are you sure you want to delete the budget for "${category}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { success, error } = await deleteBudget(budgetId);
            
            if (success) {
              Alert.alert('Success', 'Budget deleted successfully');
            } else {
              Alert.alert('Error', error || 'Failed to delete budget');
            }
          },
        },
      ]
    );
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading budgets...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <ModernButton
            title="Retry"
            variant="gradient"
            onPress={refreshBudgets}
            style={{ marginTop: Spacing.lg }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>Financial Planning</Text>
          <Text style={styles.title}>Budgets</Text>
        </View>
        <ModernButton
          title="Create"
          variant="gradient"
          size="sm"
          icon={<Text style={{ color: 'white', fontSize: 18 }}>+</Text>}
          onPress={() => router.push('/(tabs)/budget/create')}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Empty State */}
        {budgets.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💰</Text>
            <Text style={styles.emptyStateTitle}>No Budgets Yet</Text>
            <Text style={styles.emptyStateDescription}>
              Create your first budget to start tracking your spending limits.
            </Text>
            <ModernButton
              title="Create Your First Budget"
              variant="gradient"
              size="lg"
              onPress={() => router.push('/(tabs)/budget/create')}
              style={{ marginTop: Spacing.lg }}
            />
          </View>
        ) : (
          <View style={styles.content}>
            <BudgetOverview budgets={budgets} />

            {/* Filter and Sort Controls */}
            <GlassCard variant="light" padding="md" style={{ marginBottom: Spacing.lg }}>
              {/* Period Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Period</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.filterChips}>
                    {(['all', 'weekly', 'monthly', 'yearly'] as PeriodFilter[]).map((filter) => (
                      <TouchableOpacity
                        key={filter}
                        style={[
                          styles.filterChip,
                          periodFilter === filter && styles.filterChipActive,
                        ]}
                        onPress={() => setPeriodFilter(filter)}
                      >
                        <Text
                          style={[
                            styles.filterChipText,
                            periodFilter === filter && styles.filterChipTextActive,
                          ]}
                        >
                          {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Sort Options */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Sort By</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.filterChips}>
                    {[
                      { value: 'recent', label: 'Recent' },
                      { value: 'limit', label: 'Limit' },
                      { value: 'spent', label: 'Spent' },
                    ].map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.filterChip,
                          sortOption === option.value && styles.filterChipActive,
                        ]}
                        onPress={() => setSortOption(option.value as SortOption)}
                      >
                        <Text
                          style={[
                            styles.filterChipText,
                            sortOption === option.value && styles.filterChipTextActive,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Budget count */}
              <Text style={styles.budgetCount}>
                {filteredAndSortedBudgets.length} {filteredAndSortedBudgets.length === 1 ? 'budget' : 'budgets'}
              </Text>
            </GlassCard>

            {/* Budget List */}
            {filteredAndSortedBudgets.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.budgetCardWrapper}
                onPress={() => router.push(`/(tabs)/budget/${item.id}`)}
                activeOpacity={0.7}
              >
                <BudgetVsActual
                  budgetId={item.id}
                  category={item.category}
                  limitAmount={item.limit_amount}
                  period={item.period}
                  startDate={item.start_date}
                />
              </TouchableOpacity>
            ))}

            {/* Bottom padding */}
            <View style={{ height: 100 }} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.light.error,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  greeting: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
  },
  content: {
    paddingHorizontal: Spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    marginTop: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  emptyStateTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
    maxWidth: 280,
  },
  filterSection: {
    marginBottom: Spacing.md,
  },
  filterLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.sm,
  },
  filterChips: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  filterChip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.surface,
    borderWidth: 2,
    borderColor: Colors.light.border,
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
  budgetCount: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    fontWeight: Typography.fontWeight.medium,
  },
  budgetCardWrapper: {
    marginBottom: Spacing.md,
  },
});

