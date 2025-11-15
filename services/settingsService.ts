import { supabase } from '@/lib/supabase';
import { UserSettings, UserSettingsInsert, UserSettingsUpdate } from '@/types/database';

/**
 * Settings Service Layer
 * Handles all user settings operations with Supabase
 */

// Custom error class
export class SettingsServiceError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'SettingsServiceError';
  }
}

// Service response type
export interface ServiceResponse<T> {
  data: T | null;
  error: SettingsServiceError | null;
}

/**
 * Get user settings for a specific user
 * Creates default settings if none exist
 */
export async function getUserSettings(userId: string): Promise<ServiceResponse<UserSettings>> {
  try {
    if (!userId) {
      throw new SettingsServiceError('User ID is required', 'INVALID_USER_ID');
    }

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If no settings exist, create default settings
      if (error.code === 'PGRST116') {
        return await createDefaultSettings(userId);
      }
      throw new SettingsServiceError(
        `Failed to fetch user settings: ${error.message}`,
        error.code,
        error
      );
    }

    return { data, error: null };
  } catch (error) {
    if (error instanceof SettingsServiceError) {
      return { data: null, error };
    }
    
    return {
      data: null,
      error: new SettingsServiceError(
        'An unexpected error occurred while fetching settings',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

/**
 * Create default settings for a user
 */
export async function createDefaultSettings(userId: string): Promise<ServiceResponse<UserSettings>> {
  try {
    if (!userId) {
      throw new SettingsServiceError('User ID is required', 'INVALID_USER_ID');
    }

    const defaultSettings: UserSettingsInsert = {
      user_id: userId,
      // All other fields will use database defaults
    };

    const { data, error } = await supabase
      .from('user_settings')
      .insert(defaultSettings)
      .select()
      .single();

    if (error) {
      throw new SettingsServiceError(
        `Failed to create default settings: ${error.message}`,
        error.code,
        error
      );
    }

    return { data, error: null };
  } catch (error) {
    if (error instanceof SettingsServiceError) {
      return { data: null, error };
    }
    
    return {
      data: null,
      error: new SettingsServiceError(
        'An unexpected error occurred while creating default settings',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

/**
 * Update user settings
 */
export async function updateUserSettings(
  userId: string,
  updates: UserSettingsUpdate
): Promise<ServiceResponse<UserSettings>> {
  try {
    if (!userId) {
      throw new SettingsServiceError('User ID is required', 'INVALID_USER_ID');
    }

    // Remove user_id from updates to prevent modification
    const { user_id, ...safeUpdates } = updates;

    const { data, error } = await supabase
      .from('user_settings')
      .update(safeUpdates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new SettingsServiceError(
        `Failed to update settings: ${error.message}`,
        error.code,
        error
      );
    }

    if (!data) {
      throw new SettingsServiceError('Settings not found or access denied', 'NOT_FOUND');
    }

    return { data, error: null };
  } catch (error) {
    if (error instanceof SettingsServiceError) {
      return { data: null, error };
    }
    
    return {
      data: null,
      error: new SettingsServiceError(
        'An unexpected error occurred while updating settings',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

/**
 * Update account settings (display name, email notifications)
 */
export async function updateAccountSettings(
  userId: string,
  displayName?: string,
  emailNotifications?: boolean
): Promise<ServiceResponse<UserSettings>> {
  const updates: UserSettingsUpdate = {};
  if (displayName !== undefined) updates.display_name = displayName;
  if (emailNotifications !== undefined) updates.email_notifications = emailNotifications;
  
  return updateUserSettings(userId, updates);
}

/**
 * Update notification preferences
 */
export async function updateNotificationSettings(
  userId: string,
  settings: {
    pushNotifications?: boolean;
    transactionReminders?: boolean;
    budgetAlerts?: boolean;
    recurringReminders?: boolean;
    reminderTime?: string;
  }
): Promise<ServiceResponse<UserSettings>> {
  const updates: UserSettingsUpdate = {};
  if (settings.pushNotifications !== undefined) updates.push_notifications = settings.pushNotifications;
  if (settings.transactionReminders !== undefined) updates.transaction_reminders = settings.transactionReminders;
  if (settings.budgetAlerts !== undefined) updates.budget_alerts = settings.budgetAlerts;
  if (settings.recurringReminders !== undefined) updates.recurring_reminders = settings.recurringReminders;
  if (settings.reminderTime !== undefined) updates.reminder_time = settings.reminderTime;
  
  return updateUserSettings(userId, updates);
}

/**
 * Update currency settings
 */
export async function updateCurrencySettings(
  userId: string,
  currencyCode: string,
  currencySymbol: string,
  decimalPlaces?: number
): Promise<ServiceResponse<UserSettings>> {
  const updates: UserSettingsUpdate = {
    currency_code: currencyCode,
    currency_symbol: currencySymbol,
  };
  if (decimalPlaces !== undefined) updates.decimal_places = decimalPlaces;
  
  return updateUserSettings(userId, updates);
}

/**
 * Update theme settings
 */
export async function updateThemeSettings(
  userId: string,
  theme: 'light' | 'dark' | 'auto',
  accentColor?: string
): Promise<ServiceResponse<UserSettings>> {
  const updates: UserSettingsUpdate = { theme };
  if (accentColor !== undefined) updates.accent_color = accentColor;
  
  return updateUserSettings(userId, updates);
}

/**
 * Update backup settings
 */
export async function updateBackupSettings(
  userId: string,
  autoBackup: boolean,
  backupFrequency?: 'daily' | 'weekly' | 'monthly'
): Promise<ServiceResponse<UserSettings>> {
  const updates: UserSettingsUpdate = { auto_backup: autoBackup };
  if (backupFrequency !== undefined) updates.backup_frequency = backupFrequency;
  
  return updateUserSettings(userId, updates);
}

/**
 * Update last backup date
 */
export async function updateLastBackupDate(userId: string): Promise<ServiceResponse<UserSettings>> {
  return updateUserSettings(userId, {
    last_backup_date: new Date().toISOString(),
  });
}

/**
 * Update app preferences
 */
export async function updateAppPreferences(
  userId: string,
  settings: {
    defaultView?: 'dashboard' | 'transactions' | 'budget' | 'analytics' | 'balance' | 'settings';
    defaultTransactionType?: 'income' | 'expense';
    showBalance?: boolean;
    compactView?: boolean;
  }
): Promise<ServiceResponse<UserSettings>> {
  const updates: UserSettingsUpdate = {};
  if (settings.defaultView !== undefined) updates.default_view = settings.defaultView;
  if (settings.defaultTransactionType !== undefined) updates.default_transaction_type = settings.defaultTransactionType;
  if (settings.showBalance !== undefined) updates.show_balance = settings.showBalance;
  if (settings.compactView !== undefined) updates.compact_view = settings.compactView;
  
  return updateUserSettings(userId, updates);
}

/**
 * Update security settings
 */
export async function updateSecuritySettings(
  userId: string,
  biometricEnabled?: boolean,
  passcodeEnabled?: boolean
): Promise<ServiceResponse<UserSettings>> {
  const updates: UserSettingsUpdate = {};
  if (biometricEnabled !== undefined) updates.biometric_enabled = biometricEnabled;
  if (passcodeEnabled !== undefined) updates.passcode_enabled = passcodeEnabled;
  
  return updateUserSettings(userId, updates);
}

/**
 * Reset settings to defaults
 */
export async function resetToDefaults(userId: string): Promise<ServiceResponse<UserSettings>> {
  try {
    if (!userId) {
      throw new SettingsServiceError('User ID is required', 'INVALID_USER_ID');
    }

    // Delete existing settings
    await supabase
      .from('user_settings')
      .delete()
      .eq('user_id', userId);

    // Create new default settings
    return await createDefaultSettings(userId);
  } catch (error) {
    if (error instanceof SettingsServiceError) {
      return { data: null, error };
    }
    
    return {
      data: null,
      error: new SettingsServiceError(
        'An unexpected error occurred while resetting settings',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

/**
 * Helper: Get currency list (common currencies)
 */
export const COMMON_CURRENCIES = [
  { code: 'KES', symbol: 'KES', name: 'Kenyan Shilling' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling' },
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
];

/**
 * Helper: Get accent colors
 */
export const ACCENT_COLORS = [
  { name: 'Pink', value: '#F5569B' },
  { name: 'Blue', value: '#1355B2' },
  { name: 'Purple', value: '#9333EA' },
  { name: 'Green', value: '#10B981' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Indigo', value: '#6366F1' },
];

