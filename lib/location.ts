import * as Location from "expo-location";

export interface Coords {
  latitude: number;
  longitude: number;
}

/** Получить текущие координаты. Запрашивает разрешение при необходимости. */
export async function getCurrentCoords(): Promise<Coords | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") return null;
  const loc = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  return {
    latitude: loc.coords.latitude,
    longitude: loc.coords.longitude,
  };
}
