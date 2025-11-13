/**
 * Balance Sheet Service
 * 
 * Handles all CRUD operations for assets, liabilities, and balance snapshots
 * with proper error handling and validation.
 */

import { supabase } from '@/lib/supabase';
import {
  Asset,
  AssetInsert,
  AssetUpdate,
  Liability,
  LiabilityInsert,
  LiabilityUpdate,
  BalanceSnapshot,
  BalanceSnapshotInsert,
} from '@/types/database';

// ============================================================================
// Custom Error Class
// ============================================================================

export class BalanceSheetServiceError extends Error {
  code: string;
  details?: unknown;

  constructor(message: string, code: string, details?: unknown) {
    super(message);
    this.name = 'BalanceSheetServiceError';
    this.code = code;
    this.details = details;
  }
}

// ============================================================================
// Service Response Type
// ============================================================================

export interface ServiceResponse<T> {
  data: T | null;
  error: BalanceSheetServiceError | null;
}

// ============================================================================
// ASSET OPERATIONS
// ============================================================================

/**
 * Create a new asset
 */
export async function createAsset(
  assetData: AssetInsert
): Promise<ServiceResponse<Asset>> {
  try {
    // Validation
    if (!assetData.user_id) {
      throw new BalanceSheetServiceError('User ID is required', 'INVALID_USER_ID');
    }
    if (!assetData.name || assetData.name.trim().length === 0) {
      throw new BalanceSheetServiceError('Asset name is required', 'INVALID_NAME');
    }
    if (assetData.current_value < 0) {
      throw new BalanceSheetServiceError('Asset value must be positive', 'INVALID_VALUE');
    }
    if (!['cash', 'bank', 'investment', 'property', 'other'].includes(assetData.type)) {
      throw new BalanceSheetServiceError('Invalid asset type', 'INVALID_TYPE');
    }

    const { data, error } = await supabase
      .from('assets')
      .insert(assetData)
      .select()
      .single();

    if (error) {
      throw new BalanceSheetServiceError(
        `Failed to create asset: ${error.message}`,
        error.code || 'CREATE_FAILED',
        error
      );
    }

    return { data, error: null };
  } catch (error) {
    if (error instanceof BalanceSheetServiceError) {
      return { data: null, error };
    }
    return {
      data: null,
      error: new BalanceSheetServiceError(
        'An unexpected error occurred while creating asset',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

/**
 * Get all assets for a user
 */
export async function getUserAssets(
  userId: string
): Promise<ServiceResponse<Asset[]>> {
  try {
    if (!userId) {
      throw new BalanceSheetServiceError('User ID is required', 'INVALID_USER_ID');
    }

    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new BalanceSheetServiceError(
        `Failed to fetch assets: ${error.message}`,
        error.code || 'FETCH_FAILED',
        error
      );
    }

    return { data: data || [], error: null };
  } catch (error) {
    if (error instanceof BalanceSheetServiceError) {
      return { data: null, error };
    }
    return {
      data: null,
      error: new BalanceSheetServiceError(
        'An unexpected error occurred while fetching assets',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

/**
 * Get a single asset by ID
 */
export async function getAssetById(
  assetId: string
): Promise<ServiceResponse<Asset>> {
  try {
    if (!assetId) {
      throw new BalanceSheetServiceError('Asset ID is required', 'INVALID_ASSET_ID');
    }

    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('id', assetId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new BalanceSheetServiceError('Asset not found', 'NOT_FOUND', error);
      }
      throw new BalanceSheetServiceError(
        `Failed to fetch asset: ${error.message}`,
        error.code,
        error
      );
    }

    return { data, error: null };
  } catch (error) {
    if (error instanceof BalanceSheetServiceError) {
      return { data: null, error };
    }
    return {
      data: null,
      error: new BalanceSheetServiceError(
        'An unexpected error occurred while fetching asset',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

/**
 * Update an asset
 */
export async function updateAsset(
  assetId: string,
  updates: AssetUpdate
): Promise<ServiceResponse<Asset>> {
  try {
    if (!assetId) {
      throw new BalanceSheetServiceError('Asset ID is required', 'INVALID_ASSET_ID');
    }

    // Validation
    if (updates.name !== undefined && updates.name.trim().length === 0) {
      throw new BalanceSheetServiceError('Asset name cannot be empty', 'INVALID_NAME');
    }
    if (updates.current_value !== undefined && updates.current_value < 0) {
      throw new BalanceSheetServiceError('Asset value must be positive', 'INVALID_VALUE');
    }

    const { data, error } = await supabase
      .from('assets')
      .update(updates)
      .eq('id', assetId)
      .select()
      .single();

    if (error) {
      throw new BalanceSheetServiceError(
        `Failed to update asset: ${error.message}`,
        error.code || 'UPDATE_FAILED',
        error
      );
    }

    return { data, error: null };
  } catch (error) {
    if (error instanceof BalanceSheetServiceError) {
      return { data: null, error };
    }
    return {
      data: null,
      error: new BalanceSheetServiceError(
        'An unexpected error occurred while updating asset',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

/**
 * Delete an asset
 */
export async function deleteAsset(
  assetId: string
): Promise<ServiceResponse<boolean>> {
  try {
    if (!assetId) {
      throw new BalanceSheetServiceError('Asset ID is required', 'INVALID_ASSET_ID');
    }

    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', assetId);

    if (error) {
      throw new BalanceSheetServiceError(
        `Failed to delete asset: ${error.message}`,
        error.code || 'DELETE_FAILED',
        error
      );
    }

    return { data: true, error: null };
  } catch (error) {
    if (error instanceof BalanceSheetServiceError) {
      return { data: null, error };
    }
    return {
      data: null,
      error: new BalanceSheetServiceError(
        'An unexpected error occurred while deleting asset',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

// ============================================================================
// LIABILITY OPERATIONS
// ============================================================================

/**
 * Create a new liability
 */
export async function createLiability(
  liabilityData: LiabilityInsert
): Promise<ServiceResponse<Liability>> {
  try {
    // Validation
    if (!liabilityData.user_id) {
      throw new BalanceSheetServiceError('User ID is required', 'INVALID_USER_ID');
    }
    if (!liabilityData.name || liabilityData.name.trim().length === 0) {
      throw new BalanceSheetServiceError('Liability name is required', 'INVALID_NAME');
    }
    if (liabilityData.current_balance < 0) {
      throw new BalanceSheetServiceError('Liability balance must be positive', 'INVALID_BALANCE');
    }
    if (!['credit_card', 'loan', 'mortgage', 'other'].includes(liabilityData.type)) {
      throw new BalanceSheetServiceError('Invalid liability type', 'INVALID_TYPE');
    }
    if (liabilityData.interest_rate !== undefined && liabilityData.interest_rate !== null) {
      if (liabilityData.interest_rate < 0 || liabilityData.interest_rate > 100) {
        throw new BalanceSheetServiceError('Interest rate must be between 0 and 100', 'INVALID_INTEREST_RATE');
      }
    }

    const { data, error } = await supabase
      .from('liabilities')
      .insert(liabilityData)
      .select()
      .single();

    if (error) {
      throw new BalanceSheetServiceError(
        `Failed to create liability: ${error.message}`,
        error.code || 'CREATE_FAILED',
        error
      );
    }

    return { data, error: null };
  } catch (error) {
    if (error instanceof BalanceSheetServiceError) {
      return { data: null, error };
    }
    return {
      data: null,
      error: new BalanceSheetServiceError(
        'An unexpected error occurred while creating liability',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

/**
 * Get all liabilities for a user
 */
export async function getUserLiabilities(
  userId: string
): Promise<ServiceResponse<Liability[]>> {
  try {
    if (!userId) {
      throw new BalanceSheetServiceError('User ID is required', 'INVALID_USER_ID');
    }

    const { data, error } = await supabase
      .from('liabilities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new BalanceSheetServiceError(
        `Failed to fetch liabilities: ${error.message}`,
        error.code || 'FETCH_FAILED',
        error
      );
    }

    return { data: data || [], error: null };
  } catch (error) {
    if (error instanceof BalanceSheetServiceError) {
      return { data: null, error };
    }
    return {
      data: null,
      error: new BalanceSheetServiceError(
        'An unexpected error occurred while fetching liabilities',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

/**
 * Get a single liability by ID
 */
export async function getLiabilityById(
  liabilityId: string
): Promise<ServiceResponse<Liability>> {
  try {
    if (!liabilityId) {
      throw new BalanceSheetServiceError('Liability ID is required', 'INVALID_LIABILITY_ID');
    }

    const { data, error } = await supabase
      .from('liabilities')
      .select('*')
      .eq('id', liabilityId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new BalanceSheetServiceError('Liability not found', 'NOT_FOUND', error);
      }
      throw new BalanceSheetServiceError(
        `Failed to fetch liability: ${error.message}`,
        error.code,
        error
      );
    }

    return { data, error: null };
  } catch (error) {
    if (error instanceof BalanceSheetServiceError) {
      return { data: null, error };
    }
    return {
      data: null,
      error: new BalanceSheetServiceError(
        'An unexpected error occurred while fetching liability',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

/**
 * Update a liability
 */
export async function updateLiability(
  liabilityId: string,
  updates: LiabilityUpdate
): Promise<ServiceResponse<Liability>> {
  try {
    if (!liabilityId) {
      throw new BalanceSheetServiceError('Liability ID is required', 'INVALID_LIABILITY_ID');
    }

    // Validation
    if (updates.name !== undefined && updates.name.trim().length === 0) {
      throw new BalanceSheetServiceError('Liability name cannot be empty', 'INVALID_NAME');
    }
    if (updates.current_balance !== undefined && updates.current_balance < 0) {
      throw new BalanceSheetServiceError('Liability balance must be positive', 'INVALID_BALANCE');
    }
    if (updates.interest_rate !== undefined && updates.interest_rate !== null) {
      if (updates.interest_rate < 0 || updates.interest_rate > 100) {
        throw new BalanceSheetServiceError('Interest rate must be between 0 and 100', 'INVALID_INTEREST_RATE');
      }
    }

    const { data, error } = await supabase
      .from('liabilities')
      .update(updates)
      .eq('id', liabilityId)
      .select()
      .single();

    if (error) {
      throw new BalanceSheetServiceError(
        `Failed to update liability: ${error.message}`,
        error.code || 'UPDATE_FAILED',
        error
      );
    }

    return { data, error: null };
  } catch (error) {
    if (error instanceof BalanceSheetServiceError) {
      return { data: null, error };
    }
    return {
      data: null,
      error: new BalanceSheetServiceError(
        'An unexpected error occurred while updating liability',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

/**
 * Delete a liability
 */
export async function deleteLiability(
  liabilityId: string
): Promise<ServiceResponse<boolean>> {
  try {
    if (!liabilityId) {
      throw new BalanceSheetServiceError('Liability ID is required', 'INVALID_LIABILITY_ID');
    }

    const { error } = await supabase
      .from('liabilities')
      .delete()
      .eq('id', liabilityId);

    if (error) {
      throw new BalanceSheetServiceError(
        `Failed to delete liability: ${error.message}`,
        error.code || 'DELETE_FAILED',
        error
      );
    }

    return { data: true, error: null };
  } catch (error) {
    if (error instanceof BalanceSheetServiceError) {
      return { data: null, error };
    }
    return {
      data: null,
      error: new BalanceSheetServiceError(
        'An unexpected error occurred while deleting liability',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

// ============================================================================
// BALANCE SNAPSHOT OPERATIONS
// ============================================================================

/**
 * Create a balance snapshot using the Supabase helper function
 */
export async function createBalanceSnapshot(
  userId: string,
  snapshotDate?: string
): Promise<ServiceResponse<string>> {
  try {
    if (!userId) {
      throw new BalanceSheetServiceError('User ID is required', 'INVALID_USER_ID');
    }

    const date = snapshotDate || new Date().toISOString().split('T')[0];

    const { data, error } = await supabase.rpc('create_balance_snapshot', {
      p_user_id: userId,
      p_snapshot_date: date,
    });

    if (error) {
      throw new BalanceSheetServiceError(
        `Failed to create snapshot: ${error.message}`,
        error.code || 'SNAPSHOT_FAILED',
        error
      );
    }

    return { data, error: null };
  } catch (error) {
    if (error instanceof BalanceSheetServiceError) {
      return { data: null, error };
    }
    return {
      data: null,
      error: new BalanceSheetServiceError(
        'An unexpected error occurred while creating snapshot',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

/**
 * Get balance snapshots for a user
 */
export async function getUserSnapshots(
  userId: string,
  limit?: number
): Promise<ServiceResponse<BalanceSnapshot[]>> {
  try {
    if (!userId) {
      throw new BalanceSheetServiceError('User ID is required', 'INVALID_USER_ID');
    }

    let query = supabase
      .from('balance_snapshots')
      .select('*')
      .eq('user_id', userId)
      .order('snapshot_date', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new BalanceSheetServiceError(
        `Failed to fetch snapshots: ${error.message}`,
        error.code || 'FETCH_FAILED',
        error
      );
    }

    return { data: data || [], error: null };
  } catch (error) {
    if (error instanceof BalanceSheetServiceError) {
      return { data: null, error };
    }
    return {
      data: null,
      error: new BalanceSheetServiceError(
        'An unexpected error occurred while fetching snapshots',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

/**
 * Get net worth trend for a date range
 */
export async function getNetWorthTrend(
  userId: string,
  startDate: string,
  endDate?: string
): Promise<ServiceResponse<BalanceSnapshot[]>> {
  try {
    if (!userId) {
      throw new BalanceSheetServiceError('User ID is required', 'INVALID_USER_ID');
    }

    let query = supabase
      .from('balance_snapshots')
      .select('*')
      .eq('user_id', userId)
      .gte('snapshot_date', startDate)
      .order('snapshot_date', { ascending: true });

    if (endDate) {
      query = query.lte('snapshot_date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw new BalanceSheetServiceError(
        `Failed to fetch net worth trend: ${error.message}`,
        error.code || 'FETCH_FAILED',
        error
      );
    }

    return { data: data || [], error: null };
  } catch (error) {
    if (error instanceof BalanceSheetServiceError) {
      return { data: null, error };
    }
    return {
      data: null,
      error: new BalanceSheetServiceError(
        'An unexpected error occurred while fetching net worth trend',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

