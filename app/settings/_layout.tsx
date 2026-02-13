import { Stack } from "expo-router";
import { BackgroundLayout } from "@/lib/BackgroundLayout";
import { useThemeContext } from "@/lib/theme-context";

/** Фон только для экранов внутри /settings. В тёмной теме не показываем. */
const SETTINGS_BACKGROUND = require("../../assets/images/settings-bg.png");

export default function SettingsLayout() {
  const { theme, isDark } = useThemeContext();
  const backgroundSource = isDark ? null : SETTINGS_BACKGROUND;
  return (
    <BackgroundLayout source={backgroundSource}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: backgroundSource
            ? { backgroundColor: "transparent" }
            : { backgroundColor: theme.colors.background },
        }}
      />
    </BackgroundLayout>
  );
}
