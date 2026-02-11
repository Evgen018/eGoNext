import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: "images",
  allowsEditing: true,
  quality: 0.8,
};

async function pickFromCamera(): Promise<string | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Доступ запрещён", "Разрешите доступ к камере в настройках приложения.");
    return null;
  }
  const result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
  return result.canceled ? null : result.assets[0]?.uri ?? null;
}

async function pickFromGallery(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Доступ запрещён", "Разрешите доступ к галерее в настройках приложения.");
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
  return result.canceled ? null : result.assets[0]?.uri ?? null;
}

/**
 * Показать выбор источника (камера/галерея) и вернуть URI выбранного фото или null.
 */
export async function pickImageFromCameraOrGallery(): Promise<string | null> {
  return new Promise((resolve) => {
    Alert.alert("Добавить фото", "Выберите источник", [
      {
        text: "Камера",
        onPress: async () => {
          const uri = await pickFromCamera();
          resolve(uri);
        },
      },
      {
        text: "Галерея",
        onPress: async () => {
          const uri = await pickFromGallery();
          resolve(uri);
        },
      },
      { text: "Отмена", style: "cancel", onPress: () => resolve(null) },
    ]);
  });
}
