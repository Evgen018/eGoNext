import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { View, StyleSheet, ScrollView } from "react-native";
import { Appbar, List, Divider, Text } from "react-native-paper";

const appName = Constants.expoConfig?.name ?? "GoNext";
const version = Constants.expoConfig?.version ?? "1.0.0";

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Настройки" />
      </Appbar.Header>
      <ScrollView style={styles.scroll}>
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
});
