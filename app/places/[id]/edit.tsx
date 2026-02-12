import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Alert, Image } from "react-native";
import { useDb } from "@/lib/db/DbProvider";
import { Appbar, TextInput, Button, Switch, Text, IconButton } from "react-native-paper";
import { getPlaceById, updatePlace } from "@/lib/db/places";
import { getCurrentCoords } from "@/lib/location";
import { getPhotosByPlaceId, addPlacePhoto, deletePlacePhoto } from "@/lib/db/placePhotos";
import { copyToAppStorage, generatePhotoFilename, deletePhotoFile } from "@/lib/storage/photos";
import { pickImageFromCameraOrGallery } from "@/lib/imagePicker";
import { useMapPicker } from "@/lib/MapPickerContext";
import type { PlacePhoto } from "@/lib/db/types";

export default function EditPlaceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const db = useDb();
  const placeId = id ? parseInt(id, 10) : 0;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visitlater, setVisitlater] = useState(true);
  const [liked, setLiked] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [existingPhotos, setExistingPhotos] = useState<PlacePhoto[]>([]);
  const [newPhotoUris, setNewPhotoUris] = useState<string[]>([]);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const { consumeResult } = useMapPicker();

  useFocusEffect(
    useCallback(() => {
      const result = consumeResult();
      if (result) {
        setLatitude(result.latitude.toFixed(6));
        setLongitude(result.longitude.toFixed(6));
      }
    }, [consumeResult])
  );

  const handlePickOnMap = () => {
    router.push("/places/map-picker");
  };

  const handleGetLocation = async () => {
    setLoadingLoc(true);
    try {
      const coords = await getCurrentCoords();
      if (coords) {
        setLatitude(coords.latitude.toFixed(6));
        setLongitude(coords.longitude.toFixed(6));
      } else {
        Alert.alert(
          "Доступ запрещён",
          "Разрешите доступ к геолокации в настройках приложения."
        );
      }
    } finally {
      setLoadingLoc(false);
    }
  };

  useEffect(() => {
    if (!placeId || isNaN(placeId)) return;
    Promise.all([getPlaceById(db, placeId), getPhotosByPlaceId(db, placeId)])
      .then(([p, photos]) => {
        if (p) {
          setName(p.name);
          setDescription(p.description);
          setVisitlater(p.visitlater === 1);
          setLiked(p.liked === 1);
          setLatitude(p.latitude != null ? String(p.latitude) : "");
          setLongitude(p.longitude != null ? String(p.longitude) : "");
        }
        setExistingPhotos(photos);
        setLoading(false);
      })
      .catch((err) => {
        Alert.alert("Ошибка", err instanceof Error ? err.message : "Не удалось загрузить место.");
        setLoading(false);
      });
  }, [placeId]);

  const pickImage = async () => {
    const uri = await pickImageFromCameraOrGallery();
    if (uri) {
      setNewPhotoUris((prev) => [...prev, uri]);
    }
  };

  const handleDeleteExistingPhoto = async (photoId: number, uri: string) => {
    try {
      await deletePlacePhoto(db, photoId);
      await deletePhotoFile(uri);
      setExistingPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } catch (err) {
      Alert.alert("Ошибка", err instanceof Error ? err.message : "Не удалось удалить фото.");
    }
  };

  const handleRemoveNewPhoto = (index: number) => {
    setNewPhotoUris((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const lat = latitude ? parseFloat(latitude) : null;
      const lng = longitude ? parseFloat(longitude) : null;
      await updatePlace(db, placeId, {
        name: name.trim(),
        description: description.trim(),
        visitlater,
        liked,
        latitude: Number.isNaN(lat) ? null : lat,
        longitude: Number.isNaN(lng) ? null : lng,
      });
      const existingPhotos = await getPhotosByPlaceId(db, placeId);
      const maxOrder = existingPhotos.length
        ? Math.max(...existingPhotos.map((p) => p.sortOrder))
        : -1;
      const nextOrder = maxOrder + 1;
      for (let i = 0; i < newPhotoUris.length; i++) {
        const destUri = await copyToAppStorage(
          newPhotoUris[i],
          generatePhotoFilename(`place_${placeId}`)
        );
        await addPlacePhoto(db, placeId, destUri, nextOrder + i);
      }
      router.replace(`/places/${placeId}`);
    } catch (err) {
      Alert.alert("Ошибка", err instanceof Error ? err.message : "Не удалось сохранить изменения.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Редактирование" />
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
        <Appbar.Content title="Редактировать место" />
      </Appbar.Header>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <TextInput
          label="Название *"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Описание"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />
        <View style={styles.row}>
          <Text>Посетить позже</Text>
          <Switch value={visitlater} onValueChange={setVisitlater} />
        </View>
        <View style={styles.row}>
          <Text>Понравилось</Text>
          <Switch value={liked} onValueChange={setLiked} />
        </View>
        <Button
          mode="outlined"
          icon="map-marker"
          onPress={handleGetLocation}
          loading={loadingLoc}
          style={styles.input}
        >
          Текущая позиция
        </Button>
        <Button
          mode="outlined"
          icon="map-marker-outline"
          onPress={handlePickOnMap}
          style={styles.input}
        >
          Выбрать на карте
        </Button>
        <TextInput
          label="Широта"
          value={latitude}
          onChangeText={setLatitude}
          mode="outlined"
          keyboardType="decimal-pad"
          style={styles.input}
        />
        <TextInput
          label="Долгота"
          value={longitude}
          onChangeText={setLongitude}
          mode="outlined"
          keyboardType="decimal-pad"
          style={styles.input}
        />
        <Text variant="titleMedium" style={styles.photoSectionTitle}>
          Фотографии
        </Text>
        {existingPhotos.length > 0 && (
          <View style={styles.photoGrid}>
            {existingPhotos.map((p) => (
              <View key={p.id} style={styles.photoItem}>
                <Image source={{ uri: p.uri }} style={styles.photo} />
                <IconButton
                  icon="delete"
                  size={20}
                  onPress={() => handleDeleteExistingPhoto(p.id, p.uri)}
                  style={styles.photoDelete}
                />
              </View>
            ))}
          </View>
        )}
        {newPhotoUris.length > 0 && (
          <View style={styles.photoGrid}>
            {newPhotoUris.map((uri, index) => (
              <View key={`new-${index}`} style={styles.photoItem}>
                <Image source={{ uri }} style={styles.photo} />
                <IconButton
                  icon="close"
                  size={20}
                  onPress={() => handleRemoveNewPhoto(index)}
                  style={styles.photoDelete}
                />
              </View>
            ))}
          </View>
        )}
        <Button mode="outlined" onPress={pickImage} style={styles.input}>
          Добавить фото ({newPhotoUris.length})
        </Button>
        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={!name.trim()}
        >
          Сохранить
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 12 },
  input: { marginBottom: 8 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  photoSectionTitle: { marginTop: 8, marginBottom: 4 },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  photoItem: { position: "relative" },
  photo: { width: 100, height: 100, borderRadius: 8 },
  photoDelete: { position: "absolute", top: -8, right: -8, margin: 0 },
});
