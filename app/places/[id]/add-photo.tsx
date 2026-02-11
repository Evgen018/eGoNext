import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useDb } from "@/lib/db/DbProvider";
import { Appbar, Button, Text } from "react-native-paper";
import { addPlacePhoto } from "@/lib/db/placePhotos";
import { copyToAppStorage, generatePhotoFilename } from "@/lib/storage/photos";
import { pickImageFromCameraOrGallery } from "@/lib/imagePicker";

export default function AddPlacePhotoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const db = useDb();
  const placeId = id ? parseInt(id, 10) : 0;
  const [saving, setSaving] = useState(false);

  const pickAndSave = async () => {
    if (!placeId || isNaN(placeId)) return;
    const uri = await pickImageFromCameraOrGallery();
    if (!uri) return;
    setSaving(true);
    try {
      const destUri = await copyToAppStorage(
        uri,
        generatePhotoFilename(`place_${placeId}`)
      );
      await addPlacePhoto(db, placeId, destUri);
      router.replace(`/places/${placeId}`);
    } catch (err) {
      Alert.alert("Ошибка", err instanceof Error ? err.message : "Не удалось добавить фото.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Добавить фото" />
      </Appbar.Header>
      <View style={styles.content}>
        <Button mode="contained" onPress={pickAndSave} loading={saving}>
          Добавить фото (камера / галерея)
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: "center", padding: 24 },
});
