import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSmartEntry } from '@/contexts/SmartEntryContext';
import { useTransaction } from '@/contexts/TransactionContext';
import { Colors } from '@/constants/theme';
import { BorderRadius, Spacing, Typography } from '@/constants/designTokens';

export default function VoiceEntry() {
  const router = useRouter();
  const { recordVoice, processing, currentEntry } = useSmartEntry();
  const { createTransaction } = useTransaction();

  const [isRecording, setIsRecording] = useState(false);
  const [step, setStep] = useState<'record' | 'processing' | 'review'>('record');
  const [extractedTransactions, setExtractedTransactions] = useState<any[]>([]);

  const handleRecord = async () => {
    setIsRecording(true);
    // Simulate recording
    setTimeout(async () => {
      setIsRecording(false);
      setStep('processing');
      
      // Simulate audio URI - in real app, use expo-av
      const mockAudioUri = 'mock://audio/recording.m4a';
      const response = await recordVoice(mockAudioUri);
      
      if (response.success && response.entry?.extracted_transactions) {
        setExtractedTransactions(response.entry.extracted_transactions);
        setStep('review');
      } else {
        Alert.alert('Error', response.error || 'Failed to process voice');
        setStep('record');
      }
    }, 3000);
  };

  const handleApprove = async () => {
    for (const transaction of extractedTransactions) {
      await createTransaction(transaction);
    }
    Alert.alert('Success', 'Transactions saved!', [{ text: 'OK', onPress: () => router.back() }]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Voice Entry</Text>
        <Text style={styles.subtitle}>Speak your transaction details</Text>

        {step === 'record' && (
          <View style={styles.recordContainer}>
            <View style={styles.micContainer}>
              <Text style={styles.micIcon}>🎤</Text>
            </View>
            <TouchableOpacity
              style={[styles.recordButton, isRecording && styles.recordingButton]}
              onPress={handleRecord}
              disabled={isRecording}
            >
              <Text style={styles.recordButtonText}>
                {isRecording ? '⏹ Recording...' : '🎙️ Start Recording'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.hint}>Example: "I spent $25 on Uber for transportation"</Text>
          </View>
        )}

        {step === 'processing' && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.processingText}>Processing voice...</Text>
          </View>
        )}

        {step === 'review' && (
          <View style={styles.reviewContainer}>
            <Text style={styles.reviewTitle}>Extracted Transaction</Text>
            {extractedTransactions.map((t, i) => (
              <View key={i} style={styles.card}>
                <Text style={styles.label}>Amount: ${t.amount}</Text>
                <Text style={styles.label}>Category: {t.category}</Text>
                <Text style={styles.label}>Description: {t.description}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.approveButton} onPress={handleApprove}>
              <Text style={styles.approveText}>✓ Approve & Save</Text>
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
  recordContainer: { alignItems: 'center', paddingVertical: Spacing.xxl },
  micContainer: { width: 120, height: 120, borderRadius: BorderRadius.xxl, backgroundColor: Colors.light.secondaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg },
  micIcon: { fontSize: 64 },
  recordButton: { backgroundColor: Colors.light.primary, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, borderRadius: BorderRadius.xl, marginBottom: Spacing.md },
  recordingButton: { backgroundColor: Colors.light.error },
  recordButtonText: { color: Colors.light.onPrimary, fontWeight: Typography.fontWeight.semibold, fontSize: Typography.fontSize.base },
  hint: { fontSize: Typography.fontSize.sm, color: Colors.light.textSecondary, textAlign: 'center', marginTop: Spacing.md },
  processingContainer: { alignItems: 'center', paddingVertical: Spacing.xxl },
  processingText: { marginTop: Spacing.md, color: Colors.light.text, fontSize: Typography.fontSize.base },
  reviewContainer: { marginTop: Spacing.lg },
  reviewTitle: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.bold, marginBottom: Spacing.md },
  card: { backgroundColor: Colors.light.surface, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md },
  label: { fontSize: Typography.fontSize.base, color: Colors.light.text, marginBottom: Spacing.xs },
  approveButton: { backgroundColor: Colors.light.success, paddingVertical: Spacing.md, borderRadius: BorderRadius.xl, alignItems: 'center', marginTop: Spacing.md },
  approveText: { color: Colors.light.onPrimary, fontWeight: Typography.fontWeight.semibold },
});

