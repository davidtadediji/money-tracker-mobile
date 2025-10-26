/**
 * Example: Budget List Screen using BudgetContext
 * 
 * File: app/(tabs)/budget/index.tsx
 * 
 * This version uses the useBudget hook instead of direct service calls.
 * Much simpler and more maintainable!
 */

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

  const renderBudgetItem = ({ item }: { item: Budget }) => (
    <View style={styles.budgetCard}>
      <View style={styles.budgetHeader}>
        <Text style={styles.category}>{item.category}</Text>
        <TouchableOpacity onPress={() => handleDeleteBudget(item.id, item.category)}>
          <Text style={styles.deleteButton}>Delete</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.amount}>${item.limit_amount.toFixed(2)}</Text>
      
      <View style={styles.budgetFooter}>
        <Text style={styles.period}>{formatPeriod(item.period)}</Text>
        <Text style={styles.date}>Start: {formatDate(item.start_date)}</Text>
      </View>
    </View>
  );

  // Show error if any
  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={refreshBudgets}>
            <Text style={styles.primaryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Show loading on initial load
  if (loading && budgets.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#111" />
          <Text style={styles.loadingText}>Loading budgets...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Budget Overview</Text>
          <Text style={styles.subtitle}>Plan your spending limits by category.</Text>
        </View>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/(tabs)/budget/create')}
        >
          <Text style={styles.primaryButtonText}>+ Create</Text>
        </TouchableOpacity>
      </View>

      {budgets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No budgets yet</Text>
          <Text style={styles.emptySubtitle}>
            Create your first budget to start tracking your spending limits
          </Text>
          <TouchableOpacity
            style={[styles.primaryButton, { marginTop: 16 }]}
            onPress={() => router.push('/(tabs)/budget/create')}
          >
            <Text style={styles.primaryButtonText}>Create Your First Budget</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={budgets}
          keyExtractor={(item) => item.id}
          renderItem={renderBudgetItem}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={refreshBudgets}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
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
    fontWeight: '700' 
  },
  subtitle: { 
    color: '#666', 
    marginTop: 4,
    fontSize: 14,
  },
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
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
  listContent: {
    padding: 16,
  },
  budgetCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  category: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  deleteButton: {
    color: '#ff3b30',
    fontSize: 14,
    fontWeight: '600',
  },
  amount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111',
    marginVertical: 8,
  },
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  period: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  primaryButton: {
    backgroundColor: '#111',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  primaryButtonText: { 
    color: '#fff', 
    fontWeight: '600',
    fontSize: 14,
  },
});

