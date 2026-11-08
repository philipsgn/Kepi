import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import {
  ColorTokens,
  ResolvedTheme,
  ThemeMode,
  mintTokens,
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
  mode: 'pink',
  themeMode: 'pink',
  activeTheme: 'pink',
  tokens: pinkTokens,
  isDark: false,
  setMode: async () => {},
  setThemeMode: async () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>('pink');
  const [isLoaded, setIsLoaded] = useState(false);

  // Khôi phục và tự động di chuyển cài đặt Theme từ AsyncStorage khi mở app
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY_THEME);
        if (saved === 'pink' || saved === 'mint') {
          setModeState(saved as ThemeMode);
        } else if (saved === 'cool') {
          // Di chuyển theme 'cool' cũ sang 'mint' mới
          setModeState('mint');
          await AsyncStorage.setItem(STORAGE_KEY_THEME, 'mint');
        } else if (saved === 'light' || saved === 'dark' || saved === 'system') {
          // Di chuyển các theme cũ 'light'/'dark'/'system' sang 'pink' (Hồng Heo Mặc Định)
          setModeState('pink');
          await AsyncStorage.setItem(STORAGE_KEY_THEME, 'pink');
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
  // 'pink' => Hồng Heo (Linh vật PigFly)
  // 'mint' => Xanh Mint Gradient (Mát mẻ đa tầng)
  const activeTheme: ResolvedTheme = mode === 'mint' ? 'mint' : 'pink';
  const isDark = false;
  const tokens = activeTheme === 'mint' ? mintTokens : pinkTokens;

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
