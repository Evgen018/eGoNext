import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Image, Linking, Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useDb } from "@/lib/db/DbProvider";
import {
  Appbar,
  Text,
  Card,
  Button,
  IconButton,
  Divider,
} from "react-native-paper";
import { getPlaceById } from "@/lib/db/places";
import { getPhotosByPlaceId } from "@/lib/db/placePhotos";
import { deletePlace } from "@/lib/db/places";
import { deletePlacePhoto } from "@/lib/db/placePhotos";
import { deletePhotoFile } from "@/lib/storage/photos";
import type { Place } from "@/lib/db/types";
import type { PlacePhoto } from "@/lib/db/types";

function openMap(lat: number, lng: number) {
  const url = `https://www.google.com/maps?q=${lat},${lng}`;
  Linking.openURL(url);
}

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const db = useDb();
  const [place, setPlace] = useState<Place | null>(null);
  const [photos, setPhotos] = useState<PlacePhoto[]>([]);
  const [loading, setLoading] = useState(true);

  const placeId = id ? parseInt(id, 10) : 0;

  const loadData = async () => {
    if (!placeId || isNaN(placeId)) return;
    try {
      const [p, ph] = await Promise.all([
        getPlaceById(db, placeId),
        getPhotosByPlaceId(db, placeId),
      ]);
      setPlace(p ?? null);
      setPhotos(ph);
    } catch (err) {
      Alert.alert(t("common.error"), err instanceof Error ? err.message : t("places.loadPlaceError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [placeId]);

  const handleOpenMap = () => {
    if (place?.latitude != null && place?.longitude != null) {
      openMap(place.latitude, place.longitude);
    }
  };

  const handleDeletePhoto = async (photoId: number, uri: string) => {
    try {
      await deletePlacePhoto(db, photoId);
      await deletePhotoFile(uri);
      loadData();
    } catch (err) {
      Alert.alert(t("common.error"), err instanceof Error ? err.message : t("places.deletePhotoError"));
    }
  };

  const handleEdit = () => router.push(`/places/${placeId}/edit`);

  const handleDelete = () => {
    Alert.alert(t("places.deletePlaceConfirm"), t("places.deletePlaceMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await deletePlace(db, placeId);
            for (const p of photos) await deletePhotoFile(p.uri);
            router.replace("/places");
          } catch (err) {
            Alert.alert(t("common.error"), err instanceof Error ? err.message : t("places.deletePlaceError"));
          }
        },
      },
    ]);
  };

  const handleAddPhoto = () => router.push(`/places/${placeId}/add-photo`);

  if (loading || !place) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title={t("places.place")} />
        </Appbar.Header>
        <View style={styles.center}>
          <Text>{loading ? t("common.loading") : t("places.placeNotFound")}</Text>
        </View>
      </View>
    );
  }

  const hasCoords = place.latitude != null && place.longitude != null;

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={place.name} />
        <Appbar.Action icon="pencil" onPress={handleEdit} />
        <Appbar.Action icon="delete" onPress={handleDelete} />
      </Appbar.Header>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Card>
          <Card.Content>
            <Text variant="titleLarge">{place.name}</Text>
            <Text variant="bodyMedium" style={styles.desc}>
              {place.description || "—"}
            </Text>
            <View style={styles.row}>
              <Text variant="labelMedium">Посетить позже:</Text>
              <Text>{place.visitlater ? t("common.yes") : t("common.no")}</Text>
            </View>
            <View style={styles.row}>
              <Text variant="labelMedium">Понравилось:</Text>
              <Text>{place.liked ? t("common.yes") : t("common.no")}</Text>
            </View>
            {hasCoords && (
              <View style={styles.row}>
                <Text variant="labelMedium">Координаты:</Text>
                <Text>
                  {place.latitude!.toFixed(4)}, {place.longitude!.toFixed(4)}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {hasCoords && (
          <Button mode="contained-tonal" onPress={handleOpenMap}>
            Открыть на карте
          </Button>
        )}

        <Divider style={styles.divider} />
        <View style={styles.photoHeader}>
          <Text variant="titleMedium">{t("places.photos")}</Text>
          <IconButton icon="plus" size={24} onPress={handleAddPhoto} />
        </View>
        {photos.length === 0 ? (
          <Text variant="bodySmall" style={styles.muted}>
            {t("places.noPhotos")}
          </Text>
        ) : (
          <View style={styles.photoGrid}>
            {photos.map((p) => (
              <View key={p.id} style={styles.photoItem}>
                <Image source={{ uri: p.uri }} style={styles.photo} />
                <IconButton
                  icon="delete"
                  size={20}
                  onPress={() => handleDeletePhoto(p.id, p.uri)}
                  style={styles.photoDelete}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  desc: { marginTop: 8 },
  row: { flexDirection: "row", gap: 8, marginTop: 4 },
  divider: { marginVertical: 16 },
  photoHeader: { flexDirection: "row", alignItems: "center" },
  muted: { opacity: 0.6, marginTop: 8 },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  photoItem: { position: "relative" },
  photo: { width: 100, height: 100, borderRadius: 8 },
  photoDelete: { position: "absolute", top: -8, right: -8, margin: 0 },
});
