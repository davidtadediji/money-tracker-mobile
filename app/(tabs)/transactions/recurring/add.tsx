import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useRecurringTransaction } from '@/contexts/RecurringTransactionContext';
import { Colors } from '@/constants/theme';
import { BorderRadius, Spacing, Typography } from '@/constants/designTokens';
import { EXPENSE_CATEGORIES } from '@/constants/categories';

export default function AddRecurringTransaction() {
  const router = useRouter();
  const { createRecurringTransaction } = useRecurringTransaction();

  // Form state
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDate, setEndDate] = useState('');
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [notificationDays, setNotificationDays] = useState('1');
  const [loading, setLoading] = useState(false);

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const finalCategory = category === 'Custom' ? customCategory : category;
    if (!finalCategory) {
      newErrors.category = 'Please select or enter a category';
    }

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }

    if (!startDate) {
      newErrors.startDate = 'Please select a start date';
    }

    if (hasEndDate && !endDate) {
      newErrors.endDate = 'Please select an end date';
    }

    if (hasEndDate && endDate && startDate && endDate <= startDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    const notifDays = parseInt(notificationDays);
    if (notificationEnabled && (isNaN(notifDays) || notifDays < 0)) {
      newErrors.notificationDays = 'Please enter a valid number of days';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before saving');
      return;
    }

    setLoading(true);

    const finalCategory = category === 'Custom' ? customCategory : category;
    const amountNum = parseFloat(amount);
    const notifDays = parseInt(notificationDays) || 1;

    const { success, error } = await createRecurringTransaction(
      type,
      finalCategory,
      amountNum,
      frequency,
      startDate,
      description || undefined,
      hasEndDate ? endDate : null,
      notificationEnabled,
      notifDays
    );

    setLoading(false);

    if (success) {
      Alert.alert('Success', 'Recurring transaction created successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } else {
      Alert.alert('Error', error || 'Failed to create recurring transaction');
    }
  };

  const availableCategories = type === 'expense'
    ? [...EXPENSE_CATEGORIES, { id: 'custom', name: 'Custom', icon: '✏️' }]
    : [
        { id: 'salary', name: 'Salary', icon: '💰' },
        { id: 'freelance', name: 'Freelance', icon: '💻' },
        { id: 'investment', name: 'Investment', icon: '📈' },
        { id: 'other-income', name: 'Other Income', icon: '💵' },
        { id: 'custom', name: 'Custom', icon: '✏️' },
      ];

  const frequencyOptions: Array<{ value: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'; label: string }> = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>{'<'} Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Add Recurring Transaction</Text>
        </View>

        {/* Type Selector */}
        <View style={styles.section}>
          <Text style={styles.label}>Type</Text>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
              onPress={() => setType('expense')}
            >
              <Text style={[styles.typeButtonText, type === 'expense' && styles.typeButtonTextActive]}>Expense</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, type === 'income' && styles.typeButtonActive]}
              onPress={() => setType('income')}
            >
              <Text style={[styles.typeButtonText, type === 'income' && styles.typeButtonTextActive]}>Income</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Selector */}
        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryGrid}>
            {availableCategories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryChip, category === cat.name && styles.categoryChipActive]}
                onPress={() => setCategory(cat.name)}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text style={[styles.categoryText, category === cat.name && styles.categoryTextActive]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {category === 'Custom' && (
            <TextInput
              style={styles.input}
              placeholder="Enter custom category"
              value={customCategory}
              onChangeText={setCustomCategory}
            />
          )}
          {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
        </View>

        {/* Amount */}
        <View style={styles.section}>
          <Text style={styles.label}>Amount (KES)</Text>
          <TextInput
            style={[styles.input, errors.amount && styles.inputError]}
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
          {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter description"
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>

        {/* Frequency */}
        <View style={styles.section}>
          <Text style={styles.label}>Frequency</Text>
          <View style={styles.frequencyGrid}>
            {frequencyOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.frequencyChip, frequency === option.value && styles.frequencyChipActive]}
                onPress={() => setFrequency(option.value)}
              >
                <Text style={[styles.frequencyText, frequency === option.value && styles.frequencyTextActive]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Start Date */}
        <View style={styles.section}>
          <Text style={styles.label}>Start Date</Text>
          <TextInput
            style={[styles.input, errors.startDate && styles.inputError]}
            placeholder="YYYY-MM-DD"
            value={startDate}
            onChangeText={setStartDate}
          />
          {errors.startDate && <Text style={styles.errorText}>{errors.startDate}</Text>}
        </View>

        {/* End Date Toggle */}
        <View style={styles.section}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Set End Date</Text>
            <Switch
              value={hasEndDate}
              onValueChange={setHasEndDate}
              trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
              thumbColor={hasEndDate ? Colors.light.onPrimary : Colors.light.textSecondary}
            />
          </View>
          {hasEndDate && (
            <>
              <TextInput
                style={[styles.input, errors.endDate && styles.inputError]}
                placeholder="YYYY-MM-DD"
                value={endDate}
                onChangeText={setEndDate}
              />
              {errors.endDate && <Text style={styles.errorText}>{errors.endDate}</Text>}
            </>
          )}
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Enable Reminders</Text>
            <Switch
              value={notificationEnabled}
              onValueChange={setNotificationEnabled}
              trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
              thumbColor={notificationEnabled ? Colors.light.onPrimary : Colors.light.textSecondary}
            />
          </View>
          {notificationEnabled && (
            <>
              <Text style={styles.sublabel}>Remind me (days before)</Text>
              <TextInput
                style={[styles.input, errors.notificationDays && styles.inputError]}
                placeholder="1"
                value={notificationDays}
                onChangeText={setNotificationDays}
                keyboardType="number-pad"
              />
              {errors.notificationDays && <Text style={styles.errorText}>{errors.notificationDays}</Text>}
            </>
          )}
        </View>

        {/* Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={Colors.light.onPrimary} />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
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
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
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
  },
  section: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  label: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  sublabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSize.md,
    color: Colors.light.text,
  },
  inputError: {
    borderColor: Colors.light.error,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.error,
    marginTop: Spacing.xs,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  typeButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  typeButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  typeButtonTextActive: {
    color: Colors.light.onPrimary,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: Spacing.xs,
  },
  categoryChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.text,
  },
  categoryTextActive: {
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
  },
  frequencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  frequencyChip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  frequencyChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  frequencyText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.text,
  },
  frequencyTextActive: {
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  buttonGroup: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  saveButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.onPrimary,
  },
});

