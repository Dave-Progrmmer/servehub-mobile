import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(service)" />  {/* ADD THIS LINE */}
        <Stack.Screen name="search" />
        <Stack.Screen name="create-service" />
      </Stack>
    </AuthProvider>
  );
}