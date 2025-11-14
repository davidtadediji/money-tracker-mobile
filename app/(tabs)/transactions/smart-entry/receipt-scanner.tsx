import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useSmartEntry } from '@/contexts/SmartEntryContext';
import { useTransaction } from '@/contexts/TransactionContext';
import { Colors } from '@/constants/theme';
import { BorderRadius, Spacing, Typography } from '@/constants/designTokens';

export default function ReceiptScanner() {
  const router = useRouter();
  const { scanReceipt, processing, currentEntry } = useSmartEntry();
  const { createTransaction } = useTransaction();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [extractedTransactions, setExtractedTransactions] = useState<any[]>([]);
  const [step, setStep] = useState<'select' | 'processing' | 'review'>('select');

  const pickImage = async (fromCamera: boolean) => {
    try {
      const { status } = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need camera/library access to scan receipts');
        return;
      }

      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsEditing: true,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsEditing: true,
          });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
        setStep('processing');
        
        const response = await scanReceipt(imageUri);
        
        if (response.success && response.entry?.extracted_transactions) {
          setExtractedTransactions(response.entry.extracted_transactions);
          setStep('review');
        } else {
          Alert.alert('Error', response.error || 'Failed to process receipt');
          setStep('select');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      setStep('select');
    }
  };

  const handleApprove = async () => {
    try {
      for (const transaction of extractedTransactions) {
        await createTransaction({
          amount: transaction.amount,
          category: transaction.category,
          date: transaction.date,
          description: transaction.description || null,
          type: transaction.type,
        });
      }
      
      Alert.alert('Success', 'Transactions saved successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save transactions');
    }
  };

  const updateTransaction = (index: number, field: string, value: any) => {
    const updated = [...extractedTransactions];
    updated[index] = { ...updated[index], [field]: value };
    setExtractedTransactions(updated);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Receipt Scanner</Text>
          <Text style={styles.subtitle}>Scan receipts and extract transaction data</Text>
        </View>

        {/* Step 1: Select Image */}
        {step === 'select' && (
          <View style={styles.selectContainer}>
            <View style={styles.iconContainer}>
              <Text style={styles.largeIcon}>📸</Text>
            </View>
            
            <Text style={styles.selectTitle}>Scan Your Receipt</Text>
            <Text style={styles.selectDescription}>
              Take a photo or choose from your library
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => pickImage(true)}
              >
                <Text style={styles.primaryButtonText}>📷 Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => pickImage(false)}
              >
                <Text style={styles.secondaryButtonText}>🖼️ Choose from Library</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Step 2: Processing */}
        {step === 'processing' && (
          <View style={styles.processingContainer}>
            {selectedImage && (
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            )}
            
            <View style={styles.processingCard}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
              <Text style={styles.processingTitle}>Processing Receipt...</Text>
              <Text style={styles.processingSubtitle}>
                Our AI is extracting transaction details
              </Text>
            </View>
          </View>
        )}

        {/* Step 3: Review */}
        {step === 'review' && (
          <View style={styles.reviewContainer}>
            {selectedImage && (
              <Image source={{ uri: selectedImage }} style={styles.reviewImage} />
            )}

            <Text style={styles.reviewTitle}>Review Extracted Transactions</Text>
            
            {extractedTransactions.map((transaction, index) => (
              <View key={index} style={styles.transactionCard}>
                <Text style={styles.transactionLabel}>Amount</Text>
                <TextInput
                  style={styles.input}
                  value={transaction.amount.toString()}
                  onChangeText={(text) => updateTransaction(index, 'amount', parseFloat(text) || 0)}
                  keyboardType="decimal-pad"
                />

                <Text style={styles.transactionLabel}>Category</Text>
                <TextInput
                  style={styles.input}
                  value={transaction.category}
                  onChangeText={(text) => updateTransaction(index, 'category', text)}
                />

                <Text style={styles.transactionLabel}>Date</Text>
                <TextInput
                  style={styles.input}
                  value={transaction.date}
                  onChangeText={(text) => updateTransaction(index, 'date', text)}
                />

                <Text style={styles.transactionLabel}>Description</Text>
                <TextInput
                  style={styles.input}
                  value={transaction.description || ''}
                  onChangeText={(text) => updateTransaction(index, 'description', text)}
                  placeholder="Optional description"
                  placeholderTextColor={Colors.light.textSecondary}
                />

                {currentEntry?.confidence_score && (
                  <View style={styles.confidenceBadge}>
                    <Text style={styles.confidenceText}>
                      Confidence: {(currentEntry.confidence_score * 100).toFixed(0)}%
                    </Text>
                  </View>
                )}
              </View>
            ))}

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.approveButton}
                onPress={handleApprove}
              >
                <Text style={styles.approveButtonText}>✓ Approve & Save</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setStep('select');
                  setSelectedImage(null);
                  setExtractedTransactions([]);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
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
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },

  // Header
  header: {
    marginBottom: Spacing.lg,
  },
  backButton: {
    marginBottom: Spacing.sm,
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

  // Select Step
  selectContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.xxl,
    backgroundColor: Colors.light.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  largeIcon: {
    fontSize: 64,
  },
  selectTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  selectDescription: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  buttonContainer: {
    width: '100%',
    gap: Spacing.sm,
  },
  primaryButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  primaryButtonText: {
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.base,
  },
  secondaryButton: {
    backgroundColor: Colors.light.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  secondaryButtonText: {
    color: Colors.light.text,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.base,
  },

  // Processing Step
  processingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  processingCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    width: '100%',
  },
  processingTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  processingSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },

  // Review Step
  reviewContainer: {
    paddingBottom: Spacing.xl,
  },
  reviewImage: {
    width: '100%',
    height: 150,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  reviewTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  transactionCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  transactionLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  input: {
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSize.base,
    color: Colors.light.text,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  confidenceBadge: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.light.secondaryLight,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
  },
  confidenceText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.text,
    fontWeight: Typography.fontWeight.semibold,
  },
  actionButtons: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  approveButton: {
    backgroundColor: Colors.light.success,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  approveButtonText: {
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.base,
  },
  cancelButton: {
    backgroundColor: Colors.light.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  cancelButtonText: {
    color: Colors.light.text,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.base,
  },
});

