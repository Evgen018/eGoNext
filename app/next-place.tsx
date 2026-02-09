import { useRouter } from "expo-router";
import { View, StyleSheet } from "react-native";
import { Appbar, Text } from "react-native-paper";

export default function NextPlaceScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Следующее место" />
      </Appbar.Header>
      <View style={styles.content}>
        <Text variant="bodyLarge">Следующее место по маршруту</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: "center", alignItems: "center" },
});
