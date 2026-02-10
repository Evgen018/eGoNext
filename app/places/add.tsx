import { useRouter } from "expo-router";
import { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { Appbar, TextInput, Button, Switch, Text } from "react-native-paper";
import { insertPlace } from "@/lib/db/places";
import { addPlacePhoto } from "@/lib/db/placePhotos";
import { copyToAppStorage, generatePhotoFilename } from "@/lib/storage/photos";
import * as ImagePicker from "expo-image-picker";

export default function AddPlaceScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visitlater, setVisitlater] = useState(true);
  const [liked, setLiked] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [saving, setSaving] = useState(false);
  const [photoUris, setPhotoUris] = useState<string[]>([]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUris((prev) => [...prev, result.assets[0].uri]);
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
      router.replace(`/places/${id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Добавить место" />
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
