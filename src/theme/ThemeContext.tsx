import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import {
  ColorTokens,
  ResolvedTheme,
  ThemeMode,
  heoconTokens,
  pinkTokens,
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
  mode: 'heocon',
  themeMode: 'heocon',
  activeTheme: 'heocon',
  tokens: heoconTokens,
  isDark: false,
  setMode: async () => {},
  setThemeMode: async () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>('heocon');
  const [isLoaded, setIsLoaded] = useState(false);

  // Khôi phục cài đặt Theme từ AsyncStorage (mặc định luôn là 'heocon')
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY_THEME);
        if (saved === 'heocon' || saved === 'pink') {
          setModeState(saved as ThemeMode);
        } else {
          // Mặc định luôn là heocon (kể cả khi trước đó là 'mint' cũ)
          setModeState('heocon');
          await AsyncStorage.setItem(STORAGE_KEY_THEME, 'heocon');
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
  // 'heocon' => Neo-brutalist Pixel Vàng Nâu (Mặc định)
  // 'pink' => Hồng Heo Pastel Prototype
  const activeTheme: ResolvedTheme = mode === 'pink' ? 'pink' : 'heocon';
  const isDark = false;
  const tokens = activeTheme === 'pink' ? pinkTokens : heoconTokens;

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
      <StatusBar style="dark" animated />
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
