import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View, StyleSheet, FlatList, Pressable } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { Appbar, Text, Card, FAB } from "react-native-paper";
import { getAllPlaces } from "@/lib/db/places";
import type { Place } from "@/lib/db/types";

export default function PlacesScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPlaces = async () => {
    try {
      const data = await getAllPlaces(db);
      setPlaces(data);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPlaces();
    }, [])
  );

  const handleAdd = () => router.push("/places/add");

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Места" />
      </Appbar.Header>

      {loading ? (
        <View style={styles.center}>
          <Text>Загрузка...</Text>
        </View>
      ) : places.length === 0 ? (
        <View style={styles.center}>
          <Text variant="bodyLarge" style={styles.emptyText}>
            Нет мест. Нажмите + чтобы добавить.
          </Text>
        </View>
      ) : (
        <FlatList
          data={places}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable onPress={() => router.push(`/places/${item.id}`)}>
              <Card style={styles.card}>
                <Card.Content>
                  <Text variant="titleMedium">{item.name}</Text>
                  <Text variant="bodySmall" numberOfLines={2}>
                    {item.description || "Без описания"}
                  </Text>
                  {item.latitude != null && item.longitude != null && (
                    <Text variant="labelSmall" style={styles.coords}>
                      {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                    </Text>
                  )}
                </Card.Content>
              </Card>
            </Pressable>
          )}
        />
      )}

      <FAB icon="plus" style={styles.fab} onPress={handleAdd} label="Добавить" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  emptyText: { textAlign: "center" },
  list: { padding: 16, paddingBottom: 88 },
  card: { marginBottom: 12 },
  coords: { marginTop: 4, opacity: 0.7 },
  fab: { position: "absolute", right: 16, bottom: 16 },
});
