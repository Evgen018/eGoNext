import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { Appbar, TextInput, Button, Switch, Text } from "react-native-paper";
import { getPlaceById, updatePlace } from "@/lib/db/places";
import { getPhotosByPlaceId } from "@/lib/db/placePhotos";
import { addPlacePhoto } from "@/lib/db/placePhotos";
import { copyToAppStorage, generatePhotoFilename } from "@/lib/storage/photos";
import * as ImagePicker from "expo-image-picker";

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

  useEffect(() => {
    if (!placeId || isNaN(placeId)) return;
    getPlaceById(db, placeId).then((p) => {
      if (p) {
        setName(p.name);
        setDescription(p.description);
        setVisitlater(p.visitlater === 1);
        setLiked(p.liked === 1);
        setLatitude(p.latitude != null ? String(p.latitude) : "");
        setLongitude(p.longitude != null ? String(p.longitude) : "");
      }
      setLoading(false);
    });
  }, [placeId]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setNewPhotoUris((prev) => [...prev, result.assets[0].uri]);
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
