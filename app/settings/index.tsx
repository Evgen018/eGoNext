import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { Appbar, List, Text, Switch } from "react-native-paper";
import { useThemeContext, PRIMARY_COLOR_OPTIONS } from "@/lib/theme-context";
import { MD3DarkTheme } from "react-native-paper";

const appName = Constants.expoConfig?.name ?? "GoNext";
const version = Constants.expoConfig?.version ?? "1.0.0";

const DEFAULT_DARK_PRIMARY = MD3DarkTheme.colors.primary;

export default function SettingsScreen() {
  const router = useRouter();
  const { isDark, setColorScheme, primaryColor, setPrimaryColor } = useThemeContext();

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Настройки" />
      </Appbar.Header>
      <ScrollView style={styles.scroll}>
        <List.Section>
          <List.Subheader>Внешний вид</List.Subheader>
          <List.Item
            title="Тёмная тема"
            description={isDark ? "Включена" : "Выключена"}
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
                Основной цвет (тёмная тема)
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
        </List.Section>
        <List.Section>
          <List.Subheader>О приложении</List.Subheader>
          <List.Item
            title={appName}
            description="Дневник туриста"
          />
          <List.Item
            title="Версия"
            description={version}
          />
          <View style={styles.aboutText}>
            <Text variant="bodyMedium" style={styles.aboutBody}>
              Планирование поездок и ведение дневника. Работает полностью офлайн.
              Данные хранятся локально на устройстве.
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
});
