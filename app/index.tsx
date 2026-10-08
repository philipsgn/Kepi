import React from 'react';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { Colors } from '../src/constants/colors';
import { useAuthStore } from '../src/store/authStore';

export default function Index() {
  const { isAuthenticated, hasCompletedBudgetSetup, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Colors.bgPrimary,
        }}
      >
        <ActivityIndicator size="large" color={Colors.accentGold} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!hasCompletedBudgetSetup) {
    return <Redirect href="/(auth)/budget-setup" />;
  }

  return <Redirect href="/(main)" />;
}
