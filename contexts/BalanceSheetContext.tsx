/**
 * Balance Sheet Context
 * 
 * Provides global state management for assets, liabilities, and net worth calculations.
 * Automatically creates daily snapshots and handles CRUD operations.
 */

import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createAsset as createAssetService,
  createBalanceSnapshot,
  createLiability as createLiabilityService,
  deleteAsset as deleteAssetService,
  deleteLiability as deleteLiabilityService,
  getUserAssets,
  getUserLiabilities,
  updateAsset as updateAssetService,
  updateLiability as updateLiabilityService,
} from '@/services/balanceSheetService';
import { Asset, AssetInsert, AssetUpdate, Liability, LiabilityInsert, LiabilityUpdate, Transaction } from '@/types/database';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// ============================================================================
// Context Type Definition
// ============================================================================

interface BalanceSheetContextType {
  // State
  assets: Asset[];
  liabilities: Liability[];
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  loading: boolean;
  error: string | null;

  // Asset Operations
  createAsset: (assetData: Omit<AssetInsert, 'user_id'>) => Promise<{
    success: boolean;
    asset?: Asset;
    error?: string;
  }>;
  updateAsset: (assetId: string, updates: AssetUpdate) => Promise<{
    success: boolean;
    asset?: Asset;
    error?: string;
  }>;
  deleteAsset: (assetId: string) => Promise<{
    success: boolean;
    error?: string;
  }>;

  // Liability Operations
  createLiability: (liabilityData: Omit<LiabilityInsert, 'user_id'>) => Promise<{
    success: boolean;
    liability?: Liability;
    error?: string;
  }>;
  updateLiability: (liabilityId: string, updates: LiabilityUpdate) => Promise<{
    success: boolean;
    liability?: Liability;
    error?: string;
  }>;
  deleteLiability: (liabilityId: string) => Promise<{
    success: boolean;
    error?: string;
  }>;

  // Utility
  refresh: () => Promise<void>;
  createSnapshot: () => Promise<{ success: boolean; error?: string }>;

  // Settings
  autoUpdateEnabled: boolean;
  primaryAssetId: string | null;
  setAutoUpdateEnabled: (enabled: boolean) => Promise<void>;
  setPrimaryAssetId: (assetId: string | null) => Promise<void>;
}

// ============================================================================
// Context Creation
// ============================================================================

const BalanceSheetContext = createContext<BalanceSheetContextType | undefined>(undefined);

// ============================================================================
// Provider Component
// ============================================================================

