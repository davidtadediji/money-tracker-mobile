import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { useBalanceSheet } from '@/contexts/BalanceSheetContext';
import { Colors } from '@/constants/theme';
import { BorderRadius, Spacing, Typography } from '@/constants/designTokens';

type AssetType = 'cash' | 'bank' | 'investment' | 'property' | 'other';

const ASSET_TYPES: { type: AssetType; label: string; icon: string }[] = [
  { type: 'cash', label: 'Cash', icon: '💵' },
  { type: 'bank', label: 'Bank', icon: '🏦' },
  { type: 'investment', label: 'Investment', icon: '📈' },
  { type: 'property', label: 'Property', icon: '🏠' },
  { type: 'other', label: 'Other', icon: '💰' },
];

interface ValidationErrors {
  name?: string;
  value?: string;
  type?: string;
}

export default function AddAsset() {
  const router = useRouter();
  const { createAsset } = useBalanceSheet();

  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState<AssetType>('bank');
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validate name
    if (!name.trim()) {
      newErrors.name = 'Asset name is required';
    }

    // Validate value
    if (!value.trim()) {
      newErrors.value = 'Value is required';
    } else {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        newErrors.value = 'Please enter a valid number';
      } else if (numValue <= 0) {
        newErrors.value = 'Value must be greater than 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = (): boolean => {
    return (
      name.trim() !== '' &&
      value.trim() !== '' &&
      parseFloat(value) > 0 &&
      !isNaN(parseFloat(value))
    );
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { success, error } = await createAsset({
        name: name.trim(),
        type: selectedType,
        current_value: parseFloat(value),
        description: description.trim() || null,
        currency: 'USD',
      });

      if (success) {
        Alert.alert('Success', 'Asset added successfully', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert('Error', error || 'Failed to add asset');
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleValueChange = (text: string) => {
    // Allow only numbers and decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    // Prevent multiple decimal points
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return;
    }
    setValue(cleaned);
    // Clear error when user starts typing
    if (errors.value) {
      setErrors({ ...errors, value: undefined });
    }
  };

  const handleNameChange = (text: string) => {
    setName(text);
    // Clear error when user starts typing
    if (errors.name) {
      setErrors({ ...errors, name: undefined });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Add Asset</Text>
          <Text style={styles.subtitle}>Track your wealth and investments</Text>
        </View>

        {/* Asset Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Asset Name</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="e.g. Savings Account, House"
            value={name}
            onChangeText={handleNameChange}
            placeholderTextColor={Colors.light.textSecondary}
            editable={!isLoading}
            autoCapitalize="words"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* Asset Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Asset Type</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.typeScrollContainer}
          >
            <View style={styles.typeGrid}>
              {ASSET_TYPES.map((assetType) => (
                <TouchableOpacity
                  key={assetType.type}
                  style={[
                    styles.typeChip,
                    selectedType === assetType.type && styles.typeChipActive,
                  ]}
                  onPress={() => setSelectedType(assetType.type)}
                  disabled={isLoading}
                >
                  <Text style={styles.typeIcon}>{assetType.icon}</Text>
                  <Text
                    style={[
                      styles.typeChipText,
                      selectedType === assetType.type && styles.typeChipTextActive,
                    ]}
                  >
                    {assetType.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Current Value */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Current Value</Text>
          <View style={styles.currencyInputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={[
                styles.input,
                styles.currencyInput,
                errors.value && styles.inputError,
              ]}
              placeholder="0.00"
              value={value}
              onChangeText={handleValueChange}
              keyboardType="decimal-pad"
              placeholderTextColor={Colors.light.textSecondary}
              editable={!isLoading}
            />
          </View>
          {errors.value && <Text style={styles.errorText}>{errors.value}</Text>}
        </View>

        {/* Description (Optional) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add notes about this asset"
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
              styles.saveButton,
              (!isFormValid() || isLoading) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.light.onPrimary} />
            ) : (
              <Text style={styles.saveButtonText}>Save Asset</Text>
            )}
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
    minWidth: 100,
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
  saveButton: {
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
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
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
});

