import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import {
  Appbar,
  Text,
  Card,
  Button,
  IconButton,
  Chip,
} from "react-native-paper";
import { getTripById, updateTrip, setCurrentTrip, deleteTrip } from "@/lib/db/trips";
import {
  getTripPlacesByTripId,
  swapTripPlaceOrder,
  markTripPlaceVisited,
  deleteTripPlace,
} from "@/lib/db/tripPlaces";
import { getPlaceById } from "@/lib/db/places";
import { getPhotosByTripPlaceId } from "@/lib/db/tripPlacePhotos";
import { deletePhotoFile } from "@/lib/storage/photos";
import type { Trip, TripPlace } from "@/lib/db/types";

type TripPlaceWithPlace = TripPlace & { placeName: string };

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const db = useSQLiteContext();
  const tripId = id ? parseInt(id, 10) : 0;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [tripPlaces, setTripPlaces] = useState<TripPlaceWithPlace[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!tripId || isNaN(tripId)) return;
    try {
      const t = await getTripById(db, tripId);
      setTrip(t ?? null);
      const tps = await getTripPlacesByTripId(db, tripId);
      const withNames: TripPlaceWithPlace[] = await Promise.all(
        tps.map(async (tp) => {
          const p = await getPlaceById(db, tp.placeId);
          return { ...tp, placeName: p?.name ?? "?" };
        })
      );
      setTripPlaces(withNames);
    } catch (err) {
      Alert.alert("Ошибка", err instanceof Error ? err.message : "Не удалось загрузить поездку.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tripId]);

  const handleSetCurrent = async () => {
    try {
      await setCurrentTrip(db, tripId);
      loadData();
    } catch (err) {
      Alert.alert("Ошибка", err instanceof Error ? err.message : "Не удалось установить текущую поездку.");
    }
  };

  const handleDelete = () => {
    Alert.alert("Удалить поездку?", "Все данные о маршруте будут удалены.", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Удалить",
        style: "destructive",
        onPress: async () => {
          try {
            const tps = await getTripPlacesByTripId(db, tripId);
            for (const tp of tps) {
              const phs = await getPhotosByTripPlaceId(db, tp.id);
              for (const ph of phs) await deletePhotoFile(ph.uri);
            }
            await deleteTrip(db, tripId);
            router.replace("/trips");
          } catch (err) {
            Alert.alert("Ошибка", err instanceof Error ? err.message : "Не удалось удалить поездку.");
          }
        },
      },
    ]);
  };

  const handleAddPlace = () => router.push(`/trips/${tripId}/add-place`);

  const handleMoveUp = async (tp: TripPlaceWithPlace) => {
    try {
      await swapTripPlaceOrder(db, tp.id, "up");
      loadData();
    } catch (err) {
      Alert.alert("Ошибка", err instanceof Error ? err.message : "Не удалось изменить порядок.");
    }
  };

  const handleMoveDown = async (tp: TripPlaceWithPlace) => {
    try {
      await swapTripPlaceOrder(db, tp.id, "down");
      loadData();
    } catch (err) {
      Alert.alert("Ошибка", err instanceof Error ? err.message : "Не удалось изменить порядок.");
    }
  };

  const handleMarkVisited = async (tp: TripPlaceWithPlace) => {
    try {
      await markTripPlaceVisited(db, tp.id);
      loadData();
    } catch (err) {
      Alert.alert("Ошибка", err instanceof Error ? err.message : "Не удалось отметить посещение.");
    }
  };

  const handleRemovePlace = (tp: TripPlaceWithPlace) => {
    Alert.alert("Убрать место?", `Удалить "${tp.placeName}" из маршрута?`, [
      { text: "Отмена", style: "cancel" },
      {
        text: "Убрать",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTripPlace(db, tp.id);
            loadData();
          } catch (err) {
            Alert.alert("Ошибка", err instanceof Error ? err.message : "Не удалось убрать место.");
          }
        },
      },
    ]);
  };

  const handleEditPlace = (tp: TripPlaceWithPlace) =>
    router.push(`/trips/${tripId}/place/${tp.id}`);

  if (loading || !trip) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Поездка" />
        </Appbar.Header>
        <View style={styles.center}>
          <Text>{loading ? "Загрузка..." : "Поездка не найдена"}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={trip.title} />
        <Appbar.Action icon="star" onPress={handleSetCurrent} />
        <Appbar.Action icon="delete" onPress={handleDelete} />
      </Appbar.Header>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Card>
          <Card.Content>
            <Text variant="titleMedium">{trip.title}</Text>
            <Text variant="bodySmall">
              {trip.startDate} — {trip.endDate}
            </Text>
            {trip.current === 1 && (
              <Chip style={styles.chip}>Текущая поездка</Chip>
            )}
            {trip.description ? (
              <Text variant="bodyMedium" style={styles.desc}>
                {trip.description}
              </Text>
            ) : null}
          </Card.Content>
        </Card>

        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text variant="titleMedium">Маршрут</Text>
            <Button mode="outlined" compact onPress={handleAddPlace}>
              Добавить место
            </Button>
          </View>

          {tripPlaces.length === 0 ? (
            <Text variant="bodySmall" style={styles.muted}>
              Нет мест в маршруте
            </Text>
          ) : (
            tripPlaces.map((tp, idx) => (
              <Card key={tp.id} style={styles.placeCard}>
                <Card.Content>
                  <View style={styles.placeRow}>
                    <Text variant="labelLarge" style={styles.order}>
                      {idx + 1}.
                    </Text>
                    <View style={styles.placeMain}>
                      <Text variant="titleSmall">{tp.placeName}</Text>
                      {tp.visited ? (
                        <Text variant="labelSmall" style={styles.visited}>
                          Посещено: {tp.visitDate ?? "—"}
                        </Text>
                      ) : null}
                      {tp.notes ? (
                        <Text variant="bodySmall" numberOfLines={2}>
                          {tp.notes}
                        </Text>
                      ) : null}
                    </View>
                    <View style={styles.placeActions}>
                      <IconButton
                        icon="chevron-up"
                        size={20}
                        onPress={() => handleMoveUp(tp)}
                        disabled={idx === 0}
                      />
                      <IconButton
                        icon="chevron-down"
                        size={20}
                        onPress={() => handleMoveDown(tp)}
                        disabled={idx === tripPlaces.length - 1}
                      />
                      {!tp.visited && (
                        <IconButton
                          icon="check"
                          size={20}
                          onPress={() => handleMarkVisited(tp)}
                        />
                      )}
                      <IconButton
                        icon="pencil"
                        size={20}
                        onPress={() => handleEditPlace(tp)}
                      />
                      <IconButton
                        icon="close"
                        size={20}
                        onPress={() => handleRemovePlace(tp)}
                      />
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  chip: { marginTop: 8, alignSelf: "flex-start" },
  desc: { marginTop: 8 },
  section: { marginTop: 24 },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  muted: { opacity: 0.6 },
  placeCard: { marginBottom: 8 },
  placeRow: { flexDirection: "row", alignItems: "flex-start" },
  order: { width: 28, marginRight: 8 },
  placeMain: { flex: 1 },
  visited: { color: "#4CAF50", marginTop: 2 },
  placeActions: { flexDirection: "row" },
});
