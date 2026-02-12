"use client";

import { createContext, useContext, type ReactNode } from "react";
import { MD3LightTheme, type MD3Theme } from "react-native-paper";

type ThemeContextValue = {
  theme: MD3Theme;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value={{ theme: MD3LightTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeContext must be used within ThemeProvider");
  return ctx;
}
