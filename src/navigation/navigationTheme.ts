import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';
import { useMemo } from 'react';

import { useTheme } from '../context/ThemeContext';

export function useNavigationTheme(): Theme {
  const { colors, isDark } = useTheme();

  return useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;

    return {
      ...base,
      dark: isDark,
      colors: {
        ...base.colors,
        background: colors.cream,
        card: colors.background,
        text: colors.text,
        border: colors.border,
        primary: colors.brand,
      },
    };
  }, [colors, isDark]);
}
