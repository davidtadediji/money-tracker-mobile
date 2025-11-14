import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { BorderRadius, Spacing, Typography } from '@/constants/designTokens';

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
            fontSize: Typography.fontSize.xxxl,
            fontWeight: Typography.fontWeight.bold,
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
    color: Colors.light.primary,
    bottom: -70,
    left: -20,
    position: 'absolute',
  },
  titleRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: Spacing.sm,
  },
  section: { 
    marginTop: Spacing.lg,
  },
  sectionTitle: { 
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
    color: Colors.light.text,
  },
  row: { 
    flexDirection: 'row', 
    gap: Spacing.sm,
  },
  pill: { 
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  pillText: { 
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.bold,
    fontSize: Typography.fontSize.sm,
  },
  barRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    gap: Spacing.xs,
    height: 100, 
    marginTop: Spacing.sm,
    justifyContent: 'space-around',
  },
  bar: { 
    width: 24,
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.sm,
  },
  caption: { 
    color: Colors.light.textSecondary,
    marginTop: Spacing.sm,
    fontSize: Typography.fontSize.sm,
  },
  card: { 
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.md,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  listRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  listLabel: { 
    color: Colors.light.text,
    fontSize: Typography.fontSize.base,
  },
  listValue: { 
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    fontSize: Typography.fontSize.base,
  },
  progressTrack: { 
    height: 12,
    backgroundColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  progressFill: { 
    height: 12,
    backgroundColor: Colors.light.primary,
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
});
