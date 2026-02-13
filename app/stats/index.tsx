import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { useDb } from "@/lib/db/DbProvider";
import { Appbar, Text, Card, List, Divider } from "react-native-paper";
import { getStats, getTopVisitedPlaces } from "@/lib/db/stats";
import type { StatsResult, TopVisitedPlace } from "@/lib/db/stats";

export default function StatsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const db = useDb();
  const [stats, setStats] = useState<StatsResult | null>(null);
  const [topPlaces, setTopPlaces] = useState<TopVisitedPlace[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [s, top] = await Promise.all([getStats(db), getTopVisitedPlaces(db)]);
      setStats(s);
      setTopPlaces(top);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t("stats.title")} />
      </Appbar.Header>

      {loading ? (
        <View style={styles.center}>
          <Text>{t("common.loading")}</Text>
        </View>
      ) : stats ? (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t("stats.periodAll")}
          </Text>
          <View style={styles.cardsRow}>
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="headlineMedium" style={styles.number}>
                  {stats.tripsTotal}
                </Text>
                <Text variant="bodyMedium">{t("stats.trips")}</Text>
              </Card.Content>
            </Card>
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="headlineMedium" style={styles.number}>
                  {stats.placesTotal}
                </Text>
                <Text variant="bodyMedium">{t("stats.places")}</Text>
              </Card.Content>
            </Card>
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="headlineMedium" style={styles.number}>
                  {stats.photosTotal}
                </Text>
                <Text variant="bodyMedium">{t("stats.photos")}</Text>
              </Card.Content>
            </Card>
          </View>

          {stats.tripsLastYear > 0 && (
            <Text variant="bodyMedium" style={styles.lastYear}>
              {t("stats.tripsLastYear", { count: stats.tripsLastYear })}
            </Text>
          )}

          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t("stats.topVisited")}
          </Text>
          {topPlaces.length === 0 ? (
            <Text variant="bodyMedium" style={styles.emptyText}>
              {t("stats.topVisitedEmpty")}
            </Text>
          ) : (
            <Card style={styles.listCard}>
              {topPlaces.map((item, index) => (
                <Pressable
                  key={item.placeId}
                  onPress={() => router.push(`/places/${item.placeId}`)}
                  style={({ pressed }) => [pressed && styles.pressed]}
                >
                  <List.Item
                    title={item.name}
                    description={t("stats.visitsCount", { count: item.visitCount })}
                    left={(props) => (
                      <List.Icon {...props} icon="map-marker" style={styles.listIcon} />
                    )}
                    right={() => (
                      <View style={styles.badge}>
                        <Text variant="labelMedium">#{index + 1}</Text>
                      </View>
                    )}
                  />
                  {index < topPlaces.length - 1 && <Divider />}
                </Pressable>
              ))}
            </Card>
          )}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  sectionTitle: { marginBottom: 12 },
  cardsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  card: { flex: 1, minWidth: 90 },
  number: { fontWeight: "700" },
  lastYear: { opacity: 0.8, marginBottom: 24 },
  listCard: { overflow: "hidden" },
  listIcon: { marginLeft: 8 },
  badge: {
    justifyContent: "center",
    paddingRight: 16,
    opacity: 0.7,
  },
  emptyText: { opacity: 0.8, paddingVertical: 8 },
  pressed: { opacity: 0.7 },
});
