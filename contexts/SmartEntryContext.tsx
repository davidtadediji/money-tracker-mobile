import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  processReceiptImage,
  processVoiceEntry,
  processBulkImport,
  processScreenshot,
  getUserSmartEntries,
  deleteSmartEntry,
  approveAndSaveTransactions,
  type ExtractedTransaction,
} from '@/services/smartEntryService';
import { SmartEntry } from '@/types/database';

interface SmartEntryContextType {
  // Data
  smartEntries: SmartEntry[];
  currentEntry: SmartEntry | null;

  // Loading states
  loading: boolean;
  processing: boolean;

  // Error state
  error: string | null;

  // Processing functions
  scanReceipt: (imageUri: string) => Promise<{ success: boolean; entry?: SmartEntry; error?: string }>;
  recordVoice: (audioUri: string) => Promise<{ success: boolean; entry?: SmartEntry; error?: string }>;
  importBulk: (csvData: string) => Promise<{ success: boolean; entry?: SmartEntry; error?: string }>;
  captureScreenshot: (imageUri: string) => Promise<{ success: boolean; entry?: SmartEntry; error?: string }>;

  // Entry management
  refreshEntries: () => Promise<void>;
  deleteEntry: (entryId: string) => Promise<{ success: boolean; error?: string }>;
  approveTransactions: (
    entryId: string,
    transactions: ExtractedTransaction[]
  ) => Promise<{ success: boolean; error?: string }>;

  // Set current entry for review
  setCurrentEntry: (entry: SmartEntry | null) => void;
}

const SmartEntryContext = createContext<SmartEntryContextType | undefined>(undefined);

