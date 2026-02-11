import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Linking } from "react-native";
import { useDb } from "@/lib/db/DbProvider";
import { Appbar, Text, Card, Button } from "react-native-paper";
import { getCurrentTrip } from "@/lib/db/trips";
import { getNextUnvisitedTripPlace } from "@/lib/db/tripPlaces";
import { getPlaceById } from "@/lib/db/places";
import type { Place } from "@/lib/db/types";

function openOnMap(lat: number, lng: number) {
  Linking.openURL(`https://www.google.com/maps?q=${lat},${lng}`);
}

function openNavigator(lat: number, lng: number) {
  Linking.openURL(
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`
  );
}

export default function NextPlaceScreen() {
  const router = useRouter();
  const db = useDb();
  const [place, setPlace] = useState<Place | null>(null);
  const [tripTitle, setTripTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [emptyReason, setEmptyReason] = useState<string | null>(null);

  const loadNextPlace = async () => {
    setLoading(true);
    setPlace(null);
    setTripTitle(null);
    setEmptyReason(null);
    try {
      const currentTrip = await getCurrentTrip(db);
      if (!currentTrip) {
        setEmptyReason("Нет активной поездки. Отметьте поездку как текущую в разделе «Поездки».");
        return;
      }
      setTripTitle(currentTrip.title);
      const nextTp = await getNextUnvisitedTripPlace(db, currentTrip.id);
      if (!nextTp) {
        setEmptyReason("Все места посещены. Маршрут завершён!");
        return;
      }
      const p = await getPlaceById(db, nextTp.placeId);
      setPlace(p ?? null);
      if (!p) {
        setEmptyReason("Место не найдено.");
      }
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadNextPlace();
    }, [])
  );

  const hasCoords = place?.latitude != null && place?.longitude != null;

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Следующее место" />
      </Appbar.Header>

      <View style={styles.content}>
        {loading ? (
          <Text>Загрузка...</Text>
        ) : emptyReason ? (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.emptyTitle}>
                Нет следующего места
              </Text>
              <Text variant="bodyMedium" style={styles.emptyText}>
                {emptyReason}
              </Text>
            </Card.Content>
          </Card>
        ) : place ? (
          <Card style={styles.card}>
            <Card.Content>
              {tripTitle && (
                <Text variant="labelSmall" style={styles.tripLabel}>
                  {tripTitle}
                </Text>
              )}
              <Text variant="titleLarge">{place.name}</Text>
              <Text variant="bodyMedium" style={styles.desc}>
                {place.description || "—"}
              </Text>
              {hasCoords && (
                <Text variant="labelSmall" style={styles.coords}>
                  {place.latitude!.toFixed(4)}, {place.longitude!.toFixed(4)}
                </Text>
              )}
              {hasCoords && (
                <View style={styles.buttons}>
                  <Button
                    mode="contained-tonal"
                    onPress={() => openOnMap(place.latitude!, place.longitude!)}
                  >
                    Открыть на карте
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => openNavigator(place.latitude!, place.longitude!)}
                  >
                    Маршрут
                  </Button>
                </View>
              )}
              {!hasCoords && (
                <Text variant="bodySmall" style={styles.muted}>
                  Координаты не заданы. Добавьте их в карточке места для навигации.
                </Text>
              )}
            </Card.Content>
          </Card>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "stretch",
  },
  card: { marginBottom: 16 },
  tripLabel: { opacity: 0.7, marginBottom: 4 },
  desc: { marginTop: 8 },
  coords: { marginTop: 8, opacity: 0.7 },
  buttons: { marginTop: 16, gap: 12 },
  emptyTitle: { marginBottom: 8 },
  emptyText: { opacity: 0.8 },
  muted: { marginTop: 12, opacity: 0.7 },
});
