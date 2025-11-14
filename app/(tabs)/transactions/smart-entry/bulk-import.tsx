import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useSmartEntry } from '@/contexts/SmartEntryContext';
import { useTransaction } from '@/contexts/TransactionContext';
import { Colors } from '@/constants/theme';
import { BorderRadius, Spacing, Typography } from '@/constants/designTokens';

export default function BulkImport() {
  const router = useRouter();
  const { importBulk, processing } = useSmartEntry();
  const { createTransaction } = useTransaction();
  const [csvData, setCsvData] = useState('');
  const [step, setStep] = useState<'select' | 'processing' | 'review'>('select');
  const [extractedTransactions, setExtractedTransactions] = useState<any[]>([]);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'text/csv' });
      if (result.assets && result.assets[0]) {
        const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
        setCsvData(fileContent);
        setStep('processing');
        const response = await importBulk(fileContent);
        if (response.success && response.entry?.extracted_transactions) {
          setExtractedTransactions(response.entry.extracted_transactions);
          setStep('review');
        } else {
          Alert.alert('Error', response.error || 'Failed to process CSV');
          setStep('select');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to read file');
    }
  };

  const handleApprove = async () => {
    for (const transaction of extractedTransactions) {
      await createTransaction(transaction);
    }
    Alert.alert('Success', `${extractedTransactions.length} transactions saved!`, [{ text: 'OK', onPress: () => router.back() }]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Bulk Import</Text>
        <Text style={styles.subtitle}>Import transactions from CSV file</Text>

        {step === 'select' && (
          <View style={styles.selectContainer}>
            <Text style={styles.icon}>📊</Text>
            <TouchableOpacity style={styles.button} onPress={pickDocument}>
              <Text style={styles.buttonText}>📁 Select CSV File</Text>
            </TouchableOpacity>
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>CSV Format:</Text>
              <Text style={styles.infoText}>amount,category,date,type,description</Text>
              <Text style={styles.infoText}>45.99,Food & Dining,2025-01-15,expense,Restaurant</Text>
            </View>
          </View>
        )}

        {step === 'processing' && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.processingText}>Processing CSV...</Text>
          </View>
        )}

        {step === 'review' && (
          <View style={styles.reviewContainer}>
            <Text style={styles.reviewTitle}>{extractedTransactions.length} Transactions Found</Text>
            {extractedTransactions.slice(0, 5).map((t, i) => (
              <View key={i} style={styles.card}>
                <Text style={styles.cardText}>${t.amount} - {t.category}</Text>
              </View>
            ))}
            {extractedTransactions.length > 5 && <Text style={styles.moreText}>...and {extractedTransactions.length - 5} more</Text>}
            <TouchableOpacity style={styles.approveButton} onPress={handleApprove}>
              <Text style={styles.approveText}>✓ Import All</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.backgroundSecondary },
  content: { padding: Spacing.md },
  backButton: { marginBottom: Spacing.sm },
  backText: { color: Colors.light.primary, fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.semibold },
  title: { fontSize: Typography.fontSize.xxxl, fontWeight: Typography.fontWeight.bold, color: Colors.light.text, marginBottom: Spacing.xs },
  subtitle: { fontSize: Typography.fontSize.base, color: Colors.light.textSecondary, marginBottom: Spacing.lg },
  selectContainer: { alignItems: 'center', paddingVertical: Spacing.xl },
  icon: { fontSize: 80, marginBottom: Spacing.lg },
  button: { backgroundColor: Colors.light.primary, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, borderRadius: BorderRadius.xl, marginBottom: Spacing.lg },
  buttonText: { color: Colors.light.onPrimary, fontWeight: Typography.fontWeight.semibold },
  infoBox: { backgroundColor: Colors.light.surface, borderRadius: BorderRadius.lg, padding: Spacing.md, width: '100%' },
  infoTitle: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.semibold, marginBottom: Spacing.xs },
  infoText: { fontSize: Typography.fontSize.sm, color: Colors.light.textSecondary, fontFamily: 'monospace', marginBottom: 2 },
  processingContainer: { alignItems: 'center', paddingVertical: Spacing.xxl },
  processingText: { marginTop: Spacing.md, color: Colors.light.text },
  reviewContainer: { marginTop: Spacing.lg },
  reviewTitle: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.bold, marginBottom: Spacing.md },
  card: { backgroundColor: Colors.light.surface, borderRadius: BorderRadius.lg, padding: Spacing.sm, marginBottom: Spacing.xs },
  cardText: { fontSize: Typography.fontSize.base, color: Colors.light.text },
  moreText: { fontSize: Typography.fontSize.sm, color: Colors.light.textSecondary, textAlign: 'center', marginVertical: Spacing.sm },
  approveButton: { backgroundColor: Colors.light.success, paddingVertical: Spacing.md, borderRadius: BorderRadius.xl, alignItems: 'center', marginTop: Spacing.md },
  approveText: { color: Colors.light.onPrimary, fontWeight: Typography.fontWeight.semibold },
});

