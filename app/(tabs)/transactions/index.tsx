import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

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
  container: { flex: 1, padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', flex: 1 },
  primaryButton: {
    backgroundColor: '#111',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  primaryButtonText: { color: '#fff', fontWeight: '600' },
  item: { paddingVertical: 12 },
  itemTitle: { fontSize: 16, fontWeight: '600' },
  itemSubtitle: { color: '#666', marginTop: 2 },
  separator: { height: 1, backgroundColor: '#eee' },
  placeholder: { color: '#888', marginTop: 16 },
});

