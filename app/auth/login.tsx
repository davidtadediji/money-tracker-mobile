import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';

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
    <View>
      <Text>Login</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
      <View style={{ height: 12 }} />
      <Button title="Continue with Google" onPress={() => console.log('Login with Google') } />
    </View>
  );
}
