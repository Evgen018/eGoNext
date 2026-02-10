import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Pressable } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { Appbar, Text, Card } from "react-native-paper";
import { getAllPlaces } from "@/lib/db/places";
import { getTripPlacesByTripId } from "@/lib/db/tripPlaces";
import { insertTripPlace } from "@/lib/db/tripPlaces";
import type { Place } from "@/lib/db/types";

export default function AddPlaceToTripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const db = useSQLiteContext();
  const tripId = id ? parseInt(id, 10) : 0;

  const [places, setPlaces] = useState<Place[]>([]);
  const [alreadyIds, setAlreadyIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!tripId || isNaN(tripId)) return;
    const load = async () => {
      const [allPlaces, tps] = await Promise.all([
        getAllPlaces(db),
        getTripPlacesByTripId(db, tripId),
      ]);
      setPlaces(allPlaces);
      setAlreadyIds(new Set(tps.map((t) => t.placeId)));
    };
    load();
  }, [tripId]);

  const handleSelect = async (place: Place) => {
    if (alreadyIds.has(place.id)) return;
    await insertTripPlace(db, { tripId, placeId: place.id });
    setAlreadyIds((prev) => new Set([...prev, place.id]));
    router.back();
  };

  const available = places.filter((p) => !alreadyIds.has(p.id));

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Добавить место" />
      </Appbar.Header>

      {available.length === 0 ? (
        <View style={styles.center}>
          <Text variant="bodyLarge">
            {places.length === 0
              ? "Нет мест. Создайте место в разделе «Места»."
              : "Все места уже добавлены в поездку."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={available}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable onPress={() => handleSelect(item)}>
              <Card style={styles.card}>
                <Card.Content>
                  <Text variant="titleMedium">{item.name}</Text>
                  <Text variant="bodySmall" numberOfLines={1}>
                    {item.description || "—"}
                  </Text>
                </Card.Content>
              </Card>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  list: { padding: 16 },
  card: { marginBottom: 8 },
});
