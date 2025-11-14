import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { BorderRadius, Spacing, Typography } from '@/constants/designTokens';

type Txn = { id: string; amount: number; category: string; type: 'inflow' | 'outflow' };

const SAMPLE: Txn[] = [
  { id: '1', amount: 1200, category: 'Salary', type: 'inflow' },
  { id: '2', amount: 35, category: 'Food', type: 'outflow' },
];

export default function TransactionsIndex() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Transactions</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/(tabs)/transactions/add')}
        >
          <Text style={styles.primaryButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={SAMPLE}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => router.push(`/(tabs)/transactions/${item.id}`)}
          >
            <Text style={styles.itemTitle}>
              {item.type === 'inflow' ? '+' : '-'}{item.amount}
            </Text>
            <Text style={styles.itemSubtitle}>{item.category}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.placeholder}>No transactions yet.</Text>}
        contentContainerStyle={{ paddingVertical: 8 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: Spacing.md,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  headerRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: { 
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    flex: 1,
    color: Colors.light.text,
  },
  primaryButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xl,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  primaryButtonText: { 
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.sm,
  },
  item: { 
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  itemTitle: { 
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  itemSubtitle: { 
    color: Colors.light.textSecondary,
    marginTop: 2,
    fontSize: Typography.fontSize.sm,
  },
  separator: { 
    height: 1, 
    backgroundColor: 'transparent',
  },
  placeholder: { 
    color: Colors.light.textSecondary,
    marginTop: Spacing.lg,
    textAlign: 'center',
    fontSize: Typography.fontSize.base,
  },
});

