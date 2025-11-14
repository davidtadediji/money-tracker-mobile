import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { BorderRadius, Spacing, Typography } from '@/constants/designTokens';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
            fontSize: Typography.fontSize.xxxl,
            fontWeight: Typography.fontWeight.bold,
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
      <View style={{ paddingVertical: 8 }}>
        {recent.length > 0 ? (
          recent.map((item, index) => (
            <View key={item.id}>
              {index > 0 && <View style={styles.separator} />}
              <TouchableOpacity style={styles.item} onPress={() => router.push(`/(tabs)/transactions/${item.id}`)}>
                <Text style={styles.itemTitle}>
                  {item.type === 'inflow' ? '+' : '-'}{item.amount}
                </Text>
                <Text style={styles.itemSubtitle}>{item.category}</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.placeholder}>No recent transactions.</Text>
        )}
      </View>

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
              <MaterialCommunityIcons name="text-recognition" size={24} color={Colors.light.primary} />
            </View>
            <Text style={styles.drawerActionText}>OCR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.drawerAction} onPress={goVoice}>
            <View style={styles.actionIconWrap}>
              <Ionicons name="mic-outline" size={24} color={Colors.light.primary} />
            </View>
            <Text style={styles.drawerActionText}>Voice</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.drawerAction} onPress={goDirect}>
            <View style={styles.actionIconWrap}>
              <Ionicons name="create-outline" size={24} color={Colors.light.primary} />
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
    color: Colors.light.primary,
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cardRow: { 
    flexDirection: 'row', 
    gap: Spacing.md, 
    marginTop: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardTitle: { 
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
    fontSize: Typography.fontSize.sm,
  },
  balanceValue: { 
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.extrabold,
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
  sectionHeader: { 
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  sectionTitle: { 
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
  },
  actionsRow: { 
    flexDirection: 'row', 
    gap: Spacing.sm,
  },
  action: { 
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  actionText: { 
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.sm,
  },
  chartCard: { 
    marginTop: Spacing.xs,
    padding: Spacing.md,
    borderRadius: BorderRadius.xxl,
    backgroundColor: Colors.light.surface,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  barRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    gap: Spacing.xs,
    height: 100,
    justifyContent: 'space-around',
  },
  bar: { 
    width: 24,
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.sm,
  },
  chartCaption: { 
    color: Colors.light.textSecondary,
    marginTop: Spacing.sm,
    fontSize: Typography.fontSize.sm,
  },
  item: { 
    paddingVertical: Spacing.md,
  },
  itemTitle: { 
    fontSize: Typography.fontSize.base,
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
    backgroundColor: Colors.light.border,
  },
  placeholder: { 
    color: Colors.light.textSecondary,
    marginTop: Spacing.md,
  },
  fab: {
    position: 'absolute',
    right: Spacing.md,
    bottom: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  fabText: { 
    color: Colors.light.onPrimary,
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.extrabold,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.light.overlay,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.light.surface,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  grabber: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.light.border,
    marginVertical: Spacing.sm,
  },
  drawerTitle: { 
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
    fontWeight: Typography.fontWeight.medium,
  },
  drawerActions: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    paddingVertical: Spacing.sm,
  },
  drawerAction: { 
    alignItems: 'center',
    gap: Spacing.xs,
  },
  actionIconWrap: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerActionText: { 
    fontSize: Typography.fontSize.sm,
    color: Colors.light.text,
    fontWeight: Typography.fontWeight.semibold,
    marginTop: Spacing.xs,
  },
});
