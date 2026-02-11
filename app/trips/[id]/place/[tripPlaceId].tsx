import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Image, Alert } from "react-native";
import { useDb } from "@/lib/db/DbProvider";
import {
  Appbar,
  Text,
  TextInput,
  Button,
  IconButton,
} from "react-native-paper";
import { getTripPlaceById } from "@/lib/db/tripPlaces";
import { getPlaceById } from "@/lib/db/places";
import { getPhotosByTripPlaceId } from "@/lib/db/tripPlacePhotos";
import { addTripPlacePhoto, deleteTripPlacePhoto } from "@/lib/db/tripPlacePhotos";
import {
  updateTripPlaceNotes,
  markTripPlaceVisited,
} from "@/lib/db/tripPlaces";
import { copyToAppStorage, generatePhotoFilename } from "@/lib/storage/photos";
import { deletePhotoFile } from "@/lib/storage/photos";
import { pickImageFromCameraOrGallery } from "@/lib/imagePicker";

export default function TripPlaceEditScreen() {
  const { id, tripPlaceId } = useLocalSearchParams<{ id: string; tripPlaceId: string }>();
  const router = useRouter();
  const db = useDb();
  const tpId = tripPlaceId ? parseInt(tripPlaceId, 10) : 0;

  const [placeName, setPlaceName] = useState("");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<{ id: number; uri: string }[]>([]);
  const [visited, setVisited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    if (!tpId || isNaN(tpId)) return;
    try {
      const tp = await getTripPlaceById(db, tpId);
      if (!tp) return;
      setVisited(tp.visited === 1);
      setNotes(tp.notes ?? "");
      const p = await getPlaceById(db, tp.placeId);
      setPlaceName(p?.name ?? "?");
      const phs = await getPhotosByTripPlaceId(db, tpId);
      setPhotos(phs.map((ph) => ({ id: ph.id, uri: ph.uri })));
    } catch (err) {
      Alert.alert("Ошибка", err instanceof Error ? err.message : "Не удалось загрузить данные.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tpId]);

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      await updateTripPlaceNotes(db, tpId, notes.trim() || null);
    } catch (err) {
      Alert.alert("Ошибка", err instanceof Error ? err.message : "Не удалось сохранить заметки.");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkVisited = async () => {
    try {
      await markTripPlaceVisited(db, tpId);
      setVisited(true);
    } catch (err) {
      Alert.alert("Ошибка", err instanceof Error ? err.message : "Не удалось отметить посещение.");
    }
  };

  const handlePickPhoto = async () => {
    const uri = await pickImageFromCameraOrGallery();
    if (!uri) return;
    try {
      const destUri = await copyToAppStorage(
        uri,
        generatePhotoFilename(`trip_${tpId}`)
      );
      await addTripPlacePhoto(db, tpId, destUri);
      loadData();
    } catch (err) {
      Alert.alert("Ошибка", err instanceof Error ? err.message : "Не удалось добавить фото.");
    }
  };

  const handleDeletePhoto = async (photoId: number, uri: string) => {
    try {
      await deleteTripPlacePhoto(db, photoId);
      await deletePhotoFile(uri);
      loadData();
    } catch (err) {
      Alert.alert("Ошибка", err instanceof Error ? err.message : "Не удалось удалить фото.");
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Место в поездке" />
        </Appbar.Header>
        <View style={styles.center}>
          <Text>Загрузка...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={placeName} />
      </Appbar.Header>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {!visited && (
          <Button mode="contained-tonal" onPress={handleMarkVisited}>
            Отметить посещённым
          </Button>
        )}

        <Text variant="labelMedium" style={styles.label}>
          Заметки
        </Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.input}
        />
        <Button mode="outlined" onPress={handleSaveNotes} loading={saving}>
          Сохранить заметки
        </Button>

        <Text variant="labelMedium" style={styles.label}>
          Фотографии
        </Text>
        <Button mode="outlined" onPress={handlePickPhoto}>
          Добавить фото
        </Button>
        {photos.length > 0 && (
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
  label: { marginTop: 16 },
  input: { marginTop: 8 },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  photoItem: { position: "relative" },
  photo: { width: 100, height: 100, borderRadius: 8 },
  photoDelete: { position: "absolute", top: -8, right: -8, margin: 0 },
});
