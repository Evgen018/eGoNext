import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { useDb } from "@/lib/db/DbProvider";
import { Appbar, TextInput, Button, Switch, Text } from "react-native-paper";
import { insertPlace } from "@/lib/db/places";
import { insertTripPlace } from "@/lib/db/tripPlaces";
import { getCurrentCoords } from "@/lib/location";
import { addPlacePhoto } from "@/lib/db/placePhotos";
import { copyToAppStorage, generatePhotoFilename } from "@/lib/storage/photos";
import { pickImageFromCameraOrGallery } from "@/lib/imagePicker";
import { useMapPicker } from "@/lib/MapPickerContext";

export default function AddPlaceScreen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const router = useRouter();
  const db = useDb();
  const isAddToTrip = !!tripId && !isNaN(parseInt(tripId, 10));
  const parsedTripId = tripId ? parseInt(tripId, 10) : 0;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visitlater, setVisitlater] = useState(true);
  const [liked, setLiked] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [saving, setSaving] = useState(false);
  const [photoUris, setPhotoUris] = useState<string[]>([]);
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

  const pickImage = async () => {
    const uri = await pickImageFromCameraOrGallery();
    if (uri) {
      setPhotoUris((prev) => [...prev, uri]);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const lat = latitude ? parseFloat(latitude) : null;
      const lng = longitude ? parseFloat(longitude) : null;
      const id = await insertPlace(db, {
        name: name.trim(),
        description: description.trim(),
        visitlater,
        liked,
        latitude: Number.isNaN(lat) ? null : lat,
        longitude: Number.isNaN(lng) ? null : lng,
      });
      for (let i = 0; i < photoUris.length; i++) {
        const destUri = await copyToAppStorage(
          photoUris[i],
          generatePhotoFilename(`place_${id}`)
        );
        await addPlacePhoto(db, id, destUri, i);
      }
      if (isAddToTrip && parsedTripId > 0) {
        await insertTripPlace(db, { tripId: parsedTripId, placeId: id });
        router.replace(`/trips/${parsedTripId}`);
      } else {
        router.replace(`/places/${id}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Не удалось сохранить место.";
      Alert.alert("Ошибка", msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content
          title={isAddToTrip ? "Создать место и добавить в поездку" : "Добавить место"}
        />
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
          placeholder="55.7558"
        />
        <TextInput
          label="Долгота"
          value={longitude}
          onChangeText={setLongitude}
          mode="outlined"
          keyboardType="decimal-pad"
          style={styles.input}
          placeholder="37.6173"
        />
        <Button mode="outlined" onPress={pickImage} style={styles.input}>
          Прикрепить фото ({photoUris.length})
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
