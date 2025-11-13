import BudgetOverview from '@/components/BudgetOverview';
import BudgetVsActual from '@/components/BudgetVsActual';
import { useBudget } from '@/contexts/BudgetContext';
import { Budget } from '@/types/database';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
    backgroundColor: '#f8f8f8' 
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { 
    fontSize: 22, 
    fontWeight: '700',
    color: '#111',
  },
  subtitle: { 
    color: '#666', 
    marginTop: 4,
    fontSize: 14,
  },
  createButton: {
    backgroundColor: '#111',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  createButtonText: { 
    color: '#fff', 
    fontWeight: '600',
    fontSize: 14,
  },
  
  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },

  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  errorMessage: {
    color: '#ff3b30',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#111',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Filter and sort controls
  controlsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  filterChipActive: {
    backgroundColor: '#111',
    borderColor: '#111',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  budgetCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },

  // Budget list
  listContent: {
    padding: 16,
  },

  // Budget card wrapper
  budgetCardWrapper: {
    marginBottom: 16,
  },

  // Budget metadata (period and start date)
  budgetMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginTop: 8,
    marginBottom: 12,
  },
  periodBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  startDate: {
    fontSize: 12,
    color: '#999',
  },

  // Action buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#111',
    fontWeight: '600',
    fontSize: 14,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff3b30',
  },
  deleteButtonText: {
    color: '#ff3b30',
    fontWeight: '600',
    fontSize: 14,
  },
});
