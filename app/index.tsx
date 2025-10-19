import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function LandingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Money Tracker Mobile</Text>
      <Text style={styles.subtitle}>Track inflow, outflow, and your balance over time</Text>

      <View style={styles.actions}>
        <Button title="Log In" onPress={() => router.push('/auth/login')} />
        <View style={{ height: 12 }} />
        <Button title="Sign Up" onPress={() => router.push('/auth/signup')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  actions: {
    marginTop: 24,
    alignSelf: 'stretch',
  },
});
