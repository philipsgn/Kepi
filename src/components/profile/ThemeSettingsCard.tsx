import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Moon, Palette, Sun, Wind } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { ThemeMode, radii } from '../../theme/tokens';

export const ThemeSettingsCard: React.FC = () => {
  const { themeMode, setThemeMode, tokens } = useTheme();

  const handleSelectMode = (mode: ThemeMode) => {
    if (mode !== themeMode) {
      Haptics.selectionAsync();
      setThemeMode(mode);
    }
  };

  const options: {
    mode: ThemeMode;
    label: string;
    icon: (active: boolean) => React.ReactNode;
  }[] = [
    {
      mode: 'light',
      label: 'Sáng',
      icon: (active) => (
        <Sun
          size={16}
          color={active ? tokens.textOnPrimary : tokens.textMuted}
          strokeWidth={2.5}
        />
      ),
    },
    {
      mode: 'dark',
      label: 'Tối',
      icon: (active) => (
        <Moon
          size={16}
          color={active ? tokens.textOnPrimary : tokens.textMuted}
          strokeWidth={2.5}
        />
      ),
    },
    {
      mode: 'cool',
      label: 'Mát',
      icon: (active) => (
        <Wind
          size={16}
          color={active ? tokens.textOnPrimary : tokens.textMuted}
          strokeWidth={2.5}
        />
      ),
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
      <View style={styles.headerRow}>
        <Palette size={20} color={tokens.primary} strokeWidth={2.6} />
        <View style={styles.titleCol}>
          <Text style={[styles.title, { color: tokens.text }]}>Chế Độ Giao Diện</Text>
        </View>
      </View>

      <View style={[styles.segmentTrack, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
        {options.map((opt) => {
          const isActive = themeMode === opt.mode;
          return (
            <TouchableOpacity
              key={opt.mode}
              style={[
                styles.segmentBtn,
                isActive && [
                  styles.segmentBtnActive,
                  {
                    backgroundColor: tokens.primary,
                    shadowColor: tokens.glowColor,
                  },
                ],
              ]}
              onPress={() => handleSelectMode(opt.mode)}
              activeOpacity={0.8}
            >
              {opt.icon(isActive)}
              <Text
                style={[
                  styles.segmentText,
                  { color: isActive ? tokens.textOnPrimary : tokens.textMuted },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  titleCol: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 11.5,
    fontWeight: '400',
    marginTop: 1,
  },
  segmentTrack: {
    flexDirection: 'row',
    borderRadius: radii.full,
    borderWidth: 1,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: radii.full,
    gap: 6,
  },
  segmentBtnActive: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
});
