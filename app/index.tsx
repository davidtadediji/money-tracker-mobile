import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const { isAuthenticated, loading, profile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated && profile) {
      // Check if profile setup is completed
      if (!profile.profile_setup_completed) {
        router.replace('/auth/profile-setup');
      }
    }
  }, [loading, isAuthenticated, profile, router]);

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#111" />
      </View>
    );
  }

  // If authenticated, redirect to app
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  // If not authenticated, show landing/login
  return <Redirect href="/auth/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
  },
});