export function BalanceSheetProvider({ children }: { children: React.ReactNode }) {
  // State
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Settings State
  const [autoUpdateEnabled, setAutoUpdateEnabledState] = useState<boolean>(false);
  const [primaryAssetId, setPrimaryAssetIdState] = useState<string | null>(null);

  // ============================================================================
  // Calculated Values (Memoized)
  // ============================================================================

  const totalAssets = useMemo(() => {
    return assets.reduce((sum, asset) => sum + asset.current_value, 0);
  }, [assets]);

  const totalLiabilities = useMemo(() => {
    return liabilities.reduce((sum, liability) => sum + liability.current_balance, 0);
  }, [liabilities]);

  const netWorth = useMemo(() => {
    return totalAssets - totalLiabilities;
  }, [totalAssets, totalLiabilities]);

  // ============================================================================
  // Get User ID from Supabase Auth
  // ============================================================================

  const getUserId = useCallback(async (): Promise<string | null> => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session?.user?.id || null;
    } catch (err) {
      console.error('Error getting user session:', err);
      return null;
    }
  }, []);

  // ============================================================================
  // Fetch Assets and Liabilities
  // ============================================================================

  const fetchBalanceSheet = useCallback(async (uid: string) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch assets and liabilities in parallel
      const [assetsResponse, liabilitiesResponse] = await Promise.all([
        getUserAssets(uid),
        getUserLiabilities(uid),
      ]);

      if (assetsResponse.error) {
        throw new Error(assetsResponse.error.message);
      }
      if (liabilitiesResponse.error) {
        throw new Error(liabilitiesResponse.error.message);
      }

      setAssets(assetsResponse.data || []);
      setLiabilities(liabilitiesResponse.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch balance sheet';
      console.error('Error fetching balance sheet:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // Refresh Function (Manual Reload)
  // ============================================================================

  const refresh = useCallback(async () => {
    const uid = userId || (await getUserId());
    if (uid) {
      await fetchBalanceSheet(uid);
    }
  }, [userId, getUserId, fetchBalanceSheet]);

  // ============================================================================
  // Auto-create Daily Snapshot
  // ============================================================================

  const createSnapshotInternal = useCallback(
    async (uid: string): Promise<void> => {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        // Check if snapshot already exists for today
        const { data: existingSnapshot } = await supabase
          .from('balance_snapshots')
          .select('id')
          .eq('user_id', uid)
          .eq('snapshot_date', today)
          .single();

        // Only create if doesn't exist
        if (!existingSnapshot) {
          const response = await createBalanceSnapshot(uid, today);
          if (response.error) {
            console.warn('Failed to create daily snapshot:', response.error.message);
          } else {
            console.log('Daily snapshot created successfully');
          }
        }
      } catch (err) {
        console.warn('Error creating daily snapshot:', err);
        // Don't throw - snapshot creation is non-critical
      }
    },
    []
  );

  // ============================================================================
  // Manual Snapshot Creation
  // ============================================================================

  const createSnapshot = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    const uid = userId || (await getUserId());
    if (!uid) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const response = await createBalanceSnapshot(uid);
      if (response.error) {
        return { success: false, error: response.error.message };
      }
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create snapshot';
      return { success: false, error: errorMessage };
    }
  }, [userId, getUserId]);

  // ============================================================================
  // Asset CRUD Operations
  // ============================================================================

  const createAsset = useCallback(
    async (assetData: Omit<AssetInsert, 'user_id'>): Promise<{
      success: boolean;
      asset?: Asset;
      error?: string;
    }> => {
      try {
        const uid = userId || (await getUserId());
        if (!uid) {
          return { success: false, error: 'User not authenticated. Please log in.' };
        }

        const response = await createAssetService({
          ...assetData,
          user_id: uid,
        });

        if (response.error) {
          return { success: false, error: response.error.message };
        }

        if (response.data) {
          setAssets((prev) => [response.data!, ...prev]);
          // Auto-create snapshot after adding asset
          await createSnapshotInternal(uid);
          return { success: true, asset: response.data };
        }

        return { success: false, error: 'Unknown error occurred' };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create asset';
        return { success: false, error: errorMessage };
      }
    },
    [userId, getUserId, createSnapshotInternal]
  );

  const updateAsset = useCallback(
    async (assetId: string, updates: AssetUpdate): Promise<{
      success: boolean;
      asset?: Asset;
      error?: string;
    }> => {
      try {
        const response = await updateAssetService(assetId, updates);

        if (response.error) {
          return { success: false, error: response.error.message };
        }

        if (response.data) {
          setAssets((prev) =>
            prev.map((asset) => (asset.id === assetId ? response.data! : asset))
          );
          
          // Auto-create snapshot after updating asset
          const uid = userId || (await getUserId());
          if (uid) {
            await createSnapshotInternal(uid);
          }

          return { success: true, asset: response.data };
        }

        return { success: false, error: 'Unknown error occurred' };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update asset';
        return { success: false, error: errorMessage };
      }
    },
    [userId, getUserId, createSnapshotInternal]
  );

  const deleteAsset = useCallback(
    async (assetId: string): Promise<{
      success: boolean;
      error?: string;
    }> => {
      try {
        const response = await deleteAssetService(assetId);

        if (response.error) {
          return { success: false, error: response.error.message };
        }

        setAssets((prev) => prev.filter((asset) => asset.id !== assetId));
        
        // Auto-create snapshot after deleting asset
        const uid = userId || (await getUserId());
        if (uid) {
          await createSnapshotInternal(uid);
        }

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete asset';
        return { success: false, error: errorMessage };
      }
    },
    [userId, getUserId, createSnapshotInternal]
  );

  // ============================================================================
  // Liability CRUD Operations
  // ============================================================================

  const createLiability = useCallback(
    async (liabilityData: Omit<LiabilityInsert, 'user_id'>): Promise<{
      success: boolean;
      liability?: Liability;
      error?: string;
    }> => {
      try {
        const uid = userId || (await getUserId());
        if (!uid) {
          return { success: false, error: 'User not authenticated. Please log in.' };
        }

        const response = await createLiabilityService({
          ...liabilityData,
          user_id: uid,
        });

        if (response.error) {
          return { success: false, error: response.error.message };
        }

        if (response.data) {
          setLiabilities((prev) => [response.data!, ...prev]);
          // Auto-create snapshot after adding liability
          await createSnapshotInternal(uid);
          return { success: true, liability: response.data };
        }

        return { success: false, error: 'Unknown error occurred' };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create liability';
        return { success: false, error: errorMessage };
      }
    },
    [userId, getUserId, createSnapshotInternal]
  );

  const updateLiability = useCallback(
    async (liabilityId: string, updates: LiabilityUpdate): Promise<{
      success: boolean;
      liability?: Liability;
      error?: string;
    }> => {
      try {
        const response = await updateLiabilityService(liabilityId, updates);

        if (response.error) {
          return { success: false, error: response.error.message };
        }

        if (response.data) {
          setLiabilities((prev) =>
            prev.map((liability) => (liability.id === liabilityId ? response.data! : liability))
          );
          
          // Auto-create snapshot after updating liability
          const uid = userId || (await getUserId());
          if (uid) {
            await createSnapshotInternal(uid);
          }

          return { success: true, liability: response.data };
        }

        return { success: false, error: 'Unknown error occurred' };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update liability';
        return { success: false, error: errorMessage };
      }
    },
    [userId, getUserId, createSnapshotInternal]
  );

  const deleteLiability = useCallback(
    async (liabilityId: string): Promise<{
      success: boolean;
      error?: string;
    }> => {
      try {
        const response = await deleteLiabilityService(liabilityId);

        if (response.error) {
          return { success: false, error: response.error.message };
        }

        setLiabilities((prev) => prev.filter((liability) => liability.id !== liabilityId));
        
        // Auto-create snapshot after deleting liability
        const uid = userId || (await getUserId());
        if (uid) {
          await createSnapshotInternal(uid);
        }

        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete liability';
        return { success: false, error: errorMessage };
      }
    },
    [userId, getUserId, createSnapshotInternal]
  );

  // ============================================================================
  // Effects
  // ============================================================================

  // Listen for auth state changes
  useEffect(() => {
    const initializeUser = async () => {
      const uid = await getUserId();
      setUserId(uid);
      if (uid) {
        await fetchBalanceSheet(uid);
        // Auto-create daily snapshot on mount
        await createSnapshotInternal(uid);
      } else {
        setLoading(false);
      }
    };

    initializeUser();

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: string, session) => {
      const uid = session?.user?.id || null;
      setUserId(uid);

      if (uid) {
        await fetchBalanceSheet(uid);
        await createSnapshotInternal(uid);
      } else {
        // User logged out, clear data
        setAssets([]);
        setLiabilities([]);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [getUserId, fetchBalanceSheet, createSnapshotInternal]);

  // ============================================================================
  // Settings Management
  // ============================================================================

  // Load settings from AsyncStorage
  const loadSettings = useCallback(async () => {
    try {
      const [autoUpdateStr, primaryAssetIdStr] = await Promise.all([
        AsyncStorage.getItem('balanceSheet_autoUpdate'),
        AsyncStorage.getItem('balanceSheet_primaryAssetId'),
      ]);

      setAutoUpdateEnabledState(autoUpdateStr === 'true');
      setPrimaryAssetIdState(primaryAssetIdStr);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, []);

  // Set auto-update enabled
  const setAutoUpdateEnabled = useCallback(async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem('balanceSheet_autoUpdate', enabled.toString());
      setAutoUpdateEnabledState(enabled);
    } catch (error) {
      console.error('Error saving auto-update setting:', error);
    }
  }, []);

  // Set primary asset ID
  const setPrimaryAssetId = useCallback(async (assetId: string | null) => {
    try {
      if (assetId) {
        await AsyncStorage.setItem('balanceSheet_primaryAssetId', assetId);
      } else {
        await AsyncStorage.removeItem('balanceSheet_primaryAssetId');
      }
      setPrimaryAssetIdState(assetId);
    } catch (error) {
      console.error('Error saving primary asset ID:', error);
    }
  }, []);

  // ============================================================================
  // Auto-Update from Transactions
  // ============================================================================

  const handleTransactionUpdate = useCallback(async (transaction: Transaction) => {
    if (!autoUpdateEnabled || !userId) return;

    try {
      // Determine which asset to update
      let targetAssetId = primaryAssetId;

      // If no primary asset is set, try to find or create a "Cash" asset
      if (!targetAssetId) {
        const cashAsset = assets.find(
          (a) => a.name.toLowerCase() === 'cash' || a.type === 'cash'
        );
        
        if (cashAsset) {
          targetAssetId = cashAsset.id;
        } else {
          // Create default cash asset
          const result = await createAssetService(
            {
              name: 'Cash',
              type: 'cash',
              current_value: 0,
              currency: 'USD',
            },
            userId
          );
          
          if (result.data) {
            targetAssetId = result.data.id;
            // Refresh to get the new asset
            await fetchBalanceSheet(userId);
          }
        }
      }

      if (!targetAssetId) return;

      // Find the target asset
      const targetAsset = assets.find((a) => a.id === targetAssetId);
      if (!targetAsset) return;

      // Calculate new value based on transaction type
      let newValue = targetAsset.current_value;
      
      if (transaction.type === 'income') {
        // Add income to asset
        newValue += transaction.amount;
      } else if (transaction.type === 'expense') {
        // Deduct expense from asset
        newValue -= transaction.amount;
      }

      // Update the asset
      await updateAssetService(targetAssetId, {
        current_value: newValue,
      });

      // Refresh balance sheet to show updated values
      await fetchBalanceSheet(userId);

      console.log(`Auto-updated asset ${targetAsset.name}: ${transaction.type} $${transaction.amount}`);
    } catch (error) {
      console.error('Error auto-updating balance from transaction:', error);
    }
  }, [autoUpdateEnabled, primaryAssetId, userId, assets, fetchBalanceSheet]);

  // ============================================================================
  // Load Settings on Mount
  // ============================================================================

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // ============================================================================
  // Transaction Listener
  // ============================================================================

  useEffect(() => {
    if (!userId || !autoUpdateEnabled) return;

    // Subscribe to new transactions
    const subscription = supabase
      .channel('balance-sheet-transactions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('New transaction detected:', payload);
          handleTransactionUpdate(payload.new as Transaction);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, autoUpdateEnabled, handleTransactionUpdate]);

  // ============================================================================
  // Context Value
  // ============================================================================

  const value: BalanceSheetContextType = {
    // State
    assets,
    liabilities,
    totalAssets,
    totalLiabilities,
    netWorth,
    loading,
    error,

    // Asset Operations
    createAsset,
    updateAsset,
    deleteAsset,

    // Liability Operations
    createLiability,
    updateLiability,
    deleteLiability,

    // Utility
    refresh,
    createSnapshot,

    // Settings
    autoUpdateEnabled,
    primaryAssetId,
    setAutoUpdateEnabled,
    setPrimaryAssetId,
  };

  return <BalanceSheetContext.Provider value={value}>{children}</BalanceSheetContext.Provider>;
}

// ============================================================================
// Custom Hook
// ============================================================================

export function useBalanceSheet() {
  const context = useContext(BalanceSheetContext);
  if (context === undefined) {
    throw new Error('useBalanceSheet must be used within a BalanceSheetProvider');
  }
  return context;
}

