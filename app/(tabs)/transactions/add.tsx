import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { BorderRadius, Spacing, Typography } from '@/constants/designTokens';

export default function AddTransaction() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState<'inflow' | 'outflow'>('outflow');

  const save = () => {
    console.log('Add transaction', { amount, category, note, type });
    Alert.alert('Saved', 'Transaction added');
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{"<"} Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Transaction</Text>
      </View>

      <View style={styles.typeRow}>
        {(['outflow', 'inflow'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setType(t)}
            style={[styles.chip, type === t && styles.chipActive]}
          >
            <Text style={[styles.chipText, type === t && styles.chipTextActive]}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        placeholderTextColor="#777"
      />
      <TextInput
        style={styles.input}
        placeholder="Category (e.g. Food, Salary)"
        value={category}
        onChangeText={setCategory}
        placeholderTextColor="#777"
      />
      <TextInput
        style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
        placeholder="Note (optional)"
        value={note}
        onChangeText={setNote}
        multiline
        numberOfLines={4}
        placeholderTextColor="#777"
      />

      <TouchableOpacity style={styles.primaryButton} onPress={save}>
        <Text style={styles.primaryButtonText}>Save</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: Spacing.md,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  backButton: { 
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  backText: { 
    color: Colors.light.primary,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  title: { 
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
    color: Colors.light.text,
  },
  input: {
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.light.surface,
    fontSize: Typography.fontSize.base,
    color: Colors.light.text,
  },
  typeRow: { 
    flexDirection: 'row', 
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  chip: { 
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
  },
  chipActive: { 
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  chipText: { 
    color: Colors.light.textSecondary,
    fontWeight: Typography.fontWeight.medium,
    fontSize: Typography.fontSize.sm,
  },
  chipTextActive: { 
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
  },
  primaryButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  primaryButtonText: { 
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.base,
  },
});

