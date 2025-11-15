import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  getUserSettings as getUserSettingsService,
  updateAccountSettings as updateAccountSettingsService,
  updateNotificationSettings as updateNotificationSettingsService,
  updateCurrencySettings as updateCurrencySettingsService,
  updateThemeSettings as updateThemeSettingsService,
  updateBackupSettings as updateBackupSettingsService,
  updateAppPreferences as updateAppPreferencesService,
  updateSecuritySettings as updateSecuritySettingsService,
  resetToDefaults as resetToDefaultsService,
  updateLastBackupDate as updateLastBackupDateService,
} from '@/services/settingsService';
import { UserSettings, UserSettingsUpdate } from '@/types/database';

/**
 * Settings Context
 * Manages user settings and preferences across the app
 */

interface SettingsContextType {
  settings: UserSettings | null;
  loading: boolean;
  error: string | null;
  updateAccountSettings: (displayName?: string, emailNotifications?: boolean) => Promise<{ success: boolean; error?: string }>;
  updateNotificationSettings: (settings: {
    pushNotifications?: boolean;
    transactionReminders?: boolean;
    budgetAlerts?: boolean;
    recurringReminders?: boolean;
    reminderTime?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  updateCurrencySettings: (currencyCode: string, currencySymbol: string, decimalPlaces?: number) => Promise<{ success: boolean; error?: string }>;
  updateThemeSettings: (theme: 'light' | 'dark' | 'auto', accentColor?: string) => Promise<{ success: boolean; error?: string }>;
  updateBackupSettings: (autoBackup: boolean, backupFrequency?: 'daily' | 'weekly' | 'monthly') => Promise<{ success: boolean; error?: string }>;
  updateAppPreferences: (settings: {
    defaultView?: 'dashboard' | 'transactions' | 'budget' | 'analytics' | 'balance' | 'settings';
    defaultTransactionType?: 'income' | 'expense';
    showBalance?: boolean;
    compactView?: boolean;
  }) => Promise<{ success: boolean; error?: string }>;
  updateSecuritySettings: (biometricEnabled?: boolean, passcodeEnabled?: boolean) => Promise<{ success: boolean; error?: string }>;
  updateLastBackupDate: () => Promise<{ success: boolean; error?: string }>;
  resetToDefaults: () => Promise<{ success: boolean; error?: string }>;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Get user ID from auth session
  const getUserId = useCallback(async (): Promise<string | null> => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        return null;
      }
      
      return session?.user?.id || null;
    } catch (error) {
      console.error('Error in getUserId:', error);
      return null;
    }
  }, []);

  // Fetch user settings
  const fetchSettings = useCallback(async (uid: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await getUserSettingsService(uid);
      
      if (fetchError) {
        setError(fetchError.message);
        setSettings(null);
      } else {
        setSettings(data);
      }
    } catch (err) {
      setError('Failed to fetch settings');
      console.error(err);
      setSettings(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize: Get user ID and fetch settings
  useEffect(() => {
    let isMounted = true;

    const initializeSettings = async () => {
      const uid = await getUserId();
      
      if (isMounted && uid) {
        setUserId(uid);
        await fetchSettings(uid);
      } else {
        if (isMounted) {
          setLoading(false);
          setError('User not authenticated');
        }
      }
    };

    initializeSettings();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isMounted) {
        const newUserId = session?.user?.id || null;
        setUserId(newUserId);

        if (newUserId) {
          await fetchSettings(newUserId);
        } else {
          setSettings(null);
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [getUserId, fetchSettings]);

  // Refresh settings
  const refreshSettings = useCallback(async () => {
    const uid = userId || await getUserId();
    if (uid) {
      await fetchSettings(uid);
    }
  }, [userId, getUserId, fetchSettings]);

  // Update account settings
  const updateAccountSettings = useCallback(async (displayName?: string, emailNotifications?: boolean) => {
    try {
      const uid = userId || await getUserId();
      if (!uid) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error: updateError } = await updateAccountSettingsService(uid, displayName, emailNotifications);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      if (data) {
        setSettings(data);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update account settings' };
    }
  }, [userId, getUserId]);

  // Update notification settings
  const updateNotificationSettings = useCallback(async (notificationSettings: {
    pushNotifications?: boolean;
    transactionReminders?: boolean;
    budgetAlerts?: boolean;
    recurringReminders?: boolean;
    reminderTime?: string;
  }) => {
    try {
      const uid = userId || await getUserId();
      if (!uid) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error: updateError } = await updateNotificationSettingsService(uid, notificationSettings);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      if (data) {
        setSettings(data);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update notification settings' };
    }
  }, [userId, getUserId]);

  // Update currency settings
  const updateCurrencySettings = useCallback(async (currencyCode: string, currencySymbol: string, decimalPlaces?: number) => {
    try {
      const uid = userId || await getUserId();
      if (!uid) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error: updateError } = await updateCurrencySettingsService(uid, currencyCode, currencySymbol, decimalPlaces);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      if (data) {
        setSettings(data);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update currency settings' };
    }
  }, [userId, getUserId]);

  // Update theme settings
  const updateThemeSettings = useCallback(async (theme: 'light' | 'dark' | 'auto', accentColor?: string) => {
    try {
      const uid = userId || await getUserId();
      if (!uid) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error: updateError } = await updateThemeSettingsService(uid, theme, accentColor);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      if (data) {
        setSettings(data);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update theme settings' };
    }
  }, [userId, getUserId]);

  // Update backup settings
  const updateBackupSettings = useCallback(async (autoBackup: boolean, backupFrequency?: 'daily' | 'weekly' | 'monthly') => {
    try {
      const uid = userId || await getUserId();
      if (!uid) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error: updateError} = await updateBackupSettingsService(uid, autoBackup, backupFrequency);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      if (data) {
        setSettings(data);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update backup settings' };
    }
  }, [userId, getUserId]);

  // Update app preferences
  const updateAppPreferences = useCallback(async (appSettings: {
    defaultView?: 'dashboard' | 'transactions' | 'budget' | 'analytics' | 'balance' | 'settings';
    defaultTransactionType?: 'income' | 'expense';
    showBalance?: boolean;
    compactView?: boolean;
  }) => {
    try {
      const uid = userId || await getUserId();
      if (!uid) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error: updateError } = await updateAppPreferencesService(uid, appSettings);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      if (data) {
        setSettings(data);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update app preferences' };
    }
  }, [userId, getUserId]);

  // Update security settings
  const updateSecuritySettings = useCallback(async (biometricEnabled?: boolean, passcodeEnabled?: boolean) => {
    try {
      const uid = userId || await getUserId();
      if (!uid) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error: updateError } = await updateSecuritySettingsService(uid, biometricEnabled, passcodeEnabled);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      if (data) {
        setSettings(data);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update security settings' };
    }
  }, [userId, getUserId]);

  // Update last backup date
  const updateLastBackupDate = useCallback(async () => {
    try {
      const uid = userId || await getUserId();
      if (!uid) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error: updateError } = await updateLastBackupDateService(uid);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      if (data) {
        setSettings(data);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update last backup date' };
    }
  }, [userId, getUserId]);

  // Reset to defaults
  const resetToDefaults = useCallback(async () => {
    try {
      const uid = userId || await getUserId();
      if (!uid) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error: resetError } = await resetToDefaultsService(uid);

      if (resetError) {
        return { success: false, error: resetError.message };
      }

      if (data) {
        setSettings(data);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to reset settings' };
    }
  }, [userId, getUserId]);

  const value = useMemo(() => ({
    settings,
    loading,
    error,
    updateAccountSettings,
    updateNotificationSettings,
    updateCurrencySettings,
    updateThemeSettings,
    updateBackupSettings,
    updateAppPreferences,
    updateSecuritySettings,
    updateLastBackupDate,
    resetToDefaults,
    refreshSettings,
  }), [
    settings,
    loading,
    error,
    updateAccountSettings,
    updateNotificationSettings,
    updateCurrencySettings,
    updateThemeSettings,
    updateBackupSettings,
    updateAppPreferences,
    updateSecuritySettings,
    updateLastBackupDate,
    resetToDefaults,
    refreshSettings,
  ]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

