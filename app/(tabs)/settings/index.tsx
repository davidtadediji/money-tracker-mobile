import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

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
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { color: '#666', marginTop: 4 },
  item: { paddingVertical: 12 },
  itemTitle: { fontSize: 16, fontWeight: '600' },
  itemSubtitle: { color: '#666', marginTop: 2 },
  separator: { height: 1, backgroundColor: '#eee' },
});
