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
import { ActivityIndicator, Alert, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type PeriodFilter = 'all' | 'weekly' | 'monthly' | 'yearly';
type SortOption = 'recent' | 'limit' | 'spent';

export default function BudgetIndex() {
  const router = useRouter();
  const { budgets, loading, error, deleteBudget, refreshBudgets } = useBudget();
  
  // Filter and sort state
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('recent');

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

  const handleEditBudget = (budgetId: string) => {
    router.push(`/(tabs)/budget/${budgetId}`);
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatPeriod = (period: string) => {
    return period.charAt(0).toUpperCase() + period.slice(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Filter and sort budgets
  const filteredAndSortedBudgets = useMemo(() => {
    let result = [...budgets];

    // Apply period filter
    if (periodFilter !== 'all') {
      result = result.filter((budget) => budget.period === periodFilter);
    }

    // Apply sorting
    switch (sortOption) {
      case 'recent':
        // Already sorted by created_at from the API (newest first)
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'limit':
        // Highest limit first
        result.sort((a, b) => b.limit_amount - a.limit_amount);
        break;
      case 'spent':
        // Note: This would require actual spending data
        // For now, just sort by limit as a placeholder
        // TODO: Fetch spending data and sort by actual spent amount
        result.sort((a, b) => b.limit_amount - a.limit_amount);
        break;
    }

    return result;
  }, [budgets, periodFilter, sortOption]);

  const renderBudgetCard = ({ item }: { item: Budget }) => {
    return (
      <TouchableOpacity 
        style={styles.budgetCardWrapper}
        onPress={() => router.push(`/(tabs)/budget/${item.id}`)}
        activeOpacity={0.7}
      >
        {/* Budget vs Actual Component with spending tracking */}
        <BudgetVsActual
          budgetId={item.id}
          category={item.category}
          limitAmount={item.limit_amount}
          period={item.period}
          startDate={item.start_date}
        />

        {/* Period and Start Date Info */}
        <View style={styles.budgetMetadata}>
          <Text style={styles.periodBadge}>{formatPeriod(item.period)}</Text>
          <Text style={styles.startDate}>Started: {formatDate(item.start_date)}</Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => handleEditBudget(item.id)}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeleteBudget(item.id, item.category)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Show error state
  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.title}>Budget Overview</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Unable to Load Budgets</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshBudgets}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Show loading state on initial load
  if (loading && budgets.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.title}>Budget Overview</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#111" />
          <Text style={styles.loadingText}>Loading budgets...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header with title and create button */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Budget Overview</Text>
          <Text style={styles.subtitle}>Plan your spending limits by category.</Text>
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/(tabs)/budget/create')}
        >
          <Text style={styles.createButtonText}>+ Create</Text>
        </TouchableOpacity>
      </View>

      {/* Budget list or empty state */}
      {budgets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>No budgets yet</Text>
          <Text style={styles.emptySubtitle}>
            Create your first budget to start tracking your spending limits
          </Text>
          <TouchableOpacity
            style={[styles.createButton, { marginTop: 16 }]}
            onPress={() => router.push('/(tabs)/budget/create')}
          >
            <Text style={styles.createButtonText}>Create Your First Budget</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Budget Overview Section */}
            <BudgetOverview budgets={budgets} />

            {/* Filter and Sort Controls */}
            <View style={styles.controlsContainer}>
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
              <View style={styles.filterChips}>
                {[
                  { value: 'recent', label: 'Most Recent' },
                  { value: 'limit', label: 'Highest Limit' },
                  { value: 'spent', label: 'Most Spent' },
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
            </View>

            {/* Budget count */}
            <Text style={styles.budgetCount}>
              {filteredAndSortedBudgets.length} {filteredAndSortedBudgets.length === 1 ? 'budget' : 'budgets'}
            </Text>
          </View>

          {/* Budget List */}
          <FlatList
            data={filteredAndSortedBudgets}
            keyExtractor={(item) => item.id}
            renderItem={renderBudgetCard}
            contentContainerStyle={styles.listContent}
            refreshing={loading}
            onRefresh={refreshBudgets}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.light.backgroundSecondary,
  },
  header: {
    padding: Spacing.md,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: { 
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
  },
  subtitle: { 
    color: Colors.light.textSecondary,
    marginTop: 4,
    fontSize: Typography.fontSize.sm,
  },
  createButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xl,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: { 
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.sm,
  },
  
  // Loading state
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

  // Error state
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
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.base,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
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
  },

  // Filter and sort controls
  controlsContainer: {
    backgroundColor: Colors.light.surface,
    padding: Spacing.md,
    borderBottomWidth: 0,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
    flexWrap: 'wrap',
    gap: Spacing.sm,
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
  budgetCount: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },

  // Budget list
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },

  // Budget card wrapper
  budgetCardWrapper: {
    marginBottom: Spacing.md,
  },

  // Budget metadata (period and start date)
  budgetMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  periodBadge: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    backgroundColor: Colors.light.secondaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  startDate: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
  },

  // Action buttons
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  editButton: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  editButtonText: {
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.sm,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.error,
  },
  deleteButtonText: {
    color: Colors.light.error,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.sm,
  },
});
