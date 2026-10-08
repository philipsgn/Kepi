import React from 'react';
import { Stack } from 'expo-router';
import { Colors } from '../../src/constants/colors';

export default function MainLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="journal"
        options={{
          animation: 'slide_from_left',
        }}
      />
      <Stack.Screen
        name="wait-basket"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack>
  );
}
