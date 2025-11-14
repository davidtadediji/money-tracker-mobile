import { BorderRadius, Spacing, Typography } from '@/constants/designTokens';
import { Colors } from '@/constants/theme';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function ProfileScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [monthlyIncomeTarget, setMonthlyIncomeTarget] = useState('');
  const [monthlyBudgetLimit, setMonthlyBudgetLimit] = useState('');

  const handleSave = () => {
    console.log('Profile saved', {
      name,
      email,
      monthlyIncomeTarget,
      monthlyBudgetLimit,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Profile</Text>

      <View style={styles.avatar} />

      <View style={styles.group}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
        />
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="you@example.com"
        />
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>Monthly Income Target</Text>
        <TextInput
          style={styles.input}
          value={monthlyIncomeTarget}
          onChangeText={setMonthlyIncomeTarget}
          keyboardType="numeric"
          placeholder="e.g. 3000"
        />
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>Monthly Budget Limit</Text>
        <TextInput
          style={styles.input}
          value={monthlyBudgetLimit}
          onChangeText={setMonthlyBudgetLimit}
          keyboardType="numeric"
          placeholder="e.g. 2000"
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Profile</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: Spacing.md,
    gap: Spacing.md,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  header: { 
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    alignSelf: 'center',
    backgroundColor: Colors.light.secondaryLight,
    marginVertical: Spacing.sm,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  group: { 
    gap: Spacing.sm,
  },
  label: { 
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  input: {
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.light.surface,
    fontSize: Typography.fontSize.base,
    color: Colors.light.text,
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    marginTop: Spacing.sm,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  saveButtonText: {
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.base,
  },
});

