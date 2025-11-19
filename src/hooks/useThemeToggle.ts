/**
 * useThemeToggle - Manage theme switching
 */

'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function useThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine effective theme
  const effectiveTheme = theme === 'system' ? systemTheme : theme;
  const isDark = effectiveTheme === 'dark';

  const toggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const setLight = () => setTheme('light');
  const setDark = () => setTheme('dark');
  const setSystem = () => setTheme('system');

  return {
    theme: effectiveTheme as 'light' | 'dark',
    isDark,
    mounted,
    toggle,
    setLight,
    setDark,
    setSystem,
    currentThemeSetting: theme,
  };
}

/**
 * Helper to get color based on current theme
 */
export function useThemedColor(lightColor: string, darkColor: string): string {
  const { isDark } = useThemeToggle();
  return isDark ? darkColor : lightColor;
}

/**
 * Helper to conditionally apply Tailwind classes based on theme
 */
export function useThemedClass(
  lightClass: string,
  darkClass: string,
): string {
  const { isDark } = useThemeToggle();
  return isDark ? darkClass : lightClass;
}
