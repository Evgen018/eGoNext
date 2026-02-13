import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useTranslation } from "react-i18next";
import MapView, { MapPressEvent, Marker } from "react-native-maps";
import { Appbar, Button, Text } from "react-native-paper";
import { useMapPicker } from "@/lib/MapPickerContext";
import { getCurrentCoords } from "@/lib/location";

// Черногория — центр карты по умолчанию
const DEFAULT_REGION = {
  latitude: 42.7087,
  longitude: 19.3744,
  latitudeDelta: 1.2,
  longitudeDelta: 1.2,
};

export default function MapPickerScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { setResult } = useMapPicker();
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeoutMs = 8000;
    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), timeoutMs)
    );
    Promise.race([getCurrentCoords(), timeoutPromise])
      .then((coords) => {
        if (coords) {
          setRegion({
            ...DEFAULT_REGION,
            latitude: coords.latitude,
            longitude: coords.longitude,
          });
          setMarker(coords);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleMapPress = useCallback((e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ latitude, longitude });
  }, []);

  const handleDone = useCallback(() => {
    if (marker) {
      setResult({ latitude: marker.latitude, longitude: marker.longitude });
      router.back();
    } else {
      Alert.alert(t("map.selectPoint"), t("map.selectPointMessage"));
    }
  }, [marker, setResult, router]);

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t("map.title")} />
        <Appbar.Action icon="check" onPress={handleDone} />
      </Appbar.Header>
      <MapView
        style={styles.map}
        initialRegion={region}
        onPress={handleMapPress}
        showsUserLocation
        loadingEnabled={loading}
        mapType="none"
      >
        {marker && (
          <Marker
            coordinate={marker}
            draggable
            onDragEnd={(e) => {
              const { latitude, longitude } = e.nativeEvent.coordinate;
              setMarker({ latitude, longitude });
            }}
          />
        )}
      </MapView>
      <View style={styles.footer}>
        {marker ? (
          <Text variant="labelSmall" style={styles.coords}>
            {marker.latitude.toFixed(6)}, {marker.longitude.toFixed(6)}
          </Text>
        ) : (
          <Text variant="bodySmall">{t("map.tapOrDrag")}</Text>
        )}
        <Button mode="contained" onPress={handleDone} disabled={!marker}>
          {t("common.done")}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1, width: "100%" },
  footer: {
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    gap: 8,
  },
  coords: { opacity: 0.7 },
});
