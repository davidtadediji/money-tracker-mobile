import { useBudget } from '@/contexts/BudgetContext';
import { getBudgetById } from '@/services/budgetService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Validation error types
interface ValidationErrors {
  category?: string;
  limit?: string;
}

export default function EditBudget() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { updateBudget, deleteBudget } = useBudget();

  // Form state with proper TypeScript types
  const [category, setCategory] = useState<string>('');
  const [limit, setLimit] = useState<string>('');
  const [period, setPeriod] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');
  const [startDate, setStartDate] = useState<string>('');

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetch budget data on mount
  useEffect(() => {
    const fetchBudget = async () => {
      if (!id) {
        setFetchError('Budget ID is missing');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await getBudgetById(id);

        if (error) {
          setFetchError(error.message || 'Failed to load budget');
        } else if (data) {
          // Pre-fill form with existing data
          setCategory(data.category);
          setLimit(data.limit_amount.toString());
          setPeriod(data.period);
          setStartDate(data.start_date);
        } else {
          setFetchError('Budget not found');
        }
      } catch (err) {
        console.error('Error fetching budget:', err);
        setFetchError('Failed to load budget');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBudget();
  }, [id]);

  // Validate form inputs
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validate category
    if (!category.trim()) {
      newErrors.category = 'Category is required';
    } else if (category.trim().length < 2) {
      newErrors.category = 'Category must be at least 2 characters';
    }

    // Validate limit
    const limitNum = parseFloat(limit);
    if (!limit.trim()) {
      newErrors.limit = 'Limit amount is required';
    } else if (isNaN(limitNum)) {
      newErrors.limit = 'Please enter a valid number';
    } else if (limitNum <= 0) {
      newErrors.limit = 'Limit must be greater than 0';
    } else if (limitNum > 999999999) {
      newErrors.limit = 'Limit amount is too large';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if form is valid (for button state)
  const isFormValid = (): boolean => {
    return (
      category.trim().length >= 2 &&
      limit.trim().length > 0 &&
      parseFloat(limit) > 0 &&
      !isNaN(parseFloat(limit))
    );
  };

  // Handle update
  const handleUpdate = async () => {
    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    if (!id) {
      Alert.alert('Error', 'Budget ID is missing');
      return;
    }

    setIsSaving(true);

    try {
      const limitAmount = parseFloat(limit);

      const result = await updateBudget(id, {
        category: category.trim(),
        limit_amount: limitAmount,
        period,
      });

      if (result.success) {
        Alert.alert(
          'Success!',
          `Budget for ${category} has been updated successfully.`,
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to update budget. Please try again.');
      }
    } catch (error) {
      console.error('Unexpected error updating budget:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (!id) {
      Alert.alert('Error', 'Budget ID is missing');
      return;
    }

    Alert.alert(
      'Delete Budget',
      `Are you sure you want to delete the budget for "${category}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);

            try {
              const result = await deleteBudget(id);

              if (result.success) {
                Alert.alert('Deleted', 'Budget has been deleted successfully.', [
                  {
                    text: 'OK',
                    onPress: () => router.back(),
                  },
                ]);
              } else {
                Alert.alert('Error', result.error || 'Failed to delete budget. Please try again.');
                setIsDeleting(false);
              }
            } catch (error) {
              console.error('Unexpected error deleting budget:', error);
              Alert.alert('Error', 'An unexpected error occurred. Please try again.');
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  // Handle cancel
  const handleCancel = () => {
    router.back();
  };

  // Handle limit input (only allow valid decimal numbers)
  const handleLimitChange = (text: string) => {
    // Allow numbers and decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return;
    }
    setLimit(cleaned);

    // Clear limit error when user starts typing
    if (errors.limit) {
      setErrors({ ...errors, limit: undefined });
    }
  };

  // Handle category change
  const handleCategoryChange = (text: string) => {
    setCategory(text);
    // Clear category error when user starts typing
    if (errors.category) {
      setErrors({ ...errors, category: undefined });
    }
  };

  const isButtonDisabled = isSaving || isDeleting || !isFormValid();

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#111" />
          <Text style={styles.loadingText}>Loading budget...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (fetchError) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Failed to Load Budget</Text>
          <Text style={styles.errorMessage}>{fetchError}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Edit Budget</Text>
          <Text style={styles.subtitle}>Update your budget settings</Text>
        </View>

        {/* Category Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={[styles.input, errors.category && styles.inputError]}
            placeholder="e.g., Groceries, Dining, Entertainment"
            value={category}
            onChangeText={handleCategoryChange}
            placeholderTextColor="#999"
            editable={!isSaving && !isDeleting}
            autoCapitalize="words"
          />
          {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
        </View>

        {/* Limit Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Limit Amount ($)</Text>
          <TextInput
            style={[styles.input, errors.limit && styles.inputError]}
            placeholder="e.g., 500.00"
            value={limit}
            onChangeText={handleLimitChange}
            keyboardType="decimal-pad"
            placeholderTextColor="#999"
            editable={!isSaving && !isDeleting}
          />
          {errors.limit && <Text style={styles.errorText}>{errors.limit}</Text>}
        </View>

        {/* Period Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Budget Period</Text>
          <View style={styles.chipContainer}>
            {(['weekly', 'monthly', 'yearly'] as const).map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.chip, period === p && styles.chipActive]}
                onPress={() => setPeriod(p)}
                disabled={isSaving || isDeleting}
              >
                <Text style={[styles.chipText, period === p && styles.chipTextActive]}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Start Date (read-only) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Start Date</Text>
          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyText}>{startDate}</Text>
          </View>
          <Text style={styles.helpText}>Start date cannot be changed</Text>
        </View>

        {/* Update Button */}
        <TouchableOpacity
          style={[styles.updateButton, isButtonDisabled && styles.buttonDisabled]}
          onPress={handleUpdate}
          disabled={isButtonDisabled}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.updateButtonText}>Update Budget</Text>
          )}
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.cancelButton, (isSaving || isDeleting) && styles.buttonDisabled]}
            onPress={handleCancel}
            disabled={isSaving || isDeleting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.deleteButton, (isSaving || isDeleting) && styles.buttonDisabled]}
            onPress={handleDelete}
            disabled={isSaving || isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator color="#ff3b30" size="small" />
            ) : (
              <Text style={styles.deleteButtonText}>Delete Budget</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 4,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#111',
  },
  inputError: {
    borderColor: '#ff3b30',
    borderWidth: 2,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 13,
    marginTop: 4,
    marginLeft: 4,
  },
  helpText: {
    color: '#999',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: '#111',
    borderColor: '#111',
  },
  chipText: {
    color: '#111',
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
  },
  readOnlyField: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
  },
  readOnlyText: {
    fontSize: 16,
    color: '#999',
  },
  updateButton: {
    backgroundColor: '#111',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginTop: 8,
    marginBottom: 16,
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#111',
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ff3b30',
    minHeight: 48,
  },
  deleteButtonText: {
    color: '#ff3b30',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
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
  backButton: {
    backgroundColor: '#111',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

