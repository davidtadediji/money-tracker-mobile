import { Stack } from 'expo-router';

export default function BalanceSheetLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="add-asset" />
      <Stack.Screen name="add-liability" />
      <Stack.Screen name="asset/[id]" />
      <Stack.Screen name="liability/[id]" />
    </Stack>
  );
}

