import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useBalanceSheet } from '@/contexts/BalanceSheetContext';
import { Colors } from '@/constants/theme';
import { BorderRadius, Spacing, Typography } from '@/constants/designTokens';

const ASSET_ICONS: Record<string, string> = {
  cash: '💵',
  bank: '🏦',
  investment: '📈',
  property: '🏠',
  other: '💰',
};

export default function BalanceSheetSettings() {
  const router = useRouter();
  const {
    assets,
    autoUpdateEnabled,
    primaryAssetId,
    setAutoUpdateEnabled,
    setPrimaryAssetId,
  } = useBalanceSheet();

  const handleToggleAutoUpdate = async (value: boolean) => {
    await setAutoUpdateEnabled(value);
    
    if (value && !primaryAssetId && assets.length > 0) {
      Alert.alert(
        'Select Primary Asset',
        'Please select which asset account should be auto-updated from transactions.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleSelectAsset = async (assetId: string) => {
    await setPrimaryAssetId(assetId);
    Alert.alert('Success', 'Primary asset account updated');
  };

  const handleClearSelection = async () => {
    await setPrimaryAssetId(null);
    Alert.alert('Cleared', 'Primary asset selection cleared. Will use Cash account by default.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Balance Sheet Settings</Text>
          <Text style={styles.subtitle}>Configure automatic balance tracking</Text>
        </View>

        {/* Auto-Update Toggle */}
        <View style={styles.section}>
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>🔄</Text>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Auto-Update from Transactions</Text>
                  <Text style={styles.settingDescription}>
                    Automatically update your balance sheet when you add income or expense
                    transactions
                  </Text>
                </View>
              </View>
              <Switch
                value={autoUpdateEnabled}
                onValueChange={handleToggleAutoUpdate}
                trackColor={{
                  false: Colors.light.border,
                  true: Colors.light.primary,
                }}
                thumbColor={Colors.light.surface}
                ios_backgroundColor={Colors.light.border}
              />
            </View>
          </View>
        </View>

        {/* Primary Asset Selection */}
        {autoUpdateEnabled && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Primary Asset Account</Text>
              <Text style={styles.sectionDescription}>
                Select which asset account should be updated when transactions are added
              </Text>
            </View>

            {assets.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>💰</Text>
                <Text style={styles.emptyText}>No assets yet</Text>
                <Text style={styles.emptySubtext}>
                  Add an asset first to use auto-update
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.assetsList}>
                  {assets.map((asset) => (
                    <TouchableOpacity
                      key={asset.id}
                      style={[
                        styles.assetCard,
                        primaryAssetId === asset.id && styles.assetCardSelected,
                      ]}
                      onPress={() => handleSelectAsset(asset.id)}
                    >
                      <View style={styles.assetLeft}>
                        <Text style={styles.assetIcon}>
                          {ASSET_ICONS[asset.type] || ASSET_ICONS.other}
                        </Text>
                        <View>
                          <Text style={styles.assetName}>{asset.name}</Text>
                          <Text style={styles.assetType}>
                            {asset.type.charAt(0).toUpperCase() + asset.type.slice(1)} •{' '}
                            ${asset.current_value.toLocaleString()}
                          </Text>
                        </View>
                      </View>
                      {primaryAssetId === asset.id && (
                        <View style={styles.checkmark}>
                          <Text style={styles.checkmarkText}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                {primaryAssetId && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={handleClearSelection}
                  >
                    <Text style={styles.clearButtonText}>Clear Selection</Text>
                  </TouchableOpacity>
                )}

                <View style={styles.infoCard}>
                  <Text style={styles.infoIcon}>ℹ️</Text>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoTitle}>How it works</Text>
                    <Text style={styles.infoText}>
                      • Income transactions: Added to selected asset{'\n'}• Expense
                      transactions: Deducted from selected asset{'\n'}• If no asset is
                      selected, "Cash" account is used by default
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  header: {
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  backButton: {
    marginBottom: Spacing.md,
  },
  backText: {
    color: Colors.light.primary,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
  },

  // Section
  section: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  sectionDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },

  // Setting Card
  settingCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  settingLeft: {
    flexDirection: 'row',
    flex: 1,
    marginRight: Spacing.md,
  },
  settingIcon: {
    fontSize: 32,
    marginRight: Spacing.sm,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  settingDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },

  // Assets List
  assetsList: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  assetCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  assetCardSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.secondaryLight,
  },
  assetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  assetIcon: {
    fontSize: 32,
    marginRight: Spacing.sm,
  },
  assetName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  assetType: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: Colors.light.onPrimary,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },

  // Clear Button
  clearButton: {
    backgroundColor: Colors.light.surface,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.light.border,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  clearButtonText: {
    color: Colors.light.text,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.sm,
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.light.infoBackground,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.info,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  infoText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
});

