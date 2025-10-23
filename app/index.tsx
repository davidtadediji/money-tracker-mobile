import React from 'react';
import { Redirect } from 'expo-router';
import Landing from '@/app/landing';

const isLoggedIn = true; // mock flag

export default function Index() {
  // if (isLoggedIn) {
  //   return <Redirect href="/(tabs)" />;
  // }
  return <Landing />;
}
