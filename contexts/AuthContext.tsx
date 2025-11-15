import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  signUpWithEmail as signUpWithEmailService,
  signInWithEmail as signInWithEmailService,
  signOut as signOutService,
  getCurrentSession,
  getCurrentUser,
  sendPasswordResetEmail as sendPasswordResetEmailService,
  updatePassword as updatePasswordService,
  getUserProfile as getUserProfileService,
  updateUserProfile as updateUserProfileService,
  completeProfileSetup as completeProfileSetupService,
  completeOnboarding as completeOnboardingService,
  deactivateAccount as deactivateAccountService,
} from '@/services/authService';
import { UserProfile } from '@/types/database';
import { User, Session } from '@supabase/supabase-js';

/**
 * Auth Context
 * Manages authentication state and user profile across the app
 */

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  sendPasswordResetEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  completeProfileSetup: (fullName?: string, displayName?: string, phoneNumber?: string) => Promise<{ success: boolean; error?: string }>;
  completeOnboarding: () => Promise<{ success: boolean; error?: string }>;
  deactivateAccount: () => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { profile: fetchedProfile, error: profileError } = await getUserProfileService(userId);
      
      if (profileError) {
        console.error('Error fetching profile:', profileError.message);
        setProfile(null);
      } else {
        setProfile(fetchedProfile);
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      setProfile(null);
    }
  }, []);

  // Initialize: Get session and user
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current session
        const { session: currentSession, error: sessionError } = await getCurrentSession();
        
        if (sessionError) {
          setError(sessionError.message);
          setSession(null);
          setUser(null);
          setProfile(null);
          return;
        }

        if (isMounted) {
          setSession(currentSession);
          setUser(currentSession?.user || null);

          if (currentSession?.user) {
            await fetchProfile(currentSession.user.id);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to initialize auth');
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (isMounted) {
        console.log('Auth state changed:', event);

        setSession(newSession);
        setUser(newSession?.user || null);

        if (newSession?.user) {
          await fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  // Sign up
  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true);
      setError(null);

      const { user: newUser, session: newSession, error: signUpError } = await signUpWithEmailService(
        email,
        password,
        fullName
      );

      console.log('signUpError', signUpError);

      if (signUpError) {
        setError(signUpError.message);
        return { success: false, error: signUpError.message };
      }

      setUser(newUser);
      setSession(newSession);

      if (newUser) {
        await fetchProfile(newUser.id);
      }

      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to sign up';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  // Sign in
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { user: signedInUser, session: newSession, error: signInError } = await signInWithEmailService(
        email,
        password
      );

      if (signInError) {
        setError(signInError.message);
        return { success: false, error: signInError.message };
      }

      setUser(signedInUser);
      setSession(newSession);

      if (signedInUser) {
        await fetchProfile(signedInUser.id);
      }

      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to sign in';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { success, error: signOutError } = await signOutService();

      if (!success && signOutError) {
        setError(signOutError.message);
        return { success: false, error: signOutError.message };
      }

      setUser(null);
      setSession(null);
      setProfile(null);

      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to sign out';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Send password reset email
  const sendPasswordResetEmail = useCallback(async (email: string) => {
    try {
      setError(null);

      const { success, error: resetError } = await sendPasswordResetEmailService(email);

      if (!success && resetError) {
        setError(resetError.message);
        return { success: false, error: resetError.message };
      }

      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to send reset email';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Update password
  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      setError(null);

      const { success, error: updateError } = await updatePasswordService(newPassword);

      if (!success && updateError) {
        setError(updateError.message);
        return { success: false, error: updateError.message };
      }

      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update password';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    try {
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      setError(null);

      const { profile: updatedProfile, error: updateError } = await updateUserProfileService(user.id, updates);

      if (updateError) {
        setError(updateError.message);
        return { success: false, error: updateError.message };
      }

      if (updatedProfile) {
        setProfile(updatedProfile);
      }

      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [user]);

  // Complete profile setup
  const completeProfileSetup = useCallback(async (
    fullName?: string,
    displayName?: string,
    phoneNumber?: string
  ) => {
    try {
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      setError(null);

      const { profile: updatedProfile, error: setupError } = await completeProfileSetupService(
        user.id,
        fullName,
        displayName,
        phoneNumber
      );

      if (setupError) {
        setError(setupError.message);
        return { success: false, error: setupError.message };
      }

      if (updatedProfile) {
        setProfile(updatedProfile);
      }

      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to complete profile setup';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [user]);

  // Complete onboarding
  const completeOnboarding = useCallback(async () => {
    try {
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      setError(null);

      const { profile: updatedProfile, error: onboardingError } = await completeOnboardingService(user.id);

      if (onboardingError) {
        setError(onboardingError.message);
        return { success: false, error: onboardingError.message };
      }

      if (updatedProfile) {
        setProfile(updatedProfile);
      }

      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to complete onboarding';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [user]);

  // Deactivate account
  const deactivateAccount = useCallback(async () => {
    try {
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      setError(null);

      const { success, error: deactivateError } = await deactivateAccountService(user.id);

      if (!success && deactivateError) {
        setError(deactivateError.message);
        return { success: false, error: deactivateError.message };
      }

      // Clear state
      setUser(null);
      setSession(null);
      setProfile(null);

      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to deactivate account';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [user]);

  const value = useMemo(() => ({
    user,
    session,
    profile,
    loading,
    error,
    isAuthenticated: !!user && !!session,
    signUp,
    signIn,
    signOut,
    sendPasswordResetEmail,
    updatePassword,
    updateProfile,
    completeProfileSetup,
    completeOnboarding,
    deactivateAccount,
    refreshProfile,
  }), [
    user,
    session,
    profile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    sendPasswordResetEmail,
    updatePassword,
    updateProfile,
    completeProfileSetup,
    completeOnboarding,
    deactivateAccount,
    refreshProfile,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

