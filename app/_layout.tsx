import { Stack } from "expo-router";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SQLiteProvider } from "expo-sqlite";
import { PaperProvider } from "react-native-paper";
import { initSchema } from "@/lib/db/init";
import { ThemeProvider, useThemeContext } from "@/lib/theme-context";
import { MapPickerProvider } from "@/lib/MapPickerContext";
import { BackgroundLayout } from "@/lib/BackgroundLayout";

/** Фон для ВСЕХ экранов. Укажите require('@/egonext-bg.png') или null, чтобы отключить. */

const GLOBAL_BACKGROUND: import("react-native").ImageSourcePropType | null = require("@/assets/images/egonext-bg.png");

function AppContent() {
  const { theme, isDark } = useThemeContext();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <BackgroundLayout source={GLOBAL_BACKGROUND}>
        <PaperProvider key={isDark ? "dark" : "light"} theme={theme}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: GLOBAL_BACKGROUND
                ? { backgroundColor: "transparent" }
                : { backgroundColor: theme.colors.background },
            }}
          />
        </PaperProvider>
      </BackgroundLayout>
    </View>
  );
}

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="egonext.db" onInit={initSchema}>
      <ThemeProvider>
        <MapPickerProvider>
          <AppContent />
        </MapPickerProvider>
      </ThemeProvider>
    </SQLiteProvider>
  );
}
