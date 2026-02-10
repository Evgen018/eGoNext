import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View, StyleSheet, FlatList, Pressable } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { Appbar, Text, Card, FAB } from "react-native-paper";
import { getAllTrips } from "@/lib/db/trips";
import type { Trip } from "@/lib/db/types";

export default function TripsScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTrips = async () => {
    try {
      const data = await getAllTrips(db);
      setTrips(data);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTrips();
    }, [])
  );

  const handleAdd = () => router.push("/trips/add");

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Поездки" />
      </Appbar.Header>

      {loading ? (
        <View style={styles.center}>
          <Text>Загрузка...</Text>
        </View>
      ) : trips.length === 0 ? (
        <View style={styles.center}>
          <Text variant="bodyLarge" style={styles.emptyText}>
            Нет поездок. Нажмите + чтобы создать.
          </Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable onPress={() => router.push(`/trips/${item.id}`)}>
              <Card style={styles.card}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Text variant="titleMedium">{item.title}</Text>
                    {item.current === 1 && (
                      <Text variant="labelSmall" style={styles.currentBadge}>
                        Текущая
                      </Text>
                    )}
                  </View>
                  <Text variant="bodySmall">
                    {item.startDate} — {item.endDate}
                  </Text>
                  {item.description ? (
                    <Text variant="bodySmall" numberOfLines={2} style={styles.desc}>
                      {item.description}
                    </Text>
                  ) : null}
                </Card.Content>
              </Card>
            </Pressable>
          )}
        />
      )}

      <FAB icon="plus" style={styles.fab} onPress={handleAdd} label="Создать" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  emptyText: { textAlign: "center" },
  list: { padding: 16, paddingBottom: 88 },
  card: { marginBottom: 12 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  currentBadge: { color: "#6200ee" },
  desc: { marginTop: 4, opacity: 0.8 },
  fab: { position: "absolute", right: 16, bottom: 16 },
});
