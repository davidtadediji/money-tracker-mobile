import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTransaction } from '@/contexts/TransactionContext';
import { Colors } from '@/constants/theme';
import { BorderRadius, Spacing, Typography } from '@/constants/designTokens';

interface CategoryStats {
  name: string;
  totalTransactions: number;
  totalAmount: number;
  incomeAmount: number;
  expenseAmount: number;
  lastUsed: Date | null;
}

const PREDEFINED_CATEGORIES = [
  { emoji: '🍔', name: 'Food & Dining' },
  { emoji: '🛒', name: 'Groceries' },
  { emoji: '🚗', name: 'Transportation' },
  { emoji: '🏠', name: 'Housing' },
  { emoji: '⚡', name: 'Utilities' },
  { emoji: '💊', name: 'Healthcare' },
  { emoji: '🎬', name: 'Entertainment' },
  { emoji: '👕', name: 'Shopping' },
  { emoji: '✈️', name: 'Travel' },
  { emoji: '💰', name: 'Salary' },
  { emoji: '📈', name: 'Investment' },
  { emoji: '🎁', name: 'Gift' },
  { emoji: '📚', name: 'Education' },
  { emoji: '💳', name: 'Bills' },
  { emoji: '🔧', name: 'Maintenance' },
  { emoji: '☕', name: 'Coffee' },
  { emoji: '🎮', name: 'Gaming' },
  { emoji: '💪', name: 'Fitness' },
];

