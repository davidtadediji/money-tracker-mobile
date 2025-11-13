import { useBudget } from '@/contexts/BudgetContext';
import { 
  getAllCategoriesWithCustom, 
  CUSTOM_CATEGORY_ID, 
  Category 
} from '@/constants/categories';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Validation error types
interface ValidationErrors {
  category?: string;
  limit?: string;
  startDate?: string;
}

export default function CreateBudget() {
  const router = useRouter();
  const { createBudget } = useBudget();

  // Form state with proper TypeScript types
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [customCategoryName, setCustomCategoryName] = useState<string>('');
  const [limit, setLimit] = useState<string>('');
  const [period, setPeriod] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');
  const [startDate, setStartDate] = useState<string>(getTodayDate());
  
  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Get all categories including custom option
  const allCategories = getAllCategoriesWithCustom();

  // Helper function to get today's date in YYYY-MM-DD format
  function getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // Get final category name (either predefined or custom)
  const getFinalCategoryName = (): string => {
    if (selectedCategoryId === CUSTOM_CATEGORY_ID) {
      return customCategoryName.trim();
    }
    const selected = allCategories.find(cat => cat.id === selectedCategoryId);
    return selected ? selected.name : '';
  };

  // Validate form inputs
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validate category
    if (!selectedCategoryId) {
      newErrors.category = 'Please select a category';
    } else if (selectedCategoryId === CUSTOM_CATEGORY_ID) {
      if (!customCategoryName.trim()) {
        newErrors.category = 'Please enter a custom category name';
      } else if (customCategoryName.trim().length < 2) {
        newErrors.category = 'Category must be at least 2 characters';
      }
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

    // Validate start date
    if (!startDate) {
      newErrors.startDate = 'Start date is required';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      newErrors.startDate = 'Invalid date format (use YYYY-MM-DD)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if form is valid (for button state)
  const isFormValid = (): boolean => {
    const hasValidCategory = !!selectedCategoryId && 
      (selectedCategoryId !== CUSTOM_CATEGORY_ID || customCategoryName.trim().length >= 2);
    
    return (
      hasValidCategory &&
      limit.trim().length > 0 &&
      parseFloat(limit) > 0 &&
      !isNaN(parseFloat(limit)) &&
      startDate.length > 0
    );
  };

  // Handle save
  const save = async () => {
    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const limitAmount = parseFloat(limit);
      const finalCategoryName = getFinalCategoryName();
      
      const result = await createBudget(
        finalCategoryName,
        limitAmount,
        period,
        startDate
      );

      if (result.success) {
        Alert.alert(
          'Success!',
          `Budget for ${finalCategoryName} has been created successfully.`,
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert(
          'Error',
          result.error || 'Failed to create budget. Please try again.'
        );
      }
    } catch (error) {
      console.error('Unexpected error creating budget:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (selectedCategoryId || limit.trim()) {
      Alert.alert(
        'Discard Changes?',
        'Are you sure you want to discard this budget?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
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

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    // Clear custom category name if not selecting custom
    if (categoryId !== CUSTOM_CATEGORY_ID) {
      setCustomCategoryName('');
    }
    // Clear category error
    if (errors.category) {
      setErrors({ ...errors, category: undefined });
    }
  };

  // Handle custom category name change
  const handleCustomCategoryChange = (text: string) => {
    setCustomCategoryName(text);
    // Clear category error when user starts typing
    if (errors.category) {
      setErrors({ ...errors, category: undefined });
    }
  };

  // Handle start date change
  const handleStartDateChange = (text: string) => {
    setStartDate(text);
    // Clear start date error when user starts typing
    if (errors.startDate) {
      setErrors({ ...errors, startDate: undefined });
    }
  };

  const isButtonDisabled = isLoading || !isFormValid();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Budget</Text>
          <Text style={styles.subtitle}>
            Set spending limits for your expense categories
          </Text>
        </View>

        {/* Category Picker */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScrollContainer}
          >
            <View style={styles.categoryGrid}>
              {allCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    selectedCategoryId === cat.id && styles.categoryChipActive,
                    errors.category && !selectedCategoryId && styles.categoryChipError,
                  ]}
                  onPress={() => handleCategorySelect(cat.id)}
                  disabled={isLoading}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategoryId === cat.id && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          {errors.category && (
            <Text style={styles.errorText}>{errors.category}</Text>
          )}
        </View>

        {/* Custom Category Input (shown when Custom is selected) */}
        {selectedCategoryId === CUSTOM_CATEGORY_ID && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Custom Category Name</Text>
            <TextInput
              style={[styles.input, errors.category && styles.inputError]}
              placeholder="Enter category name"
              value={customCategoryName}
              onChangeText={handleCustomCategoryChange}
              placeholderTextColor="#999"
              editable={!isLoading}
              autoCapitalize="words"
              autoFocus
            />
          </View>
        )}

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
            editable={!isLoading}
          />
          {errors.limit && (
            <Text style={styles.errorText}>{errors.limit}</Text>
          )}
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
                disabled={isLoading}
              >
                <Text style={[styles.chipText, period === p && styles.chipTextActive]}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Start Date Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Start Date</Text>
          <TextInput
            style={[styles.input, errors.startDate && styles.inputError]}
            placeholder="YYYY-MM-DD"
            value={startDate}
            onChangeText={handleStartDateChange}
            placeholderTextColor="#999"
            editable={!isLoading}
          />
          {errors.startDate && (
            <Text style={styles.errorText}>{errors.startDate}</Text>
          )}
          <Text style={styles.helpText}>
            Format: YYYY-MM-DD (e.g., {getTodayDate()})
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.cancelButton, isLoading && styles.buttonDisabled]}
            onPress={handleCancel}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.saveButton,
              isButtonDisabled && styles.buttonDisabled,
            ]}
            onPress={save}
            disabled={isButtonDisabled}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save Budget</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  backButton: { paddingVertical: 6, paddingHorizontal: 8 },
  backText: { color: '#111', fontSize: 16, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  label: { marginBottom: 8, color: '#555' },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
 
 
  subtitle: {
    fontSize: 15,
    color: '#666',
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
 
  // Category picker styles
  categoryScrollContainer: {
    marginBottom: 8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingRight: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  categoryChipActive: {
    backgroundColor: '#111',
    borderColor: '#111',
  },
  categoryChipError: {
    borderColor: '#ff3b30',
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  categoryChipTextActive: {
    color: '#fff',
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
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
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
  saveButton: {
    flex: 1,
    backgroundColor: '#111',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  saveButtonText: { 
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

