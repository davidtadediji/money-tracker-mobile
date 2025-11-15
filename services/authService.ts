import { supabase } from '@/lib/supabase';
import { UserProfile, UserProfileUpdate } from '@/types/database';
import { Session, User, AuthError } from '@supabase/supabase-js';

/**
 * Authentication Service
 * Handles all authentication operations with Supabase
 */

// Custom error class
export class AuthServiceError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AuthServiceError';
  }
}

// Service response types
export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: AuthServiceError | null;
}

export interface ProfileResponse {
  profile: UserProfile | null;
  error: AuthServiceError | null;
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName?: string
): Promise<AuthResponse> {
  try {
    if (!email || !password) {
      throw new AuthServiceError('Email and password are required', 'INVALID_INPUT');
    }

    if (password.length < 6) {
      throw new AuthServiceError('Password must be at least 6 characters', 'WEAK_PASSWORD');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
        },
      },
    });

    if (error) {
      throw new AuthServiceError(
        error.message || 'Failed to sign up',
        error.name,
        error
      );
    }

    return {
      user: data.user,
      session: data.session,
      error: null,
    };
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return { user: null, session: null, error };
    }
    
    return {
      user: null,
      session: null,
      error: new AuthServiceError(
        'An unexpected error occurred during sign up',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    if (!email || !password) {
      throw new AuthServiceError('Email and password are required', 'INVALID_INPUT');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new AuthServiceError(
        error.message || 'Failed to sign in',
        error.name,
        error
      );
    }

    // Update last login time in profile
    if (data.user) {
      await updateLastLogin(data.user.id);
    }

    return {
      user: data.user,
      session: data.session,
      error: null,
    };
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return { user: null, session: null, error };
    }
    
    return {
      user: null,
      session: null,
      error: new AuthServiceError(
        'An unexpected error occurred during sign in',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<{ success: boolean; error: AuthServiceError | null }> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new AuthServiceError(
        error.message || 'Failed to sign out',
        error.name,
        error
      );
    }

    return { success: true, error: null };
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return { success: false, error };
    }
    
    return {
      success: false,
      error: new AuthServiceError(
        'An unexpected error occurred during sign out',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

/**
 * Get current session
 */
export async function getCurrentSession(): Promise<{ session: Session | null; error: AuthServiceError | null }> {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw new AuthServiceError(
        error.message || 'Failed to get session',
        error.name,
        error
      );
    }

    return { session: data.session, error: null };
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return { session: null, error };
    }
    
    return {
      session: null,
      error: new AuthServiceError(
        'An unexpected error occurred while getting session',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<{ user: User | null; error: AuthServiceError | null }> {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      throw new AuthServiceError(
        error.message || 'Failed to get user',
        error.name,
        error
      );
    }

    return { user: data.user, error: null };
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return { user: null, error };
    }
    
    return {
      user: null,
      error: new AuthServiceError(
        'An unexpected error occurred while getting user',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string): Promise<{ success: boolean; error: AuthServiceError | null }> {
  try {
    if (!email) {
      throw new AuthServiceError('Email is required', 'INVALID_INPUT');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'moneytracker://auth/reset-password',
    });

    if (error) {
      throw new AuthServiceError(
        error.message || 'Failed to send password reset email',
        error.name,
        error
      );
    }

    return { success: true, error: null };
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return { success: false, error };
    }
    
    return {
      success: false,
      error: new AuthServiceError(
        'An unexpected error occurred while sending reset email',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

/**
 * Update password (when user is authenticated)
 */
export async function updatePassword(newPassword: string): Promise<{ success: boolean; error: AuthServiceError | null }> {
  try {
    if (!newPassword) {
      throw new AuthServiceError('New password is required', 'INVALID_INPUT');
    }

    if (newPassword.length < 6) {
      throw new AuthServiceError('Password must be at least 6 characters', 'WEAK_PASSWORD');
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new AuthServiceError(
        error.message || 'Failed to update password',
        error.name,
        error
      );
    }

    return { success: true, error: null };
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return { success: false, error };
    }
    
    return {
      success: false,
      error: new AuthServiceError(
        'An unexpected error occurred while updating password',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

/**
 * Get user profile
 */
export async function getUserProfile(userId: string): Promise<ProfileResponse> {
  try {
    if (!userId) {
      throw new AuthServiceError('User ID is required', 'INVALID_USER_ID');
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      throw new AuthServiceError(
        `Failed to fetch user profile: ${error.message}`,
        error.code,
        error
      );
    }

    return { profile: data, error: null };
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return { profile: null, error };
    }
    
    return {
      profile: null,
      error: new AuthServiceError(
        'An unexpected error occurred while fetching profile',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: UserProfileUpdate
): Promise<ProfileResponse> {
  try {
    if (!userId) {
      throw new AuthServiceError('User ID is required', 'INVALID_USER_ID');
    }

    // Remove user_id from updates to prevent modification
    const { user_id, ...safeUpdates } = updates;

    const { data, error } = await supabase
      .from('user_profiles')
      .update(safeUpdates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new AuthServiceError(
        `Failed to update profile: ${error.message}`,
        error.code,
        error
      );
    }

    if (!data) {
      throw new AuthServiceError('Profile not found or access denied', 'NOT_FOUND');
    }

    return { profile: data, error: null };
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return { profile: null, error };
    }
    
    return {
      profile: null,
      error: new AuthServiceError(
        'An unexpected error occurred while updating profile',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

/**
 * Complete profile setup
 */
export async function completeProfileSetup(
  userId: string,
  fullName?: string,
  displayName?: string,
  phoneNumber?: string
): Promise<ProfileResponse> {
  try {
    const updates: UserProfileUpdate = {
      profile_setup_completed: true,
    };

    if (fullName !== undefined) updates.full_name = fullName;
    if (displayName !== undefined) updates.display_name = displayName;
    if (phoneNumber !== undefined) updates.phone_number = phoneNumber;

    return updateUserProfile(userId, updates);
  } catch (error) {
    return {
      profile: null,
      error: new AuthServiceError(
        'Failed to complete profile setup',
        'PROFILE_SETUP_ERROR',
        error
      ),
    };
  }
}

/**
 * Mark onboarding as completed
 */
export async function completeOnboarding(userId: string): Promise<ProfileResponse> {
  return updateUserProfile(userId, {
    onboarding_completed: true,
  });
}

/**
 * Update last login time
 */
async function updateLastLogin(userId: string): Promise<void> {
  try {
    await supabase
      .from('user_profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('user_id', userId);
  } catch (error) {
    // Silent fail - not critical
    console.error('Failed to update last login:', error);
  }
}

/**
 * Delete user account (soft delete by marking inactive)
 */
export async function deactivateAccount(userId: string): Promise<{ success: boolean; error: AuthServiceError | null }> {
  try {
    if (!userId) {
      throw new AuthServiceError('User ID is required', 'INVALID_USER_ID');
    }

    const { error } = await supabase
      .from('user_profiles')
      .update({ is_active: false })
      .eq('user_id', userId);

    if (error) {
      throw new AuthServiceError(
        `Failed to deactivate account: ${error.message}`,
        error.code,
        error
      );
    }

    // Sign out the user
    await signOut();

    return { success: true, error: null };
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return { success: false, error };
    }
    
    return {
      success: false,
      error: new AuthServiceError(
        'An unexpected error occurred while deactivating account',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

/**
 * Check if email exists
 */
export async function checkEmailExists(email: string): Promise<{ exists: boolean; error: AuthServiceError | null }> {
  try {
    // Note: This is a simple check using Supabase's signInWithPassword with a dummy password
    // In a real app, you might want to implement a serverless function for this
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: 'dummy_password_for_check',
    });

    if (error) {
      // If error is about invalid credentials, email exists
      if (error.message.includes('Invalid login credentials')) {
        return { exists: true, error: null };
      }
      // If error is about user not found, email doesn't exist
      return { exists: false, error: null };
    }

    // If no error (unlikely with dummy password), email exists
    return { exists: true, error: null };
  } catch (error) {
    return {
      exists: false,
      error: new AuthServiceError(
        'Failed to check email',
        'CHECK_EMAIL_ERROR',
        error
      ),
    };
  }
}

