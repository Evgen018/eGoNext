"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  MD3LightTheme,
  MD3DarkTheme,
  type MD3Theme,
} from "react-native-paper";

const THEME_STORAGE_KEY = "@egonext/theme-dark";

type ThemeContextValue = {
  theme: MD3Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setDark: (value: boolean) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((value) => {
      if (value !== null) setIsDark(value === "true");
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(THEME_STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const setDark = useCallback((value: boolean) => {
    setIsDark(value);
    AsyncStorage.setItem(THEME_STORAGE_KEY, String(value));
  }, []);

  const theme = isDark ? MD3DarkTheme : MD3LightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeContext must be used within ThemeProvider");
  return ctx;
}
