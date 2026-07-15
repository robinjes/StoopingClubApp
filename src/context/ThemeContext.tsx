import AsyncStorage from '@react-native-async-storage/async-storage';
import { colorScheme } from 'nativewind';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { View } from 'react-native';

import { darkColors, lightColors, type ThemeColors } from '../theme/colors';

const THEME_STORAGE_KEY = 'stooping-club-color-scheme';

type ThemeMode = 'light' | 'dark';

type ThemeContextValue = {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  isReady: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveThemeMode(value: string | null): ThemeMode {
  return value === 'dark' ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [isReady, setIsReady] = useState(false);

  useLayoutEffect(() => {
    colorScheme.set(mode);
  }, [mode]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (!cancelled) {
          setMode(resolveThemeMode(saved));
        }
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setMode((current) => {
      const next: ThemeMode = current === 'light' ? 'dark' : 'light';
      void AsyncStorage.setItem(THEME_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      isDark: mode === 'dark',
      colors: mode === 'dark' ? darkColors : lightColors,
      isReady,
      toggleTheme,
    }),
    [isReady, mode, toggleTheme],
  );

  if (!isReady) {
    return <View style={{ flex: 1, backgroundColor: lightColors.cream }} />;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
