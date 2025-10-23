import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

export default function AnalyticsIndex() {
  const router = useRouter();

  const bars = [70, 35, 55, 25, 80, 45, 65];

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={220}
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
          Analytics
        </ThemedText>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/(tabs)/analytics/reports')}>
          <Text style={styles.primaryButtonText}>Reports</Text>
        </TouchableOpacity>
      </ThemedView>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Income vs Expenses</Text>
        <View style={styles.row}>
          <View style={[styles.pill, { backgroundColor: '#16a34a' }]}>
            <Text style={styles.pillText}>Income: 4,500</Text>
          </View>
          <View style={[styles.pill, { backgroundColor: '#dc2626' }]}>
            <Text style={styles.pillText}>Expenses: 3,200</Text>
          </View>
        </View>
        <View style={styles.barRow}>
          {bars.map((h, idx) => (
            <View key={idx} style={[styles.bar, { height: 18 + h }]} />
          ))}
        </View>
        <Text style={styles.caption}>Last 7 days</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Category-wise Analysis</Text>
        <View style={styles.card}> 
          {[
            { label: 'Food', value: 620 },
            { label: 'Transport', value: 180 },
            { label: 'Bills', value: 740 },
            { label: 'Others', value: 220 },
          ].map((c) => (
            <View key={c.label} style={styles.listRow}>
              <Text style={styles.listLabel}>{c.label}</Text>
              <Text style={styles.listValue}>{c.value}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Budget Performance</Text>
        <View style={styles.card}> 
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '68%' }]} />
          </View>
          <Text style={styles.caption}>68% of monthly budget used</Text>
        </View>
      </View>

      <TouchableOpacity style={[styles.primaryButton, { alignSelf: 'flex-start', marginTop: 16 }]} onPress={() => router.push('/(tabs)/analytics/reports')}>
        <Text style={styles.primaryButtonText}>Open Custom Reports</Text>
      </TouchableOpacity>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -70,
    left: -20,
    position: 'absolute',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  section: { marginTop: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8 },
  pill: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 9999 },
  pillText: { color: '#fff', fontWeight: '700' },
  barRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 100, marginTop: 10 },
  bar: { width: 12, backgroundColor: '#111', borderRadius: 6 },
  caption: { color: '#666', marginTop: 8 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  listRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  listLabel: { color: '#333' },
  listValue: { fontWeight: '700' },
  progressTrack: { height: 10, backgroundColor: '#eee', borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: 10, backgroundColor: '#111' },
  primaryButton: { backgroundColor: '#111', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  primaryButtonText: { color: '#fff', fontWeight: '600' },
});
