import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function BudgetIndex() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Budget Overview</Text>
      <Text style={styles.subtitle}>Plan your spending limits by category.</Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.push('/(tabs)/budget/create')}
      >
        <Text style={styles.primaryButtonText}>Create Budget</Text>
      </TouchableOpacity>

      <View style={{ marginTop: 24 }}>
        <Text style={styles.sectionTitle}>Your Budgets</Text>
        <Text style={styles.placeholder}>No budgets yet.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { color: '#666', marginTop: 4 },
  sectionTitle: { marginTop: 8, fontWeight: '600' },
  placeholder: { color: '#888', marginTop: 4 },
  primaryButton: {
    backgroundColor: '#111',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 16,
  },
  primaryButtonText: { color: '#fff', fontWeight: '600' },
});

