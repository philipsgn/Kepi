import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../src/store/authStore';
import { ThemeProvider } from '../src/theme';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, hasCompletedBudgetSetup, isLoading, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else if (!hasCompletedBudgetSetup) {
      if (segments[1] !== 'budget-setup') {
        router.replace('/(auth)/budget-setup');
      }
    } else {
      if (inAuthGroup) {
        router.replace('/(main)');
      }
    }
  }, [isAuthenticated, hasCompletedBudgetSetup, isLoading, segments]);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StatusBar style="auto" />
        <Stack
          initialRouteName="index"
          screenOptions={{
            headerShown: false,
            animation: 'fade',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(main)" />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
