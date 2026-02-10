import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { Appbar, Button, Text } from "react-native-paper";
import { addPlacePhoto } from "@/lib/db/placePhotos";
import { copyToAppStorage, generatePhotoFilename } from "@/lib/storage/photos";
import * as ImagePicker from "expo-image-picker";

export default function AddPlacePhotoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const db = useSQLiteContext();
  const placeId = id ? parseInt(id, 10) : 0;
  const [saving, setSaving] = useState(false);

  const pickAndSave = async () => {
    if (!placeId || isNaN(placeId)) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    setSaving(true);
    try {
      const destUri = await copyToAppStorage(
        result.assets[0].uri,
        generatePhotoFilename(`place_${placeId}`)
      );
      await addPlacePhoto(db, placeId, destUri);
      router.replace(`/places/${placeId}`);
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
          Выбрать фото из галереи
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: "center", padding: 24 },
});
