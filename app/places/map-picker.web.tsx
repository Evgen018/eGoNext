import { useRouter } from "expo-router";
import { View, StyleSheet } from "react-native";
import { Appbar, Text } from "react-native-paper";

/** Web-версия: react-native-maps не поддерживает web, показываем подсказку. */
export default function MapPickerScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Выбор на карте" />
      </Appbar.Header>
      <View style={styles.center}>
        <Text variant="bodyLarge" style={styles.webMessage}>
          Выбор точки на карте доступен в мобильном приложении (Android/iOS).
          {"\n\n"}
          Используйте «Текущая позиция» или введите координаты вручную.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  webMessage: { textAlign: "center", opacity: 0.8 },
});
