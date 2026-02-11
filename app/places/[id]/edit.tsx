import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { Appbar, TextInput, Button, Switch, Text } from "react-native-paper";
import { getPlaceById, updatePlace } from "@/lib/db/places";
import { getCurrentCoords } from "@/lib/location";
import { getPhotosByPlaceId } from "@/lib/db/placePhotos";
import { addPlacePhoto } from "@/lib/db/placePhotos";
import { copyToAppStorage, generatePhotoFilename } from "@/lib/storage/photos";
import { pickImageFromCameraOrGallery } from "@/lib/imagePicker";
import { useMapPicker } from "@/lib/MapPickerContext";

export default function EditPlaceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const db = useSQLiteContext();
  const placeId = id ? parseInt(id, 10) : 0;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visitlater, setVisitlater] = useState(true);
  const [liked, setLiked] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
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
    getPlaceById(db, placeId)
      .then((p) => {
        if (p) {
          setName(p.name);
          setDescription(p.description);
          setVisitlater(p.visitlater === 1);
          setLiked(p.liked === 1);
          setLatitude(p.latitude != null ? String(p.latitude) : "");
          setLongitude(p.longitude != null ? String(p.longitude) : "");
        }
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
});
