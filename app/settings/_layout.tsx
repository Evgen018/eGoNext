import { Stack } from "expo-router";
import { BackgroundLayout } from "@/lib/BackgroundLayout";

/** Фон только для экранов внутри /settings. Путь относительно app/settings/. null = без фона. */
const SETTINGS_BACKGROUND = require("../../assets/images/settings-bg.png");

export default function SettingsLayout() {
  return (
    <BackgroundLayout source={SETTINGS_BACKGROUND}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "transparent" },
        }}
      />
    </BackgroundLayout>
  );
}
