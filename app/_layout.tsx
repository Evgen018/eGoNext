import { useEffect } from "react";
import { Stack } from "expo-router";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { PaperProvider } from "react-native-paper";
import { DbProvider } from "@/lib/db/DbProvider";
import { initSchema } from "@/lib/db/init";
import { ThemeProvider, useThemeContext } from "@/lib/theme-context";
import { MapPickerProvider } from "@/lib/MapPickerContext";
import { BackgroundLayout } from "@/lib/BackgroundLayout";
import { loadStoredLanguage } from "@/lib/i18n";

/** Фон для ВСЕХ экранов. В тёмной теме не показываем. В release — маленький placeholder (большие PNG ломают AAPT). */
const GLOBAL_BACKGROUND: import("react-native").ImageSourcePropType = __DEV__
  ? require("../assets/images/egonext-bg.png")
  : require("../assets/images/placeholder-bg.png");

function AppContent() {
  const { theme, isDark } = useThemeContext();

  useEffect(() => {
    loadStoredLanguage();
  }, []);

  const backgroundSource = isDark ? null : GLOBAL_BACKGROUND;
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <BackgroundLayout source={backgroundSource}>
        <PaperProvider theme={theme}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: backgroundSource
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
    <DbProvider databaseName="egonext.db" onInit={initSchema}>
      <ThemeProvider>
        <MapPickerProvider>
          <AppContent />
        </MapPickerProvider>
      </ThemeProvider>
    </DbProvider>
  );
}
