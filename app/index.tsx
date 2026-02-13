import { useRouter } from "expo-router";
import { View, StyleSheet } from "react-native";
import { Appbar, Button } from "react-native-paper";
import { useTranslation } from "react-i18next";

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title={t("home.title")} />
      </Appbar.Header>

      <View style={styles.content}>
        <Button
          mode="contained"
          onPress={() => router.push("/places")}
          style={styles.button}
        >
          {t("home.places")}
        </Button>
        <Button
          mode="contained"
          onPress={() => router.push("/trips")}
          style={styles.button}
        >
          {t("home.trips")}
        </Button>
        <Button
          mode="contained"
          onPress={() => router.push("/next-place")}
          style={styles.button}
        >
          {t("home.nextPlace")}
        </Button>
        <Button
          mode="contained"
          onPress={() => router.push("/stats")}
          style={styles.button}
        >
          {t("home.stats")}
        </Button>
        <Button
          mode="contained"
          onPress={() => router.push("/settings")}
          style={styles.button}
        >
          {t("home.settings")}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    padding: 24,
  },
  button: {
    alignSelf: "center",
    minWidth: 0,
  },
});
