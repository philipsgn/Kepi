import React, { useEffect } from 'react';
import { Platform } from 'react-native';
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
    'Baloo2-Bold': Baloo2_800ExtraBold,
    Nunito: Nunito_700Bold,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    initializeAuth();
    // Quyết định 195: Triệt tiêu viền focus xanh mặc định của trình duyệt Web quanh TextInput/textarea
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const styleId = 'pigfly-web-input-reset';
      if (!document.getElementById(styleId)) {
        const styleEl = document.createElement('style');
        styleEl.id = styleId;
        styleEl.textContent =
          'input:focus, textarea:focus, select:focus { outline: none !important; box-shadow: none !important; }';
        document.head.appendChild(styleEl);
      }
    }
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
        <StatusBar style="dark" />
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
