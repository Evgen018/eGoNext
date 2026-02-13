import Constants from "expo-constants";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { Appbar, List, Text, Switch, Button, ActivityIndicator } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useThemeContext, PRIMARY_COLOR_OPTIONS } from "@/lib/theme-context";
import { MD3DarkTheme } from "react-native-paper";
import { changeAppLanguage, type SupportedLanguage } from "@/lib/i18n";
import { useDb } from "@/lib/db/DbProvider";
import {
  createBackupFile,
  readBackupFile,
  importFromBackupData,
} from "@/lib/backup";

const appName = Constants.expoConfig?.name ?? "GoNext";
const version = Constants.expoConfig?.version ?? "1.0.0";

const DEFAULT_DARK_PRIMARY = MD3DarkTheme.colors.primary;

export default function SettingsScreen() {
  const router = useRouter();
  const db = useDb();
  const { t, i18n } = useTranslation();
  const { isDark, setColorScheme, primaryColor, setPrimaryColor } = useThemeContext();
  const currentLang = (i18n.language === "en" ? "en" : "ru") as SupportedLanguage;
  const [backupBusy, setBackupBusy] = useState(false);

  const handleLanguage = (lang: SupportedLanguage) => {
    changeAppLanguage(lang);
  };

  const handleExport = async () => {
    setBackupBusy(true);
    try {
      const fileUri = await createBackupFile(db);
      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/json",
          dialogTitle: t("backup.share"),
        });
        Alert.alert(t("common.done"), t("backup.exportSuccess"));
      } else {
        Alert.alert(t("common.done"), t("backup.exportSuccess"));
      }
    } catch (err) {
      Alert.alert(
        t("common.error"),
        err instanceof Error ? err.message : t("backup.exportError")
      );
    } finally {
      setBackupBusy(false);
    }
  };

  const handleImport = () => {
    Alert.alert(
      t("backup.import"),
      t("backup.importConfirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.yes"),
          onPress: async () => {
            setBackupBusy(true);
            try {
              const result = await DocumentPicker.getDocumentAsync({
                type: "application/json",
                copyToCacheDirectory: true,
              });
              if (result.canceled || !result.assets?.[0]) return;
              const uri = result.assets[0].uri;
              const data = await readBackupFile(uri);
              await importFromBackupData(db, data);
              Alert.alert(t("common.done"), t("backup.importSuccess"));
            } catch (err) {
              const msg =
                err instanceof Error && err.message.includes("Invalid")
                  ? t("backup.importInvalidFile")
                  : err instanceof Error
                    ? err.message
                    : t("backup.importError");
              Alert.alert(t("common.error"), msg);
            } finally {
              setBackupBusy(false);
            }
          },
        },
      ]
    );
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
          <List.Subheader>{t("backup.title")}</List.Subheader>
          <List.Item
            title={t("backup.export")}
            description={t("backup.exportDescription")}
            left={(props) => <List.Icon {...props} icon="export" />}
            right={() =>
              backupBusy ? (
                <ActivityIndicator size="small" style={styles.backupSpinner} />
              ) : (
                <Button mode="contained-tonal" compact onPress={handleExport}>
                  {t("backup.share")}
                </Button>
              )
            }
            onPress={backupBusy ? undefined : handleExport}
            disabled={backupBusy}
          />
          <List.Item
            title={t("backup.import")}
            description={t("backup.importDescription")}
            left={(props) => <List.Icon {...props} icon="import" />}
            right={() =>
              backupBusy ? (
                <ActivityIndicator size="small" style={styles.backupSpinner} />
              ) : null
            }
            onPress={backupBusy ? undefined : handleImport}
            disabled={backupBusy}
          />
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
  backupSpinner: {
    marginRight: 8,
  },
});
