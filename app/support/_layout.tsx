import { Stack } from 'expo-router';

export default function SupportLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Help & Support',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="faq" 
        options={{ 
          title: 'FAQ',
          presentation: 'card',
        }} 
      />
      <Stack.Screen 
        name="onboarding" 
        options={{ 
          title: 'Tutorial',
          presentation: 'card',
        }} 
      />
      <Stack.Screen 
        name="contact" 
        options={{ 
          title: 'Contact Support',
          presentation: 'card',
        }} 
      />
      <Stack.Screen 
        name="about" 
        options={{ 
          title: 'About',
          presentation: 'card',
        }} 
      />
      <Stack.Screen 
        name="tickets" 
        options={{ 
          title: 'My Tickets',
          presentation: 'card',
        }} 
      />
    </Stack>
  );
}

