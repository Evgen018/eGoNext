import { useRouter } from "expo-router";
import { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { Appbar, TextInput, Button } from "react-native-paper";
import { insertTrip } from "@/lib/db/trips";

const today = () => new Date().toISOString().slice(0, 10);

export default function AddTripScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState(today());
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const id = await insertTrip(db, {
        title: title.trim(),
        description: description.trim(),
        startDate,
        endDate,
        current: false,
      });
      router.replace(`/trips/${id}`);
    } catch (err) {
      Alert.alert("Ошибка", err instanceof Error ? err.message : "Не удалось создать поездку.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Создать поездку" />
      </Appbar.Header>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <TextInput
          label="Название *"
          value={title}
          onChangeText={setTitle}
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
        <TextInput
          label="Дата начала"
          value={startDate}
          onChangeText={setStartDate}
          mode="outlined"
          style={styles.input}
          placeholder="YYYY-MM-DD"
        />
        <TextInput
          label="Дата окончания"
          value={endDate}
          onChangeText={setEndDate}
          mode="outlined"
          style={styles.input}
          placeholder="YYYY-MM-DD"
        />
        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={!title.trim()}
        >
          Создать поездку
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
});
