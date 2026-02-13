import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Pressable, Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useDb } from "@/lib/db/DbProvider";
import { Appbar, Text, Card, FAB } from "react-native-paper";
import { getAllPlaces } from "@/lib/db/places";
import { getTripPlacesByTripId } from "@/lib/db/tripPlaces";
import { insertTripPlace } from "@/lib/db/tripPlaces";
import type { Place } from "@/lib/db/types";

export default function AddPlaceToTripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const db = useDb();
  const tripId = id ? parseInt(id, 10) : 0;

  const [places, setPlaces] = useState<Place[]>([]);
  const [alreadyIds, setAlreadyIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!tripId || isNaN(tripId)) return;
    const load = async () => {
      try {
        const [allPlaces, tps] = await Promise.all([
          getAllPlaces(db),
          getTripPlacesByTripId(db, tripId),
        ]);
        setPlaces(allPlaces);
        setAlreadyIds(new Set(tps.map((t) => t.placeId)));
      } catch (err) {
        Alert.alert(t("common.error"), err instanceof Error ? err.message : t("trips.loadDataError"));
      }
    };
    load();
  }, [tripId]);

  const handleCreateNew = () => {
    router.push(`/places/add?tripId=${tripId}`);
  };

  const handleSelect = async (place: Place) => {
    if (alreadyIds.has(place.id)) return;
    try {
      await insertTripPlace(db, { tripId, placeId: place.id });
      setAlreadyIds((prev) => new Set([...prev, place.id]));
      router.back();
    } catch (err) {
      Alert.alert(t("common.error"), err instanceof Error ? err.message : t("trips.addPlaceError"));
    }
  };

  const available = places.filter((p) => !alreadyIds.has(p.id));

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t("trips.addPlaceToTrip")} />
      </Appbar.Header>

      {available.length === 0 ? (
        <View style={styles.center}>
          <Text variant="bodyLarge" style={styles.emptyText}>
            {places.length === 0
              ? t("trips.noPlacesCreateNew")
              : t("trips.allPlacesAdded")}
          </Text>
          <FAB
            icon="plus"
            label={t("trips.createNewPlace")}
            onPress={handleCreateNew}
            style={styles.fabInCenter}
          />
        </View>
      ) : (
        <>
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
                      {item.description || t("places.noDescription")}
                    </Text>
                  </Card.Content>
                </Card>
              </Pressable>
            )}
          />
          <FAB
            icon="plus"
            label={t("trips.createNewPlace")}
            onPress={handleCreateNew}
            style={styles.fab}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  emptyText: { textAlign: "center", marginBottom: 16 },
  list: { padding: 16, paddingBottom: 88 },
  card: { marginBottom: 8 },
  fab: { position: "absolute", right: 16, bottom: 16 },
  fabInCenter: { marginTop: 8 },
});
