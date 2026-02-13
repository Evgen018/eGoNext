"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { MD3LightTheme, MD3DarkTheme, type MD3Theme } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import color from "color";

const THEME_STORAGE_KEY = "@egonext/colorScheme";
const PRIMARY_COLOR_STORAGE_KEY = "@egonext/primaryColor";

export type ColorScheme = "light" | "dark";

/** Палитра из 10 цветов для выбора основного цвета тёмной темы (Material-style). */
export const PRIMARY_COLOR_OPTIONS: string[] = [
  "#D0BCFF", // фиолетовый
  "#80CBC4", // бирюзовый
  "#81C784", // зелёный
  "#FFB74D", // оранжевый
  "#E57373", // красный
  "#7986CB", // индиго
  "#F06292", // розовый
  "#4DD0E1", // циан
  "#A5D6A7", // светлозелёный
  "#CE93D8", // светлофиолетовый
];

type ThemeContextValue = {
  theme: MD3Theme;
  isDark: boolean;
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  primaryColor: string | null;
  setPrimaryColor: (hex: string | null) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyPrimaryToDarkTheme(base: MD3Theme, primaryHex: string): MD3Theme {
  const c = color(primaryHex);
  const primaryContainer = c.darken(0.55).rgb().string();
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: primaryHex,
      onPrimary: c.isDark() ? "#ffffff" : "#000000",
      primaryContainer,
      onPrimaryContainer: primaryHex,
      inversePrimary: primaryHex,
    },
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>("light");
  const [primaryColor, setPrimaryColorState] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (stored === "light" || stored === "dark") {
        setColorSchemeState(stored);
      }
    });
    AsyncStorage.getItem(PRIMARY_COLOR_STORAGE_KEY).then((stored) => {
      if (stored && /^#[0-9A-Fa-f]{6}$/.test(stored)) {
        setPrimaryColorState(stored);
      }
    });
  }, []);

  const setColorScheme = useCallback((scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    AsyncStorage.setItem(THEME_STORAGE_KEY, scheme);
  }, []);

  const setPrimaryColor = useCallback((hex: string | null) => {
    setPrimaryColorState(hex);
    AsyncStorage.setItem(PRIMARY_COLOR_STORAGE_KEY, hex ?? "");
  }, []);

  const theme = useMemo(() => {
    if (colorScheme === "light") {
      return MD3LightTheme;
    }
    if (primaryColor) {
      return applyPrimaryToDarkTheme(MD3DarkTheme, primaryColor);
    }
    return MD3DarkTheme;
  }, [colorScheme, primaryColor]);

  const isDark = colorScheme === "dark";

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        colorScheme,
        setColorScheme,
        primaryColor,
        setPrimaryColor,
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
