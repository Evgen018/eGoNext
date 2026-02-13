import { useRouter } from "expo-router";
import { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useDb } from "@/lib/db/DbProvider";
import { Appbar, TextInput, Button } from "react-native-paper";
import { insertTrip } from "@/lib/db/trips";

const today = () => new Date().toISOString().slice(0, 10);

export default function AddTripScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const db = useDb();
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
      Alert.alert(t("common.error"), err instanceof Error ? err.message : t("trips.createTripError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t("trips.createTrip")} />
      </Appbar.Header>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <TextInput
          label={t("trips.nameLabel")}
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label={t("trips.descriptionLabel")}
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />
        <TextInput
          label={t("trips.startDate")}
          value={startDate}
          onChangeText={setStartDate}
          mode="outlined"
          style={styles.input}
          placeholder="YYYY-MM-DD"
        />
        <TextInput
          label={t("trips.endDate")}
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
          {t("trips.createTrip")}
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
