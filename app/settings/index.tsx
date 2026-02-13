import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { Appbar, List, Text, Switch, Button } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useThemeContext, PRIMARY_COLOR_OPTIONS } from "@/lib/theme-context";
import { MD3DarkTheme } from "react-native-paper";
import { changeAppLanguage, type SupportedLanguage } from "@/lib/i18n";

const appName = Constants.expoConfig?.name ?? "GoNext";
const version = Constants.expoConfig?.version ?? "1.0.0";

const DEFAULT_DARK_PRIMARY = MD3DarkTheme.colors.primary;

export default function SettingsScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { isDark, setColorScheme, primaryColor, setPrimaryColor } = useThemeContext();
  const currentLang = (i18n.language === "en" ? "en" : "ru") as SupportedLanguage;

  const handleLanguage = (lang: SupportedLanguage) => {
    changeAppLanguage(lang);
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t("settings.title")} />
      </Appbar.Header>
      <ScrollView style={styles.scroll}>
        <List.Section>
          <List.Subheader>{t("settings.appearance")}</List.Subheader>
          <List.Item
            title={t("settings.darkTheme")}
            description={isDark ? t("settings.darkThemeOn") : t("settings.darkThemeOff")}
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <Switch
                value={isDark}
                onValueChange={() => setColorScheme(isDark ? "light" : "dark")}
              />
            )}
            onPress={() => setColorScheme(isDark ? "light" : "dark")}
          />
          {isDark && (
            <>
              <List.Subheader style={styles.colorSubheader}>
                {t("settings.primaryColor")}
              </List.Subheader>
              <View style={styles.colorRow}>
                <Pressable
                  style={[
                    styles.colorCircle,
                    { backgroundColor: DEFAULT_DARK_PRIMARY },
                    primaryColor === null && styles.colorCircleSelected,
                  ]}
                  onPress={() => setPrimaryColor(null)}
                />
                {PRIMARY_COLOR_OPTIONS.map((hex) => (
                  <Pressable
                    key={hex}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: hex },
                      primaryColor === hex && styles.colorCircleSelected,
                    ]}
                    onPress={() => setPrimaryColor(hex)}
                  />
                ))}
              </View>
            </>
          )}
          <List.Subheader style={styles.colorSubheader}>
            {t("settings.language")}
          </List.Subheader>
          <View style={styles.languageRow}>
            <Button
              mode={currentLang === "ru" ? "contained" : "outlined"}
              compact
              onPress={() => handleLanguage("ru")}
              style={styles.langButton}
            >
              RU
            </Button>
            <Button
              mode={currentLang === "en" ? "contained" : "outlined"}
              compact
              onPress={() => handleLanguage("en")}
              style={styles.langButton}
            >
              EN
            </Button>
          </View>
        </List.Section>
        <List.Section>
          <List.Subheader>{t("settings.about")}</List.Subheader>
          <List.Item
            title={appName}
            description={t("settings.appDescription")}
          />
          <List.Item
            title={t("settings.version")}
            description={version}
          />
          <View style={styles.aboutText}>
            <Text variant="bodyMedium" style={styles.aboutBody}>
              {t("settings.aboutText")}
            </Text>
          </View>
        </List.Section>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  aboutText: { paddingHorizontal: 16, paddingVertical: 12 },
  aboutBody: { opacity: 0.8 },
  colorSubheader: { paddingLeft: 16, paddingTop: 8 },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorCircleSelected: {
    borderColor: "#fff",
    borderWidth: 3,
  },
  languageRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "center",
  },
  langButton: {
    minWidth: 64,
  },
});
