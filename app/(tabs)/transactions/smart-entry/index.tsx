import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { BorderRadius, Spacing, Typography } from '@/constants/designTokens';

export default function SmartEntryHub() {
  const router = useRouter();

  const smartEntryOptions = [
    {
      id: 'receipt',
      title: 'Receipt Scanner',
      description: 'Scan receipts with OCR',
      icon: '📸',
      route: '/(tabs)/transactions/smart-entry/receipt-scanner',
      gradient: ['#F5569B', '#FF8EC7'],
    },
    {
      id: 'voice',
      title: 'Voice Entry',
      description: 'Speak your transactions',
      icon: '🎤',
      route: '/(tabs)/transactions/smart-entry/voice-entry',
      gradient: ['#1355B2', '#5B9FDB'],
    },
    {
      id: 'bulk',
      title: 'Bulk Import',
      description: 'Import CSV/Excel files',
      icon: '📊',
      route: '/(tabs)/transactions/smart-entry/bulk-import',
      gradient: ['#FFCBEB', '#FFA0D7'],
    },
    {
      id: 'screenshot',
      title: 'Screenshot',
      description: 'Process payment screenshots',
      icon: '📱',
      route: '/(tabs)/transactions/smart-entry/screenshot-processor',
      gradient: ['#6366F1', '#8B5CF6'],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Smart Entry Tools</Text>
          <Text style={styles.subtitle}>
            Quickly add transactions using AI-powered tools
          </Text>
        </View>

        {/* Feature Cards */}
        <View style={styles.featuresGrid}>
          {smartEntryOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.featureCard}
              onPress={() => router.push(option.route as any)}
              activeOpacity={0.7}
            >
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIcon}>{option.icon}</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{option.title}</Text>
                <Text style={styles.featureDescription}>{option.description}</Text>
              </View>
              <View style={styles.featureArrow}>
                <Text style={styles.arrowText}>→</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>✨ How It Works</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Text style={styles.infoNumber}>1</Text>
              <Text style={styles.infoText}>
                Choose a smart entry method that suits your needs
              </Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoNumber}>2</Text>
              <Text style={styles.infoText}>
                Our AI will extract transaction details automatically
              </Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoNumber}>3</Text>
              <Text style={styles.infoText}>
                Review and confirm before saving to your account
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Quick Tips</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>
              • Ensure receipts are clear and well-lit for better OCR accuracy
            </Text>
            <Text style={styles.tipText}>
              • Speak clearly when using voice entry
            </Text>
            <Text style={styles.tipText}>
              • CSV files should have columns: amount, category, date, type
            </Text>
            <Text style={styles.tipText}>
              • Screenshots work best with payment confirmations
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },

  // Header
  header: {
    marginBottom: Spacing.lg,
  },
  backButton: {
    marginBottom: Spacing.sm,
  },
  backText: {
    color: Colors.light.primary,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
  },

  // Features Grid
  featuresGrid: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.light.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  featureIcon: {
    fontSize: 32,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  featureDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  featureArrow: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    color: Colors.light.onPrimary,
    fontSize: 18,
    fontWeight: Typography.fontWeight.bold,
  },

  // Info Section
  infoSection: {
    marginBottom: Spacing.xl,
  },
  infoTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  infoCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
  },
  infoNumber: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.primary,
    color: Colors.light.onPrimary,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
    lineHeight: 28,
    marginRight: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.light.text,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
  },
  infoDivider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: Spacing.xs,
  },

  // Tips Section
  tipsSection: {
    marginBottom: Spacing.xl,
  },
  tipsTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  tipCard: {
    backgroundColor: Colors.light.secondaryLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  tipText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.text,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
    marginBottom: Spacing.xs,
  },
});

