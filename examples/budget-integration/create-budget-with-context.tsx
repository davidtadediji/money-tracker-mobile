/**
 * Example: Create Budget Screen using BudgetContext
 * 
 * File: app/(tabs)/budget/create.tsx
 * 
 * This version uses the useBudget hook for simpler state management.
 */

import { useBudget } from '@/contexts/BudgetContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateBudget() {
  const router = useRouter();
  const { createBudget } = useBudget();
  
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');
  const [startDate, setStartDate] = useState(getTodayDate());
  const [loading, setLoading] = useState(false);

  function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  const validateInputs = (): string | null => {
    if (!category.trim()) {
      return 'Please enter a category name';
    }

    if (!limit.trim()) {
      return 'Please enter a budget limit';
    }

    const limitNum = parseFloat(limit);
    if (isNaN(limitNum) || limitNum <= 0) {
      return 'Budget limit must be a positive number';
    }

    if (!startDate) {
      return 'Please select a start date';
    }

    return null;
  };

  const handleSave = async () => {
    // Validate inputs
    const validationError = validateInputs();
    if (validationError) {
      Alert.alert('Invalid Input', validationError);
      return;
    }

    setLoading(true);

    try {
      const limitNum = parseFloat(limit);

      const { success, error } = await createBudget(
        category.trim(),
        limitNum,
        period,
        startDate
      );

      setLoading(false);

      if (success) {
        Alert.alert(
          'Success',
          'Budget created successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.back()
            }
          ]
        );
      } else {
        Alert.alert('Error', error || 'Failed to create budget');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      Alert.alert('Error', 'An unexpected error occurred');
      setLoading(false);
    }
  };

  const quickAmounts = [100, 250, 500, 1000, 2000];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Create Budget</Text>
          <Text style={styles.description}>
            Set a spending limit for a category to help manage your expenses.
          </Text>

          {/* Category Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Category *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Groceries, Entertainment, Transport"
              value={category}
              onChangeText={setCategory}
              placeholderTextColor="#999"
              autoCapitalize="words"
            />
          </View>

          {/* Limit Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Budget Limit *</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={[styles.input, styles.amountInput]}
                placeholder="0.00"
                value={limit}
                onChangeText={setLimit}
                keyboardType="decimal-pad"
                placeholderTextColor="#999"
              />
            </View>
            
            {/* Quick Amount Buttons */}
            <View style={styles.quickAmounts}>
              {quickAmounts.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={styles.quickAmountButton}
                  onPress={() => setLimit(amount.toString())}
                >
                  <Text style={styles.quickAmountText}>${amount}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Period Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>Period *</Text>
            <View style={styles.periodButtons}>
              {(['weekly', 'monthly', 'yearly'] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.periodButton, period === p && styles.periodButtonActive]}
                  onPress={() => setPeriod(p)}
                >
                  <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Start Date Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Start Date *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={startDate}
              onChangeText={setStartDate}
              placeholderTextColor="#999"
            />
            <Text style={styles.hint}>Format: YYYY-MM-DD (e.g., 2025-01-01)</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={() => router.back()}
              disabled={loading}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.primaryButton, loading && styles.primaryButtonDisabled]} 
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Create Budget</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 16,
  },
  title: { 
    fontSize: 24, 
    fontWeight: '700',
    marginBottom: 8,
    color: '#111',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: { 
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fafafa',
    fontSize: 16,
    color: '#111',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  currencySymbol: {
    position: 'absolute',
    left: 14,
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    zIndex: 1,
  },
  amountInput: {
    paddingLeft: 32,
    flex: 1,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  quickAmountButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: { 
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  periodButtonActive: { 
    backgroundColor: '#111',
    borderColor: '#111',
  },
  periodText: { 
    color: '#111',
    fontWeight: '600',
    fontSize: 14,
  },
  periodTextActive: { 
    color: '#fff',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#111',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: { 
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    color: '#111',
    fontWeight: '600',
    fontSize: 16,
  },
});

