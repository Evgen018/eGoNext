import { useRouter } from "expo-router";
import { View, StyleSheet } from "react-native";
import { Appbar, Text } from "react-native-paper";

export default function TripsScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Поездки" />
      </Appbar.Header>
      <View style={styles.content}>
        <Text variant="bodyLarge">Список поездок</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: "center", alignItems: "center" },
});
