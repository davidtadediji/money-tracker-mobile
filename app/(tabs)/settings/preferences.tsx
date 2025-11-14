import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { BorderRadius, Spacing, Typography } from '@/constants/designTokens';

export default function PreferencesScreen() {
  const [currency, setCurrency] = useState("USD");
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [ocrEnabled, setOcrEnabled] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [timeframe, setTimeframe] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("monthly");
  

  const handleSave = () => {
    console.log("Preferences saved", {
      currency,
      darkMode,
      notifications,
      ocrEnabled,
      voiceEnabled,
      timeframe,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
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
        <Switch 
          value={darkMode} 
          onValueChange={setDarkMode}
          trackColor={{ false: Colors.light.border, true: Colors.light.primaryLight }}
          thumbColor={darkMode ? Colors.light.primary : Colors.light.surface}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Notifications</Text>
        <Switch 
          value={notifications} 
          onValueChange={setNotifications}
          trackColor={{ false: Colors.light.border, true: Colors.light.primaryLight }}
          thumbColor={notifications ? Colors.light.primary : Colors.light.surface}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>OCR for Receipts</Text>
        <Switch 
          value={ocrEnabled} 
          onValueChange={setOcrEnabled}
          trackColor={{ false: Colors.light.border, true: Colors.light.primaryLight }}
          thumbColor={ocrEnabled ? Colors.light.primary : Colors.light.surface}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Voice Entry</Text>
        <Switch 
          value={voiceEnabled} 
          onValueChange={setVoiceEnabled}
          trackColor={{ false: Colors.light.border, true: Colors.light.primaryLight }}
          thumbColor={voiceEnabled ? Colors.light.primary : Colors.light.surface}
        />
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>Default Timeframe</Text>
        <View style={styles.chips}>
          {(["daily", "weekly", "monthly", "yearly"] as const).map((tf) => (
            <TouchableOpacity
              key={tf}
              style={[styles.chip, timeframe === tf && styles.chipActive]}
              onPress={() => setTimeframe(tf)}
            >
              <Text
                style={[
                  styles.chipText,
                  timeframe === tf && styles.chipTextActive,
                ]}
              >
                {tf.charAt(0).toUpperCase() + tf.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Preferences</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: Spacing.md,
    gap: Spacing.md,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  header: { 
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
  },
  group: { 
    gap: Spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xs,
  },
  label: { 
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.light.text,
  },
  input: {
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.light.surface,
    fontSize: Typography.fontSize.base,
    color: Colors.light.text,
  },
  chips: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
  },
  chipActive: { 
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  chipText: { 
    color: Colors.light.textSecondary,
    fontWeight: Typography.fontWeight.medium,
    fontSize: Typography.fontSize.sm,
  },
  chipTextActive: { 
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    marginTop: Spacing.sm,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  saveButtonText: {
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.base,
  },
});
