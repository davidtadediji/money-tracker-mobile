import { useBudget } from '@/contexts/BudgetContext';
import { Budget } from '@/types/database';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BudgetIndex() {
  const router = useRouter();
  const { budgets, loading, error, deleteBudget, refreshBudgets } = useBudget();

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
    // TODO: Navigate to edit screen when implemented
    Alert.alert('Edit Budget', 'Edit functionality coming soon!');
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

  const renderBudgetCard = ({ item }: { item: Budget }) => {
    // Placeholder progress calculation (replace with actual spending data later)
    const spent = 0; // TODO: Calculate from transactions
    const progress = item.limit_amount > 0 ? (spent / item.limit_amount) * 100 : 0;
    const progressCapped = Math.min(progress, 100);

    return (
      <View style={styles.budgetCard}>
        {/* Header with category and period badge */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.categoryText}>{item.category}</Text>
            <Text style={styles.periodBadge}>{formatPeriod(item.period)}</Text>
          </View>
        </View>

        {/* Limit and spent amounts */}
        <View style={styles.amountSection}>
          <Text style={styles.limitAmount}>{formatCurrency(item.limit_amount)}</Text>
          <Text style={styles.spentLabel}>
            Spent: {formatCurrency(spent)} of {formatCurrency(item.limit_amount)}
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${progressCapped}%` },
                progress > 100 && styles.progressBarOverflow
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{progressCapped.toFixed(0)}%</Text>
        </View>

        {/* Start date */}
        <Text style={styles.startDate}>Start: {formatDate(item.start_date)}</Text>

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
      </View>
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
        <FlatList
          data={budgets}
          keyExtractor={(item) => item.id}
          renderItem={renderBudgetCard}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={refreshBudgets}
          showsVerticalScrollIndicator={false}
        />
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

  // Budget list
  listContent: {
    padding: 16,
  },

  // Budget card
  budgetCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  categoryText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 6,
  },
  periodBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },

  // Amount section
  amountSection: {
    marginBottom: 12,
  },
  limitAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111',
    marginBottom: 4,
  },
  spentLabel: {
    fontSize: 14,
    color: '#666',
  },

  // Progress bar
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4cd964',
    borderRadius: 4,
  },
  progressBarOverflow: {
    backgroundColor: '#ff3b30',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    minWidth: 40,
    textAlign: 'right',
  },

  // Start date
  startDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 16,
  },

  // Action buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
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