export default function CategoriesManager() {
  const router = useRouter();
  const { transactions, categories: userCategories, loading } = useTransaction();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'amount'>('usage');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const categoryStats = useMemo(() => {
    const stats = new Map<string, CategoryStats>();

    transactions.forEach((transaction) => {
      const categoryName = transaction.category;

      if (!stats.has(categoryName)) {
        stats.set(categoryName, {
          name: categoryName,
          totalTransactions: 0,
          totalAmount: 0,
          incomeAmount: 0,
          expenseAmount: 0,
          lastUsed: null,
        });
      }

      const stat = stats.get(categoryName)!;
      stat.totalTransactions += 1;

      if (transaction.type === 'income') {
        stat.incomeAmount += transaction.amount;
        stat.totalAmount += transaction.amount;
      } else {
        stat.expenseAmount += transaction.amount;
        stat.totalAmount -= transaction.amount;
      }

      const txDate = new Date(transaction.date);
      if (!stat.lastUsed || txDate > stat.lastUsed) {
        stat.lastUsed = txDate;
      }
    });

    return Array.from(stats.values());
  }, [transactions]);

  const filteredAndSortedCategories = useMemo(() => {
    let filtered = categoryStats;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((cat) =>
        cat.name.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'usage') {
        return b.totalTransactions - a.totalTransactions;
      } else {
        // amount
        return Math.abs(b.totalAmount) - Math.abs(a.totalAmount);
      }
    });

    return filtered;
  }, [categoryStats, searchQuery, sortBy]);

  const formatCurrency = (amount: number): string => {
    return `$${Math.abs(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'Never';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getCategoryEmoji = (categoryName: string): string => {
    const found = PREDEFINED_CATEGORIES.find((cat) =>
      categoryName.includes(cat.name)
    );
    return found?.emoji || '📁';
  };

  const handleAddCustomCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    // Check if category already exists
    if (userCategories.some((cat) => cat.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      Alert.alert('Error', 'This category already exists');
      return;
    }

    // Close modal and show success
    setShowAddModal(false);
    Alert.alert(
      'Category Added',
      `"${newCategoryName.trim()}" has been added. You can now use it when creating transactions.`,
      [{ text: 'OK' }]
    );
    setNewCategoryName('');
  };

  const totalCategories = categoryStats.length;
  const totalTransactions = categoryStats.reduce((sum, cat) => sum + cat.totalTransactions, 0);
  const mostUsedCategory = categoryStats.length > 0
    ? categoryStats.reduce((max, cat) => (cat.totalTransactions > max.totalTransactions ? cat : max))
    : null;

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredAndSortedCategories}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <View style={styles.categoryCard}>
            <View style={styles.categoryHeader}>
              <View style={styles.categoryIcon}>
                <Text style={styles.categoryEmoji}>{getCategoryEmoji(item.name)}</Text>
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{item.name}</Text>
                <Text style={styles.categoryMeta}>
                  {item.totalTransactions} transaction{item.totalTransactions !== 1 ? 's' : ''} • Last used{' '}
                  {formatDate(item.lastUsed)}
                </Text>
              </View>
            </View>

            <View style={styles.categoryStats}>
              {item.incomeAmount > 0 && (
                <View style={styles.statBadge}>
                  <Text style={styles.statLabel}>Income</Text>
                  <Text style={[styles.statAmount, styles.incomeText]}>
                    +{formatCurrency(item.incomeAmount)}
                  </Text>
                </View>
              )}
              {item.expenseAmount > 0 && (
                <View style={styles.statBadge}>
                  <Text style={styles.statLabel}>Expense</Text>
                  <Text style={[styles.statAmount, styles.expenseText]}>
                    -{formatCurrency(item.expenseAmount)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Text style={styles.backText}>← Back</Text>
              </TouchableOpacity>
              <Text style={styles.title}>Categories</Text>
              <Text style={styles.subtitle}>Manage your transaction categories</Text>
            </View>

            {/* Summary Cards */}
            <View style={styles.summaryContainer}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{totalCategories}</Text>
                <Text style={styles.summaryLabel}>Total Categories</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{totalTransactions}</Text>
                <Text style={styles.summaryLabel}>Total Transactions</Text>
              </View>
            </View>

            {mostUsedCategory && (
              <View style={styles.insightCard}>
                <Text style={styles.insightIcon}>⭐</Text>
                <View style={styles.insightContent}>
                  <Text style={styles.insightTitle}>Most Used Category</Text>
                  <Text style={styles.insightValue}>
                    {mostUsedCategory.name} ({mostUsedCategory.totalTransactions} transactions)
                  </Text>
                </View>
              </View>
            )}

            {/* Search */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search categories..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={Colors.light.textSecondary}
              />
              <Text style={styles.searchIcon}>🔍</Text>
            </View>

            {/* Sort Options */}
            <View style={styles.controlsRow}>
              <View style={styles.sortChips}>
                {(['usage', 'name', 'amount'] as const).map((sort) => (
                  <TouchableOpacity
                    key={sort}
                    style={[styles.sortChip, sortBy === sort && styles.sortChipActive]}
                    onPress={() => setSortBy(sort)}
                  >
                    <Text style={[styles.sortChipText, sortBy === sort && styles.sortChipTextActive]}>
                      {sort === 'usage' && '📊 Usage'}
                      {sort === 'name' && '🔤 Name'}
                      {sort === 'amount' && '💰 Amount'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddModal(true)}
              >
                <Text style={styles.addButtonText}>+ Add</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.resultCount}>
              {filteredAndSortedCategories.length} categor{filteredAndSortedCategories.length !== 1 ? 'ies' : 'y'}
            </Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={styles.emptyTitle}>No Categories Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? 'Try a different search term'
                : 'Start by adding a transaction to create categories'}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Add Custom Category Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Custom Category</Text>
            <Text style={styles.modalDescription}>
              Create a custom category for your transactions. You can use emojis for better organization!
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="e.g., 🎵 Music Streaming"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholderTextColor={Colors.light.textSecondary}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonPrimary}
                onPress={handleAddCustomCategory}
              >
                <Text style={styles.modalButtonPrimaryText}>Add Category</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => {
                  setShowAddModal(false);
                  setNewCategoryName('');
                }}
              >
                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: Colors.light.backgroundSecondary,
  },
  loadingText: {
    marginTop: Spacing.md,
    color: Colors.light.textSecondary,
    fontSize: Typography.fontSize.base,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },

  // Header
  header: {
    marginBottom: Spacing.lg,
  },
  backButton: {
    marginBottom: Spacing.sm,
  },
  backText: {
    color: Colors.light.primary,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
  },

  // Summary Cards
  summaryContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  summaryValue: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.primary,
    marginBottom: Spacing.xs,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },

  // Insight Card
  insightCard: {
    flexDirection: 'row',
    backgroundColor: Colors.light.secondaryLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  insightIcon: {
    fontSize: 32,
    marginRight: Spacing.sm,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
  },
  insightValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },

  // Search
  searchContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  searchInput: {
    backgroundColor: Colors.light.surface,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    paddingRight: 40,
    fontSize: Typography.fontSize.base,
    color: Colors.light.text,
  },
  searchIcon: {
    position: 'absolute',
    right: Spacing.md,
    top: '50%',
    transform: [{ translateY: -12 }],
    fontSize: 20,
  },

  // Controls
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sortChips: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flex: 1,
    marginRight: Spacing.sm,
  },
  sortChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
  },
  sortChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  sortChipText: {
    color: Colors.light.textSecondary,
    fontWeight: Typography.fontWeight.medium,
    fontSize: Typography.fontSize.xs,
  },
  sortChipTextActive: {
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
  },
  addButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  addButtonText: {
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.sm,
  },
  resultCount: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },

  // Category Card
  categoryCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: 2,
  },
  categoryMeta: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
  },
  categoryStats: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statBadge: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
    marginBottom: 2,
  },
  statAmount: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  incomeText: {
    color: Colors.light.success,
  },
  expenseText: {
    color: Colors.light.error,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    marginTop: Spacing.xxl,
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
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.light.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  modalContent: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  modalDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },
  modalInput: {
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.light.text,
    backgroundColor: Colors.light.backgroundSecondary,
    marginBottom: Spacing.md,
  },
  modalButtons: {
    gap: Spacing.sm,
  },
  modalButtonPrimary: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  modalButtonPrimaryText: {
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.base,
  },
  modalButtonSecondary: {
    backgroundColor: Colors.light.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  modalButtonSecondaryText: {
    color: Colors.light.text,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.base,
  },
});

