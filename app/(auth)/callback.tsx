import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '../../src/services/supabase';
import { useAuthStore } from '../../src/store/authStore';
import { Colors } from '../../src/constants/colors';

/**
 * Route Callback phục vụ OAuth Google Deep Linking
 * Lắng nghe access_token / refresh_token hoặc code từ URL redirect
 */
export default function AuthCallbackScreen() {
  const router = useRouter();
  const { initializeAuth } = useAuthStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        let url = await Linking.getInitialURL();
        if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location.href) {
          url = window.location.href;
        }
        if (url) {
          await processUrl(url);
        } else {
          // Fallback: khởi tạo lại auth xem session đã được lưu chưa
          await initializeAuth();
          router.replace('/(main)');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Lỗi xử lý phiên đăng nhập.';
        setErrorMessage(msg);
      }
    }

    async function processUrl(url: string) {
      try {
        // 1. Kiểm tra tham số mã code (PKCE)
        const parsed = Linking.parse(url);
        const code = parsed.queryParams?.code;

        if (code && typeof code === 'string') {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (url.includes('#')) {
          // 2. Kiểm tra token trong hash fragment
          const hash = url.split('#')[1];
          const params = new URLSearchParams(hash);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (error) throw error;
          }
        }

        await initializeAuth();
        router.replace('/(main)');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Không thể xác thực phiên.';
        setErrorMessage(msg);
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 2000);
      }
    }

    handleAuthCallback();

    const subscription = Linking.addEventListener('url', ({ url }) => {
      processUrl(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primaryYellow} />
      <Text style={styles.text}>
        {errorMessage ? errorMessage : 'Đang đồng bộ tài khoản Kepi...'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E1620',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  text: {
    marginTop: 16,
    color: '#FAF6EC',
    fontSize: 15,
    fontFamily: 'System',
    textAlign: 'center',
  },
});
