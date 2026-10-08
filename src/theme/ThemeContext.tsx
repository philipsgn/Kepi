import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import {
  ColorTokens,
  ResolvedTheme,
  ThemeMode,
  coolTokens,
  darkTokens,
  lightTokens,
} from './tokens';

const STORAGE_KEY_THEME = 'vi_locket_theme_mode';

interface ThemeContextValue {
  mode: ThemeMode;
  themeMode: ThemeMode;
  activeTheme: ResolvedTheme;
  tokens: ColorTokens;
  isDark: boolean;
  setMode: (mode: ThemeMode) => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  themeMode: 'light',
  activeTheme: 'light',
  tokens: lightTokens,
  isDark: false,
  setMode: async () => {},
  setThemeMode: async () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  // Khôi phục cài đặt Theme từ AsyncStorage khi mở app
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY_THEME);
        if (saved === 'light' || saved === 'dark' || saved === 'cool') {
          setModeState(saved as ThemeMode);
        } else if (saved === 'system') {
          // Tự động chuyển đổi lưu trữ cũ 'system' sang 'cool' (Mát)
          setModeState('cool');
          await AsyncStorage.setItem(STORAGE_KEY_THEME, 'cool');
        }
      } catch (err) {
        console.warn('[ThemeContext] Failed to load theme mode:', err);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const setMode = async (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_THEME, newMode);
    } catch (err) {
      console.warn('[ThemeContext] Failed to save theme mode:', err);
    }
  };

  // Xác định theme thực tế (resolved)
  // 'light' => Sáng (Vàng Hoàng Gia & Kem Bơ)
  // 'dark'  => Tối (Space Gray Titanium)
  // 'cool'  => Mát (Cool Mint & Aqua Jade Gradient)
  const activeTheme: ResolvedTheme =
    mode === 'dark'
      ? 'dark'
      : mode === 'cool'
      ? 'cool'
      : 'light';

  const isDark = activeTheme === 'dark';
  const tokens =
    activeTheme === 'dark'
      ? darkTokens
      : activeTheme === 'cool'
      ? coolTokens
      : lightTokens;

  return (
    <ThemeContext.Provider
      value={{
        mode,
        themeMode: mode,
        activeTheme,
        tokens,
        isDark,
        setMode,
        setThemeMode: setMode,
      }}
    >
      {/* Tự động cập nhật StatusBar: Chữ sáng trên nền tối, chữ tối trên nền sáng */}
      <StatusBar style={isDark ? 'light' : 'dark'} animated />
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
