import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransaction } from '@/contexts/TransactionContext';
import { Colors } from '@/constants/theme';
import { BorderRadius, Spacing, Typography } from '@/constants/designTokens';

const PREDEFINED_CATEGORIES = [
  '🍔 Food & Dining',
  '🛒 Groceries',
  '🚗 Transportation',
  '🏠 Housing',
  '⚡ Utilities',
  '💊 Healthcare',
  '🎬 Entertainment',
  '👕 Shopping',
  '✈️ Travel',
  '💰 Salary',
  '📈 Investment',
  '🎁 Gift',
  '📚 Education',
  '💳 Bills',
  '🔧 Maintenance',
  '☕ Coffee',
  '🎮 Gaming',
  '💪 Fitness',
];

interface ValidationErrors {
  amount?: string;
  category?: string;
  date?: string;
}

export default function EditTransaction() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transactions, updateTransaction, categories: userCategories } = useTransaction();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [allCategories, setAllCategories] = useState<string[]>([]);

  useEffect(() => {
    const combined = Array.from(
      new Set([...userCategories, ...PREDEFINED_CATEGORIES])
    ).sort();
    setAllCategories(combined);
  }, [userCategories]);

  useEffect(() => {
    if (id) {
      const found = transactions.find((t) => t.id === id);
      if (found) {
        setAmount(found.amount.toString());
        setCategory(found.category);
        setDescription(found.description || '');
        setDate(found.date);
        setType(found.type);
      }
      setIsFetching(false);
    }
  }, [id, transactions]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount)) {
        newErrors.amount = 'Please enter a valid number';
      } else if (numAmount <= 0) {
        newErrors.amount = 'Amount must be greater than 0';
      }
    }

    if (!category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = (): boolean => {
    return (
      amount.trim() !== '' &&
      parseFloat(amount) > 0 &&
      !isNaN(parseFloat(amount)) &&
      category.trim() !== '' &&
      date !== ''
    );
  };

  const handleUpdate = async () => {
    if (!validateForm() || !id) {
      return;
    }

    setIsLoading(true);

    try {
      const { success, error } = await updateTransaction(id, {
        amount: parseFloat(amount),
        category: category.trim(),
        description: description.trim() || null,
        date: date,
        type: type,
      });

      if (success) {
        Alert.alert('Success', 'Transaction updated successfully', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert('Error', error || 'Failed to update transaction');
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmountChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return;
    }
    setAmount(cleaned);
    if (errors.amount) {
      setErrors({ ...errors, amount: undefined });
    }
  };

  const handleSelectCategory = (selectedCategory: string) => {
    setCategory(selectedCategory);
    setShowCategoryModal(false);
    if (errors.category) {
      setErrors({ ...errors, category: undefined });
    }
  };

  if (isFetching) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Loading transaction...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Edit Transaction</Text>
          <Text style={styles.subtitle}>Update your transaction details</Text>
        </View>

        {/* Type Selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Type</Text>
          <View style={styles.typeRow}>
            {(['expense', 'income'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setType(t)}
                style={[styles.typeChip, type === t && styles.typeChipActive]}
                disabled={isLoading}
              >
                <Text style={styles.typeIcon}>{t === 'income' ? '↑' : '↓'}</Text>
                <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Amount */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={[styles.input, styles.amountInput, errors.amount && styles.inputError]}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={handleAmountChange}
              placeholderTextColor={Colors.light.textSecondary}
              editable={!isLoading}
            />
          </View>
          {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
        </View>

        {/* Category */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <TouchableOpacity
            style={[styles.input, styles.categoryInput, errors.category && styles.inputError]}
            onPress={() => setShowCategoryModal(true)}
            disabled={isLoading}
          >
            <Text
              style={[
                styles.categoryInputText,
                !category && styles.categoryInputPlaceholder,
              ]}
            >
              {category || 'Select category'}
            </Text>
            <Text style={styles.dropdownIcon}>▼</Text>
          </TouchableOpacity>
          {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
        </View>

        {/* Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date</Text>
          <TextInput
            style={[styles.input, errors.date && styles.inputError]}
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeText={setDate}
            placeholderTextColor={Colors.light.textSecondary}
            editable={!isLoading}
          />
          {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add notes about this transaction"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor={Colors.light.textSecondary}
            editable={!isLoading}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.updateButton,
              (!isFormValid() || isLoading) && styles.updateButtonDisabled,
            ]}
            onPress={handleUpdate}
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.light.onPrimary} />
            ) : (
              <Text style={styles.updateButtonText}>Update Transaction</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={allCategories}
              keyExtractor={(item, index) => `${item}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryItem,
                    category === item && styles.categoryItemSelected,
                  ]}
                  onPress={() => handleSelectCategory(item)}
                >
                  <Text style={styles.categoryItemText}>{item}</Text>
                  {category === item && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.categorySeparator} />}
            />

            <View style={styles.modalFooter}>
              <Text style={styles.customCategoryLabel}>Or type a custom category:</Text>
              <View style={styles.customCategoryRow}>
                <TextInput
                  style={styles.customCategoryInput}
                  placeholder="Enter category name"
                  placeholderTextColor={Colors.light.textSecondary}
                  onSubmitEditing={(e) => {
                    if (e.nativeEvent.text.trim()) {
                      handleSelectCategory(e.nativeEvent.text.trim());
                    }
                  }}
                />
              </View>
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
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
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

  // Input Group
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.light.text,
    backgroundColor: Colors.light.surface,
  },
  inputError: {
    borderColor: Colors.light.error,
  },
  errorText: {
    color: Colors.light.error,
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },

  // Type Selector
  typeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  typeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
  },
  typeChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  typeIcon: {
    fontSize: 20,
  },
  typeChipText: {
    color: Colors.light.textSecondary,
    fontWeight: Typography.fontWeight.medium,
    fontSize: Typography.fontSize.base,
  },
  typeChipTextActive: {
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
  },

  // Amount Input
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginRight: Spacing.sm,
  },
  amountInput: {
    flex: 1,
  },

  // Category Input
  categoryInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInputText: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.text,
    flex: 1,
  },
  categoryInputPlaceholder: {
    color: Colors.light.textSecondary,
  },
  dropdownIcon: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },

  // Text Area
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },

  // Buttons
  buttonContainer: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  updateButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  updateButtonDisabled: {
    opacity: 0.6,
  },
  updateButtonText: {
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.base,
  },
  cancelButton: {
    backgroundColor: Colors.light.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  cancelButtonText: {
    color: Colors.light.text,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.base,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.light.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.light.surface,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    maxHeight: '80%',
    paddingBottom: Spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
  },
  modalClose: {
    fontSize: 24,
    color: Colors.light.textSecondary,
    paddingHorizontal: Spacing.sm,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  categoryItemSelected: {
    backgroundColor: Colors.light.secondaryLight,
  },
  categoryItemText: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.text,
  },
  checkmark: {
    fontSize: 20,
    color: Colors.light.primary,
    fontWeight: Typography.fontWeight.bold,
  },
  categorySeparator: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginHorizontal: Spacing.md,
  },
  modalFooter: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  customCategoryLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.sm,
  },
  customCategoryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  customCategoryInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSize.base,
    color: Colors.light.text,
    backgroundColor: Colors.light.backgroundSecondary,
  },
});

