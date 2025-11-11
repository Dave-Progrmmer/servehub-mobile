
import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { useEffect } from 'react';
import { notificationService } from '../utils/notifications';

export default function RootLayout() {
  useEffect(() => {
    // Initialize notifications
    notificationService.initialize();

    return () => {
      notificationService.cleanup();
    };
  }, []);

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(service)" />
        <Stack.Screen name="search" />
        <Stack.Screen name="create-service" />
        <Stack.Screen name="notifications" options={{ presentation: 'card' }} />
        <Stack.Screen name="chat/[userId]" options={{ presentation: 'card' }} />
      </Stack>
    </AuthProvider>
  );
}