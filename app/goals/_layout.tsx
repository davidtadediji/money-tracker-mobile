import { Stack } from 'expo-router';

export default function GoalsLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Financial Goals',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="create" 
        options={{ 
          title: 'Create Goal',
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="[id]" 
        options={{ 
          title: 'Goal Details',
          presentation: 'card',
        }} 
      />
      <Stack.Screen 
        name="edit/[id]" 
        options={{ 
          title: 'Edit Goal',
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="calculator" 
        options={{ 
          title: 'Savings Calculator',
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="templates" 
        options={{ 
          title: 'Goal Templates',
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="progress" 
        options={{ 
          title: 'Progress Tracking',
          presentation: 'card',
        }} 
      />
    </Stack>
  );
}

