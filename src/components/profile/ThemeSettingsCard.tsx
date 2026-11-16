import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Leaf, Palette, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { ThemeMode, radii } from '../../theme/tokens';

export const ThemeSettingsCard: React.FC = () => {
  const { themeMode, setThemeMode, tokens, mode } = useTheme();
  const isHeocon = mode === 'heocon' || !mode;

  const handleSelectMode = (m: ThemeMode) => {
    if (m !== themeMode) {
      Haptics.selectionAsync();
      setThemeMode(m);
    }
  };

  const options: {
    mode: ThemeMode;
    label: string;
    icon: (active: boolean) => React.ReactNode;
  }[] = [
    {
      mode: 'heocon',
      label: 'Heo Con',
      icon: (active) => (
        <Sparkles
          size={16}
          color={active ? (isHeocon ? '#2B2118' : tokens.textOnPrimary) : tokens.textMuted}
          strokeWidth={2.6}
        />
      ),
    },
    {
      mode: 'pink',
      label: 'Hồng Heo',
      icon: (active) => (
        <Sparkles
          size={16}
          color={active ? (isHeocon ? '#2B2118' : tokens.textOnPrimary) : tokens.textMuted}
          strokeWidth={2.6}
        />
      ),
    },
    {
      mode: 'mint',
      label: 'Xanh Mint',
      icon: (active) => (
        <Leaf
          size={16}
          color={active ? (isHeocon ? '#2B2118' : tokens.textOnPrimary) : tokens.textMuted}
          strokeWidth={2.6}
        />
      ),
    },
  ];

  return (
    <View
      style={[
        styles.container,
        isHeocon
          ? {
              backgroundColor: '#FFFBF1',
              borderColor: '#2B2118',
              borderWidth: 3,
              shadowColor: '#2B2118',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 4,
            }
          : { backgroundColor: tokens.surface, borderColor: tokens.border },
      ]}
    >
      <View style={styles.headerRow}>
        <Palette size={20} color={isHeocon ? '#2B2118' : tokens.primary} strokeWidth={2.6} />
        <View style={styles.titleCol}>
          <Text style={[styles.title, { color: isHeocon ? '#2B2118' : tokens.text }]}>Màu Sắc Giao Diện</Text>
          <Text style={[styles.subtitle, { color: isHeocon ? '#6E5D4F' : tokens.textMuted }]}>
            Hệ 3 giao diện PigFly: Heo Con Pixel, Hồng Heo & Xanh Mint
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.segmentTrack,
          isHeocon
            ? {
                backgroundColor: '#F6EEDC',
                borderColor: '#2B2118',
                borderWidth: 2,
              }
            : { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border },
        ]}
      >
        {options.map((opt) => {
          const isActive = themeMode === opt.mode;
          return (
            <TouchableOpacity
              key={opt.mode}
              style={[
                styles.segmentBtn,
                isActive &&
                  (isHeocon
                    ? {
                        backgroundColor: '#F4B93B',
                        borderWidth: 2,
                        borderColor: '#2B2118',
                        borderRadius: radii.full,
                      }
                    : [
                        styles.segmentBtnActive,
                        {
                          backgroundColor: tokens.primary,
                          shadowColor: tokens.glowColor,
                        },
                      ]),
              ]}
              onPress={() => handleSelectMode(opt.mode)}
              activeOpacity={0.8}
            >
              {opt.icon(isActive)}
              <Text
                style={[
                  styles.segmentText,
                  {
                    color: isActive
                      ? isHeocon
                        ? '#2B2118'
                        : tokens.textOnPrimary
                      : isHeocon
                      ? '#6E5D4F'
                      : tokens.textMuted,
                    fontWeight: isActive ? '800' : '600',
                  },
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
