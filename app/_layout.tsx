import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { PaperProvider } from "react-native-paper";
import { initSchema } from "@/lib/db/init";
import { ThemeProvider, useThemeContext } from "@/lib/theme-context";

function AppContent() {
  const { theme } = useThemeContext();
  return (
    <PaperProvider theme={theme}>
      <Stack screenOptions={{ headerShown: false }} />
    </PaperProvider>
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
