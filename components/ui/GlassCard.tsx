/**
 * Glass Card Component
 * 
 * Modern glassmorphism card with blur effects
 */

import { Colors } from '@/constants/theme';
import { BorderRadius, Glassmorphism, ModernShadows, Spacing } from '@/constants/designTokens';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'light' | 'medium' | 'dark' | 'pink' | 'blue';
  padding?: keyof typeof Spacing;
  style?: ViewStyle;
}

export default function GlassCard({
  children,
  variant = 'light',
  padding = 'lg',
  style,
}: GlassCardProps) {
  const variantStyles = {
    light: styles.light,
    medium: styles.medium,
    dark: styles.dark,
    pink: styles.pink,
    blue: styles.blue,
  };

  return (
    <View
      style={[
        styles.base,
        variantStyles[variant],
        { padding: Spacing[padding] },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...ModernShadows.soft,
  },

  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  medium: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  dark: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },

  pink: {
    backgroundColor: 'rgba(245, 86, 155, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 86, 155, 0.3)',
  },

  blue: {
    backgroundColor: 'rgba(19, 85, 178, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(19, 85, 178, 0.3)',
  },
});

