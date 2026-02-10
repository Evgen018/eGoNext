import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { PaperProvider } from "react-native-paper";
import { initSchema } from "@/lib/db/init";
import { ThemeProvider, useThemeContext } from "@/lib/theme-context";
import { BackgroundLayout } from "@/lib/BackgroundLayout";

/** Фон для ВСЕХ экранов. Укажите require('@/egonext-bg.png') или null, чтобы отключить. */
const GLOBAL_BACKGROUND: import("react-native").ImageSourcePropType | null = null;

function AppContent() {
  const { theme } = useThemeContext();
  return (
    <BackgroundLayout source={GLOBAL_BACKGROUND}>
      <PaperProvider theme={theme}>
        <Stack screenOptions={{ headerShown: false }} />
      </PaperProvider>
    </BackgroundLayout>
  );
}

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="egonext.db" onInit={initSchema}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SQLiteProvider>
  );
}
