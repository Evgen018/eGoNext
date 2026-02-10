import { Stack } from "expo-router";
import { BackgroundLayout } from "@/lib/BackgroundLayout";

/** Фон только для экранов внутри /settings. null = без фона. */
const SETTINGS_BACKGROUND = null;

export default function SettingsLayout() {
  return (
    <BackgroundLayout source={SETTINGS_BACKGROUND}>
      <Stack screenOptions={{ headerShown: false }} />
    </BackgroundLayout>
  );
}
