import React from 'react';
import { Stack } from 'expo-router';
import { Colors } from '../../src/constants/colors';

export default function AuthLayout() {
  return (
    <Stack
      initialRouteName="login"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.bgPrimary },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="budget-setup" />
      <Stack.Screen name="callback" options={{ animation: 'fade' }} />
    </Stack>
  );
}
