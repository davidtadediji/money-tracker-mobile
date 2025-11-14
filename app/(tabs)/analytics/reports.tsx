import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { BorderRadius, Spacing, Typography } from '@/constants/designTokens';


export default function Reports() {
  const router = useRouter();
  const [from, setFrom] = useState('2025-10-01');
  const [to, setTo] = useState('2025-10-31');
  const [category, setCategory] = useState('');

  const generate = () => {
    Alert.alert('Report Generated', `From ${from} to ${to}${category ? `, Category: ${category}` : ''}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Custom Reports</Text>
      <TextInput style={styles.input} placeholder="From (YYYY-MM-DD)" value={from} onChangeText={setFrom} placeholderTextColor="#777" />
      <TextInput style={styles.input} placeholder="To (YYYY-MM-DD)" value={to} onChangeText={setTo} placeholderTextColor="#777" />
      <TextInput style={styles.input} placeholder="Category (optional)" value={category} onChangeText={setCategory} placeholderTextColor="#777" />
      <TouchableOpacity style={styles.primaryButton} onPress={generate}>
        <Text style={styles.primaryButtonText}>Generate</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.secondaryButton]} onPress={() => router.back()}>
        <Text style={styles.secondaryButtonText}>Back</Text>
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
  title: { 
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.lg,
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
  primaryButton: { 
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignSelf: 'flex-start',
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
  secondaryButton: { 
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignSelf: 'flex-start', 
    marginTop: Spacing.sm,
    backgroundColor: Colors.light.surface,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  secondaryButtonText: { 
    color: Colors.light.text,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.sm,
  },
});
