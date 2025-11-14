import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useSmartEntry } from '@/contexts/SmartEntryContext';
import { useTransaction } from '@/contexts/TransactionContext';
import { Colors } from '@/constants/theme';
import { BorderRadius, Spacing, Typography } from '@/constants/designTokens';

export default function ScreenshotProcessor() {
  const router = useRouter();
  const { captureScreenshot, processing } = useSmartEntry();
  const { createTransaction } = useTransaction();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'processing' | 'review'>('select');
  const [extractedTransactions, setExtractedTransactions] = useState<any[]>([]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need library access');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setSelectedImage(imageUri);
      setStep('processing');
      const response = await captureScreenshot(imageUri);
      if (response.success && response.entry?.extracted_transactions) {
        setExtractedTransactions(response.entry.extracted_transactions);
        setStep('review');
      } else {
        Alert.alert('Error', response.error || 'Failed to process screenshot');
        setStep('select');
      }
    }
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
        <Text style={styles.title}>Screenshot Processor</Text>
        <Text style={styles.subtitle}>Extract data from payment screenshots</Text>

        {step === 'select' && (
          <View style={styles.selectContainer}>
            <Text style={styles.icon}>📱</Text>
            <TouchableOpacity style={styles.button} onPress={pickImage}>
              <Text style={styles.buttonText}>🖼️ Select Screenshot</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'processing' && (
          <View style={styles.processingContainer}>
            {selectedImage && <Image source={{ uri: selectedImage }} style={styles.image} />}
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.processingText}>Processing screenshot...</Text>
          </View>
        )}

        {step === 'review' && (
          <View style={styles.reviewContainer}>
            {selectedImage && <Image source={{ uri: selectedImage }} style={styles.reviewImage} />}
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
  selectContainer: { alignItems: 'center', paddingVertical: Spacing.xxl },
  icon: { fontSize: 80, marginBottom: Spacing.lg },
  button: { backgroundColor: Colors.light.primary, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, borderRadius: BorderRadius.xl },
  buttonText: { color: Colors.light.onPrimary, fontWeight: Typography.fontWeight.semibold },
  processingContainer: { alignItems: 'center', paddingVertical: Spacing.xl },
  image: { width: '100%', height: 200, borderRadius: BorderRadius.lg, marginBottom: Spacing.lg },
  processingText: { marginTop: Spacing.md, color: Colors.light.text },
  reviewContainer: { marginTop: Spacing.lg },
  reviewImage: { width: '100%', height: 150, borderRadius: BorderRadius.lg, marginBottom: Spacing.lg },
  reviewTitle: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.bold, marginBottom: Spacing.md },
  card: { backgroundColor: Colors.light.surface, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md },
  label: { fontSize: Typography.fontSize.base, color: Colors.light.text, marginBottom: Spacing.xs },
  approveButton: { backgroundColor: Colors.light.success, paddingVertical: Spacing.md, borderRadius: BorderRadius.xl, alignItems: 'center', marginTop: Spacing.md },
  approveText: { color: Colors.light.onPrimary, fontWeight: Typography.fontWeight.semibold },
});

