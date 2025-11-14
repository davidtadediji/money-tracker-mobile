/**
 * Gradient Card Component
 * 
 * Modern card with gradient backgrounds
 */

import { BorderRadius, ModernShadows, Spacing } from '@/constants/designTokens';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';

interface GradientCardProps {
  children: React.ReactNode;
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  padding?: keyof typeof Spacing;
  style?: ViewStyle;
}

export default function GradientCard({
  children,
  colors,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  padding = 'lg',
  style,
}: GradientCardProps) {
  return (
    <LinearGradient
      colors={colors as any}
      start={start}
      end={end}
      style={[
        styles.container,
        { padding: Spacing[padding] },
        style,
      ]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...ModernShadows.soft,
  },
});

