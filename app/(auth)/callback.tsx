import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { Colors } from '../../src/constants/colors';

/**
 * Route Callback dự phòng - Tự động điều hướng về màn hình chính
 */
export default function AuthCallbackScreen() {
  const router = useRouter();
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    async function redirectHome() {
      await initializeAuth();
      router.replace('/(main)');
    }
    redirectHome();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primaryYellow} />
      <Text style={styles.text}>Đang khởi động PigFly...</Text>
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
    color: '#FAF6EC',
    marginTop: 16,
    fontSize: 14,
    fontWeight: '500',
  },
});
