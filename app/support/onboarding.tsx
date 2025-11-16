/**
 * Onboarding/Tutorial Screen
 * Interactive tutorial for app features
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { BorderRadius, Spacing, Typography } from '@/constants/designTokens';
import { useSupport } from '@/contexts/SupportContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const {
    onboardingSteps,
    onboardingProgress,
    currentOnboardingStep,
    isLoadingOnboarding,
    loadOnboarding,
    completeStep,
    skipStep,
    resetOnboarding,
  } = useSupport();

  useEffect(() => {
    loadOnboarding();
  }, [loadOnboarding]);

  const handleComplete = async (stepNumber: number) => {
    await completeStep(stepNumber);
  };

  const handleSkip = async (stepNumber: number) => {
    await skipStep(stepNumber);
  };

  const handleActionButton = (step: any) => {
    if (step.action_button_route) {
      router.push(step.action_button_route);
    }
    handleComplete(step.step_number);
  };

  const handleRestart = async () => {
    await resetOnboarding();
  };

  if (isLoadingOnboarding) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading tutorial...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show completion screen if onboarding is complete
  if (onboardingProgress?.is_completed) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.completionContainer}>
          <Text style={styles.completionEmoji}>🎉</Text>
          <Text style={styles.completionTitle}>Tutorial Complete!</Text>
          <Text style={styles.completionText}>
            You're all set! You've learned the basics of Money Tracker.
          </Text>
          
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.primaryButtonText}>Done</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleRestart}
          >
            <Text style={styles.secondaryButtonText}>Restart Tutorial</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((onboardingProgress?.completed_steps?.length || 0) / onboardingSteps.length) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {onboardingProgress?.completed_steps?.length || 0} of {onboardingSteps.length} completed
          </Text>
        </View>

        {/* Steps List */}
        <View style={styles.stepsContainer}>
          {onboardingSteps.map((step) => {
            const isCompleted = onboardingProgress?.completed_steps?.includes(step.step_number);
            const isSkipped = onboardingProgress?.skipped_steps?.includes(step.step_number);
            const isCurrent = currentOnboardingStep === step.step_number;

            return (
              <View
                key={step.id}
                style={[
                  styles.stepCard,
                  isCurrent && styles.stepCardCurrent,
                  isCompleted && styles.stepCardCompleted,
                ]}
              >
                {/* Step Header */}
                <View style={styles.stepHeader}>
                  <View style={styles.stepNumberContainer}>
                    <Text style={styles.stepNumber}>
                      {isCompleted ? '✓' : step.step_number}
                    </Text>
                  </View>
                  <View style={styles.stepHeaderContent}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    {isSkipped && (
                      <View style={styles.skippedBadge}>
                        <Text style={styles.skippedBadgeText}>Skipped</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Step Icon/Emoji */}
                {step.icon_name && (
                  <View style={styles.stepIconContainer}>
                    <Text style={styles.stepIcon}>
                      {getIconEmoji(step.icon_name)}
                    </Text>
                  </View>
                )}

                {/* Step Description */}
                <Text style={styles.stepDescription}>{step.description}</Text>

                {/* Step Type Badge */}
                <View style={styles.stepMeta}>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>
                      {getTypeLabel(step.content_type)}
                    </Text>
                  </View>
                  {step.is_required && (
                    <View style={styles.requiredBadge}>
                      <Text style={styles.requiredBadgeText}>Required</Text>
                    </View>
                  )}
                </View>

                {/* Action Buttons */}
                {!isCompleted && !isSkipped && (
                  <View style={styles.stepActions}>
                    {step.action_button_text && (
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleActionButton(step)}
                      >
                        <Text style={styles.actionButtonText}>
                          {step.action_button_text}
                        </Text>
                      </TouchableOpacity>
                    )}
                    
                    {!step.action_button_text && (
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleComplete(step.step_number)}
                      >
                        <Text style={styles.actionButtonText}>
                          Mark as Complete
                        </Text>
                      </TouchableOpacity>
                    )}

                    {step.can_skip && (
                      <TouchableOpacity
                        style={styles.skipButton}
                        onPress={() => handleSkip(step.step_number)}
                      >
                        <Text style={styles.skipButtonText}>Skip</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Completed State */}
                {isCompleted && (
                  <View style={styles.completedBanner}>
                    <Text style={styles.completedText}>✓ Completed</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Reset Button */}
        {(onboardingProgress?.completed_steps?.length || 0) > 0 && (
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleRestart}
          >
            <Text style={styles.resetButtonText}>🔄 Restart Tutorial</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper functions
function getIconEmoji(iconName: string): string {
  const iconMap: Record<string, string> = {
    'wave': '👋',
    'plus-circle': '➕',
    'target': '🎯',
    'bar-chart': '📊',
    'bell': '🔔',
    'wallet': '💰',
    'calendar': '📅',
    'settings': '⚙️',
  };
  return iconMap[iconName] || '📖';
}

function getTypeLabel(type: string): string {
  const typeMap: Record<string, string> = {
    'info': 'Info',
    'tutorial': 'Tutorial',
    'permission_request': 'Permission',
    'setup': 'Setup',
  };
  return typeMap[type] || type;
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
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  progressContainer: {
    marginBottom: Spacing.xl,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.full,
  },
  progressText: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  stepsContainer: {
    gap: Spacing.md,
  },
  stepCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  stepCardCurrent: {
    borderWidth: 2,
    borderColor: Colors.light.primary,
    shadowOpacity: 0.15,
    elevation: 3,
  },
  stepCardCompleted: {
    opacity: 0.7,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  stepNumberContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  stepNumber: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.onPrimary,
  },
  stepHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  stepTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    flex: 1,
  },
  stepIconContainer: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  stepIcon: {
    fontSize: 48,
  },
  stepDescription: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  stepMeta: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  typeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  typeBadgeText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
  },
  requiredBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.light.error,
  },
  requiredBadgeText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.medium,
  },
  skippedBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.light.textSecondary,
  },
  skippedBadgeText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.onPrimary,
  },
  stepActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  actionButtonText: {
    color: Colors.light.onPrimary,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  skipButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center',
  },
  skipButtonText: {
    color: Colors.light.textSecondary,
    fontSize: Typography.fontSize.base,
  },
  completedBanner: {
    backgroundColor: Colors.light.success + '20',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  completedText: {
    color: Colors.light.success,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  resetButton: {
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
  },
  resetButtonText: {
    color: Colors.light.text,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  completionEmoji: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  completionTitle: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  completionText: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  primaryButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  primaryButtonText: {
    color: Colors.light.onPrimary,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  secondaryButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.light.border,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.light.text,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
});

