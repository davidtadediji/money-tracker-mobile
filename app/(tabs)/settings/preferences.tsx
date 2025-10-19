import React, { useState } from 'react';
import { View, Text, TextInput, Switch, TouchableOpacity, StyleSheet, Button } from 'react-native';

export default function PreferencesScreen() {
  const [currency, setCurrency] = useState('USD');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [ocrEnabled, setOcrEnabled] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  const handleSave = () => {
    console.log('Preferences saved', {
      currency,
      darkMode,
      notifications,
      ocrEnabled,
      voiceEnabled,
      timeframe,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Preferences</Text>

      <View style={styles.group}>
        <Text style={styles.label}>Currency</Text>
        <TextInput
          style={styles.input}
          value={currency}
          onChangeText={setCurrency}
          autoCapitalize="characters"
          placeholder="e.g. USD, EUR"
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Dark Mode</Text>
        <Switch value={darkMode} onValueChange={setDarkMode} />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Notifications</Text>
        <Switch value={notifications} onValueChange={setNotifications} />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>OCR for Receipts</Text>
        <Switch value={ocrEnabled} onValueChange={setOcrEnabled} />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Voice Entry</Text>
        <Switch value={voiceEnabled} onValueChange={setVoiceEnabled} />
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>Default Timeframe</Text>
        <View style={styles.chips}>
          {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((tf) => (
            <TouchableOpacity
              key={tf}
              style={[styles.chip, timeframe === tf && styles.chipActive]}
              onPress={() => setTimeframe(tf)}
            >
              <Text style={[styles.chipText, timeframe === tf && styles.chipTextActive]}>
                {tf.charAt(0).toUpperCase() + tf.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Button title="Save" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 16 },
  header: { fontSize: 20, fontWeight: '600' },
  group: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  label: { fontSize: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: '#ccc' },
  chipActive: { backgroundColor: '#111', borderColor: '#111' },
  chipText: { color: '#111' },
  chipTextActive: { color: '#fff' },
});

