"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { MD3LightTheme, MD3DarkTheme, type MD3Theme } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

const THEME_STORAGE_KEY = "@egonext/colorScheme";

export type ColorScheme = "light" | "dark";

type ThemeContextValue = {
  theme: MD3Theme;
  isDark: boolean;
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>("light");

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (stored === "light" || stored === "dark") {
        setColorSchemeState(stored);
      }
    });
  }, []);

  const setColorScheme = useCallback((scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    AsyncStorage.setItem(THEME_STORAGE_KEY, scheme);
  }, []);

  const theme = colorScheme === "dark" ? MD3DarkTheme : MD3LightTheme;
  const isDark = colorScheme === "dark";

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        colorScheme,
        setColorScheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeContext must be used within ThemeProvider");
  return ctx;
}
