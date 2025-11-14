/**
 * Card Component
 * 
 * Reusable card with your custom color palette
 */

import { Colors } from '@/constants/theme';
import { BorderRadius, Shadows, Spacing } from '@/constants/designTokens';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  padding?: keyof typeof Spacing;
  style?: ViewStyle;
}

export default function Card({
  children,
  variant = 'default',
  elevation = 'md',
  padding = 'md',
  style,
}: CardProps) {
  const cardStyle = [
    styles.base,
    styles[variant],
    elevation !== 'none' && Shadows[elevation],
    { padding: Spacing[padding] },
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.lg,
  },

  default: {
    backgroundColor: Colors.light.surface,
  },
  primary: {
    backgroundColor: Colors.light.primaryLight,
  },
  secondary: {
    backgroundColor: Colors.light.secondaryLight,
  },
  accent: {
    backgroundColor: Colors.light.accentLight,
  },
});

