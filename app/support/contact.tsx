/**
 * Contact Support Screen
 * Submit support tickets and feedback
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { BorderRadius, Spacing, Typography } from '@/constants/designTokens';
import { useSupport } from '@/contexts/SupportContext';
import Constants from 'expo-constants';

export default function ContactSupportScreen() {
  const router = useRouter();
  const { createTicket, appInfo } = useSupport();

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'bug' | 'feature_request' | 'help' | 'feedback' | 'other'>('help');
  const [contactEmail, setContactEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: 'help', label: 'Help', icon: '❓', description: 'Need help using the app' },
    { value: 'bug', label: 'Bug Report', icon: '🐛', description: 'Something isn\'t working' },
    { value: 'feature_request', label: 'Feature Request', icon: '💡', description: 'Suggest a new feature' },
    { value: 'feedback', label: 'Feedback', icon: '💬', description: 'Share your thoughts' },
    { value: 'other', label: 'Other', icon: '📝', description: 'Something else' },
  ];

  const handleSubmit = async () => {
    // Validation
    if (!subject.trim()) {
      Alert.alert('Error', 'Please enter a subject');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please describe your issue');
      return;
    }

    if (!contactEmail.trim()) {
      Alert.alert('Error', 'Please provide a contact email');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      setIsSubmitting(true);

      // Collect device info
      const deviceInfo = {
        platform: Platform.OS,
        version: Platform.Version,
        appVersion: Constants.expoConfig?.version || '1.0.0',
        buildNumber: Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || '1',
      };

      await createTicket({
        subject,
        description,
        category,
        contact_email: contactEmail,
        priority: 'medium',
        status: 'open',
        preferred_contact_method: 'email',
        app_version: deviceInfo.appVersion,
        device_info: deviceInfo,
      });

      Alert.alert(
        'Success',
        'Your support ticket has been submitted. We\'ll get back to you soon!',
        [
          {
            text: 'View My Tickets',
            onPress: () => router.push('/support/tickets'),
          },
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );

      // Reset form
      setSubject('');
      setDescription('');
      setCategory('help');
      setContactEmail('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit support ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Contact Support</Text>
          <Text style={styles.subtitle}>
            We're here to help! Describe your issue and we'll get back to you as soon as possible.
          </Text>
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.categoryCard,
                  category === cat.value && styles.categoryCardActive,
                ]}
                onPress={() => setCategory(cat.value as any)}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.categoryLabel,
                    category === cat.value && styles.categoryLabelActive,
                  ]}
                >
                  {cat.label}
                </Text>
                <Text style={styles.categoryDescription}>{cat.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Contact Email */}
        <View style={styles.section}>
          <Text style={styles.label}>Your Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="email@example.com"
            placeholderTextColor={Colors.light.textSecondary}
            value={contactEmail}
            onChangeText={setContactEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.helperText}>
            We'll use this email to respond to your request
          </Text>
        </View>

        {/* Subject */}
        <View style={styles.section}>
          <Text style={styles.label}>Subject *</Text>
          <TextInput
            style={styles.input}
            placeholder="Brief description of your issue"
            placeholderTextColor={Colors.light.textSecondary}
            value={subject}
            onChangeText={setSubject}
            maxLength={100}
          />
          <Text style={styles.helperText}>
            {subject.length}/100 characters
          </Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Please provide as much detail as possible..."
            placeholderTextColor={Colors.light.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={1000}
          />
          <Text style={styles.helperText}>
            {description.length}/1000 characters
          </Text>
        </View>

        {/* Device Info Preview */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📱 Device Information</Text>
          <Text style={styles.infoText}>
            Platform: {Platform.OS} {Platform.Version}
          </Text>
          <Text style={styles.infoText}>
            App Version: {Constants.expoConfig?.version || '1.0.0'}
          </Text>
          <Text style={styles.infoSubtext}>
            This info will be included to help us resolve your issue
          </Text>
        </View>

        {/* Support Info */}
        {appInfo?.support_email && (
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>📧 Alternative Contact</Text>
            <Text style={styles.infoText}>
              Email: {appInfo.support_email}
            </Text>
            {appInfo.support_phone && (
              <Text style={styles.infoText}>
                Phone: {appInfo.support_phone}
              </Text>
            )}
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={Colors.light.onPrimary} />
          ) : (
            <Text style={styles.submitButtonText}>Submit Support Request</Text>
          )}
        </TouchableOpacity>

        {/* View Tickets Link */}
        <TouchableOpacity
          style={styles.viewTicketsButton}
          onPress={() => router.push('/support/tickets')}
        >
          <Text style={styles.viewTicketsText}>View My Tickets</Text>
        </TouchableOpacity>
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
    lineHeight: 22,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  textArea: {
    minHeight: 120,
    paddingTop: Spacing.md,
  },
  helperText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
  },
  categoriesGrid: {
    gap: Spacing.sm,
  },
  categoryCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  categoryCardActive: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary + '10',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  categoryLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: 4,
  },
  categoryLabelActive: {
    color: Colors.light.primary,
  },
  categoryDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  infoBox: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  infoTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  infoSubtext: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    marginBottom: Spacing.md,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: Colors.light.onPrimary,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  viewTicketsButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  viewTicketsText: {
    color: Colors.light.primary,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
});

