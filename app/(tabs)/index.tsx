import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

type Txn = { id: string; amount: number; category: string; type: 'inflow' | 'outflow'; date: string };

const TXNS: Txn[] = [
  { id: '1', amount: 1200, category: 'Salary', type: 'inflow', date: '2025-10-01' },
  { id: '2', amount: 45, category: 'Coffee', type: 'outflow', date: '2025-10-02' },
  { id: '3', amount: 90, category: 'Groceries', type: 'outflow', date: '2025-10-03' },
  { id: '4', amount: 250, category: 'Freelance', type: 'inflow', date: '2025-10-05' },
  { id: '5', amount: 18, category: 'Transport', type: 'outflow', date: '2025-10-06' },
];

function calcBalance(items: Txn[]) {
  return items.reduce((sum, t) => sum + (t.type === 'inflow' ? t.amount : -t.amount), 0);
}

export default function DashboardScreen() {
  const router = useRouter();
  const balance = calcBalance(TXNS);
  const recent = TXNS.slice(0, 5);

  const bars = [60, 20, 40, 80, 30, 55, 70];
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const goDirect = () => {
    setDrawerOpen(false);
    router.push('/(tabs)/transactions/add');
  };

  const goOCR = () => {
    setDrawerOpen(false);
    router.push({ pathname: '/(tabs)/transactions/add', params: { mode: 'ocr' } as any });
  };

  const goVoice = () => {
    setDrawerOpen(false);
    router.push({ pathname: '/(tabs)/transactions/add', params: { mode: 'voice' } as any });
  };

  return (
    <View style={{ flex: 1 }}>
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={260}
          color="#808080"
          name="chart.bar.xaxis"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleRow}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Dashboard
        </ThemedText>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => router.push('/(tabs)/transactions/add')}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Quick Add</Text>
        </TouchableOpacity>
      </ThemedView>

      <View style={styles.cardRow}>
        <View style={[styles.card, { flex: 1 }]}> 
          <Text style={styles.cardTitle}>Current Balance</Text>
          <Text style={styles.balanceValue}>{balance}</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
      </View>
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.action} onPress={() => router.push('/(tabs)/transactions/add')}>
          <Text style={styles.actionText}>Add Txn</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.action} onPress={() => router.push('/(tabs)/transactions')}>
          <Text style={styles.actionText}>View Txns</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.action} onPress={() => router.push('/(tabs)/budget/create')}>
          <Text style={styles.actionText}>New Budget</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Mini Charts</Text>
      </View>
      <View style={styles.chartCard}>
        <View style={styles.barRow}>
          {bars.map((h, idx) => (
            <View key={idx} style={[styles.bar, { height: 20 + h }]} />
          ))}
        </View>
        <Text style={styles.chartCaption}>Last 7 days activity</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
      </View>
      <FlatList
        data={recent}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => router.push(`/(tabs)/transactions/${item.id}`)}>
            <Text style={styles.itemTitle}>
              {item.type === 'inflow' ? '+' : '-'}{item.amount}
            </Text>
            <Text style={styles.itemSubtitle}>{item.category}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.placeholder}>No recent transactions.</Text>}
        contentContainerStyle={{ paddingVertical: 8 }}
      />

    </ParallaxScrollView>
    <TouchableOpacity style={styles.fab} onPress={() => setDrawerOpen(true)}>
      <Text style={styles.fabText}>+</Text>
    </TouchableOpacity>
    <Modal
      visible={drawerOpen}
      animationType="slide"
      transparent
      onRequestClose={() => setDrawerOpen(false)}
    >
      <Pressable style={styles.backdrop} onPress={() => setDrawerOpen(false)} />
      <View style={styles.drawer}>
        <View style={styles.grabber} />
        <Text style={styles.drawerTitle}>Add transaction via</Text>
        <View style={styles.drawerActions}>
          <TouchableOpacity style={styles.drawerAction} onPress={goOCR}>
            <View style={styles.actionIconWrap}>
              <MaterialCommunityIcons name="text-recognition" size={24} color="#111" />
            </View>
            <Text style={styles.drawerActionText}>OCR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.drawerAction} onPress={goVoice}>
            <View style={styles.actionIconWrap}>
              <Ionicons name="mic-outline" size={24} color="#111" />
            </View>
            <Text style={styles.drawerActionText}>Voice</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.drawerAction} onPress={goDirect}>
            <View style={styles.actionIconWrap}>
              <Ionicons name="create-outline" size={24} color="#111" />
            </View>
            <Text style={styles.drawerActionText}>Direct</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: { color: '#666', marginBottom: 6 },
  balanceValue: { fontSize: 28, fontWeight: '800' },
  primaryButton: {
    backgroundColor: '#111',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  primaryButtonText: { color: '#fff', fontWeight: '600' },
  sectionHeader: { marginTop: 18, marginBottom: 6 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  actionsRow: { flexDirection: 'row', gap: 8 },
  action: { backgroundColor: '#111', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  actionText: { color: '#fff', fontWeight: '600' },
  chartCard: { marginTop: 6, padding: 12, borderRadius: 16, backgroundColor: '#fff' },
  barRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 100 },
  bar: { width: 12, backgroundColor: '#111', borderRadius: 6 },
  chartCaption: { color: '#666', marginTop: 8 },
  item: { paddingVertical: 12 },
  itemTitle: { fontSize: 16, fontWeight: '600' },
  itemSubtitle: { color: '#666', marginTop: 2 },
  separator: { height: 1, backgroundColor: '#eee' },
  placeholder: { color: '#888', marginTop: 16 },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  fabText: { color: '#fff', fontSize: 24, fontWeight: '800' },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  drawer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 24,
    paddingTop: 8,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  grabber: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
    marginVertical: 8,
  },
  drawerTitle: { fontSize: 14, color: '#666', marginBottom: 10, textAlign: 'center' },
  drawerActions: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
  drawerAction: { alignItems: 'center', gap: 8 },
  actionIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerActionText: { fontSize: 12, color: '#111', fontWeight: '600', marginTop: 4 },
});
