import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';
import {
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';

import { useAuthStore } from '../src/store/authStore';
import { ThemeProvider } from '../src/theme';
import { PWAInstallBanner } from '../src/components/PWAInstallBanner';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, hasCompletedBudgetSetup, isLoading, initializeAuth } = useAuthStore();

  const [fontsLoaded] = useFonts({
    Baloo2_800ExtraBold,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

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
      const subSegment = (segments as string[])[1];
      if (subSegment !== 'budget-setup') {
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
        <PWAInstallBanner />
        <Stack
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