export function SmartEntryProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [smartEntries, setSmartEntries] = useState<SmartEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<SmartEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get user ID
  const getUserId = useCallback(async (): Promise<string | null> => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Error getting session:', sessionError);
        return null;
      }

      return session?.user?.id || null;
    } catch (err) {
      console.error('Error in getUserId:', err);
      return null;
    }
  }, []);

  // Fetch smart entries
  const refreshEntries = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: serviceError } = await getUserSmartEntries(userId);

      if (serviceError) {
        setError(serviceError.message);
      } else {
        setSmartEntries(data || []);
      }
    } catch (err) {
      setError('Failed to fetch smart entries');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Scan receipt
  const scanReceipt = useCallback(
    async (imageUri: string): Promise<{ success: boolean; entry?: SmartEntry; error?: string }> => {
      if (!userId) {
        return { success: false, error: 'User not authenticated' };
      }

      setProcessing(true);
      setError(null);

      try {
        const { data, error: serviceError } = await processReceiptImage(imageUri, userId);

        if (serviceError) {
          setError(serviceError.message);
          return { success: false, error: serviceError.message };
        }

        if (data) {
          await refreshEntries();
          setCurrentEntry(data);
          return { success: true, entry: data };
        }

        return { success: false, error: 'Failed to process receipt' };
      } catch (err) {
        setError('An unexpected error occurred');
        return { success: false, error: 'An unexpected error occurred' };
      } finally {
        setProcessing(false);
      }
    },
    [userId, refreshEntries]
  );

  // Record voice
  const recordVoice = useCallback(
    async (audioUri: string): Promise<{ success: boolean; entry?: SmartEntry; error?: string }> => {
      if (!userId) {
        return { success: false, error: 'User not authenticated' };
      }

      setProcessing(true);
      setError(null);

      try {
        const { data, error: serviceError } = await processVoiceEntry(audioUri, userId);

        if (serviceError) {
          setError(serviceError.message);
          return { success: false, error: serviceError.message };
        }

        if (data) {
          await refreshEntries();
          setCurrentEntry(data);
          return { success: true, entry: data };
        }

        return { success: false, error: 'Failed to process voice entry' };
      } catch (err) {
        setError('An unexpected error occurred');
        return { success: false, error: 'An unexpected error occurred' };
      } finally {
        setProcessing(false);
      }
    },
    [userId, refreshEntries]
  );

  // Import bulk
  const importBulk = useCallback(
    async (csvData: string): Promise<{ success: boolean; entry?: SmartEntry; error?: string }> => {
      if (!userId) {
        return { success: false, error: 'User not authenticated' };
      }

      setProcessing(true);
      setError(null);

      try {
        const { data, error: serviceError } = await processBulkImport(csvData, userId);

        if (serviceError) {
          setError(serviceError.message);
          return { success: false, error: serviceError.message };
        }

        if (data) {
          await refreshEntries();
          setCurrentEntry(data);
          return { success: true, entry: data };
        }

        return { success: false, error: 'Failed to process bulk import' };
      } catch (err) {
        setError('An unexpected error occurred');
        return { success: false, error: 'An unexpected error occurred' };
      } finally {
        setProcessing(false);
      }
    },
    [userId, refreshEntries]
  );

  // Capture screenshot
  const captureScreenshot = useCallback(
    async (imageUri: string): Promise<{ success: boolean; entry?: SmartEntry; error?: string }> => {
      if (!userId) {
        return { success: false, error: 'User not authenticated' };
      }

      setProcessing(true);
      setError(null);

      try {
        const { data, error: serviceError } = await processScreenshot(imageUri, userId);

        if (serviceError) {
          setError(serviceError.message);
          return { success: false, error: serviceError.message };
        }

        if (data) {
          await refreshEntries();
          setCurrentEntry(data);
          return { success: true, entry: data };
        }

        return { success: false, error: 'Failed to process screenshot' };
      } catch (err) {
        setError('An unexpected error occurred');
        return { success: false, error: 'An unexpected error occurred' };
      } finally {
        setProcessing(false);
      }
    },
    [userId, refreshEntries]
  );

  // Delete entry
  const deleteEntry = useCallback(
    async (entryId: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const { data, error: serviceError } = await deleteSmartEntry(entryId);

        if (serviceError) {
          return { success: false, error: serviceError.message };
        }

        if (data) {
          await refreshEntries();
          return { success: true };
        }

        return { success: false, error: 'Failed to delete entry' };
      } catch (err) {
        return { success: false, error: 'An unexpected error occurred' };
      }
    },
    [refreshEntries]
  );

  // Approve transactions
  const approveTransactions = useCallback(
    async (
      entryId: string,
      transactions: ExtractedTransaction[]
    ): Promise<{ success: boolean; error?: string }> => {
      if (!userId) {
        return { success: false, error: 'User not authenticated' };
      }

      try {
        const { data, error: serviceError } = await approveAndSaveTransactions(
          entryId,
          transactions,
          userId
        );

        if (serviceError) {
          return { success: false, error: serviceError.message };
        }

        if (data) {
          await refreshEntries();
          setCurrentEntry(null);
          return { success: true };
        }

        return { success: false, error: 'Failed to approve transactions' };
      } catch (err) {
        return { success: false, error: 'An unexpected error occurred' };
      }
    },
    [userId, refreshEntries]
  );

  // Initialize user and fetch entries
  useEffect(() => {
    const initializeUser = async () => {
      const uid = await getUserId();
      setUserId(uid);
    };

    initializeUser();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const uid = session?.user?.id || null;
      setUserId(uid);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [getUserId]);

  // Fetch entries when userId changes
  useEffect(() => {
    if (userId) {
      refreshEntries();
    }
  }, [userId, refreshEntries]);

  const value = useMemo(
    () => ({
      smartEntries,
      currentEntry,
      loading,
      processing,
      error,
      scanReceipt,
      recordVoice,
      importBulk,
      captureScreenshot,
      refreshEntries,
      deleteEntry,
      approveTransactions,
      setCurrentEntry,
    }),
    [
      smartEntries,
      currentEntry,
      loading,
      processing,
      error,
      scanReceipt,
      recordVoice,
      importBulk,
      captureScreenshot,
      refreshEntries,
      deleteEntry,
      approveTransactions,
    ]
  );

  return <SmartEntryContext.Provider value={value}>{children}</SmartEntryContext.Provider>;
}

export function useSmartEntry() {
  const context = useContext(SmartEntryContext);
  if (context === undefined) {
    throw new Error('useSmartEntry must be used within a SmartEntryProvider');
  }
  return context;
}

