import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useRecurringTransaction } from '@/contexts/RecurringTransactionContext';
import { Colors } from '@/constants/theme';
import { BorderRadius, Spacing, Typography } from '@/constants/designTokens';
import { EXPENSE_CATEGORIES } from '@/constants/categories';
import { RecurringTransaction } from '@/types/database';

export default function EditRecurringTransaction() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getRecurringTransactionById, updateRecurringTransaction, deleteRecurringTransaction } = useRecurringTransaction();

  const [recurring, setRecurring] = useState<RecurringTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDate, setEndDate] = useState('');
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [notificationDays, setNotificationDays] = useState('1');

  // Load recurring transaction
  useEffect(() => {
    if (id) {
      loadRecurring();
    }
  }, [id]);

  const loadRecurring = async () => {
    setLoading(true);
    const { success, recurring: data, error } = await getRecurringTransactionById(id);
   
    if (success && data) {
      setRecurring(data);
      setType(data.type);
      setCategory(data.category);
      setAmount(data.amount.toString());
      setDescription(data.description || '');
      setFrequency(data.frequency);
      setHasEndDate(!!data.end_date);
      setEndDate(data.end_date || '');
      setNotificationEnabled(data.notification_enabled);
      setNotificationDays(data.notification_days_before.toString());
    } else {
      Alert.alert('Error', error || 'Failed to load recurring transaction');
      router.back();
    }
    
    setLoading(false);
  };

  const handleUpdate = async () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid amount');
      return;
    }

    setSaving(true);

    const finalCategory = category === 'Custom' ? customCategory : category;

    const { success, error } = await updateRecurringTransaction(id, {
      type,
      category: finalCategory,
      amount: amountNum,
      description: description || null,
      frequency,
      end_date: hasEndDate ? endDate : null,
      notification_enabled: notificationEnabled,
      notification_days_before: parseInt(notificationDays) || 1,
    });

    setSaving(false);

    if (success) {
      Alert.alert('Success', 'Recurring transaction updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } else {
      Alert.alert('Error', error || 'Failed to update recurring transaction');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Recurring Transaction',
      'Are you sure you want to delete this recurring transaction? This will not delete already created transactions.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setSaving(true);
            const { success, error } = await deleteRecurringTransaction(id);
            setSaving(false);

            if (success) {
              Alert.alert('Success', 'Recurring transaction deleted', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } else {
              Alert.alert('Error', error || 'Failed to delete recurring transaction');
            }
          },
        },
      ]
    );
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>{'<'} Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Edit Recurring Transaction</Text>
        </View>

        {/* Type */}
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

        {/* Category */}
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
        </View>

        {/* Amount */}
        <View style={styles.section}>
          <Text style={styles.label}>Amount (KES)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
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

        {/* End Date */}
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
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={endDate}
              onChangeText={setEndDate}
            />
          )}
        </View>

        {/* Notifications */}
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
                style={styles.input}
                placeholder="1"
                value={notificationDays}
                onChangeText={setNotificationDays}
                keyboardType="number-pad"
              />
            </>
          )}
        </View>

        {/* Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={saving}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.updateButton, saving && styles.updateButtonDisabled]}
            onPress={handleUpdate}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={Colors.light.onPrimary} />
            ) : (
              <Text style={styles.updateButtonText}>Update</Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.md,
    color: Colors.light.textSecondary,
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
  deleteButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.light.errorBackground,
    borderWidth: 1,
    borderColor: Colors.light.error,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.error,
  },
  updateButton: {
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
  updateButtonDisabled: {
    opacity: 0.6,
  },
  updateButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.onPrimary,
  },
});

