import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import i18n from "@/lib/i18n";

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: "images",
  allowsEditing: true,
  quality: 0.8,
};

async function pickFromCamera(): Promise<string | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    Alert.alert(
      i18n.t("photo.accessDenied"),
      i18n.t("photo.cameraDenied")
    );
    return null;
  }
  const result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
  return result.canceled ? null : result.assets[0]?.uri ?? null;
}

async function pickFromGallery(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert(
      i18n.t("photo.accessDenied"),
      i18n.t("photo.galleryDenied")
    );
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
    Alert.alert(
      i18n.t("photo.addPhoto"),
      i18n.t("photo.chooseSource"),
      [
        {
          text: i18n.t("photo.camera"),
          onPress: async () => {
            const uri = await pickFromCamera();
            resolve(uri);
          },
        },
        {
          text: i18n.t("photo.gallery"),
          onPress: async () => {
            const uri = await pickFromGallery();
            resolve(uri);
          },
        },
        { text: i18n.t("common.cancel"), style: "cancel", onPress: () => resolve(null) },
      ]
    );
  });
}
