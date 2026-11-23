import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Heart, Palette, Sparkles } from 'lucide-react-native';
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
      label: 'Kem',
      icon: (active) => (
        <Sparkles
          size={16}
          color={active ? '#2B2118' : tokens.textMuted}
          strokeWidth={2.6}
        />
      ),
    },
    {
      mode: 'pink',
      label: 'Hồng',
      icon: (active) => (
        <Heart
          size={16}
          color={active ? (themeMode === 'pink' ? '#FFFFFF' : '#F43F5E') : tokens.textMuted}
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
              borderRadius: 22,
              shadowColor: '#2B2118',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 4,
            }
          : {
              backgroundColor: '#FFFFFF',
              borderColor: '#3B0713',
              borderWidth: 3,
              borderRadius: 22,
              shadowColor: '#3B0713',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 4,
            },
      ]}
    >
      <View style={styles.headerRow}>
        <View
          style={[
            styles.iconBox,
            {
              width: 48,
              height: 48,
              borderRadius: 14,
              backgroundColor: isHeocon ? '#FFF4CC' : '#FCE7F3',
              borderWidth: 2.5,
              borderColor: isHeocon ? '#2B2118' : '#3B0713',
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}
        >
          <Palette size={20} color={isHeocon ? '#2B2118' : '#F43F5E'} strokeWidth={2.6} />
        </View>
        <View style={styles.titleCol}>
          <Text
            style={[
              styles.title,
              { color: isHeocon ? '#2B2118' : '#3B0713' },
              { fontFamily: 'Baloo2_800ExtraBold', fontWeight: '800' },
            ]}
          >
            GIAO DIỆN
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.segmentTrack,
          {
            backgroundColor: isHeocon ? '#F6EEDC' : '#FFF5F7',
            borderColor: isHeocon ? '#2B2118' : '#3B0713',
            borderWidth: 2,
          },
        ]}
      >
        {options.map((opt) => {
          const isActive = themeMode === opt.mode;
          return (
            <TouchableOpacity
              key={opt.mode}
              style={[
                styles.segmentBtn,
                isActive && {
                  backgroundColor: opt.mode === 'heocon' ? '#F4B93B' : '#F43F5E',
                  borderWidth: 2,
                  borderColor: isHeocon ? '#2B2118' : '#3B0713',
                  borderRadius: radii.full,
                  shadowColor: isHeocon ? '#2B2118' : '#3B0713',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 2,
                },
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
                      ? opt.mode === 'heocon'
                        ? '#2B2118'
                        : '#FFFFFF'
                      : isHeocon
                      ? '#6E5D4F'
                      : '#881337',
                    fontWeight: isActive ? '800' : '600',
                    fontFamily: isActive ? 'Baloo2_800ExtraBold' : 'Nunito',
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
  iconBox: {
    alignItems: 'center',
    justifyContent: 'center',
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
