/**
 * Modern Button Component
 * 
 * Sleek button with gradients and glass effects
 */

import { Colors } from '@/constants/theme';
import { BorderRadius, ModernShadows, Spacing, Typography } from '@/constants/designTokens';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

interface ModernButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'gradient' | 'glass' | 'outline' | 'solid';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export default function ModernButton({
  title,
  onPress,
  variant = 'gradient',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
}: ModernButtonProps) {
  const sizeStyles = {
    sm: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
    md: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg },
    lg: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xl },
  };

  const textSizes = {
    sm: Typography.fontSize.sm,
    md: Typography.fontSize.base,
    lg: Typography.fontSize.lg,
  };

  if (variant === 'gradient') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[styles.container, style]}
      >
        <LinearGradient
          colors={disabled ? ['#D1D5DB', '#9CA3AF'] : ['#F5569B', '#B855D4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, sizeStyles[size]]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.content}>
              {icon}
              <Text style={[styles.text, { fontSize: textSizes[size] }]}>
                {title}
              </Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'glass') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[styles.container, style]}
      >
        <View style={[styles.glass, sizeStyles[size]]}>
          {loading ? (
            <ActivityIndicator color={Colors.light.primary} />
          ) : (
            <View style={styles.content}>
              {icon}
              <Text style={[styles.textGlass, { fontSize: textSizes[size] }]}>
                {title}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.7}
        style={[styles.outline, sizeStyles[size], disabled && styles.disabled, style]}
      >
        {loading ? (
          <ActivityIndicator color={Colors.light.primary} />
        ) : (
          <View style={styles.content}>
            {icon}
            <Text style={[styles.textOutline, { fontSize: textSizes[size] }]}>
              {title}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // Solid variant
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.solid,
        sizeStyles[size],
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={[styles.text, { fontSize: textSizes[size] }]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },

  gradient: {
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...ModernShadows.soft,
  },

  glass: {
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...ModernShadows.soft,
  },

  solid: {
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    ...ModernShadows.soft,
  },

  outline: {
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },

  text: {
    color: '#fff',
    fontWeight: Typography.fontWeight.bold,
  },

  textGlass: {
    color: Colors.light.primary,
    fontWeight: Typography.fontWeight.bold,
  },

  textOutline: {
    color: Colors.light.primary,
    fontWeight: Typography.fontWeight.bold,
  },

  disabled: {
    opacity: 0.5,
  },
});

