/**
 * About App Screen
 * App information, version, legal, and credits
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { BorderRadius, Spacing, Typography } from '@/constants/designTokens';
import { useSupport } from '@/contexts/SupportContext';
import Constants from 'expo-constants';

export default function AboutScreen() {
  const { appInfo, isLoadingAppInfo, loadAppInfo } = useSupport();

  useEffect(() => {
    loadAppInfo();
  }, [loadAppInfo]);

  const openURL = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  if (isLoadingAppInfo) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const currentVersion = appInfo?.app_version || Constants.expoConfig?.version || '1.0.0';
  const buildNumber = appInfo?.build_number || Constants.expoConfig?.ios?.buildNumber || '1';

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* App Icon & Name */}
        <View style={styles.appHeader}>
          <View style={styles.appIconContainer}>
            <Text style={styles.appIcon}>💰</Text>
          </View>
          <Text style={styles.appName}>Money Tracker</Text>
          <Text style={styles.appTagline}>Your Financial Companion</Text>
          <Text style={styles.versionText}>
            Version {currentVersion} (Build {buildNumber})
          </Text>
        </View>

        {/* What's New */}
        {appInfo?.whats_new && appInfo.whats_new.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✨ What's New</Text>
            <View style={styles.card}>
              {appInfo.whats_new.map((item, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.listItemText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Improvements */}
        {appInfo?.improvements && appInfo.improvements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚀 Improvements</Text>
            <View style={styles.card}>
              {appInfo.improvements.map((item, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.listItemText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bug Fixes */}
        {appInfo?.bug_fixes && appInfo.bug_fixes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🐛 Bug Fixes</Text>
            <View style={styles.card}>
              {appInfo.bug_fixes.map((item, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.listItemText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Contact & Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📧 Contact & Support</Text>
          <View style={styles.card}>
            {appInfo?.support_email && (
              <TouchableOpacity
                style={styles.linkItem}
                onPress={() => openURL(`mailto:${appInfo.support_email}`)}
              >
                <Text style={styles.linkLabel}>Email</Text>
                <Text style={styles.linkValue}>{appInfo.support_email}</Text>
              </TouchableOpacity>
            )}
            
            {appInfo?.support_phone && (
              <TouchableOpacity
                style={styles.linkItem}
                onPress={() => openURL(`tel:${appInfo.support_phone}`)}
              >
                <Text style={styles.linkLabel}>Phone</Text>
                <Text style={styles.linkValue}>{appInfo.support_phone}</Text>
              </TouchableOpacity>
            )}
            
            {appInfo?.website_url && (
              <TouchableOpacity
                style={styles.linkItem}
                onPress={() => openURL(appInfo.website_url!)}
              >
                <Text style={styles.linkLabel}>Website</Text>
                <Text style={styles.linkValue}>{appInfo.website_url}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📜 Legal</Text>
          <View style={styles.card}>
            {appInfo?.privacy_policy_url && (
              <TouchableOpacity
                style={styles.linkItem}
                onPress={() => openURL(appInfo.privacy_policy_url!)}
              >
                <Text style={styles.linkLabel}>Privacy Policy</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            )}
            
            {appInfo?.terms_of_service_url && (
              <TouchableOpacity
                style={styles.linkItem}
                onPress={() => openURL(appInfo.terms_of_service_url!)}
              >
                <Text style={styles.linkLabel}>Terms of Service</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.linkItem}>
              <Text style={styles.linkLabel}>Open Source Licenses</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Social Links */}
        {appInfo?.social_links && Object.keys(appInfo.social_links).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌐 Follow Us</Text>
            <View style={styles.socialContainer}>
              {appInfo.social_links.twitter && (
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => openURL(appInfo.social_links.twitter)}
                >
                  <Text style={styles.socialIcon}>🐦</Text>
                  <Text style={styles.socialLabel}>Twitter</Text>
                </TouchableOpacity>
              )}
              
              {appInfo.social_links.facebook && (
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => openURL(appInfo.social_links.facebook)}
                >
                  <Text style={styles.socialIcon}>📘</Text>
                  <Text style={styles.socialLabel}>Facebook</Text>
                </TouchableOpacity>
              )}
              
              {appInfo.social_links.instagram && (
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => openURL(appInfo.social_links.instagram)}
                >
                  <Text style={styles.socialIcon}>📷</Text>
                  <Text style={styles.socialLabel}>Instagram</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Developer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👨‍💻 Developer</Text>
          <View style={styles.card}>
            <Text style={styles.developerName}>
              {appInfo?.developer_name || 'Money Tracker Team'}
            </Text>
            {appInfo?.developer_website && (
              <TouchableOpacity onPress={() => openURL(appInfo.developer_website!)}>
                <Text style={styles.developerWebsite}>{appInfo.developer_website}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Copyright */}
        <View style={styles.footer}>
          <Text style={styles.copyrightText}>
            {appInfo?.copyright_text || '© 2025 Money Tracker. All rights reserved.'}
          </Text>
          <Text style={styles.builtWithText}>
            Built with ❤️ using React Native & Expo
          </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: Spacing.md,
  },
  appHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  appIconContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  appIcon: {
    fontSize: 40,
  },
  appName: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  appTagline: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.sm,
  },
  versionText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  bullet: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.primary,
    marginRight: Spacing.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  listItemText: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.light.text,
    lineHeight: 22,
  },
  linkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  linkLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.text,
    fontWeight: Typography.fontWeight.medium,
  },
  linkValue: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.primary,
  },
  chevron: {
    fontSize: 20,
    color: Colors.light.textSecondary,
  },
  socialContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  socialButton: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  socialIcon: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  socialLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.text,
    fontWeight: Typography.fontWeight.medium,
  },
  developerName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  developerWebsite: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.primary,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  copyrightText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  builtWithText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
});

