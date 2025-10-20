import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

/*
// Google Auth (Expo AuthSession) — stub/example
// 1) Install: expo install expo-auth-session expo-web-browser
// 2) Add your client IDs below, then replace the placeholder handler to call promptAsync().

import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useEffect } from 'react';

WebBrowser.maybeCompleteAuthSession();

function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: '<EXPO_CLIENT_ID>',
    iosClientId: '<IOS_CLIENT_ID>',
    androidClientId: '<ANDROID_CLIENT_ID>',
    webClientId: '<WEB_CLIENT_ID>',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response; // access_token etc.
      // TODO: send token to backend / create session
      console.log('Google auth success', authentication);
    }
  }, [response]);

  return { request, promptAsync };
}

// In component:
// const { request, promptAsync } = useGoogleAuth();
// <Button title="Continue with Google" disabled={!request} onPress={() => promptAsync()} />
*/

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Add login logic here
    console.log('Logging in with:', email, password);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Log in to track your cash flow and balance</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#777"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#777"
        />

        <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
          <Text style={styles.primaryButtonText}>Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => console.log('Login with Google')}
        >
          <Text style={styles.secondaryButtonText}>Continue with Google</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f7f7f7',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  primaryButton: {
    backgroundColor: '#111',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  secondaryButton: {
    borderColor: '#111',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: { color: '#111', fontWeight: '600', fontSize: 16 },
});
