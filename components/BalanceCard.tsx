/**
 * Balance Card Component
 * 
 * Modern card displaying user's balance with glassmorphism
 */

import { Colors } from '@/constants/theme';
import { BorderRadius, ModernShadows, Spacing, Typography } from '@/constants/designTokens';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface BalanceCardProps {
  balance: number;
  currency?: string;
  title?: string;
  subtitle?: string;
  showEyeIcon?: boolean;
  onEyePress?: () => void;
}

export default function BalanceCard({
  balance,
  currency = '$',
  title = 'AVAILABLE BALANCE',
  subtitle,
  showEyeIcon = true,
  onEyePress,
}: BalanceCardProps) {
  return (
    <LinearGradient
      colors={['#F5569B', '#B855D4']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {showEyeIcon && (
          <TouchableOpacity onPress={onEyePress} style={styles.eyeButton}>
            <Text style={styles.eyeIcon}>👁️</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Balance */}
      <View style={styles.balanceContainer}>
        <Text style={styles.currency}>{currency}</Text>
        <Text style={styles.balance}>
          {balance.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </View>

      {/* Subtitle */}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      {/* Decorative Elements */}
      <View style={styles.decoration1} />
      <View style={styles.decoration2} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.md,
    ...ModernShadows.glow,
    overflow: 'hidden',
    position: 'relative',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },

  title: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: Typography.letterSpacing.wide,
  },

  eyeButton: {
    padding: Spacing.xs,
  },

  eyeIcon: {
    fontSize: Typography.fontSize.lg,
  },

  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },

  currency: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: '#fff',
    marginRight: Spacing.xs,
    marginTop: Spacing.xs,
  },

  balance: {
    fontSize: Typography.fontSize.hero,
    fontWeight: Typography.fontWeight.black,
    color: '#fff',
    letterSpacing: Typography.letterSpacing.tight,
  },

  subtitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Decorative circular elements
  decoration1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -40,
    right: -20,
  },

  decoration2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: -20,
    left: -10,
  },
});

