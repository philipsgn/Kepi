import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SettingsView } from '../../src/components/views/SettingsView';
import { useTheme } from '../../src/theme';

export default function SettingsScreen() {
  const { tokens } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: tokens.bg }]}>
      <SettingsView />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
