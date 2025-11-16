import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useBalanceSheet } from '@/contexts/BalanceSheetContext';
import { supabase } from '@/lib/supabase';
import { Liability } from '@/types/database';
import { Colors } from '@/constants/theme';
import { BorderRadius, Spacing, Typography } from '@/constants/designTokens';

type LiabilityType = 'credit_card' | 'loan' | 'mortgage' | 'other';

const LIABILITY_TYPES: { type: LiabilityType; label: string; icon: string }[] = [
  { type: 'credit_card', label: 'Credit Card', icon: '💳' },
  { type: 'loan', label: 'Loan', icon: '🏦' },
  { type: 'mortgage', label: 'Mortgage', icon: '🏠' },
  { type: 'other', label: 'Other', icon: '📋' },
];

interface ValidationErrors {
  name?: string;
  balance?: string;
  type?: string;
}

export default function EditLiability() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { updateLiability, deleteLiability } = useBalanceSheet();

  const [liability, setLiability] = useState<Liability | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState<LiabilityType>('credit_card');
  const [balance, setBalance] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    fetchLiability();
  }, [id]);

  const fetchLiability = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('liabilities')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        Alert.alert('Error', 'Failed to load liability');
        router.back();
        return;
      }

      if (data) {
        setLiability(data);
        setName(data.name);
        setSelectedType(data.type as LiabilityType);
        setBalance(data.current_balance.toString());
        setInterestRate(data.interest_rate?.toString() || '');
        setDescription(data.description || '');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Liability name is required';
    }

    if (!balance.trim()) {
      newErrors.balance = 'Balance is required';
    } else {
      const numBalance = parseFloat(balance);
      if (isNaN(numBalance)) {
        newErrors.balance = 'Please enter a valid number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = (): boolean => {
    return (
      name.trim() !== '' &&
      balance.trim() !== '' &&
      !isNaN(parseFloat(balance))
    );
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { success, error } = await updateLiability(id, {
        name: name.trim(),
        type: selectedType,
        current_balance: parseFloat(balance),
        interest_rate: interestRate ? parseFloat(interestRate) : null,
        description: description.trim() || null,
      });

      if (success) {
        Alert.alert('Success', 'Liability updated successfully', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert('Error', error || 'Failed to update liability');
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Liability',
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            const { success, error } = await deleteLiability(id);

            if (success) {
              Alert.alert('Deleted', 'Liability deleted successfully', [
                {
                  text: 'OK',
                  onPress: () => router.back(),
                },
              ]);
            } else {
              Alert.alert('Error', error || 'Failed to delete liability');
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    router.back();
  };

  const handleBalanceChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.-]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return;
    }
    const negativeSigns = cleaned.split('-').length - 1;
    if (negativeSigns > 1 || (cleaned.indexOf('-') > 0 && cleaned.indexOf('-') !== -1)) {
      return;
    }
    setBalance(cleaned);
    if (errors.balance) {
      setErrors({ ...errors, balance: undefined });
    }
  };

  const handleInterestRateChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return;
    }
    setInterestRate(cleaned);
  };

  const handleNameChange = (text: string) => {
    setName(text);
    if (errors.name) {
      setErrors({ ...errors, name: undefined });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading liability...</Text>
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
          <Text style={styles.title}>Edit Liability</Text>
          <Text style={styles.subtitle}>Update your liability information</Text>
        </View>

        {/* Liability Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Liability Name</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="e.g. Credit Card, Car Loan"
            value={name}
            onChangeText={handleNameChange}
            placeholderTextColor={Colors.light.textSecondary}
            editable={!isLoading}
            autoCapitalize="words"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* Liability Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Liability Type</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.typeScrollContainer}
          >
            <View style={styles.typeGrid}>
              {LIABILITY_TYPES.map((liabilityType) => (
                <TouchableOpacity
                  key={liabilityType.type}
                  style={[
                    styles.typeChip,
                    selectedType === liabilityType.type && styles.typeChipActive,
                  ]}
                  onPress={() => setSelectedType(liabilityType.type)}
                  disabled={isLoading}
                >
                  <Text style={styles.typeIcon}>{liabilityType.icon}</Text>
                  <Text
                    style={[
                      styles.typeChipText,
                      selectedType === liabilityType.type && styles.typeChipTextActive,
                    ]}
                  >
                    {liabilityType.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Current Balance */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Current Balance</Text>
          <View style={styles.currencyInputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={[
                styles.input,
                styles.currencyInput,
                errors.balance && styles.inputError,
              ]}
              placeholder="0.00"
              value={balance}
              onChangeText={handleBalanceChange}
              keyboardType="decimal-pad"
              placeholderTextColor={Colors.light.textSecondary}
              editable={!isLoading}
            />
          </View>
          {errors.balance && <Text style={styles.errorText}>{errors.balance}</Text>}
        </View>

        {/* Interest Rate (Optional) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Interest Rate (Optional)</Text>
          <View style={styles.currencyInputContainer}>
            <TextInput
              style={[styles.input, styles.currencyInput]}
              placeholder="0.00"
              value={interestRate}
              onChangeText={handleInterestRateChange}
              keyboardType="decimal-pad"
              placeholderTextColor={Colors.light.textSecondary}
              editable={!isLoading}
            />
            <Text style={styles.percentSymbol}>%</Text>
          </View>
        </View>

        {/* Description (Optional) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add notes about this liability"
            value={description}
            onChangeText={setDescription}
            placeholderTextColor={Colors.light.textSecondary}
            editable={!isLoading}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
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
              <Text style={styles.updateButtonText}>Update Liability</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={isLoading}
          >
            <Text style={styles.deleteButtonText}>Delete Liability</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
  },

  // Header
  header: {
    marginBottom: Spacing.lg,
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

  // Currency Input
  currencyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginRight: Spacing.sm,
  },
  percentSymbol: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginLeft: Spacing.sm,
  },
  currencyInput: {
    flex: 1,
  },

  // Type Selector
  typeScrollContainer: {
    marginHorizontal: -Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  typeGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  typeChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    minWidth: 110,
  },
  typeChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  typeIcon: {
    fontSize: 20,
  },
  typeChipText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.light.textSecondary,
  },
  typeChipTextActive: {
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
  },

  // Text Area
  textArea: {
    height: 90,
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
  deleteButton: {
    backgroundColor: Colors.light.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.error,
  },
  deleteButtonText: {
    color: Colors.light.error,
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
});

