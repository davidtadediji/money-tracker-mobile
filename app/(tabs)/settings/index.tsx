import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { BorderRadius, Spacing, Typography } from '@/constants/designTokens';

export default function SettingsIndex() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Manage your account and preferences</Text>

      <View style={{ marginTop: 24 }}>
        <TouchableOpacity style={styles.item} onPress={() => router.push('/(tabs)/settings/profile')}>
          <Text style={styles.itemTitle}>Profile</Text>
          <Text style={styles.itemSubtitle}>Update your personal information</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity style={styles.item} onPress={() => router.push('/(tabs)/settings/preferences')}>
          <Text style={styles.itemTitle}>Preferences</Text>
          <Text style={styles.itemSubtitle}>Notifications, currency, theme</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: Spacing.md,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  title: { 
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
  },
  subtitle: { 
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
    fontSize: Typography.fontSize.base,
  },
  item: { 
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  itemTitle: { 
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  itemSubtitle: { 
    color: Colors.light.textSecondary,
    marginTop: 2,
    fontSize: Typography.fontSize.sm,
  },
  separator: { 
    height: 1, 
    backgroundColor: 'transparent',
  },
});
