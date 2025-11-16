/**
 * Support Hub Screen
 * Main entry point for all support features
 */

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
import { useSupport } from '@/contexts/SupportContext';

export default function SupportIndexScreen() {
  const router = useRouter();
  const { openTicketsCount, featuredFAQs } = useSupport();

  const supportOptions = [
    {
      id: 'faq',
      title: 'FAQ',
      description: 'Frequently asked questions',
      icon: '❓',
      route: '/support/faq',
      badge: featuredFAQs.length > 0 ? `${featuredFAQs.length} featured` : undefined,
    },
    {
      id: 'tutorial',
      title: 'Tutorial',
      description: 'Learn how to use the app',
      icon: '📚',
      route: '/support/onboarding',
    },
    {
      id: 'contact',
      title: 'Contact Support',
      description: 'Get help from our team',
      icon: '💬',
      route: '/support/contact',
      badge: openTicketsCount > 0 ? `${openTicketsCount} open` : undefined,
    },
    {
      id: 'tickets',
      title: 'My Tickets',
      description: 'View your support requests',
      icon: '🎫',
      route: '/support/tickets',
      badge: openTicketsCount > 0 ? `${openTicketsCount}` : undefined,
    },
    {
      id: 'about',
      title: 'About App',
      description: 'Version info & legal',
      icon: 'ℹ️',
      route: '/support/about',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Help & Support</Text>
          <Text style={styles.subtitle}>
            We're here to help you get the most out of Money Tracker
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How can we help?</Text>
          
          <View style={styles.optionsGrid}>
            {supportOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionCard}
                onPress={() => router.push(option.route as any)}
              >
                <View style={styles.optionIcon}>
                  <Text style={styles.optionEmoji}>{option.icon}</Text>
                </View>
                <View style={styles.optionContent}>
                  <View style={styles.optionHeader}>
                    <Text style={styles.optionTitle}>{option.title}</Text>
                    {option.badge && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{option.badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured FAQs */}
        {featuredFAQs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular Questions</Text>
              <TouchableOpacity onPress={() => router.push('/support/faq')}>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>

            {featuredFAQs.slice(0, 3).map((faq) => (
              <TouchableOpacity
                key={faq.id}
                style={styles.faqPreview}
                onPress={() => router.push('/support/faq')}
              >
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Text style={styles.faqAnswer} numberOfLines={2}>
                  {faq.answer}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Links</Text>
          
          <TouchableOpacity
            style={styles.quickLink}
            onPress={() => router.push('/support/contact')}
          >
            <Text style={styles.quickLinkText}>📧 Email Support</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickLink}
            onPress={() => router.push('/support/about')}
          >
            <Text style={styles.quickLinkText}>📜 Privacy Policy</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickLink}
            onPress={() => router.push('/support/about')}
          >
            <Text style={styles.quickLinkText}>📋 Terms of Service</Text>
          </TouchableOpacity>
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
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  seeAllText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  optionsGrid: {
    gap: Spacing.sm,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  optionEmoji: {
    fontSize: 24,
  },
  optionContent: {
    flex: 1,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  optionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  optionDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  badge: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.medium,
  },
  chevron: {
    fontSize: 24,
    color: Colors.light.textSecondary,
    marginLeft: Spacing.sm,
  },
  faqPreview: {
    backgroundColor: Colors.light.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  faqQuestion: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  faqAnswer: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  quickLink: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xs,
  },
  quickLinkText: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.text,
  },
});

